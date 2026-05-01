const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Company = require('../models/Company');
const Invite = require('../models/Invite');
const notificationService = require('../services/notification.service');

const CATEGORY_OPTIONS = ['science', 'engineering', 'security', 'devops', 'operations', 'research', 'other'];

const normalizePreferences = (preferences) => {
  if (Array.isArray(preferences)) return preferences.map(item => String(item).trim()).filter(Boolean);
  if (typeof preferences === 'string') {
    return preferences.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [];
};

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, companyName, role, category, preferences } = req.body;
    if (!name || !email || !password || !companyName)
      return res.status(400).json({ success: false, message: 'All fields required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

    // Create company (tenant)
    const company = await Company.create({
      name: companyName,
      category: CATEGORY_OPTIONS.includes(category) ? category : 'engineering',
      preferences: normalizePreferences(preferences),
    });

    // Create user as admin of that company
    const user = await User.create({
      name, email, password,
      role: role || 'admin',
      companyId: company._id,
      preferences: normalizePreferences(preferences),
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, companyId: user.companyId },
      company: { id: company._id, name: company.name, slug: company.slug, category: company.category, preferences: company.preferences },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const company = await Company.findById(user.companyId);

    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, companyId: user.companyId },
      company: { id: company._id, name: company.name, slug: company.slug, category: company.category, preferences: company.preferences },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const company = await Company.findById(user.companyId);
    res.json({ success: true, user, company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/auth/team - Get all users in same company
const getTeam = async (req, res) => {
  try {
    const [team, invites] = await Promise.all([
      User.find({ companyId: req.user.companyId }).select('-password'),
      Invite.find({ companyId: req.user.companyId }).sort({ createdAt: -1 }),
    ]);
    res.json({ success: true, team, invites });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/auth/invite - Admin creates a team invite
const inviteTeamMember = async (req, res) => {
  try {
    const { name, email, role, category, preferences } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const existingUser = await User.findOne({ email: String(email).toLowerCase() });
    if (existingUser && String(existingUser.companyId) === String(req.user.companyId)) {
      return res.status(400).json({ success: false, message: 'User already belongs to this organization' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const company = await Company.findById(req.user.companyId);
    const invite = await Invite.create({
      name: name || '',
      email: String(email).toLowerCase(),
      token,
      role: role || 'engineer',
      category: CATEGORY_OPTIONS.includes(category) ? category : company?.category || 'engineering',
      preferences: normalizePreferences(preferences),
      companyId: req.user.companyId,
      invitedBy: req.user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteUrl = `${frontendUrl}/accept-invite/${token}`;

    try {
      await notificationService.sendInviteEmail({
        to: String(email).toLowerCase(),
        inviterName: req.user.name,
        companyName: company?.name || 'your organization',
        inviteUrl,
        role: invite.role,
        category: invite.category,
      });
    } catch (emailErr) {
      console.warn('Invite email skipped:', emailErr.message);
    }

    res.status(201).json({ success: true, invite, inviteUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/auth/invite/:token - Public invite preview
const getInviteByToken = async (req, res) => {
  try {
    const invite = await Invite.findOne({ token: req.params.token })
      .populate('companyId', 'name slug category preferences')
      .populate('invitedBy', 'name email');

    if (!invite) return res.status(404).json({ success: false, message: 'Invite not found' });
    if (invite.expiresAt < new Date()) return res.status(410).json({ success: false, message: 'Invite expired' });
    if (invite.status !== 'pending') return res.status(400).json({ success: false, message: `Invite already ${invite.status}` });

    res.json({ success: true, invite });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/auth/invite/accept - Public invite acceptance
const acceptInvite = async (req, res) => {
  try {
    const { token, name, password, preferences } = req.body;
    if (!token || !name || !password) {
      return res.status(400).json({ success: false, message: 'Token, name, and password are required' });
    }

    const invite = await Invite.findOne({ token }).populate('companyId');
    if (!invite) return res.status(404).json({ success: false, message: 'Invite not found' });
    if (invite.expiresAt < new Date()) return res.status(410).json({ success: false, message: 'Invite expired' });
    if (invite.status !== 'pending') return res.status(400).json({ success: false, message: `Invite already ${invite.status}` });

    let user = await User.findOne({ email: invite.email });
    if (user && String(user.companyId) !== String(invite.companyId._id)) {
      return res.status(400).json({ success: false, message: 'This email already belongs to another organization' });
    }

    if (!user) {
      user = await User.create({
        name,
        email: invite.email,
        password,
        role: invite.role,
        companyId: invite.companyId._id,
        preferences: normalizePreferences(preferences).length ? normalizePreferences(preferences) : invite.preferences,
      });
    } else {
      user.name = name;
      user.role = invite.role;
      user.companyId = invite.companyId._id;
      if (normalizePreferences(preferences).length) {
        user.preferences = normalizePreferences(preferences);
      }
      user.password = password;
      await user.save();
    }

    invite.status = 'accepted';
    invite.acceptedAt = new Date();
    await invite.save();

    const company = await Company.findById(invite.companyId._id);
    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, companyId: user.companyId, preferences: user.preferences },
      company: { id: company._id, name: company.name, slug: company.slug, category: company.category, preferences: company.preferences },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, getTeam, inviteTeamMember, getInviteByToken, acceptInvite };

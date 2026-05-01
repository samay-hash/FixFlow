const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, companyName, role } = req.body;
    if (!name || !email || !password || !companyName)
      return res.status(400).json({ success: false, message: 'All fields required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

    // Create company (tenant)
    const company = await Company.create({ name: companyName });

    // Create user as admin of that company
    const user = await User.create({
      name, email, password,
      role: role || 'admin',
      companyId: company._id,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, companyId: user.companyId },
      company: { id: company._id, name: company.name, slug: company.slug },
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
      company: { id: company._id, name: company.name, slug: company.slug },
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
    const team = await User.find({ companyId: req.user.companyId }).select('-password');
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/auth/invite - Admin invites a new team member
const inviteTeamMember = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

    const user = await User.create({
      name, email,
      password: password || 'changeme123',
      role: role || 'engineer',
      companyId: req.user.companyId,
    });
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, getTeam, inviteTeamMember };

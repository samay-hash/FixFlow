import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewIncident() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [sites, setSites] = useState([]);
  const [team, setTeam] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'high',
    siteId: '',
    assignedTo: [],
    category: 'other',
  });

  const canCreate = user?.role === 'admin' || user?.role === 'engineer';

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [sitesRes, teamRes] = await Promise.all([
          api.get('/sites'),
          api.get('/auth/team'),
        ]);
        setSites(sitesRes.data.sites || []);
        setTeam(teamRes.data.team || []);
      } catch {
        toast.error('Failed to load create form data');
      } finally {
        setLoadingMeta(false);
      }
    };

    loadMeta();
  }, []);

  const categories = [
    { value: 'backend', label: 'Backend' },
    { value: 'frontend', label: 'Frontend' },
    { value: 'database', label: 'Database' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'network', label: 'Network' },
    { value: 'security', label: 'Security' },
    { value: 'other', label: 'Other' },
  ];

  const memberMatchesCategory = (member) => {
    const prefs = (member?.preferences || []).map((p) => String(p).toLowerCase());
    return prefs.includes(String(form.category).toLowerCase());
  };

  const sortedTeam = useMemo(() => {
    return [...team].sort((a, b) => {
      const aMatch = memberMatchesCategory(a) ? 1 : 0;
      const bMatch = memberMatchesCategory(b) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      return a.name.localeCompare(b.name);
    });
  }, [team, form.category]);

  const toggleAssignee = (userId) => {
    setForm((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter((id) => id !== userId)
        : [...prev.assignedTo, userId],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        severity: form.severity,
        assignedTo: form.assignedTo,
        category: form.category,
      };

      if (form.siteId) payload.siteId = form.siteId;

      const { data } = await api.post('/incidents', payload);
      toast.success('Incident created successfully');
      navigate(`/incidents/${data.incident._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create incident');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <button onClick={() => navigate('/incidents')} className="btn-ghost btn-sm mb-6">
          <ArrowLeft size={14} />All Incidents
        </button>

        <div className="page-header mb-6">
          <h1 className="page-title">Create Incident</h1>
          <p className="page-subtitle">Manually declare and assign a live incident</p>
        </div>

        {!canCreate ? (
          <div className="card">
            <p className="text-sm text-slate-300">Only admin and engineer roles can create incidents.</p>
          </div>
        ) : loadingMeta ? (
          <div className="card">
            <p className="text-sm text-slate-300">Loading form...</p>
          </div>
        ) : (
          <form onSubmit={submit} className="card space-y-5">
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Database connection timeout across production API"
                required
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-28"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe symptoms, impact, and what changed before the incident."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Severity</label>
                <select
                  className="input"
                  value={form.severity}
                  onChange={(e) => setForm((prev) => ({ ...prev, severity: e.target.value }))}
                >
                  <option value="critical">critical</option>
                  <option value="high">high</option>
                  <option value="medium">medium</option>
                  <option value="low">low</option>
                </select>
              </div>

              <div>
                <label className="label">Category / Department</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Related Site (optional)</label>
                <select
                  className="input"
                  value={form.siteId}
                  onChange={(e) => setForm((prev) => ({ ...prev, siteId: e.target.value }))}
                >
                  <option value="">No linked site</option>
                  {sites.map((site) => (
                    <option key={site._id} value={site._id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Assign Responders (optional)</label>
              {team.length === 0 ? (
                <p className="text-xs text-slate-500">No teammates available.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sortedTeam.map((member) => {
                    const checked = form.assignedTo.includes(member._id);
                    const isMatch = memberMatchesCategory(member);
                    return (
                      <label
                        key={member._id}
                        className="flex items-center justify-between px-3 py-2 rounded border border-slate-700 bg-dark-800"
                      >
                        <span>
                          <span className="text-sm text-slate-200">{member.name}</span>
                          <span className="block text-xs text-slate-400">{member.role} {member?.preferences?.length ? `- ${member.preferences.join(', ')}` : ''}</span>
                          {isMatch && (
                            <span className="inline-block mt-1 text-[10px] uppercase px-2 py-0.5 rounded" style={{ background: '#C8FF00', color: '#0A0A0A' }}>
                              Category match
                            </span>
                          )}
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAssignee(member._id)}
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary">
                <Save size={14} />
                {submitting ? 'Creating...' : 'Create Incident'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => navigate('/incidents')}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

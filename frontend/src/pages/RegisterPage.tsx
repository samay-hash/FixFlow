import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthPageShell } from '../components/auth/AuthPageShell';
import { AuthSelect, AuthSubmitButton, AuthTextField, AuthTextarea } from '../components/auth/AuthFormControls';

const categories = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'science', label: 'Science' },
  { value: 'security', label: 'Security' },
  { value: 'devops', label: 'DevOps' },
  { value: 'operations', label: 'Operations' },
  { value: 'research', label: 'Research' },
  { value: 'other', label: 'Other' },
];

const featurePills = [
  { label: 'Real-time Alerts', className: 'bg-orange-50 text-orange-600' },
  { label: 'AI Postmortems', className: 'bg-violet-50 text-violet-600' },
  { label: 'Team Collab', className: 'bg-emerald-50 text-emerald-600' },
];

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    category: 'engineering',
    preferences: '',
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await register(form);
  };

  return (
    <AuthPageShell
      eyebrow="Workspace setup"
      title="Create your"
      accent="workspace."
      description="Set up monitoring in seconds. No credit card required."
      secondaryCopy="Already have a workspace?"
      secondaryHref="/login"
      secondaryAction="Sign in"
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-[24px] bg-white/82 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthTextField
            id="name"
            label="Full Name"
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <AuthTextField
            id="email"
            label="Work Email"
            type="email"
            autoComplete="email"
            placeholder="john@company.com"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthTextField
            id="companyName"
            label="Company / Team Name"
            type="text"
            autoComplete="organization"
            placeholder="Acme Corp"
            value={form.companyName}
            onChange={(event) => setForm({ ...form, companyName: event.target.value })}
            required
          />

          <AuthTextField
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </div>

        <AuthSelect
          id="category"
          label="Organization Category"
          options={categories}
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
        />

        <AuthTextarea
          id="preferences"
          label="Preferences / Focus Areas"
          placeholder="incident response, scientific analysis, backend reliability"
          value={form.preferences}
          onChange={(event) => setForm({ ...form, preferences: event.target.value })}
        />

        <AuthSubmitButton
          loading={loading}
          label="CREATE WORKSPACE & START MONITORING"
          loadingLabel="SETTING UP..."
          icon={<ArrowRight size={18} />}
        />
      </form>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {featurePills.map((feature) => (
          <div
            key={feature.label}
            className={`rounded-2xl border border-slate-200 px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.08em] shadow-[0_10px_22px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 ${feature.className}`}
          >
            {feature.label}
          </div>
        ))}
      </div>
    </AuthPageShell>
  );
}

import { useState, type FormEvent } from 'react';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthPageShell } from '../components/auth/AuthPageShell';
import { AuthSubmitButton, AuthTextField, PasswordToggle } from '../components/auth/AuthFormControls';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await login(form);
  };

  return (
    <AuthPageShell
      eyebrow="Incident command login"
      title="Sign in"
      accent="to your workspace."
      description="Smart Incident Monitoring & Response System for organization admins and invited engineers."
      secondaryCopy="No account?"
      secondaryHref="/register"
      secondaryAction="Create workspace"
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-[24px] bg-white/82 p-4 sm:p-5">
        <AuthTextField
          id="email"
          label="Work email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />

        <AuthTextField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          trailing={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((value) => !value)} />}
          required
        />

        <AuthSubmitButton
          loading={loading}
          label="SIGN IN"
          loadingLabel="SIGNING IN..."
          icon={<ArrowRight size={18} />}
        />

        <div className="flex items-start gap-3 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-white px-4 py-3 text-[12px] font-black uppercase text-[#07111f] shadow-[0_10px_22px_rgba(255,79,10,0.06)]">
          <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#ff4f0a]" />
          Demo: Register a new account to get started instantly
        </div>
      </form>
    </AuthPageShell>
  );
}

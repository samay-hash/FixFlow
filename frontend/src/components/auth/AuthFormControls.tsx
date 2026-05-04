import { Eye, EyeOff, Loader2 } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface AuthTextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  id: string;
  label: string;
  hint?: string;
  trailing?: ReactNode;
}

export function AuthTextField({ id, label, hint, trailing, ...inputProps }: AuthTextFieldProps) {
  return (
    <div className="group">
      <label
        htmlFor={id}
        className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-[#07111f] transition-colors group-focus-within:text-[#ff4f0a]"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className="min-h-[48px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] font-bold text-[#07111f] shadow-[0_10px_24px_rgba(15,23,42,0.045)] outline-none transition duration-200 placeholder:text-slate-300 hover:border-slate-300 focus:border-orange-300 focus:bg-orange-50/20 focus:ring-4 focus:ring-orange-100"
          {...inputProps}
        />
        {trailing}
      </div>
      {hint && <p className="mt-2 text-[12px] font-semibold leading-5 text-slate-400">{hint}</p>}
    </div>
  );
}

interface PasswordToggleProps {
  visible: boolean;
  onToggle: () => void;
}

export function PasswordToggle({ visible, onToggle }: PasswordToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-orange-50 hover:text-[#ff4f0a] focus:outline-none focus:ring-4 focus:ring-orange-100"
      aria-label={visible ? 'Hide password' : 'Show password'}
    >
      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}

interface AuthSelectOption {
  value: string;
  label: string;
}

interface AuthSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  id: string;
  label: string;
  options: AuthSelectOption[];
}

export function AuthSelect({ id, label, options, ...selectProps }: AuthSelectProps) {
  return (
    <div className="group">
      <label
        htmlFor={id}
        className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-[#07111f] transition-colors group-focus-within:text-[#ff4f0a]"
      >
        {label}
      </label>
      <select
        id={id}
        className="min-h-[48px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] font-bold text-[#07111f] shadow-[0_10px_24px_rgba(15,23,42,0.045)] outline-none transition duration-200 hover:border-slate-300 focus:border-orange-300 focus:bg-orange-50/20 focus:ring-4 focus:ring-orange-100"
        {...selectProps}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface AuthTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  id: string;
  label: string;
}

export function AuthTextarea({ id, label, ...textareaProps }: AuthTextareaProps) {
  return (
    <div className="group">
      <label
        htmlFor={id}
        className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-[#07111f] transition-colors group-focus-within:text-[#ff4f0a]"
      >
        {label}
      </label>
      <textarea
        id={id}
        className="min-h-[72px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] font-bold text-[#07111f] shadow-[0_10px_24px_rgba(15,23,42,0.045)] outline-none transition duration-200 placeholder:text-slate-300 hover:border-slate-300 focus:border-orange-300 focus:bg-orange-50/20 focus:ring-4 focus:ring-orange-100"
        {...textareaProps}
      />
    </div>
  );
}

interface AuthSubmitButtonProps {
  loading: boolean;
  label: string;
  loadingLabel: string;
  icon: ReactNode;
}

export function AuthSubmitButton({ loading, label, loadingLabel, icon }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex min-h-[50px] w-full items-center justify-center gap-3 rounded-2xl bg-[#ff4f0a] px-6 py-3 text-[14px] font-black text-white shadow-[0_16px_34px_rgba(255,79,10,0.28)] transition duration-200 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65"
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      {loading ? loadingLabel : label}
    </button>
  );
}

import { 
  Clock, 
  Bell, 
  Route, 
  Sparkles, 
  FileText, 
  Activity, 
  Globe, 
  Wrench, 
  MessageSquare, 
  Code2, 
  LucideIcon
} from 'lucide-react';

export const ACCENT = '#ff4f0a';

export interface HeroChip {
  icon: LucideIcon;
  label: string;
  color: string;
}

export const HERO_CHIPS: HeroChip[] = [
  { icon: Clock, label: '60s checks', color: 'text-emerald-500' },
  { icon: Bell, label: 'Realtime alerts', color: 'text-orange-500' },
  { icon: Route, label: 'Deploy context', color: 'text-violet-500' },
  { icon: Sparkles, label: 'AI summaries', color: 'text-rose-500' },
  { icon: FileText, label: 'Postmortems', color: 'text-blue-500' },
];

export interface LifecycleItem {
  id: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  desc: string;
}

export const LIFECYCLE: LifecycleItem[] = [
  {
    id: 'Detect',
    icon: Activity,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    desc: 'Continuous checks catch issues the moment they start.',
  },
  {
    id: 'Alert',
    icon: Bell,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    desc: 'Smart alerts with context reduce noise and pinpoint what matters.',
  },
  {
    id: 'Investigate',
    icon: Globe,
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    desc: 'AI and telemetry correlate signals to surface the root cause.',
  },
  {
    id: 'Resolve',
    icon: Wrench,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    desc: 'Link deploys, commits, and changes to fix faster with confidence.',
  },
  {
    id: 'Learn',
    icon: Sparkles,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    desc: 'AI summaries and postmortems help your team improve over time.',
  },
];

export interface FeatureCard {
  icon: LucideIcon;
  tint: string;
  title: string;
  desc: string;
}

export const FEATURE_CARDS: (FeatureCard & { logo?: string })[] = [
  {
    icon: MessageSquare,
    tint: 'bg-orange-50 text-orange-500',
    title: 'War room collaboration',
    desc: 'Align your team with shared timelines, clear ownership, and live updates.',
  },
  {
    icon: Code2,
    logo: '/logos/github.svg',
    tint: 'bg-violet-50 text-violet-500',
    title: 'Deploy-aware investigations',
    desc: 'Automatically link incidents to deploys and code changes that may be related.',
  },
  {
    icon: Globe,
    tint: 'bg-blue-50 text-blue-500',
    title: 'Customer communication',
    desc: 'Keep stakeholders informed with status pages and clear, consistent updates.',
  },
];

export interface PricingPlan {
  plan: string;
  sub: string;
  price: string;
  priceNote: string;
  features: string[];
  btn: string;
  popular?: boolean;
}

export const PRICING: PricingPlan[] = [
  {
    plan: 'Starter',
    sub: 'For individuals getting started.',
    price: '$0',
    priceNote: 'Forever free',
    features: ['Up to 3 integrations', '7-day event history', 'Basic incident alerts', 'Community support'],
    btn: 'Get started free',
  },
  {
    plan: 'Pro',
    sub: 'For small teams that move fast.',
    price: '$19',
    priceNote: 'per user / month',
    features: ['Unlimited integrations', '30-day event history', 'Advanced incident alerts', 'Priority email support'],
    btn: 'Start free trial',
  },
  {
    plan: 'Team',
    sub: 'For growing engineering teams.',
    price: '$49',
    priceNote: 'per user / month',
    features: ['Unlimited everything', '90-day event history', 'Status pages & analytics', 'SAML SSO & audit logs', 'Priority chat support'],
    btn: 'Start free trial',
    popular: true,
  },
  {
    plan: 'Enterprise',
    sub: 'For organizations with scale.',
    price: 'Custom',
    priceNote: "Let's build a plan for you.",
    features: ['Advanced security & SSO', 'Custom data retention', 'Dedicated success manager', '99.9% uptime SLA'],
    btn: 'Contact sales',
  },
];

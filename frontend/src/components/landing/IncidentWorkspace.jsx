import React from 'react';
import { AlertTriangle, ChevronDown, MoreHorizontal, ArrowRight, CircleAlert, Check, GitBranch } from 'lucide-react';
import { StatusDot, AvatarGroup, SparkLine } from './shared/UIAtoms';
import { DeployPreview } from './shared/Previews';

export function IncidentWorkspace() {
  return (
    <section className="relative bg-[#fffaf5] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-12 text-center font-serif text-[40px] leading-[1.05] tracking-[-0.04em] text-[#07111f] md:text-[52px]">
          Work the incident from <span className="text-[#ff4f0a]">one focused workspace.</span>
        </h2>

        <div className="rounded-[26px] border border-slate-200 bg-white/85 p-5 shadow-[0_24px_70px_rgba(80,55,40,0.1)] md:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_305px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <AlertTriangle size={22} />
                </span>
                <span className="flex-1">
                  <span className="block text-[18px] font-black tracking-[-0.02em] text-[#07111f]">Payments API latency spike</span>
                  <span className="mt-1 block text-[12px] font-semibold text-slate-500">Incident #INC-507 / Triggered 10:21 AM (8m ago)</span>
                </span>
                <button className="inline-flex items-center gap-2 self-start rounded-xl bg-red-50 px-3 py-2 text-[12px] font-black text-red-500">
                  Investigating <ChevronDown size={14} />
                </button>
                <MoreHorizontal size={21} className="hidden text-slate-400 sm:block" />
              </div>

              <div className="mb-5 flex gap-6 overflow-x-auto border-b border-slate-100 text-[12px] font-black text-slate-500">
                {['Overview', 'Timeline', 'Impact', 'Logs', 'Postmortem'].map((item, index) => (
                  <span key={item} className={`whitespace-nowrap pb-3 ${index === 0 ? 'border-b-2 border-orange-500 text-orange-500' : ''}`}>{item}</span>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-[1.2fr_0.75fr_0.75fr]">
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-[13px] font-black text-[#07111f]">Impact summary</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <span>
                      <span className="block text-[11px] font-bold text-slate-500">Affected users</span>
                      <strong className="block text-[26px] tracking-[-0.04em] text-[#07111f]">12.4%</strong>
                      <span className="text-[11px] font-black text-red-500">+ 3.2% in last 10m</span>
                    </span>
                    <span>
                      <span className="block text-[11px] font-bold text-slate-500">Response time</span>
                      <strong className="block text-[26px] tracking-[-0.04em] text-[#07111f]">124 ms</strong>
                      <span className="text-[11px] font-black text-red-500">+ 42% in last 10m</span>
                    </span>
                  </div>
                  <div className="mt-5 rounded-2xl bg-red-50 p-3">
                    <SparkLine className="h-20 w-full" color="#ff1d3d" strokeWidth={3} />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="mb-3 text-[13px] font-black text-[#07111f]">Suspected deploy</p>
                  <DeployPreview />
                  <p className="mt-4 text-[11px] font-bold text-slate-500">Confidence</p>
                  <span className="mt-2 inline-flex rounded-lg bg-red-50 px-3 py-1 text-[11px] font-black text-red-500">High</span>
                  <button className="mt-5 inline-flex items-center gap-2 text-[12px] font-black text-blue-600">
                    View change details <ArrowRight size={14} />
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="mb-3 text-[13px] font-black text-[#07111f]">Current status</p>
                  <p className="mb-4 flex items-center gap-2 text-[12px] font-extrabold text-slate-700"><StatusDot color="bg-red-500" /> Investigating</p>
                  <p className="text-[11px] font-bold text-slate-500">Owner</p>
                  <p className="my-2 flex items-center gap-2 text-[12px] font-extrabold text-slate-700">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-[10px] font-black text-orange-700">M</span>
                    Maya Chen
                  </p>
                  <p className="mt-4 text-[11px] font-bold text-slate-500">Responders</p>
                  <div className="my-2"><AvatarGroup /></div>
                  <button className="mt-2 w-full rounded-xl border border-slate-200 py-2 text-[12px] font-black text-slate-700">Add responder</button>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-100 p-4">
                <p className="mb-4 text-[13px] font-black text-[#07111f]">Response actions</p>
                <div className="grid gap-3 text-[11px] font-bold text-slate-500 md:grid-cols-5">
                  {['Incident acknowledged', 'Declared incident', 'Customer notified', 'Root cause identified', 'Resolved'].map((item, index) => (
                    <span key={item} className="flex items-start gap-2">
                      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${index < 2 ? 'border-emerald-500 bg-emerald-50 text-emerald-500' : 'border-slate-300 text-transparent'}`}>
                        {index < 2 && <Check size={10} />}
                      </span>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4a154b] text-[12px] font-black text-white">SL</span>
                  <span className="text-[14px] font-black text-[#07111f]">Slack alert</span>
                </div>
                <p className="text-[11px] font-bold text-slate-500">FixFlow APP <span className="ml-2">10:21 AM</span></p>
                <p className="mt-2 flex items-center gap-2 text-[13px] font-black text-[#07111f]"><CircleAlert size={16} className="text-red-500" /> Incident triggered</p>
                <p className="mt-1 text-[12px] font-semibold text-slate-600">Payments API latency spike</p>
                <button className="mt-4 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-[12px] font-black text-orange-600">Open incident</button>
                <p className="mt-4 text-[11px] font-bold text-slate-400">3 replies / Last reply 2m ago</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center gap-3">
                  <GitBranch size={24} />
                  <span className="text-[14px] font-black text-[#07111f]">GitHub deploy context</span>
                </div>
                {[
                  ['Repository', 'fixflow/payments-service'],
                  ['Branch', 'main'],
                  ['Commit', 'a1b2c3d'],
                  ['Deployed', '10:16 AM - by joe'],
                ].map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-slate-100 py-2 text-[11px]">
                    <span className="font-bold text-slate-400">{key}</span>
                    <span className="font-extrabold text-slate-700">{value}</span>
                  </div>
                ))}
                <button className="mt-4 inline-flex items-center gap-2 text-[12px] font-black text-blue-600">View commit <ArrowRight size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

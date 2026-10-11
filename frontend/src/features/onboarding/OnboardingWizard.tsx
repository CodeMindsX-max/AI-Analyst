import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/app/providers';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  Building,
  Database,
  Briefcase,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [wsName, setWsName] = useState('Acme Enterprise Analytics');
  const [org, setOrg] = useState('Acme Corporation');
  const [industry, setIndustry] = useState('SaaS');
  const [size, setSize] = useState('100-500');
  const [datasetChoice, setDatasetChoice] = useState('demo');
  const [domain, setDomain] = useState('Sales');
  const [responseStyle, setResponseStyle] = useState('analytical');
  const [chartPref, setChartPref] = useState('bar');
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast('Workspace Configured', 'Your preferences have been applied.', 'success');
      navigate('/overview');
    }, 600);
  };

  const steps = [
    { num: 1, title: 'Welcome', icon: Sparkles },
    { num: 2, title: 'Workspace', icon: Building },
    { num: 3, title: 'Data Source', icon: Database },
    { num: 4, title: 'Domain', icon: Briefcase },
    { num: 5, title: 'AI Analyst', icon: Sliders },
    { num: 6, title: 'Summary', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s) => {
              const Icon = s.icon;
              const isPast = s.num < step;
              const isCurrent = s.num === step;
              return (
                <div key={s.num} className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isPast
                        ? 'bg-blue-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-white border border-slate-300 text-slate-400'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[11px] mt-1 hidden sm:block ${
                      isCurrent ? 'font-bold text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-8 shadow-lg border-slate-200">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md">
                AI
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Welcome to AnalystAI</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                AnalystAI empowers business managers and data teams to explore complex company metrics, understand trends, and generate evidence-linked business answers without writing SQL.
              </p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left text-xs text-blue-900 space-y-1.5">
                <div className="font-semibold text-blue-950">Pre-Configured Demo Environment</div>
                <p>
                  This setup wizard will configure your local workspace preferences. The demo sales dataset is already seeded and ready for exploration.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Workspace details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Workspace Details</h2>
                <p className="text-xs text-slate-500">Provide high-level organization attributes</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Workspace Name</label>
                <input
                  type="text"
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Entity</label>
                <input
                  type="text"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SaaS">SaaS & Cloud Services</option>
                    <option value="Ecommerce">Ecommerce & Retail</option>
                    <option value="Finance">Fintech & Financial Services</option>
                    <option value="Healthcare">Healthcare & Bio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1-20">1 - 20 employees</option>
                    <option value="20-100">20 - 100 employees</option>
                    <option value="100-500">100 - 500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Data Source */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Select Initial Dataset</h2>
                <p className="text-xs text-slate-500">Choose how AnalystAI accesses your business data</p>
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => setDatasetChoice('demo')}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    datasetChoice === 'demo' ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="dataset"
                    checked={datasetChoice === 'demo'}
                    onChange={() => setDatasetChoice('demo')}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">Seeded Demo Analytics Dataset</span>
                      <Badge variant="success">Recommended</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Pre-populated SQLite database with 1,420 orders, customers, products, and regional targets. Ready to explore variance and trends immediately.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setDatasetChoice('upload')}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    datasetChoice === 'upload' ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="dataset"
                    checked={datasetChoice === 'upload'}
                    onChange={() => setDatasetChoice('upload')}
                    className="mt-1"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-900">Upload CSV / XLSX Dataset</span>
                    <p className="text-xs text-slate-500 mt-1">
                      Import your own tabular spreadsheet via the Data Sources section after completing onboarding.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Domain */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Business Focus Domain</h2>
                <p className="text-xs text-slate-500">Select the primary functional domain for default KPIs and definitions</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['Sales', 'Ecommerce', 'Finance', 'Marketing', 'Operations', 'Customer Success'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDomain(d)}
                    className={`p-3.5 rounded-xl border text-left text-sm font-semibold transition-all ${
                      domain === d ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: AI Defaults */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">AI Analyst Preferences</h2>
                <p className="text-xs text-slate-500">Tune response tone and visual formatting</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Answer Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'concise', label: 'Concise', desc: 'Bullet points only' },
                    { id: 'analytical', label: 'Analytical', desc: 'Deltas & factors' },
                    { id: 'executive', label: 'Executive', desc: 'Strategic briefing' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setResponseStyle(s.id)}
                      className={`p-3 rounded-lg border text-left text-xs transition-all ${
                        responseStyle === s.id ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-semibold">{s.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Chart Format</label>
                <select
                  value={chartPref}
                  onChange={(e) => setChartPref(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bar">Bar Chart (Categorical & Comparison)</option>
                  <option value="line">Line Chart (Continuous Time Series)</option>
                  <option value="area">Area Chart (Cumulative Volume)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 6: Summary */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="text-center pb-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <h2 className="text-xl font-bold text-slate-900">Setup Ready</h2>
                <p className="text-xs text-slate-500">Review your workspace setup before launching</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Workspace:</span>
                  <span className="font-semibold text-slate-900">{wsName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Organization:</span>
                  <span className="font-semibold text-slate-900">{org}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Domain:</span>
                  <span className="font-semibold text-slate-900">{domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dataset:</span>
                  <span className="font-semibold text-slate-900">Demo Sales Dataset (SQLite)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">AI Response Tone:</span>
                  <span className="font-semibold capitalize text-slate-900">{responseStyle}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)} icon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => navigate('/overview')}>
                Skip setup
              </Button>
            )}

            {step < 6 ? (
              <Button onClick={() => setStep(step + 1)} icon={<ArrowRight className="w-4 h-4" />}>
                Continue
              </Button>
            ) : (
              <Button onClick={handleFinish} loading={loading} variant="primary" size="lg">
                Launch Workspace
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

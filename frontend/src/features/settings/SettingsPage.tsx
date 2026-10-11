import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  Brain,
  Sliders,
  ShieldAlert,
  Save,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { api } from '@/api/http';
import type { WorkspaceSettings } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function SettingsPage() {
  const { toast } = useToast();

  const [settings, setSettings] = useState<WorkspaceSettings>({
    llm_provider: 'mock',
    embedding_provider: 'mock',
    response_style: 'executive',
    max_output_tokens: 2048,
    default_chart_type: 'bar',
    citation_preference: 'always',
    top_k: 4,
    allowed_tools: 'all',
    max_sql_rows: 1000,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const s = await api.settings.get();
        setSettings(s);
      } catch (err: any) {
        toast('Failed to load settings', err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.settings.update(settings);
      setSettings(updated);
      toast('Settings Saved', 'Workspace configuration updated successfully.', 'success');
    } catch (err: any) {
      toast('Save Failed', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Workspace Settings & Model Configuration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure agent orchestration parameters, LLM model providers, and safety guardrails.
          </p>
        </div>

        <Button onClick={handleSave} loading={saving} icon={<Save className="w-3.5 h-3.5" />}>
          Save Configuration
        </Button>
      </div>

      {/* Student Extension Notice Banner */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 text-blue-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold">AI / NLP Final Year Project (FYP) Model Provider Interface</p>
          <p className="text-blue-800 leading-relaxed">
            By default, AnalystAI runs in offline deterministic mode with zero external cloud dependencies. To hook real models, simply implement the clearly marked abstract interfaces at:
          </p>
          <ul className="list-disc list-inside text-blue-800 font-mono text-[11px] pt-1 space-y-0.5">
            <li>backend/app/providers/llm_provider.py &rarr; OpenAI / Anthropic / Ollama</li>
            <li>backend/app/providers/embedding_provider.py &rarr; OpenAI / HuggingFace</li>
            <li>backend/app/providers/vector_store.py &rarr; Chroma / FAISS / Qdrant</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Model Providers */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Cpu className="w-4 h-4 text-blue-600" />
            AI & Model Orchestration
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">LLM Reasoning Engine</label>
              <select
                value={settings.llm_provider}
                onChange={(e) => setSettings({ ...settings, llm_provider: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
              >
                <option value="mock">Local Deterministic Engine (Zero API Keys Required)</option>
                <option value="openai">OpenAI GPT-4o (Extension Point)</option>
                <option value="anthropic">Anthropic Claude 3.5 Sonnet (Extension Point)</option>
                <option value="ollama">Local Ollama Llama-3 (Extension Point)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Embedding Vector Model</label>
              <select
                value={settings.embedding_provider}
                onChange={(e) => setSettings({ ...settings, embedding_provider: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
              >
                <option value="mock">Local Deterministic Embedder (Offline TF-IDF/Hash)</option>
                <option value="openai">OpenAI text-embedding-3-small (Extension Point)</option>
                <option value="huggingface">HuggingFace BAAI/bge-small-en (Extension Point)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Analyst Persona & Response Settings */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Brain className="w-4 h-4 text-indigo-600" />
            Agent Analysis & Synthesis Persona
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Executive Answer Style</label>
              <select
                value={settings.response_style}
                onChange={(e) => setSettings({ ...settings, response_style: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
              >
                <option value="executive">Executive Concise (C-Suite Decision Focus)</option>
                <option value="technical">Technical Data Analyst (Full Distribution Details)</option>
                <option value="board">Board Briefing (High-level Strategic Insights)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Visualization Type</label>
              <select
                value={settings.default_chart_type}
                onChange={(e) => setSettings({ ...settings, default_chart_type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="area">Area Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">RAG Context Depth (Top-K Chunks)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={settings.top_k}
                onChange={(e) => setSettings({ ...settings, top_k: parseInt(e.target.value, 10) || 3 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Output Token Limit</label>
              <input
                type="number"
                min={256}
                max={4096}
                value={settings.max_output_tokens}
                onChange={(e) => setSettings({ ...settings, max_output_tokens: parseInt(e.target.value, 10) || 2048 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </Card>

        {/* Safety & Guardrails */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            Execution Safety Guardrails
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max SQL Rows Per Query</label>
              <input
                type="number"
                min={50}
                max={5000}
                value={settings.max_sql_rows}
                onChange={(e) => setSettings({ ...settings, max_sql_rows: parseInt(e.target.value, 10) || 1000 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Strict Read-Only Enforcement is active. Mutations (DROP, INSERT, UPDATE, ALTER) are permanently blocked.</span>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}

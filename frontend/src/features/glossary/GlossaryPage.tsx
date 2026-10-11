import React, { useState, useEffect } from 'react';
import {
  BookA,
  Plus,
  Search,
  Filter,
  Calculator,
  Database,
  User,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { api } from '@/api/http';
import type { GlossaryTerm } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';

export function GlossaryPage() {
  const { toast } = useToast();

  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [formula, setFormula] = useState('');
  const [domain, setDomain] = useState('Revenue');
  const [sourceTables, setSourceTables] = useState('sales_orders');
  const [sourceColumns, setSourceColumns] = useState('revenue');
  const [synonyms, setSynonyms] = useState('');
  const [steward, setSteward] = useState('Finance Analytics Team');
  const [saving, setSaving] = useState(false);

  const loadTerms = async () => {
    try {
      const data = await api.glossary.list(search || undefined, domainFilter !== 'All' ? domainFilter : undefined);
      setTerms(data);
    } catch (err: any) {
      toast('Failed to load terms', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerms();
  }, [search, domainFilter]);

  const handleOpenCreate = () => {
    setEditingTerm(null);
    setTerm('');
    setDefinition('');
    setFormula('');
    setDomain('Revenue');
    setSourceTables('sales_orders');
    setSourceColumns('revenue');
    setSynonyms('');
    setSteward('Finance Analytics Team');
    setModalOpen(true);
  };

  const handleOpenEdit = (t: GlossaryTerm) => {
    setEditingTerm(t);
    setTerm(t.term);
    setDefinition(t.definition);
    setFormula(t.formula || '');
    setDomain(t.domain || 'Revenue');
    setSourceTables(t.source_tables || '');
    setSourceColumns(t.source_columns || '');
    setSynonyms(t.synonyms || '');
    setSteward(t.steward || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !definition.trim()) {
      toast('Validation Error', 'Term name and definition are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        term,
        definition,
        formula,
        domain,
        source_tables: sourceTables,
        source_columns: sourceColumns,
        synonyms,
        steward,
      };

      if (editingTerm) {
        await api.glossary.update(editingTerm.id, payload);
        toast('Term Updated', `Updated definition for "${term}".`, 'success');
      } else {
        await api.glossary.create(payload);
        toast('Term Created', `Added "${term}" to business glossary.`, 'success');
      }
      setModalOpen(false);
      loadTerms();
    } catch (err: any) {
      toast('Save Failed', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, termName: string) => {
    if (!confirm(`Delete term "${termName}" from glossary?`)) return;
    try {
      await api.glossary.delete(id);
      toast('Deleted', `Term "${termName}" removed.`, 'info');
      loadTerms();
    } catch (err: any) {
      toast('Delete Failed', err.message, 'error');
    }
  };

  const domains = ['All', 'Revenue', 'Sales', 'Customer', 'Operations', 'Finance'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Business Glossary & Metric Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Standardize metric definitions, canonical formulas, and synonyms used by the AI Analyst agent.
          </p>
        </div>

        <Button onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
          Add Glossary Term
        </Button>
      </div>

      {/* Search and Domain Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search metrics, formulas, synonyms..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                domainFilter === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {terms.map((t) => (
          <Card key={t.id} className="p-5 flex flex-col justify-between hover:border-blue-400 transition-colors">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900">{t.term}</h3>
                <Badge variant="info">{t.domain || 'General'}</Badge>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mt-2">{t.definition}</p>

              {t.formula && (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-blue-700">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-sans font-bold mb-0.5">
                    <Calculator className="w-3 h-3" /> Formula
                  </div>
                  {t.formula}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                {t.synonyms && (
                  <div>
                    <span className="font-semibold text-slate-700">Synonyms: </span>
                    <span>{t.synonyms}</span>
                  </div>
                )}
                {t.source_tables && (
                  <div>
                    <span className="font-semibold text-slate-700">Source: </span>
                    <span className="font-mono text-slate-600">{t.source_tables} ({t.source_columns || 'all'})</span>
                  </div>
                )}
                {t.steward && (
                  <div>
                    <span className="font-semibold text-slate-700">Steward: </span>
                    <span>{t.steward}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(t)}
                className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition-colors"
                title="Edit term"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(t.id, t.term)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                title="Delete term"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Term Modal */}
      {modalOpen && (
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingTerm ? `Edit "${editingTerm.term}"` : 'New Business Glossary Term'}
          footer={
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={saving}>
                {editingTerm ? 'Update Term' : 'Create Term'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSave} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Term Name *</label>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="e.g. Gross Margin"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Domain</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Revenue">Revenue</option>
                  <option value="Sales">Sales</option>
                  <option value="Customer">Customer</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Definition *</label>
              <textarea
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="Clear enterprise definition of what this metric or concept means..."
                rows={3}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Calculation Formula (SQL / Math)</label>
              <input
                type="text"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g. (total_revenue - cost_of_goods) / total_revenue * 100"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source Table(s)</label>
                <input
                  type="text"
                  value={sourceTables}
                  onChange={(e) => setSourceTables(e.target.value)}
                  placeholder="sales_orders, products"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source Column(s)</label>
                <input
                  type="text"
                  value={sourceColumns}
                  onChange={(e) => setSourceColumns(e.target.value)}
                  placeholder="revenue, discount"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Synonyms (Comma-separated)</label>
              <input
                type="text"
                value={synonyms}
                onChange={(e) => setSynonyms(e.target.value)}
                placeholder="e.g. Sales, Turnover, Top-line"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Data Steward / Team</label>
              <input
                type="text"
                value={steward}
                onChange={(e) => setSteward(e.target.value)}
                placeholder="e.g. Finance Analytics Lead"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}

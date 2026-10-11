import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookmarkCheck,
  Search,
  Sparkles,
  Trash2,
  Tag,
  Pin,
  Calendar,
  Code2,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/api/http';
import type { SavedAnalysis } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { formatDate } from '@/lib/formatters';

export function SavedAnalysesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [viewSqlAnalysis, setViewSqlAnalysis] = useState<SavedAnalysis | null>(null);

  const loadAnalyses = async () => {
    try {
      const data = await api.analyst.listSavedAnalyses();
      setAnalyses(data);
    } catch (err: any) {
      toast('Failed to load saved analyses', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete saved analysis "${title}"?`)) return;
    try {
      await api.analyst.deleteSavedAnalysis(id);
      toast('Deleted', `Analysis "${title}" deleted.`, 'info');
      loadAnalyses();
    } catch (err: any) {
      toast('Delete Failed', err.message, 'error');
    }
  };

  // Collect all unique tags
  const allTags = ['All', ...Array.from(new Set(analyses.flatMap((a) => a.tags || [])))];

  const filteredAnalyses = analyses.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.question.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase());
    const matchTag = selectedTag === 'All' || a.tags?.includes(selectedTag);
    return matchSearch && matchTag;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Saved Analyses & Insights</h1>
          <p className="text-xs text-slate-500 mt-1">
            Revisit, pin, and share answers and findings produced by the AI Analyst.
          </p>
        </div>

        <Button onClick={() => navigate('/analyst')} icon={<Sparkles className="w-4 h-4" />}>
          Run New Analysis
        </Button>
      </div>

      {/* Search & Tag Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved analyses by title or question..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
          />
        </div>

        {allTags.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedTag === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAnalyses.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-xs text-slate-500">
            No saved analyses matching filters. Save your first insight from the AI Analyst page!
          </div>
        ) : (
          filteredAnalyses.map((item) => (
            <Card
              key={item.id}
              className="p-5 flex flex-col justify-between hover:border-blue-400 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <BookmarkCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{item.title}</span>
                  </div>
                  {item.is_pinned && <Pin className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />}
                </div>

                <p className="text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 line-clamp-2">
                  "{item.question}"
                </p>

                <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                  {item.summary}
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {formatDate(item.created_at)}
                </span>
                <div className="flex items-center gap-1">
                  {item.query_sql && (
                    <button
                      onClick={() => setViewSqlAnalysis(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                      title="Inspect SQL"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-blue-600"
                    onClick={() => navigate(`/analyst?prompt=${encodeURIComponent(item.question)}`)}
                  >
                    Open &rarr;
                  </Button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* View SQL Modal */}
      {viewSqlAnalysis && (
        <Dialog
          open={!!viewSqlAnalysis}
          onClose={() => setViewSqlAnalysis(null)}
          title={`SQL Query: ${viewSqlAnalysis.title}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigate(`/sql-workspace?query=${encodeURIComponent(viewSqlAnalysis.query_sql || '')}`);
                }}
              >
                Open in SQL Workspace
              </Button>
              <Button onClick={() => setViewSqlAnalysis(null)}>Close</Button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <p className="font-semibold text-slate-800">Generated Analytical SQL:</p>
            <pre className="p-4 bg-slate-950 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
              {viewSqlAnalysis.query_sql}
            </pre>
          </div>
        </Dialog>
      )}
    </div>
  );
}

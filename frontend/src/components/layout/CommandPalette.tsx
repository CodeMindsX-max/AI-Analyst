import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, FileText, BarChart3, BookmarkCheck, BookA, Database, X } from 'lucide-react';
import { api } from '@/api/http';
import type { SearchResult } from '@/api/types';
import { cn } from '@/lib/utils';

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      return;
    }

    if (!query.trim()) {
      // Show default top routes
      setResults([
        { id: '1', title: 'Executive Overview', description: 'View KPIs & Trends', category: 'navigation', url: '/overview' },
        { id: '2', title: 'AI Analyst', description: 'Ask natural language business questions', category: 'navigation', url: '/analyst' },
        { id: '3', title: 'Data Explorer', description: 'Browse tables & schemas', category: 'navigation', url: '/data-explorer' },
        { id: '4', title: 'SQL Workspace', description: 'Execute read-only queries', category: 'navigation', url: '/sql-workspace' },
        { id: '5', title: 'Business Glossary', description: 'Explore definitions & formulas', category: 'navigation', url: '/glossary' },
      ]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const resp = await api.search.query(query);
        setResults(resp.results);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, open]);

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  if (!open) return null;

  const categoryIcons: Record<string, React.ReactNode> = {
    navigation: <Compass className="w-4 h-4 text-blue-500" />,
    report: <FileText className="w-4 h-4 text-purple-500" />,
    dashboard: <BarChart3 className="w-4 h-4 text-emerald-500" />,
    analysis: <BookmarkCheck className="w-4 h-4 text-indigo-500" />,
    glossary: <BookA className="w-4 h-4 text-amber-500" />,
    source: <Database className="w-4 h-4 text-cyan-500" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, screen name, metric, or report... (Esc to exit)"
            className="w-full bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400"
          />
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {loading && <div className="p-4 text-center text-xs text-slate-400">Searching workspace...</div>}
          {!loading && results.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">No matching resources found for "{query}"</div>
          )}
          {!loading &&
            results.map((res) => (
              <button
                key={res.id}
                onClick={() => handleSelect(res.url)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-slate-50 transition-colors group"
              >
                <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-white border border-slate-200/60 shadow-2xs">
                  {categoryIcons[res.category] || <Search className="w-4 h-4 text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate">{res.title}</div>
                  <div className="text-[11px] text-slate-500 truncate">{res.description}</div>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {res.category}
                </span>
              </button>
            ))}
        </div>

        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigation Quick Finder</span>
          <span>Press Enter to navigate</span>
        </div>
      </div>
    </div>
  );
}

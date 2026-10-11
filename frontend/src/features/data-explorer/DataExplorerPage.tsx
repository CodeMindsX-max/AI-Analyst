import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Table as TableIcon,
  Columns,
  BarChart2,
  Code2,
  Sparkles,
  ChevronRight,
  Database,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { api } from '@/api/http';
import type { TableSchemaInfo, TablePreviewResponse, ColumnProfile } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';

export function DataExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [schema, setSchema] = useState<TableSchemaInfo | null>(null);
  const [preview, setPreview] = useState<TablePreviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [page, setPage] = useState<number>(1);
  const [colSearch, setColSearch] = useState<string>('');

  const tableParam = searchParams.get('table');

  // Load available tables
  useEffect(() => {
    async function loadTableList() {
      try {
        const list = await api.explorer.listTables();
        setTables(list);
        if (list.length > 0) {
          const initTable = tableParam && list.includes(tableParam) ? tableParam : list[0];
          setSelectedTable(initTable);
        }
      } catch (err: any) {
        toast('Failed to load tables', err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadTableList();
  }, [tableParam, toast]);

  // Load selected table schema and preview data
  useEffect(() => {
    if (!selectedTable) return;
    async function loadTableData() {
      setDataLoading(true);
      try {
        const [schemaRes, previewRes] = await Promise.all([
          api.explorer.getTableSchema(selectedTable),
          api.explorer.getTableRows(selectedTable, page, 25),
        ]);
        setSchema(schemaRes);
        setPreview(previewRes);
      } catch (err: any) {
        toast('Failed to inspect table', err.message, 'error');
      } finally {
        setDataLoading(false);
      }
    }
    loadTableData();
  }, [selectedTable, page, toast]);

  const handleSelectTable = (tbl: string) => {
    setSelectedTable(tbl);
    setSearchParams({ table: tbl });
    setPage(1);
  };

  const handleOpenInSql = () => {
    navigate(`/sql-workspace?query=${encodeURIComponent(`SELECT * FROM ${selectedTable} LIMIT 50;`)}`);
  };

  const handleAskAnalyst = () => {
    navigate(`/analyst?prompt=${encodeURIComponent(`Analyze the key patterns and trends in ${selectedTable}`)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data Explorer</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse schema metadata, inspect column statistics, and preview live table rows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenInSql} icon={<Code2 className="w-3.5 h-3.5" />}>
            Open in SQL Workspace
          </Button>
          <Button size="sm" onClick={handleAskAnalyst} icon={<Sparkles className="w-3.5 h-3.5" />}>
            Ask AI Analyst
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Tables List */}
        <Card className="p-4 lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              Tables ({tables.length})
            </span>
          </div>

          <div className="space-y-1">
            {tables.map((t) => (
              <button
                key={t}
                onClick={() => handleSelectTable(t)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono transition-colors text-left ${
                  selectedTable === t
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <TableIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t}</span>
                </div>
                {selectedTable === t && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Source: <span className="font-semibold text-slate-700">Acme Analytics Warehouse</span>
          </div>
        </Card>

        {/* Right Column: Schema, Preview, Profiling */}
        <div className="lg:col-span-3 space-y-4">
          {schema && (
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-sm">
                  {selectedTable}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{schema.table_name}</h2>
                  <p className="text-xs text-slate-500">{schema.description || 'Relational table'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Rows</span>
                  <span className="font-bold text-slate-900">
                    {schema.row_count ? schema.row_count.toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Columns</span>
                  <span className="font-bold text-slate-900">{schema.columns.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <Tabs
            tabs={[
              { id: 'preview', label: 'Data Preview' },
              { id: 'schema', label: 'Columns & Schema' },
              { id: 'profiling', label: 'Column Profiling' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {dataLoading ? (
            <div className="py-20 text-center text-xs text-slate-500">Loading table data...</div>
          ) : (
            <>
              {/* Tab 1: Data Preview Table */}
              {activeTab === 'preview' && preview && (
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto max-h-[520px]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                        <tr>
                          {preview.columns.map((c) => (
                            <th key={c} className="px-3.5 py-2.5 font-semibold text-slate-700 whitespace-nowrap">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {preview.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            {preview.columns.map((c) => (
                              <td key={c} className="px-3.5 py-2 text-slate-800 whitespace-nowrap">
                                {row[c] !== null && row[c] !== undefined ? String(row[c]) : (
                                  <span className="text-slate-400 italic">null</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination bar */}
                  <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      Showing {preview.rows.length} rows (Page {page}) of {preview.total_rows.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={preview.rows.length < 25}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Tab 2: Columns & Schema */}
              {activeTab === 'schema' && schema && (
                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Filter column name..."
                      value={colSearch}
                      onChange={(e) => setColSearch(e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 w-64 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <span className="text-xs text-slate-500">{schema.columns.length} columns defined</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                        <tr>
                          <th className="py-2 px-3">Column Name</th>
                          <th className="py-2 px-3">Data Type</th>
                          <th className="py-2 px-3">Null %</th>
                          <th className="py-2 px-3">Distinct Values</th>
                          <th className="py-2 px-3">Sample Values</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {schema.columns
                          .filter((c) => c.name.toLowerCase().includes(colSearch.toLowerCase()))
                          .map((col) => (
                            <tr key={col.name} className="hover:bg-slate-50/60">
                              <td className="py-2.5 px-3 font-semibold text-slate-900 font-mono">{col.name}</td>
                              <td className="py-2.5 px-3">
                                <Badge variant="outline">{col.data_type}</Badge>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">{col.null_percentage}%</td>
                              <td className="py-2.5 px-3 text-slate-600 font-mono">{col.distinct_count}</td>
                              <td className="py-2.5 px-3 text-slate-500 text-[11px] font-mono truncate max-w-xs">
                                {col.sample_values ? col.sample_values.slice(0, 3).join(', ') : '-'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Tab 3: Profiling & Statistics */}
              {activeTab === 'profiling' && schema && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schema.columns.map((c) => (
                    <Card key={c.name} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 font-mono">{c.name}</span>
                        <Badge variant="info">{c.data_type}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Null Count</span>
                          <span className="font-semibold text-slate-800">
                            {c.null_count} ({c.null_percentage}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Distinct Count</span>
                          <span className="font-semibold text-slate-800">{c.distinct_count}</span>
                        </div>
                        {c.min_val !== undefined && (
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Min Value</span>
                            <span className="font-semibold text-slate-800 font-mono truncate block">
                              {String(c.min_val)}
                            </span>
                          </div>
                        )}
                        {c.max_val !== undefined && (
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Max Value</span>
                            <span className="font-semibold text-slate-800 font-mono truncate block">
                              {String(c.max_val)}
                            </span>
                          </div>
                        )}
                      </div>

                      {c.sample_values && c.sample_values.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 block uppercase mb-1">Sample Samples</span>
                          <div className="flex flex-wrap gap-1">
                            {c.sample_values.slice(0, 4).map((s, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                                {String(s)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

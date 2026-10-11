import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Layers,
  Sparkles,
  Hash,
  Clock,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { api } from '@/api/http';
import type { DocumentDetailResponse } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatters';

export function KnowledgeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [detail, setDetail] = useState<DocumentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDoc() {
      if (!id) return;
      try {
        const res = await api.knowledge.getDocument(id);
        setDetail(res);
      } catch (err: any) {
        toast('Not Found', err.message, 'error');
        navigate('/knowledge-base');
      } finally {
        setLoading(false);
      }
    }
    loadDoc();
  }, [id, navigate, toast]);

  const handleDelete = async () => {
    if (!detail) return;
    if (!confirm(`Delete "${detail.document.name}"?`)) return;
    try {
      await api.knowledge.deleteDocument(detail.document.id);
      toast('Deleted', 'Document removed from knowledge base.', 'info');
      navigate('/knowledge-base');
    } catch (err: any) {
      toast('Delete Failed', err.message, 'error');
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-500">Loading document details...</div>;
  }

  if (!detail) return null;

  const { document: doc, chunks, extracted_text_preview } = detail;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/knowledge-base')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Knowledge Base
        </Button>
        <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700" icon={<Trash2 className="w-3.5 h-3.5" />}>
          Delete Document
        </Button>
      </div>

      {/* Header Info */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">{doc.name}</h1>
              <Badge variant="success">{doc.status.toUpperCase()}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              File format: <span className="font-mono uppercase font-semibold">{doc.file_type}</span> &bull; Mode: {doc.indexing_mode} &bull; Created: {formatDate(doc.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-600">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Total Chunks</span>
            <span className="text-base font-bold text-slate-900">{chunks.length}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Total Characters</span>
            <span className="text-base font-bold text-slate-900">{(doc.char_count || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Raw Extracted Text Preview */}
      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          Raw Extracted Text Preview
        </h2>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-48 overflow-y-auto text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
          {extracted_text_preview || 'No raw text available.'}
        </div>
      </Card>

      {/* Chunks List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Indexed Semantic Chunks ({chunks.length})
        </h2>

        <div className="space-y-3">
          {chunks.map((chunk) => (
            <Card key={chunk.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-600 flex items-center gap-1 font-mono">
                  <Hash className="w-3.5 h-3.5" />
                  Chunk #{chunk.chunk_index + 1}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {chunk.content.length} characters &bull; ~{Math.round(chunk.content.length / 4)} tokens
                </span>
              </div>
              <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono">
                {chunk.content}
              </p>
              {chunk.metadata && Object.keys(chunk.metadata).length > 0 && (
                <div className="text-[11px] text-slate-500 font-mono pt-1">
                  Metadata: {JSON.stringify(chunk.metadata)}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

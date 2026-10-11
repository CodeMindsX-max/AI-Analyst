import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Upload,
  Search,
  FileText,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import { api } from '@/api/http';
import type { KnowledgeDocument, RetrievalPreviewItem } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { formatDate } from '@/lib/formatters';

export function KnowledgeBasePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // RAG Retrieval tester state
  const [testerOpen, setTesterOpen] = useState(false);
  const [testQuery, setTestQuery] = useState('What is our return policy and customer satisfaction threshold?');
  const [testingRag, setTestingRag] = useState(false);
  const [ragResults, setRagResults] = useState<RetrievalPreviewItem[]>([]);
  const [ragMode, setRagMode] = useState<string>('');

  const loadDocuments = async () => {
    try {
      const docs = await api.knowledge.listDocuments();
      setDocuments(docs);
    } catch (err: any) {
      toast('Failed to load documents', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast('File Required', 'Please select a file to upload.', 'error');
      return;
    }
    setUploading(true);
    try {
      const res = await api.knowledge.uploadDocument(uploadFile);
      toast('Document Ingested', `Indexed into ${res.chunk_count} chunks.`, 'success');
      setUploadOpen(false);
      setUploadFile(null);
      loadDocuments();
    } catch (err: any) {
      toast('Upload Failed', err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string, docName: string) => {
    if (!confirm(`Are you sure you want to delete "${docName}"?`)) return;
    try {
      await api.knowledge.deleteDocument(docId);
      toast('Deleted', `Document "${docName}" removed.`, 'info');
      loadDocuments();
    } catch (err: any) {
      toast('Delete Failed', err.message, 'error');
    }
  };

  const handleTestRetrieval = async () => {
    if (!testQuery.trim()) return;
    setTestingRag(true);
    try {
      const res = await api.knowledge.retrievalPreview(testQuery, 4);
      setRagResults(res.results);
      setRagMode(res.retrieval_mode);
      toast('Retrieval Completed', `Found ${res.results.length} relevant chunks.`, 'info');
    } catch (err: any) {
      toast('Retrieval Failed', err.message, 'error');
    } finally {
      setTestingRag(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Knowledge Base & RAG Index</h1>
          <p className="text-xs text-slate-500 mt-1">
            Store internal business documentation, KPI playbooks, and company policies to ground AI reasoning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTesterOpen(true)}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Test RAG Retrieval
          </Button>
          <Button size="sm" onClick={() => setUploadOpen(true)} icon={<Upload className="w-3.5 h-3.5" />}>
            Upload Document
          </Button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {documents.map((doc) => (
          <Card
            key={doc.id}
            className="p-5 flex flex-col justify-between hover:border-blue-400 transition-colors group"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <Badge variant={doc.status === 'indexed' ? 'success' : 'outline'}>
                  {doc.status.toUpperCase()}
                </Badge>
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {doc.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Type: <span className="font-mono uppercase">{doc.file_type}</span> &bull; Mode: {doc.indexing_mode}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Chunks</span>
                  <span className="font-semibold text-slate-800">{doc.chunk_count}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Size / Chars</span>
                  <span className="font-semibold text-slate-800">
                    {(doc.char_count || doc.file_size_bytes || 0).toLocaleString()} chars
                  </span>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Added</span>
                  <span className="text-slate-600">{formatDate(doc.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600"
                onClick={() => navigate(`/knowledge-base/${doc.id}`)}
              >
                Inspect Chunks &rarr;
              </Button>
              <button
                onClick={() => handleDelete(doc.id, doc.name)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Upload Document Modal */}
      {uploadOpen && (
        <Dialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          title="Upload & Ingest Document"
          footer={
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} loading={uploading} disabled={!uploadFile}>
                Ingest & Chunk Document
              </Button>
            </div>
          }
        >
          <form onSubmit={handleUpload} className="space-y-4 py-2 text-xs">
            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200/60 text-blue-900 text-[11px] leading-relaxed">
              Uploaded files are parsed, sanitized, chunked via semantic sentence windows (400-800 characters with overlap), and registered into the RAG vector retriever.
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select File (.txt, .md, .pdf, .json) *</label>
              <input
                type="file"
                accept=".txt,.md,.markdown,.pdf,.json"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {uploadFile && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-800">{uploadFile.name}</span>
                <span className="text-slate-500 block text-[11px]">{(uploadFile.size / 1024).toFixed(1)} KB</span>
              </div>
            )}
          </form>
        </Dialog>
      )}

      {/* RAG Retrieval Tester Modal */}
      {testerOpen && (
        <Dialog
          open={testerOpen}
          onClose={() => setTesterOpen(false)}
          title="RAG Retrieval Diagnostic Tester"
          footer={<Button onClick={() => setTesterOpen(false)}>Close Inspector</Button>}
        >
          <div className="space-y-4 py-2 text-xs">
            <p className="text-slate-600 text-[11px]">
              Query the vector retriever to observe similarity scoring, semantic ranking, and chunk provenance.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Enter query to test RAG..."
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <Button size="sm" onClick={handleTestRetrieval} loading={testingRag}>
                Test Search
              </Button>
            </div>

            {ragMode && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Retrieval Mode: <strong className="text-slate-800 font-mono">{ragMode}</strong></span>
                <span>Top Matches: <strong className="text-slate-800">{ragResults.length}</strong></span>
              </div>
            )}

            <div className="space-y-3 max-h-[380px] overflow-y-auto">
              {ragResults.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  Click "Test Search" to run semantic search over indexed documents.
                </div>
              ) : (
                ragResults.map((res, i) => (
                  <div key={i} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-900">{res.document_name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="info">Score: {res.score.toFixed(3)}</Badge>
                        <Badge variant="outline">{res.match_method}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-mono bg-white p-2.5 rounded border border-slate-200">
                      "{res.content}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

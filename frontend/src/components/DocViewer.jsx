import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, FileText, ExternalLink, AlertCircle } from 'lucide-react';

export default function DocViewer({ activeDoc, pdfPreviewUrl }) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfError, setPdfError] = useState(false);
  const totalPages = Number(activeDoc?.totalPages) || 0;

  useEffect(() => {
    setCurrentPage(Number(activeDoc?.currentPage) || 1);
    setZoom(100);
    setPdfError(false);
  }, [activeDoc?.id, activeDoc?.currentPage, pdfPreviewUrl]);

  const viewerUrl = pdfPreviewUrl ? `${pdfPreviewUrl}#page=${currentPage}&zoom=${zoom}` : '';
  const openOriginal = () => window.open(pdfPreviewUrl, '_blank', 'noopener,noreferrer');

  return (
    <section className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--workspace)]">
      <header className="flex min-h-[64px] shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <FileText size={19} strokeWidth={1.7} className="shrink-0 text-[var(--accent)]" />
          <div className="min-w-0">
            <h2 className="truncate text-[13px] font-semibold" title={activeDoc?.fileName || ''}>{activeDoc?.fileName || 'Document preview'}</h2>
            <p className="mt-0.5 font-ui-mono text-[9px] uppercase tracking-[0.07em] text-[var(--text-muted)]">{totalPages > 0 ? `${totalPages} pages · PDF` : 'PDF document'}</p>
          </div>
        </div>
        {pdfPreviewUrl && <button type="button" onClick={openOriginal} className="secondary-button !min-h-[40px] !px-3" title="Open original PDF"><ExternalLink size={14} /><span className="hidden sm:inline">Open original</span></button>}
      </header>

      <div className="custom-scrollbar relative flex min-h-0 flex-1 items-start justify-center overflow-auto p-3 pb-28 sm:p-6 sm:pb-32">
        {activeDoc && pdfPreviewUrl && !pdfError ? (
          <div className="relative h-full min-h-[600px] w-full max-w-[850px] overflow-hidden rounded-md border border-[var(--border-strong)] bg-[var(--surface-raised)] shadow-[var(--shadow-soft)]" style={{ minWidth: zoom > 115 ? `${zoom}%` : '100%' }}>
            <iframe key={`${activeDoc.id}-${currentPage}-${zoom}`} src={viewerUrl} title={activeDoc.fileName || 'PDF preview'} className="h-full min-h-[600px] w-full border-0" onError={() => setPdfError(true)} />
          </div>
        ) : (
          <div className="flex min-h-[400px] w-full max-w-md flex-col items-center justify-center px-6 text-center">
            {pdfError ? <AlertCircle size={30} className="text-[var(--danger)]" /> : <FileText size={30} strokeWidth={1.4} className="text-[var(--text-muted)]" />}
            <h3 className="mt-4 text-base font-semibold">{pdfError ? 'Unable to preview this PDF' : 'PDF preview unavailable'}</h3>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--text-muted)]">The document may still be available for chat. Try opening the original PDF instead.</p>
            {pdfPreviewUrl && <button type="button" onClick={openOriginal} className="primary-button mt-5"><ExternalLink size={15} />Open original PDF</button>}
          </div>
        )}
      </div>

      {activeDoc && pdfPreviewUrl && !pdfError && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-3 sm:bottom-6">
          <div className="pointer-events-auto flex max-w-full items-center gap-1 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)]/95 p-1.5 shadow-[var(--shadow-soft)] backdrop-blur-md" role="toolbar" aria-label="PDF viewer controls">
            <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage <= 1} className="icon-button" title="Previous page" aria-label="Previous page"><ChevronLeft size={17} /></button>
            <div className="flex min-w-[58px] items-center justify-center font-ui-mono text-[11px] tabular-nums"><span>{currentPage}</span><span className="mx-1.5 text-[var(--text-muted)]">/</span><span className="text-[var(--text-muted)]">{totalPages || '—'}</span></div>
            <button type="button" onClick={() => setCurrentPage((page) => totalPages > 0 ? Math.min(totalPages, page + 1) : page + 1)} disabled={totalPages > 0 && currentPage >= totalPages} className="icon-button" title="Next page" aria-label="Next page"><ChevronRight size={17} /></button>
            <div className="mx-1 h-6 w-px bg-[var(--border)]" />
            <button type="button" onClick={() => setZoom((value) => Math.max(value - 10, 50))} disabled={zoom <= 50} className="icon-button" title="Zoom out" aria-label="Zoom out"><ZoomOut size={16} /></button>
            <button type="button" onClick={() => setZoom(100)} className="hidden h-10 min-w-[52px] items-center justify-center rounded-lg px-2 font-ui-mono text-[11px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-subtle)] min-[420px]:flex" title="Reset zoom">{zoom}%</button>
            <button type="button" onClick={() => setZoom((value) => Math.min(value + 10, 200))} disabled={zoom >= 200} className="icon-button" title="Zoom in" aria-label="Zoom in"><ZoomIn size={16} /></button>
            <button type="button" onClick={() => { setZoom(100); setCurrentPage(1); }} className="icon-button hidden sm:inline-flex" title="Reset view" aria-label="Reset view"><RotateCcw size={15} /></button>
          </div>
        </div>
      )}
    </section>
  );
}

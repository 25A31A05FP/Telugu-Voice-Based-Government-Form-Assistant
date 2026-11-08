import React from 'react';
import { X, Download, Printer, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import { FormSession, FormTemplate } from '../types/form.ts';
import { generateApplicationPdf } from '../utils/pdfGenerator.ts';

interface PreviewPdfModalProps {
  session: FormSession;
  template: FormTemplate;
  onClose: () => void;
  onUpdateSession: (updated: FormSession) => void;
}

export const PreviewPdfModal: React.FC<PreviewPdfModalProps> = ({
  session,
  template,
  onClose,
  onUpdateSession,
}) => {
  const handleDownload = () => {
    generateApplicationPdf(session, template);
    onUpdateSession({
      ...session,
      pdfGeneratedCount: (session.pdfGeneratedCount || 0) + 1,
    });
  };

  const answeredCount = Object.keys(session.answers).length;
  const isComplete = answeredCount === template.questions.length;
  const refCode = `APP-${session.id.slice(-8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">
              Application Document Preview
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Bilingual Output
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-slate-700 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Sheet Container */}
        <div className="p-6 md:p-8 overflow-y-auto bg-stone-100 flex-1 flex justify-center">
          <div className="bg-white w-full max-w-2xl border-2 border-emerald-900 shadow-lg rounded-sm p-8 space-y-6 text-slate-900">
            {/* Top Sheet Header */}
            <div className="bg-emerald-800 text-white p-4 rounded text-center space-y-1">
              <div className="text-xs uppercase tracking-widest font-bold text-emerald-200">
                GOVERNMENT DEMONSTRATION APPLICATION
              </div>
              <div className="text-xl font-extrabold tracking-tight">
                సహాయక్ — TELUGU VOICE FORM ASSISTANT
              </div>
              <div className="text-[11px] text-emerald-100">
                Authentic Bilingual Self-Declaration Format (తెలుగు & ఇంగ్లీష్)
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="flex items-start justify-between gap-4 border-b pb-4 border-stone-200">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                  {template.titleEn}
                </h3>
                <div className="text-sm font-semibold text-emerald-800">
                  {template.titleTe}
                </div>
              </div>

              <div className="text-right text-xs space-y-0.5 text-slate-500 font-mono">
                <div>Ref: <strong className="text-slate-800">{refCode}</strong></div>
                <div>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div className="text-emerald-700 font-semibold">{isComplete ? 'VERIFIED COMPLETE' : 'DRAFT'}</div>
              </div>
            </div>

            {/* Answered Fields Grid */}
            <div className="border border-stone-200 rounded overflow-hidden">
              <div className="bg-stone-50 border-b border-stone-200 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 grid grid-cols-12 gap-2">
                <div className="col-span-1">#</div>
                <div className="col-span-6">Field / Question Details</div>
                <div className="col-span-5">Applicant Response</div>
              </div>

              <div className="divide-y divide-stone-100 text-xs">
                {template.questions.map((q, idx) => {
                  const ans = session.answers[q.id];
                  return (
                    <div
                      key={q.id}
                      className={`px-3 py-2 grid grid-cols-12 gap-2 items-center ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'
                      }`}
                    >
                      <div className="col-span-1 text-slate-400 font-mono">{idx + 1}</div>
                      <div className="col-span-6">
                        <div className="font-semibold text-slate-900">{q.labelEn}</div>
                        <div className="text-[11px] text-emerald-800 font-medium">{q.labelTe}</div>
                      </div>
                      <div className="col-span-5 font-medium text-slate-900">
                        {ans ? (
                          <div>
                            <span className="font-bold text-slate-900">{ans.englishTranslation || ans.rawTelugu}</span>
                            {ans.rawTelugu && ans.rawTelugu !== ans.englishTranslation && (
                              <div className="text-[10px] text-slate-500">{ans.rawTelugu}</div>
                            )}
                          </div>
                        ) : (
                          <span className="italic text-slate-300">Not answered</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Supporting Documents Checklist */}
            <div className="border border-stone-200 rounded p-4 bg-stone-50/60 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                SUPPORTING DOCUMENTS ATTESTATION (ధృవపత్రాల జాబితా)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {template.requiredDocuments.map((docItem) => {
                  const isReady = !!session.checklist[docItem.id];
                  return (
                    <div key={docItem.id} className="flex items-center gap-2">
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border ${
                          isReady
                            ? 'bg-emerald-700 border-emerald-700 text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isReady && '✓'}
                      </div>
                      <span className={isReady ? 'font-semibold text-slate-900' : 'text-slate-500'}>
                        {docItem.titleEn}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Declaration */}
            <div className="border border-amber-300 bg-amber-50/50 rounded p-3 text-xs text-amber-950 space-y-1">
              <div className="font-bold text-amber-900">
                DECLARATION / దరఖాస్తుదారు ధృవీకరణ:
              </div>
              <p className="leading-relaxed text-[11px]">
                I solemnly affirm that the particulars furnished above are true and correct to the best of my knowledge and belief.
                పై పేర్కొన్న వివరాలన్నీ నా పరిజ్ఞానం మేరకు నిజమైనవని మరియు సరైనవని దీని ద్వారా ధృవీకరిస్తున్నాను.
              </p>
            </div>

            {/* Signatures */}
            <div className="pt-4 flex items-end justify-between text-xs text-slate-600">
              <div className="space-y-1">
                <div>Date: ____________________</div>
                <div>Place: ___________________</div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-8" />
                <div className="border-t border-slate-400 pt-1 font-semibold">
                  Applicant Signature / Thumb Impression
                </div>
                <div className="text-[10px] text-slate-400">
                  (దరఖాస్తుదారు సంతకం / వేలిముద్ర)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-white flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Click 'Download PDF' to save a clean, high-resolution document ready for printing.
          </div>
          <button
            onClick={handleDownload}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Form PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ArrowLeft,
  FileCheck,
  FileText,
  Download,
  AlertTriangle,
  Edit2,
  Check,
  X,
  Printer,
  Sparkles,
  Share2,
} from 'lucide-react';
import { FormSession, FormTemplate, FormQuestion } from '../types/form.ts';
import { generateApplicationPdf } from '../utils/pdfGenerator.ts';

interface ReviewFormViewProps {
  session: FormSession;
  template: FormTemplate;
  onUpdateSession: (updated: FormSession) => void;
  onNavigate: (route: string) => void;
  onOpenPdfPreview: () => void;
}

export const ReviewFormView: React.FC<ReviewFormViewProps> = ({
  session,
  template,
  onUpdateSession,
  onNavigate,
  onOpenPdfPreview,
}) => {
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const answeredCount = Object.keys(session.answers).length;
  const totalCount = template.questions.length;

  const missingRequired = template.questions.filter(
    (q) => q.required && !session.answers[q.id]?.englishTranslation && !session.answers[q.id]?.rawTelugu
  );

  const handleStartEdit = (q: FormQuestion) => {
    setEditingQuestionId(q.id);
    const existing = session.answers[q.id];
    setEditText(existing?.englishTranslation || existing?.rawTelugu || '');
  };

  const handleSaveEdit = (q: FormQuestion) => {
    if (!editText.trim()) {
      // Remove answer if cleared
      const updatedAnswers = { ...session.answers };
      delete updatedAnswers[q.id];
      const updated: FormSession = {
        ...session,
        answers: updatedAnswers,
        status: Object.keys(updatedAnswers).length === totalCount ? 'completed' : 'draft',
        updatedAt: new Date().toISOString(),
      };
      onUpdateSession(updated);
    } else {
      const updatedAnswers = {
        ...session.answers,
        [q.id]: {
          questionId: q.id,
          rawTelugu: session.answers[q.id]?.rawTelugu || editText.trim(),
          englishTranslation: editText.trim(),
          updatedAt: new Date().toISOString(),
          isConfirmed: true,
        },
      };
      const updated: FormSession = {
        ...session,
        answers: updatedAnswers,
        status: Object.keys(updatedAnswers).length === totalCount ? 'completed' : 'draft',
        updatedAt: new Date().toISOString(),
      };
      onUpdateSession(updated);
    }
    setEditingQuestionId(null);
  };

  const handleDownloadPdf = () => {
    generateApplicationPdf(session, template);
    // increment count
    onUpdateSession({
      ...session,
      pdfGeneratedCount: (session.pdfGeneratedCount || 0) + 1,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(`workspace/${session.id}`)}
            className="w-9 h-9 rounded-full bg-white border border-stone-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-serif">
              Review & edit
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {template.titleEn} • {answeredCount}/{totalCount} answered
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleShareLink}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-colors cursor-pointer"
            title="Copy project shareable link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedLink ? 'Link copied!' : 'Share'}</span>
          </button>

          <button
            onClick={() => onNavigate(`checklist/${session.id}`)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-colors cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Checklist</span>
          </button>

          <button
            onClick={onOpenPdfPreview}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-200" />
            <span>Preview document</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Missing Required Fields Alert */}
      {missingRequired.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5 text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Required answers still missing ({missingRequired.length})</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {missingRequired.map((q) => q.labelEn).join(', ')}
          </p>
          <div className="pt-1">
            <button
              onClick={() => onNavigate(`workspace/${session.id}`)}
              className="font-bold text-emerald-800 hover:text-emerald-900 underline cursor-pointer"
            >
              Answer them with voice assistant now →
            </button>
          </div>
        </div>
      )}

      {/* Review Table / List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden">
        {template.questions.map((q, idx) => {
          const answer = session.answers[q.id];
          const isEditing = editingQuestionId === q.id;

          return (
            <div
              key={q.id}
              className="p-5 hover:bg-stone-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {idx + 1}. {q.labelEn}
                  </span>
                  {q.required && <span className="text-amber-600 font-bold">*</span>}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {q.labelTe}
                </div>

                {/* Answer Display or Edit Input */}
                {isEditing ? (
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="Type updated answer..."
                      className="bg-white border border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ring-2 ring-emerald-200 w-full max-w-md"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(q)}
                      className="p-1.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 cursor-pointer"
                      title="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingQuestionId(null)}
                      className="p-1.5 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="pt-1">
                    {answer ? (
                      <div className="text-sm font-bold text-slate-900">
                        {answer.englishTranslation || answer.rawTelugu}
                        {answer.rawTelugu && answer.rawTelugu !== answer.englishTranslation && (
                          <span className="text-xs font-normal text-slate-500 ml-2">
                            ({answer.rawTelugu})
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs italic text-slate-400">
                        Not answered
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              {!isEditing && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleStartEdit(q)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 hover:bg-stone-100 text-slate-700 border border-stone-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-slate-400" />
                    <span>{answer ? 'Edit' : 'Add'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

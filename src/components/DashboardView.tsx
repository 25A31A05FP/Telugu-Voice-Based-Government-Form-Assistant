import React, { useState } from 'react';
import {
  Mic,
  FileText,
  Upload,
  Plus,
  ArrowRight,
  Trash2,
  Clock,
  CheckCircle2,
  Download,
  AlertCircle,
  FileCheck,
  Share2,
  Check,
} from 'lucide-react';
import { FormSession, FormTemplate } from '../types/form.ts';
import { calculateCompletionRate } from '../utils/validation.ts';
import { getAllTemplates } from '../utils/storage.ts';

interface DashboardViewProps {
  sessions: FormSession[];
  onNavigate: (route: string) => void;
  onDeleteSession: (id: string) => void;
  onSelectSession: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessions,
  onNavigate,
  onDeleteSession,
  onSelectSession,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const allTemplates = getAllTemplates();
  const drafts = sessions.filter((s) => s.status === 'draft');
  const completed = sessions.filter((s) => s.status === 'completed');
  const totalPdfs = sessions.reduce((sum, s) => sum + (s.pdfGeneratedCount || 0), 0);
  const latestSession = sessions[0];

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-200">
        <div>
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">
            YOUR WORKSPACE
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif">
            Namaskaram
          </h1>
          <p className="text-base text-emerald-800 font-medium mt-1">
            నమస్కారం · మీ దరఖాస్తులు ఇక్కడ ఉంటాయి (Your applications live here)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleShareLink}
            className="flex items-center gap-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-slate-800 px-3.5 py-2.5 rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Copy shareable project link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedLink ? 'Link copied!' : 'Share app link'}</span>
          </button>

          {latestSession && (
            <button
              onClick={() => onSelectSession(latestSession.id)}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4 text-emerald-200" />
              <span>Continue application</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('new')}
            className="flex items-center gap-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-slate-800 px-4 py-2.5 rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Demo templates</span>
          </button>

          <button
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Upload your form</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            TOTAL APPLICATIONS
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-serif">
            {sessions.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            sessions on this device
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            DRAFTS
          </div>
          <div className="text-3xl font-extrabold text-amber-600 font-serif">
            {drafts.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            still in progress
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            COMPLETED
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-serif">
            {completed.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            ready to print
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            PDFS GENERATED
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-serif">
            {totalPdfs}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            all downloads
          </div>
        </div>
      </div>

      {/* Main Sections: Applications List & PDF Downloads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Applications List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-serif">
              Applications
            </h2>
            <button
              onClick={() => onNavigate('documents')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              All documents
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No applications started yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Start from a sample government certificate template or upload your own college/scholarship form.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => onNavigate('new')}
                  className="px-4 py-2 bg-slate-900 hover:bg-emerald-800 text-white rounded-full text-xs font-semibold transition-colors cursor-pointer"
                >
                  Start with a template
                </button>
                <button
                  onClick={() => onNavigate('upload')}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                >
                  Upload your form
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const template = allTemplates.find((t) => t.id === session.templateId);
                const totalQ = template?.questions.length || 14;
                const answeredQ = Object.keys(session.answers).length;
                const percentage = calculateCompletionRate(answeredQ, totalQ);

                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-emerald-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {session.formTitleEn}
                          </h3>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              session.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                        <div className="text-xs text-emerald-800 font-medium">
                          {session.formTitleTe}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                          <span>Updated {new Date(session.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          {session.applicantName && <span>• Applicant: {session.applicantName}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectSession(session.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          <Mic className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Continue</span>
                        </button>
                        <button
                          onClick={() => onNavigate(`form/${session.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>Review</span>
                        </button>
                        <button
                          onClick={() => onDeleteSession(session.id)}
                          className="w-8 h-8 rounded-lg bg-stone-50 hover:bg-red-50 text-stone-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar inside Card */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="w-48 bg-stone-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="font-semibold text-slate-700">
                        {answeredQ}/{totalQ} answered ({percentage}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Recent PDF Downloads & Next Step Guidance */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 font-serif mb-4">
              Recent PDF downloads
            </h2>

            {completed.length > 0 ? (
              <div className="space-y-3">
                {completed.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3"
                  >
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {comp.formTitleEn}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Ready to print · {Object.keys(comp.answers).length} questions
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate(`form/${comp.id}`)}
                      className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg hover:bg-emerald-100 cursor-pointer"
                      title="Preview PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p>Generated documents will be listed here.</p>
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-stone-100">
              <div className="text-xs uppercase tracking-wider font-bold text-slate-600 mb-1">
                NEXT STEP
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Finish every question, check the supporting documents, then download the demonstration PDF.
              </p>
              <button
                onClick={() => onNavigate('new')}
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-4 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>Start an application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

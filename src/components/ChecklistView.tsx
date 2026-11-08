import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  FileCheck,
  Check,
  Paperclip,
  Info,
  CheckCircle2,
  FileText,
  Trash2,
} from 'lucide-react';
import { FormSession, FormTemplate, DocumentChecklistItem } from '../types/form.ts';

interface ChecklistViewProps {
  session: FormSession;
  template: FormTemplate;
  onUpdateSession: (updated: FormSession) => void;
  onNavigate: (route: string) => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  session,
  template,
  onUpdateSession,
  onNavigate,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeAttachingDocId, setActiveAttachingDocId] = useState<string | null>(null);

  const toggleReady = (docId: string) => {
    const isCurrent = !!session.checklist[docId];
    const updatedChecklist = {
      ...session.checklist,
      [docId]: !isCurrent,
    };
    onUpdateSession({
      ...session,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAttachClick = (docId: string) => {
    setActiveAttachingDocId(docId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeAttachingDocId && e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      onUpdateSession({
        ...session,
        checklist: {
          ...session.checklist,
          [activeAttachingDocId]: true,
        },
        attachedDocs: {
          ...session.attachedDocs,
          [activeAttachingDocId]: fileName,
        },
        updatedAt: new Date().toISOString(),
      });
      setActiveAttachingDocId(null);
    }
  };

  const readyCount = Object.keys(session.checklist).filter((k) => session.checklist[k]).length;
  const totalCount = template.requiredDocuments.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(`workspace/${session.id}`)}
            className="w-9 h-9 rounded-full bg-white border border-stone-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-serif">
              Document checklist
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {template.titleEn} • {readyCount}/{totalCount} ready
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate(`form/${session.id}`)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          Review form
        </button>
      </div>

      {/* Notice Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-bold text-emerald-900">
            This app does not verify any document.
          </div>
          <div className="text-emerald-800 font-medium">
            ఈ యాప్ ఏ పత్రాన్ని పరిశీలించదు. మీరు ఏ పత్రాలు సిద్ధంగా ఉన్నాయో మాత్రమే గుర్తు పెట్టుకుంటుంది.
          </div>
          <p className="text-slate-500 pt-1">
            Uploads are stored privately and are only ever accessed within your current browser session.
          </p>
        </div>
      </div>

      {/* Checklist items list */}
      <div className="space-y-3">
        {template.requiredDocuments.map((docItem) => {
          const isReady = !!session.checklist[docItem.id];
          const attachedFile = session.attachedDocs?.[docItem.id];

          return (
            <div
              key={docItem.id}
              className={`bg-white rounded-2xl border p-5 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isReady ? 'border-emerald-400 bg-emerald-50/20' : 'border-stone-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleReady(docItem.id)}
                  className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center border mt-0.5 transition-all cursor-pointer ${
                    isReady
                      ? 'bg-emerald-700 border-emerald-700 text-white'
                      : 'border-stone-300 bg-white hover:border-emerald-500'
                  }`}
                >
                  {isReady && <Check className="w-3.5 h-3.5" />}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {docItem.titleEn}
                    </h3>
                    {docItem.required && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-emerald-800">
                    {docItem.titleTe}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pt-0.5">
                    {docItem.descriptionEn}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {docItem.descriptionTe}
                  </p>

                  {attachedFile && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 rounded-lg text-xs font-medium text-slate-700">
                      <Paperclip className="w-3 h-3 text-slate-500" />
                      <span>Attached: {attachedFile}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => toggleReady(docItem.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isReady
                      ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isReady ? 'Ready (సిద్ధం)' : 'Mark as ready'}</span>
                </button>

                <button
                  onClick={() => handleAttachClick(docItem.id)}
                  className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                  <span>Attach</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

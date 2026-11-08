import React, { useState } from 'react';
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { FormTemplate } from '../types/form.ts';
import { getAllTemplates, getUserSettings, saveUserSettings } from '../utils/storage.ts';

interface NewApplicationViewProps {
  onStartSession: (templateId: string, applicantName: string) => void;
  onNavigate: (route: string) => void;
}

export const NewApplicationView: React.FC<NewApplicationViewProps> = ({
  onStartSession,
  onNavigate,
}) => {
  const templates = getAllTemplates();
  const settings = getUserSettings();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || 'income-certificate');
  const [applicantName, setApplicantName] = useState<string>(settings.applicantName || '');
  const [questionLang, setQuestionLang] = useState<'te-IN' | 'en-IN'>(settings.language);
  const [hasConsent, setHasConsent] = useState<boolean>(false);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleStart = () => {
    if (!hasConsent) return;
    saveUserSettings({
      applicantName,
      language: questionLang,
    });
    onStartSession(selectedTemplateId, applicantName);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back & Heading */}
      <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-9 h-9 rounded-full bg-white border border-stone-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">
            NEW APPLICATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            Choose a form to start
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form selection */}
        <div className="lg:col-span-7 space-y-5">
          {/* Upload Custom Card */}
          <div
            onClick={() => onNavigate('upload')}
            className="group relative bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200/90 rounded-2xl p-6 cursor-pointer transition-all shadow-xs hover:shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-700 text-white rounded-lg">
                    <Upload className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                    Upload any application form
                  </h2>
                </div>
                <div className="text-xs font-semibold text-emerald-800">
                  మీ సొంత దరఖాస్తు ఫారాన్ని అప్‌లోడ్ చేయండి
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  College admission, scholarship, job, internship, exam, hostel or any PDF — scanned PDF, photo, DOCX or a public form link.
                </p>
              </div>

              <div className="w-8 h-8 rounded-full bg-white border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-all">
                →
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              OR START FROM A DEMONSTRATION TEMPLATE
            </div>

            <div className="space-y-3">
              {templates.map((tpl) => {
                const isSelected = tpl.id === selectedTemplateId;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      isSelected
                        ? 'bg-emerald-50/40 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {tpl.titleEn}
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-slate-600">
                          {tpl.badge || 'Demo'}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-emerald-800">
                        {tpl.titleTe}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                        {tpl.descriptionEn}
                      </p>
                      <div className="text-[11px] font-medium text-slate-600 pt-1">
                        {tpl.questions.length} questions · {tpl.requiredDocuments.length} documents
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-emerald-700 border-emerald-700 text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Name, Language, What you'll need, Consent */}
        <div className="lg:col-span-5 space-y-5">
          {/* Applicant & Language Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                YOUR NAME (OPTIONAL)
              </label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="e.g. Lakshmi Devi"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                QUESTION LANGUAGE
              </label>
              <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setQuestionLang('te-IN')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    questionLang === 'te-IN'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  తెలుగు
                </button>
                <button
                  type="button"
                  onClick={() => setQuestionLang('en-IN')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    questionLang === 'en-IN'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* What you'll need */}
            {selectedTemplate && selectedTemplate.requiredDocuments.length > 0 && (
              <div className="pt-3 border-t border-stone-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  WHAT YOU'LL NEED
                </div>
                <div className="space-y-1.5">
                  {selectedTemplate.requiredDocuments.map((docItem) => (
                    <div
                      key={docItem.id}
                      className="flex items-center gap-2 text-xs text-slate-600"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      <span>{docItem.titleEn}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Consent and Start Button Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Consent before we collect anything</span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <p className="font-medium text-slate-800">
                ప్రశ్నలు వినిపించడానికి మరియు మీ సమాధానాలు అర్థం చేసుకోవడానికి, ఈ యాప్ మీ వాయిస్ రికార్డింగ్‌ను స్పీచ్-టు-టెక్స్ట్ సేవకు మరియు మీ సమాధానాల పాఠ్యాన్ని అనువాద సేవకు పంపుతుంది. మీరు తర్వాత కొనసాగించడానికి సమాధానాలు ఈ యాప్‌లో నిల్వ చేయబడతాయి. ప్రభుత్వ కార్యాలయానికి ఏమీ పంపబడదు. ఎప్పుడైనా సెషన్‌ను తొలగించవచ్చు.
              </p>
              <p className="text-[11px] text-slate-500">
                To hear questions and understand your answers, this app sends your recorded audio to a speech-to-text service and the text of your answers to a language translation service. Your answers are stored in this app so you can continue later. Nothing is sent to a government office. You can delete a session at any time from the dashboard.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={hasConsent}
                onChange={(e) => setHasConsent(e.target.checked)}
                className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-600 cursor-pointer"
              />
              <span className="text-xs text-slate-700 leading-normal">
                I understand and agree that my answers are processed by the speech and translation services described above. <span className="font-semibold text-emerald-900">నేను అర్థం చేసుకుని అంగీకరిస్తున్నాను.</span>
              </span>
            </label>

            <button
              onClick={handleStart}
              disabled={!hasConsent}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 ${
                hasConsent
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer hover:shadow'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <span>Start voice session</span>
              <span>→</span>
            </button>

            <div className="text-center text-[11px] text-slate-400">
              Demonstration templates only. Nothing is submitted to any department.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Mic,
  Upload,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Volume2,
  Sparkles,
  Download,
} from 'lucide-react';
import { SAMPLE_TEMPLATES } from '../data/sampleForms.ts';

interface HomeViewProps {
  onNavigate: (route: string) => void;
  onSelectTemplate: (templateId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectTemplate,
}) => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Telugu • తెలుగు • English</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 font-serif leading-[1.15] tracking-tight">
              Any application, <br />
              explained in your <br />
              <span className="italic font-normal text-emerald-700 underline decoration-emerald-200 underline-offset-8">
                own language
              </span>
            </h1>

            <div className="text-lg sm:text-xl font-bold text-slate-800">
              ప్రభుత్వ ఫారాలను తెలుగులో వినండి, మాట్లాడి నింపండి.
            </div>

            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              Upload a college admission, scholarship, job, internship, exam or government application — as a PDF, a scanned copy, a photo, a Word file, or a public link. సహాయక్ finds every question, reads it aloud in Telugu, listens to your answer, translates it into English and fills the form for you — with everything shown back before you download the document.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('upload')}
                className="flex items-center gap-2.5 bg-slate-900 hover:bg-emerald-800 text-white px-6 py-3.5 rounded-full text-sm font-bold shadow-sm transition-all hover:shadow cursor-pointer"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload your form</span>
              </button>

              <button
                onClick={() => onNavigate('new')}
                className="flex items-center gap-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-slate-800 px-6 py-3.5 rounded-full text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4 text-emerald-700" />
                <span>Start with a sample</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-stone-200 max-w-lg">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                  Any
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  form you upload
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                  2
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  languages
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-serif">
                  100%
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  review before download
                </div>
              </div>
            </div>

            {/* Tags / Supported Types */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                'College admission',
                'Scholarship',
                'Job / internship',
                'Exam registration',
                'Government form',
                'Scanned PDF',
                'Word document',
                'Form link',
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-white border border-stone-200 text-slate-600 text-xs font-medium shadow-2xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right Hero Interactive Widget Preview */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>VOICE WORKSPACE</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Question 3 of 14
                </span>
              </div>

              {/* Dark Navy Question Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-2 relative overflow-hidden">
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  ASKED IN TELUGU
                </div>
                <div className="text-xl sm:text-2xl font-bold font-serif leading-snug">
                  మీ పూర్తి పేరు ఏమిటి?
                </div>
                <div className="text-xs text-slate-300">
                  What is your full name?
                </div>
              </div>

              {/* Central Mic & Audio Waves */}
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-md">
                    <Mic className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      LISTENING…
                    </div>
                    {/* Animated waveform bars */}
                    <div className="flex items-center gap-1 h-6 mt-1">
                      {[10, 18, 24, 14, 22, 16, 20, 8].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-emerald-600 rounded-full animate-pulse"
                          style={{
                            height: `${h}px`,
                            animationDelay: `${i * 120}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Answer Dual Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    TELUGU ANSWER
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    లక్ష్మి దేవి
                  </div>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    ENGLISH TRANSLATION
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    Lakshmi Devi
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Field “Full name” filled · saved to this session</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four Steps Section */}
      <section className="bg-stone-100/70 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs uppercase tracking-wider font-bold text-emerald-800">
              HOW IT WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif">
              Four steps, no form jargon.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                titleEn: 'Hear the question',
                titleTe: 'ప్రశ్న వినండి',
                desc: 'Every English form question is translated into natural Telugu and read aloud, one question at a time.',
              },
              {
                num: '02',
                titleEn: 'Answer in Telugu',
                titleTe: 'తెలుగులో సమాధానం చెప్పండి',
                desc: 'Speak or type your answer. Your Telugu words are recorded as speech and transcribed by Gemini speech intelligence.',
              },
              {
                num: '03',
                titleEn: 'See the English',
                titleTe: 'ఆంగ్ల అనువాదం చూడండి',
                desc: 'The answer is translated into English, validated for the field type, and placed in the right box of the form.',
              },
              {
                num: '04',
                titleEn: 'Preview & download',
                titleTe: 'PDF డౌన్‌లోడ్ చేయండి',
                desc: 'Review every field, correct anything, then generate a neatly formatted demonstration PDF.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-2xs space-y-3"
              >
                <div className="text-3xl font-extrabold text-emerald-700 font-serif">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {step.titleEn}
                  </h3>
                  <div className="text-xs font-semibold text-emerald-800">
                    {step.titleTe}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demonstration Templates Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-emerald-800">
              DEMONSTRATION TEMPLATES
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-serif mt-1">
              Start from a sample form
            </h2>
            <p className="text-xs text-slate-500 max-w-xl mt-1 leading-relaxed">
              These schemas are simplified demonstrations built for this project. They are <strong className="text-slate-700">not official government forms</strong>. Verified, authentic templates can be added or uploaded without changing the app.
            </p>
          </div>

          <button
            onClick={() => onNavigate('new')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer self-start md:self-auto"
          >
            <span>View all templates</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_TEMPLATES.slice(0, 3).map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => {
                onSelectTemplate(tpl.id);
                onNavigate('new');
              }}
              className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-slate-600">
                    {tpl.badge}
                  </span>
                  <span className="text-xs text-emerald-800 font-bold group-hover:translate-x-1 transition-transform">
                    Open →
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                    {tpl.titleEn}
                  </h3>
                  <div className="text-xs font-semibold text-emerald-800">
                    {tpl.titleTe}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {tpl.descriptionEn}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {tpl.requiredDocuments.slice(0, 3).map((doc) => (
                    <span
                      key={doc.id}
                      className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-slate-600 font-medium"
                    >
                      {doc.titleEn.split(' ')[0]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-slate-500">
                <span>{tpl.questions.length} questions</span>
                <span className="font-semibold text-slate-700">Ready to start</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy By Design Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs uppercase tracking-wider font-bold text-emerald-800">
              PRIVACY BY DESIGN
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-serif">
              You stay in control of your information.
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nothing is submitted to a government department. We ask for consent before collecting personal information, we never ask for your full Aadhaar number, and you can delete a session — and every answer inside it — whenever you want.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('new')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-emerald-800 text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                Start an application
              </button>
              <button
                onClick={() => onNavigate('settings')}
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                Language & privacy settings
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-stone-50 rounded-2xl p-6 border border-stone-200/80 space-y-3">
            {[
              'Explicit consent screen before the first question.',
              'Aadhaar is captured as the last four digits only.',
              'Audio recordings are used once for transcription, then discarded.',
              'Clear notice about which external AI services process your data.',
            ].map((text, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

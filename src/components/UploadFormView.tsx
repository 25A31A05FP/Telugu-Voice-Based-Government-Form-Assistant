import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Upload,
  FileText,
  Link2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { FormTemplate } from '../types/form.ts';
import { saveCustomTemplate } from '../utils/storage.ts';

interface UploadFormViewProps {
  onNavigate: (route: string) => void;
  onStartSession: (templateId: string, applicantName: string) => void;
}

export const UploadFormView: React.FC<UploadFormViewProps> = ({
  onNavigate,
  onStartSession,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [formLink, setFormLink] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (selectedFile: File) => {
    if (selectedFile.size > 15 * 1024 * 1024) {
      setErrorMessage('File size must be under 15MB');
      return;
    }
    setFile(selectedFile);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyzeForm = async () => {
    if (!fileBase64 && !formLink.trim()) {
      setErrorMessage('Please select a file or paste a form link');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/parse-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: fileBase64,
          mimeType: file?.type || 'image/png',
          formUrl: formLink.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned error status ${res.status}`);
      }

      const data = await res.json();
      if (!data.success || !data.template) {
        throw new Error(data.error || 'Failed to analyze form');
      }

      const newTemplate: FormTemplate = data.template;
      saveCustomTemplate(newTemplate);
      // Start session right away
      onStartSession(newTemplate.id, '');
    } catch (err: any) {
      console.error('Failed to parse uploaded form:', err);
      setErrorMessage(
        err.message || 'Could not parse the form. Please make sure the image or file text is readable.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back & Heading */}
      <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
        <button
          onClick={() => onNavigate('new')}
          className="w-9 h-9 rounded-full bg-white border border-stone-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">
            ANY APPLICATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            Upload your own form
          </h1>
          <p className="text-xs text-emerald-800 font-medium">
            మీ ఫారాన్ని అప్‌లోడ్ చేయండి — ప్రశ్నలు స్వయంచాలకంగా జాబితా అవుతాయి
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload box and Link input */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xs space-y-6">
            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-emerald-600 bg-emerald-50/50'
                  : file
                  ? 'border-emerald-500 bg-emerald-50/20'
                  : 'border-stone-300 hover:border-emerald-400 bg-stone-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>

              {file ? (
                <div>
                  <div className="font-bold text-slate-900 text-sm">{file.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-base font-bold text-slate-900">
                    Drop your application form here
                  </div>
                  <div className="text-xs font-semibold text-emerald-800">
                    మీ దరఖాస్తు ఫారాన్ని ఇక్కడ వదలండి
                  </div>
                  <div className="text-xs text-slate-500 pt-1">
                    PDF · scanned PDF · JPG · PNG · DOCX — up to 10 MB
                  </div>
                  <div className="pt-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-slate-900 hover:bg-emerald-800 text-white rounded-full text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      Choose a file
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                OR PASTE A FORM LINK
              </span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Form link input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  placeholder="https://college.edu/admission-form"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <button
                type="button"
                onClick={handleAnalyzeForm}
                disabled={isProcessing || (!file && !formLink.trim())}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <span>Read form</span>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Only public pages can be read. Forms behind a login, CAPTCHA or payment cannot be opened — download the file and upload it instead.
            </p>

            {/* Main Action Trigger */}
            {file && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAnalyzeForm}
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Reading form & generating Telugu questions...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>Analyze form & start voice session</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Educational info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>What happens next</span>
            </div>

            <div className="space-y-3">
              {[
                {
                  num: '1',
                  text: 'The form is read — printed text, scans and photographs are all supported.',
                },
                {
                  num: '2',
                  text: 'Every question is listed in English and Telugu for you to check.',
                },
                {
                  num: '3',
                  text: 'The assistant asks each question aloud in Telugu, one at a time.',
                },
                {
                  num: '4',
                  text: 'You review the answers, then download the completed document.',
                },
              ].map((step) => (
                <div key={step.num} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {step.num}
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    {step.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-100">
              <div className="text-xs uppercase tracking-wider font-bold text-slate-600 mb-2">
                WORKS WITH
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'College admission',
                  'Scholarship',
                  'Job application',
                  'Internship',
                  'Exam registration',
                  'Government form',
                  'Hostel form',
                ].map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-full bg-stone-100 text-slate-700 text-[11px] font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                Scanned and photographed forms are read with OCR. A sharper photo gives better questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

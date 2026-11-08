import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck,
  FileText,
  Save,
  RotateCcw,
  Edit3,
  AlertCircle,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { FormSession, FormTemplate, FormQuestion } from '../types/form.ts';
import { speakQuestion, stopSpeaking, startAudioRecording, RecordingSession } from '../utils/speech.ts';
import { getUserSettings } from '../utils/storage.ts';
import {
  validateAadhaarLast4,
  validateMobileNumber,
  validatePinCode,
  normalizeIncome,
  calculateCompletionRate,
} from '../utils/validation.ts';

interface VoiceWorkspaceProps {
  session: FormSession;
  template: FormTemplate;
  onUpdateSession: (updated: FormSession) => void;
  onNavigate: (route: string) => void;
}

export const VoiceWorkspace: React.FC<VoiceWorkspaceProps> = ({
  session,
  template,
  onUpdateSession,
  onNavigate,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [autoAsk, setAutoAsk] = useState(true);
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [liveSpeechText, setLiveSpeechText] = useState<string>('');

  const recordingRef = useRef<RecordingSession | null>(null);
  const speechRecRef = useRef<any>(null);
  const settings = getUserSettings();

  const currentQuestion: FormQuestion | undefined = template.questions[currentIndex];
  const currentAnswer = currentQuestion ? session.answers[currentQuestion.id] : undefined;

  // Auto-play question on question change if autoAsk is enabled
  useEffect(() => {
    if (!currentQuestion) return;
    setValidationError(null);
    setIsTypingMode(false);
    setLiveSpeechText('');
    setManualInput(currentAnswer?.englishTranslation || currentAnswer?.rawTelugu || '');

    if (autoAsk) {
      const timer = setTimeout(() => {
        handlePlayQuestion();
      }, 400);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    } else {
      stopSpeaking();
    }
  }, [currentIndex, currentQuestion?.id]);

  // Clean up speech and recording on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recordingRef.current) {
        recordingRef.current.cancel();
      }
      if (speechRecRef.current) {
        try { speechRecRef.current.abort(); } catch (_) {}
      }
    };
  }, []);

  const handlePlayQuestion = () => {
    if (!currentQuestion) return;
    setIsSpeaking(true);
    const textToSpeak =
      settings.language === 'en-IN'
        ? currentQuestion.questionEn
        : currentQuestion.questionTe;

    speakQuestion(textToSpeak, {
      speed: settings.speakingSpeed,
      voiceSource: settings.voiceSource,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: (err) => {
        console.warn('Voice playback issue:', err);
        setIsSpeaking(false);
      },
    });
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const startListening = async () => {
    stopSpeaking();
    setIsSpeaking(false);
    setValidationError(null);
    setLiveSpeechText('');
    setStatusMessage('Listening to your Telugu answer...');

    // Attempt browser live speech recognition preview in parallel
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const sr = new SpeechRec();
        sr.lang = settings.language === 'en-IN' ? 'en-IN' : 'te-IN';
        sr.continuous = true;
        sr.interimResults = true;
        sr.onresult = (evt: any) => {
          let interim = '';
          for (let i = evt.resultIndex; i < evt.results.length; ++i) {
            interim += evt.results[i][0].transcript;
          }
          if (interim) {
            setLiveSpeechText(interim);
          }
        };
        sr.onerror = () => {};
        sr.start();
        speechRecRef.current = sr;
      } catch (_) {}
    }

    try {
      const rec = await startAudioRecording((vol) => {
        setAudioVolume(vol);
      });
      recordingRef.current = rec;
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setIsRecording(false);
      if (speechRecRef.current) {
        try { speechRecRef.current.abort(); } catch (_) {}
        speechRecRef.current = null;
      }
      setStatusMessage('Microphone access unavailable. You can also type your answer below.');
      setIsTypingMode(true);
    }
  };

  const stopListeningAndProcess = async () => {
    if (speechRecRef.current) {
      try { speechRecRef.current.stop(); } catch (_) {}
      speechRecRef.current = null;
    }

    if (!recordingRef.current || !currentQuestion) return;
    setIsRecording(false);
    setIsProcessing(true);
    setStatusMessage('Transcribing Telugu speech and translating into form field...');

    try {
      const { audioBase64 } = await recordingRef.current.stop();
      recordingRef.current = null;

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType: 'audio/webm',
          questionContext: {
            questionTe: currentQuestion.questionTe,
            questionEn: currentQuestion.questionEn,
            fieldType: currentQuestion.type,
            labelEn: currentQuestion.labelEn,
            validationType: currentQuestion.validationType,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Transcription service returned status ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to parse audio');
      }

      applyAnswer(data.teluguText, data.englishText || data.extractedValue);
      setStatusMessage('Answer recorded successfully!');
    } catch (err: any) {
      console.error('Processing speech error:', err);
      // If liveSpeechText was captured during speech, fallback to it
      if (liveSpeechText.trim()) {
        handleSampleSelect(liveSpeechText.trim());
      } else {
        setStatusMessage('Could not recognize voice clearly. You can speak again or type manually.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSampleSelect = async (sampleTe: string) => {
    if (!currentQuestion) return;
    setIsProcessing(true);
    setStatusMessage(`Applying sample: "${sampleTe}"...`);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sampleTe,
          from: /[\u0C00-\u0C7F]/.test(sampleTe) ? 'te' : 'en',
          to: /[\u0C00-\u0C7F]/.test(sampleTe) ? 'en' : 'te',
          fieldKey: currentQuestion.fieldKey,
          questionPrompt: currentQuestion.questionEn,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const teText = data.teluguDisplay || (data.translatedText && /[\u0C00-\u0C7F]/.test(data.translatedText) ? data.translatedText : sampleTe);
        const enText = data.englishDisplay || data.normalizedValue || data.translatedText || sampleTe;
        applyAnswer(teText, enText);
      } else {
        applyAnswer(sampleTe, sampleTe);
      }
    } catch (err) {
      applyAnswer(sampleTe, sampleTe);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!currentQuestion || !manualInput.trim()) {
      setValidationError('Please enter an answer');
      return;
    }

    setIsProcessing(true);
    try {
      // If user typed in Telugu or English, translate and normalize
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: manualInput.trim(),
          from: /[\u0C00-\u0C7F]/.test(manualInput) ? 'te' : 'en',
          to: /[\u0C00-\u0C7F]/.test(manualInput) ? 'en' : 'te',
          fieldKey: currentQuestion.fieldKey,
          questionPrompt: currentQuestion.questionEn,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const teText = data.teluguDisplay || (data.translatedText && /[\u0C00-\u0C7F]/.test(data.translatedText) ? data.translatedText : manualInput);
        const enText = data.englishDisplay || data.normalizedValue || data.translatedText || manualInput;
        applyAnswer(teText, enText);
      } else {
        applyAnswer(manualInput, manualInput);
      }
      setIsTypingMode(false);
    } catch (err) {
      applyAnswer(manualInput, manualInput);
      setIsTypingMode(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyAnswer = (rawTelugu: string, englishTranslation: string) => {
    if (!currentQuestion) return;

    // Validate if necessary
    let normalized = englishTranslation;
    if (currentQuestion.validationType === 'aadhaarLast4') {
      const res = validateAadhaarLast4(englishTranslation || rawTelugu);
      if (!res.isValid) {
        setValidationError(res.errorMessage || 'Invalid Aadhaar digits');
      } else {
        setValidationError(null);
        if (res.normalizedValue) normalized = res.normalizedValue;
      }
    } else if (currentQuestion.validationType === 'mobile') {
      const res = validateMobileNumber(englishTranslation || rawTelugu);
      if (!res.isValid) {
        setValidationError(res.errorMessage || 'Invalid Mobile number');
      } else {
        setValidationError(null);
        if (res.normalizedValue) normalized = res.normalizedValue;
      }
    } else if (currentQuestion.validationType === 'pincode') {
      const res = validatePinCode(englishTranslation || rawTelugu);
      if (!res.isValid) {
        setValidationError(res.errorMessage || 'Invalid PIN code');
      } else {
        setValidationError(null);
        if (res.normalizedValue) normalized = res.normalizedValue;
      }
    } else if (currentQuestion.validationType === 'income') {
      const res = normalizeIncome(englishTranslation || rawTelugu);
      if (!res.isValid) {
        setValidationError(res.errorMessage || 'Invalid income');
      } else {
        setValidationError(null);
        if (res.normalizedValue) normalized = res.normalizedValue;
      }
    }

    const updatedAnswers = {
      ...session.answers,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        rawTelugu: rawTelugu || normalized,
        englishTranslation: normalized || rawTelugu,
        updatedAt: new Date().toISOString(),
        isConfirmed: true,
      },
    };

    const answeredCount = Object.keys(updatedAnswers).length;
    const isCompleted = answeredCount === template.questions.length;

    const updatedSession: FormSession = {
      ...session,
      answers: updatedAnswers,
      status: isCompleted ? 'completed' : 'draft',
      updatedAt: new Date().toISOString(),
    };

    onUpdateSession(updatedSession);
  };

  const handleNext = () => {
    if (currentIndex < template.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Reached the end, navigate to review form
      onNavigate(`form/${session.id}`);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const answeredCount = Object.keys(session.answers).length;
  const totalQuestions = template.questions.length;
  const completionRate = calculateCompletionRate(answeredCount, totalQuestions);

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">No questions found in this form.</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-9 h-9 rounded-full bg-white border border-stone-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-xl font-bold text-slate-900 leading-tight">
              {template.titleEn}
            </div>
            <div className="text-sm font-medium text-emerald-800">
              {template.titleTe}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-stone-100 px-3 py-1.5 rounded-full cursor-pointer hover:bg-stone-200 transition-colors">
            <input
              type="checkbox"
              checked={autoAsk}
              onChange={(e) => setAutoAsk(e.target.checked)}
              className="rounded text-emerald-700 focus:ring-emerald-600"
            />
            <span>Auto-ask questions (స్వయంచాలకంగా అడగండి)</span>
          </label>

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-stone-200 px-3 py-1.5 rounded-full hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>సేవ్ చేసి బయటకు (Save & Exit)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left interactive workspace, Right progress & index */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Question Card & Mic */}
        <div className="lg:col-span-8 space-y-6">
          {/* Question Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-600 bg-stone-100 px-2.5 py-1 rounded-md">
                  QUESTION {currentIndex + 1} OF {totalQuestions}
                </span>
                {currentQuestion.required && (
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    Required
                  </span>
                )}
              </div>

              {/* Replay voice button */}
              <button
                onClick={isSpeaking ? handleStopSpeaking : handlePlayQuestion}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-emerald-700 text-white shadow-xs animate-pulse'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>ఆపండి (Stop)</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Replay (వినండి)</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald-800 tracking-wider uppercase">
                ప్రశ్న (Telugu Question)
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                {currentQuestion.questionTe}
              </h2>
              <p className="text-base text-slate-600 font-medium">
                {currentQuestion.questionEn}
              </p>
            </div>

            {/* Hint / Example box */}
            {(currentQuestion.hintTe || currentQuestion.hintEn) && (
              <div className="mt-5 bg-stone-50 border border-stone-200/80 rounded-xl p-3.5 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-slate-700">
                  {currentQuestion.hintTe && (
                    <div className="font-semibold text-slate-800">
                      సహాయం: {currentQuestion.hintTe}
                    </div>
                  )}
                  {currentQuestion.hintEn && (
                    <div className="text-slate-500 mt-0.5">
                      Hint: {currentQuestion.hintEn}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-slate-500">
              <div className="uppercase tracking-wider font-medium">
                FIELD: {currentQuestion.labelEn} • {currentQuestion.type}
              </div>
              <div className="text-slate-600">
                {currentQuestion.labelTe}
              </div>
            </div>
          </div>

          {/* Central Microphone Action Panel */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-8 flex flex-col items-center justify-center text-center">
            {/* Visualizer and Mic Button */}
            <div className="relative mb-4">
              {/* Outer pulsing rings when recording */}
              {isRecording && (
                <>
                  <div
                    className="absolute inset-0 rounded-full bg-red-400 opacity-25 animate-ping"
                    style={{ transform: `scale(${1.2 + audioVolume * 0.5})` }}
                  />
                  <div
                    className="absolute -inset-3 rounded-full bg-red-500/10 border-2 border-red-500/30 animate-pulse"
                  />
                </>
              )}

              <button
                onClick={isRecording ? stopListeningAndProcess : startListening}
                disabled={isProcessing}
                aria-label={isRecording ? 'Stop recording answer' : 'Start recording answer in Telugu'}
                className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
                  isProcessing
                    ? 'bg-amber-500 text-white'
                    : isRecording
                    ? 'bg-red-600 text-white hover:bg-red-700 ring-4 ring-red-200'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800 ring-4 ring-emerald-100 hover:scale-105'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-10 h-10 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-10 h-10" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </button>
            </div>

            {/* Voice Status Text & Waveform */}
            <div className="space-y-1 max-w-md w-full">
              <div className="text-lg font-bold text-slate-900">
                {isProcessing
                  ? 'సమాధానం ప్రాసెస్ అవుతోంది...'
                  : isRecording
                  ? 'Listening… మాట్లాడండి (Speak now)'
                  : 'మీ వంతు (Your Turn)'}
              </div>

              <div className="text-xs text-slate-500">
                {isProcessing
                  ? 'Gemini AI is transcribing Telugu speech and validating format'
                  : isRecording
                  ? 'Click microphone again when finished speaking'
                  : 'మైక్రోఫోన్ నొక్కి మీ సమాధానం తెలుగులో చెప్పండి'}
              </div>

              {/* Dynamic waveform bars while recording */}
              {isRecording && (
                <div className="flex items-center justify-center gap-1.5 h-8 mt-3">
                  {[0.3, 0.7, 1.0, 0.6, 0.4, 0.8, 0.5, 0.9, 0.6, 0.3].map((heightMul, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-red-500 rounded-full transition-all duration-75"
                      style={{
                        height: `${Math.max(6, Math.min(32, 8 + audioVolume * 60 * heightMul))}px`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Real-time speech transcript preview if speech recognizer is active */}
              {isRecording && liveSpeechText && (
                <div className="mt-2.5 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 font-medium animate-pulse">
                  <span className="text-[10px] uppercase font-bold text-red-700 block mb-0.5">Live hearing:</span>
                  "{liveSpeechText}"
                </div>
              )}
            </div>

            {/* Replay button */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handlePlayQuestion}
                disabled={isRecording || isProcessing}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-800 bg-stone-100 hover:bg-stone-200 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>ప్రశ్న మళ్లీ వినండి (Re-hear question)</span>
              </button>
            </div>

            {/* Quick Sample Telugu Answer Chips */}
            {(() => {
              const samples = getSampleAnswers(currentQuestion);
              if (samples.length === 0 || isRecording) return null;
              return (
                <div className="mt-5 pt-4 border-t border-stone-100 w-full">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>నమూనా సమాధానం ప్రయత్నించండి (Try Sample Telugu Answer):</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {samples.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleSampleSelect(item.te)}
                        className="px-3 py-1.5 bg-stone-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-stone-200 hover:border-emerald-300 rounded-full text-xs font-medium transition-all shadow-2xs hover:scale-102 cursor-pointer flex items-center gap-1"
                        title={`Click to auto-parse Telugu answer: "${item.te}"`}
                      >
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>"{item.label}"</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Your Answer Preview & Manual Typing Box */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                YOUR ANSWER (మీ సమాధానం)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsTypingMode(!isTypingMode);
                    setManualInput(currentAnswer?.englishTranslation || currentAnswer?.rawTelugu || '');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isTypingMode ? 'Cancel typing' : 'టైప్ చేయండి (Type / Edit)'}</span>
                </button>
              </div>
            </div>

            {/* Validation Error if any */}
            {validationError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Typing Mode Input Form */}
            {isTypingMode ? (
              <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <label className="block text-xs font-semibold text-slate-700">
                  Type or edit your answer in Telugu or English:
                </label>
                {currentQuestion.type === 'select' && currentQuestion.options ? (
                  <select
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="">-- ఎంచుకోండి (Select an option) --</option>
                    {currentQuestion.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : currentQuestion.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Enter answer details here..."
                    className="w-full bg-white border border-stone-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                ) : (
                  <input
                    type={currentQuestion.type === 'number' ? 'text' : currentQuestion.type}
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder={`e.g. ${currentQuestion.hintEn || 'Enter answer'}`}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                )}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsTypingMode(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleManualSubmit}
                    disabled={isProcessing || !manualInput.trim()}
                    className="px-4 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save Answer (సేవ్ చేయండి)</span>
                  </button>
                </div>
              </div>
            ) : currentAnswer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-4">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    TELUGU ANSWER (తెలుగు సమాధానం)
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {currentAnswer.rawTelugu || '—'}
                  </div>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
                  <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    ENGLISH TRANSLATION (ఫారమ్ విలువ)
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {currentAnswer.englishTranslation || '—'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-stone-200 rounded-xl text-slate-400 text-sm">
                No answer recorded yet. Click the microphone above to speak in Telugu or click 'టైప్ చేయండి' to type.
              </div>
            )}

            {/* Answer Control Action Buttons */}
            {currentAnswer && !isTypingMode && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Field saved for this session</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={startListening}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>మళ్లీ చెప్పండి (Speak again)</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Confirm & Continue (తర్వాత)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons (Back & Next) */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                currentIndex === 0
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-white border border-stone-300 text-slate-700 hover:bg-stone-50 shadow-xs'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>వెనుకకు (Previous)</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-slate-900 hover:bg-emerald-800 text-white shadow-sm transition-all cursor-pointer"
            >
              <span>{currentIndex === totalQuestions - 1 ? 'పూర్తి చేసి సమీక్షించండి (Review Form)' : 'తర్వాత (Next)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom quick links */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-2">
            <button
              onClick={() => onNavigate(`checklist/${session.id}`)}
              className="hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Document checklist ({Object.keys(session.checklist).filter((k) => session.checklist[k]).length}/{template.requiredDocuments.length} ready)</span>
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate(`form/${session.id}`)}
              className="hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Review form & PDF</span>
            </button>
          </div>
        </div>

        {/* Right Column: Progress & Question Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sticky top-24">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                PROGRESS
              </span>
              <span className="text-xs font-bold text-emerald-800">
                {answeredCount}/{totalQuestions}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-stone-100 rounded-full h-2.5 mb-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mb-6 font-medium">
              {completionRate}% complete · {totalQuestions - answeredCount} questions remaining
            </div>

            {/* Questions navigation list */}
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              ALL QUESTIONS
            </div>
            <div className="max-h-[500px] overflow-y-auto space-y-1.5 pr-1">
              {template.questions.map((q, idx) => {
                const isAnswered = !!session.answers[q.id];
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300 shadow-xs'
                        : isAnswered
                        ? 'bg-stone-50 text-slate-800 hover:bg-stone-100 border border-transparent'
                        : 'text-slate-500 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] ${
                          isAnswered
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-emerald-200 text-emerald-900 font-bold'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {isAnswered ? <Check className="w-3 h-3" /> : idx + 1}
                      </div>
                      <div className="truncate">
                        <div className="truncate font-semibold">{q.labelEn}</div>
                        <div className="text-[10px] text-slate-500 truncate">{q.labelTe}</div>
                      </div>
                    </div>
                    {q.required && !isAnswered && (
                      <span className="text-[9px] text-amber-600 font-bold shrink-0">*</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col gap-2">
              <button
                onClick={() => onNavigate(`checklist/${session.id}`)}
                className="w-full text-center py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
              >
                Supporting Documents Checklist
              </button>
              <button
                onClick={() => onNavigate(`form/${session.id}`)}
                className="w-full text-center py-2 px-3 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
              >
                Review Application & Preview PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function getSampleAnswers(question?: FormQuestion): { te: string; label: string }[] {
  if (!question) return [];
  const qKey = (question.fieldKey || '').toLowerCase();
  const valType = question.validationType;

  if (valType === 'mobile' || qKey.includes('mobile') || qKey.includes('phone')) {
    return [
      { te: 'నా ఫోన్ నెంబర్ 9848022338', label: '9848022338' },
      { te: '9440123456', label: '9440123456' },
    ];
  }
  if (valType === 'aadhaarLast4' || qKey.includes('aadhaar')) {
    return [
      { te: 'నా ఆధార్ కార్డు చివరి నాలుగు అంకెలు 8901', label: '8901' },
      { te: '5642', label: '5642' },
    ];
  }
  if (valType === 'pincode' || qKey.includes('pin')) {
    return [
      { te: 'మా పిన్ కోడ్ 522201', label: '522201' },
      { te: '500081', label: '500081' },
    ];
  }
  if (valType === 'income' || qKey.includes('income')) {
    return [
      { te: 'సంవత్సరానికి అరవై వేల రూపాయలు', label: 'రూ. 60,000 / సం.' },
      { te: 'సంవత్సర ఆదాయం డెబ్భై అయిదు వేలు', label: 'రూ. 75,000 / సం.' },
    ];
  }
  if (qKey.includes('gender')) {
    return [
      { te: 'పురుషుడు', label: 'పురుషుడు (Male)' },
      { te: 'స్త్రీ', label: 'స్త్రీ (Female)' },
    ];
  }
  if (qKey.includes('dob') || qKey.includes('birth') || qKey.includes('date')) {
    return [
      { te: '15 ఆగస్టు 1990', label: '15/08/1990' },
      { te: '1 జనవరి 1995', label: '01/01/1995' },
    ];
  }
  if (qKey.includes('father') || qKey.includes('husband')) {
    return [
      { te: 'శ్రీనివాస రావు', label: 'శ్రీనివాస రావు' },
      { te: 'వెంకట రమణ', label: 'వెంకట రమణ' },
    ];
  }
  if (qKey.includes('applicant') || qKey.includes('name') || qKey.includes('student')) {
    return [
      { te: 'వెంకటేశ్వర్లు రావు', label: 'వెంకటేశ్వర్లు రావు' },
      { te: 'లక్ష్మీ ప్రసన్న', label: 'లక్ష్మీ ప్రసన్న' },
    ];
  }
  if (qKey.includes('district')) {
    return [
      { te: 'గుంటూరు జిల్లా', label: 'గుంటూరు' },
      { te: 'కృష్ణా జిల్లా', label: 'కృష్ణా' },
    ];
  }
  if (qKey.includes('mandal')) {
    return [
      { te: 'తెనాలి మండలం', label: 'తెనాలి' },
      { te: 'మంగళగిరి మండలం', label: 'మంగళగిరి' },
    ];
  }
  if (qKey.includes('village') || qKey.includes('habitation') || qKey.includes('address')) {
    return [
      { te: 'కొలకలూరు గ్రామం', label: 'కొలకలూరు' },
      { te: 'గాంధీ నగర్, తెనాలి', label: 'గాంధీ నగర్' },
    ];
  }
  if (qKey.includes('caste') || qKey.includes('category')) {
    return [
      { te: 'బీసీ-బి పద్మశాలి', label: 'BC-B' },
      { te: 'ఓసీ కాపు', label: 'OC' },
      { te: 'ఎస్సీ మాదిగ', label: 'SC' },
    ];
  }
  if (qKey.includes('ration')) {
    return [
      { te: 'నాకు తెల్ల రేషన్ కార్డు ఉంది WAP0719001', label: 'తెల్ల రేషన్ కార్డు' },
    ];
  }
  if (question.type === 'select' && question.options && question.options.length > 0) {
    return question.options.slice(0, 3).map((opt) => ({ te: opt, label: opt }));
  }
  if (question.hintTe) {
    return [{ te: question.hintTe, label: question.hintTe.slice(0, 20) }];
  }
  return [
    { te: question.labelTe || 'సరే', label: question.labelEn || 'Confirm' },
  ];
}

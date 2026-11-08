import React, { useState } from 'react';
import {
  Volume2,
  Globe,
  User,
  Shield,
  Trash2,
  RefreshCw,
  Check,
  Play,
  VolumeX,
} from 'lucide-react';
import { UserSettings } from '../types/form.ts';
import { getUserSettings, saveUserSettings, clearAllSessions } from '../utils/storage.ts';
import { speakQuestion, stopSpeaking } from '../utils/speech.ts';

interface SettingsViewProps {
  onNavigate: (route: string) => void;
  onClearData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onNavigate,
  onClearData,
}) => {
  const [settings, setSettings] = useState<UserSettings>(getUserSettings());
  const [isSaved, setIsSaved] = useState(false);
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  const handleSaveProfile = () => {
    saveUserSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLanguageChange = (lang: 'te-IN' | 'en-IN') => {
    const updated = { ...settings, language: lang };
    setSettings(updated);
    saveUserSettings(updated);
  };

  const handleVoiceSourceChange = (source: 'auto' | 'device' | 'ai') => {
    const updated = { ...settings, voiceSource: source };
    setSettings(updated);
    saveUserSettings(updated);
  };

  const handleSpeedChange = (speed: number) => {
    const updated = { ...settings, speakingSpeed: speed };
    setSettings(updated);
    saveUserSettings(updated);
  };

  const handleTestVoice = () => {
    if (isPlayingTest) {
      stopSpeaking();
      setIsPlayingTest(false);
      return;
    }

    setIsPlayingTest(true);
    const testPhrase =
      settings.language === 'en-IN'
        ? 'Welcome to Sahayak Voice Form Assistant. Your voice application is ready.'
        : 'నమస్కారం! సహాయక్ తెలుగు వాయిస్ అసిస్టెంట్‌కి స్వాగతం. మీ దరఖాస్తును సులభంగా పూర్తి చేయండి.';

    speakQuestion(testPhrase, {
      speed: settings.speakingSpeed,
      voiceSource: settings.voiceSource,
      onStart: () => setIsPlayingTest(true),
      onEnd: () => setIsPlayingTest(false),
      onError: () => setIsPlayingTest(false),
    });
  };

  const handleResetDeviceKey = () => {
    localStorage.removeItem('telugu_voice_device_key');
    window.location.reload();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <div className="text-xs uppercase tracking-wider font-bold text-slate-500">
          SETTINGS
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif">
          Language, voice & privacy
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Applicant profile Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">Applicant profile</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            No password and no account is created. This name and your session key live only in this browser, and are used to keep your applications together on this device.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              YOUR NAME (OPTIONAL)
            </label>
            <input
              type="text"
              value={settings.applicantName}
              onChange={(e) => setSettings({ ...settings, applicantName: e.target.value })}
              placeholder="e.g. Lakshmi Devi"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSaveProfile}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{isSaved ? 'Profile saved' : 'Save profile'}</span>
            </button>
          </div>

          <div className="pt-2 text-[11px] font-mono text-slate-400">
            Device key: {settings.deviceKey}
          </div>
        </div>

        {/* Language Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">Language</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Questions are asked and answers are interpreted in this language.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleLanguageChange('te-IN')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                settings.language === 'te-IN'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="font-bold text-sm text-slate-900">తెలుగు (Telugu)</div>
              <div className="text-xs text-emerald-800 mt-0.5">te-IN</div>
            </button>

            <button
              onClick={() => handleLanguageChange('en-IN')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                settings.language === 'en-IN'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="font-bold text-sm text-slate-900">English</div>
              <div className="text-xs text-emerald-800 mt-0.5">en-IN</div>
            </button>
          </div>
        </div>

        {/* Voice & Speech Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">Voice</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Telugu questions are read by the Gemini AI voice or device's Telugu voice with clear native pronunciation. The question text is always shown on screen as well.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              VOICE SOURCE
            </label>
            <select
              value={settings.voiceSource}
              onChange={(e) => handleVoiceSourceChange(e.target.value as any)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="auto">
                Automatic — AI voice with device fallback (Recommended)
              </option>
              <option value="ai">AI voice only (Gemini Cloud TTS)</option>
              <option value="device">Device voice only (Web Speech API)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              <span>SPEAKING SPEED</span>
              <span className="text-emerald-800">{settings.speakingSpeed.toFixed(2)}×</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.05"
              value={settings.speakingSpeed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleTestVoice}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {isPlayingTest ? <VolumeX className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlayingTest ? 'Stop audio' : 'Test voice (వాయిస్ పరీక్షించండి)'}</span>
            </button>
          </div>
        </div>

        {/* Privacy & Data Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">Privacy & data</h2>
          </div>

          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1.5 text-xs text-slate-600">
            <div className="font-bold text-slate-800 mb-1">What is processed where:</div>
            <div>• Recorded audio → speech-to-text service (transcription only).</div>
            <div>• Telugu answer text → translation service.</div>
            <div>• Answers → stored in this app, scoped to your device key.</div>
            <div>• Aadhaar: only the last four digits are ever asked for.</div>
          </div>

          <div className="pt-2 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
              DELETE YOUR DATA
            </div>
            <p className="text-xs text-slate-500">
              Removes every application, answer, checklist entry and PDF record for this device.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete all applications on this device?')) {
                    onClearData();
                  }
                }}
                className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Delete all sessions
              </button>

              <button
                onClick={() => {
                  if (confirm('Forget device key and reset browser workspace?')) {
                    handleResetDeviceKey();
                  }
                }}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Forget this device key
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { FormSession, UserSettings, FormTemplate } from '../types/form.ts';
import { SAMPLE_TEMPLATES } from '../data/sampleForms.ts';

const SETTINGS_KEY = 'telugu_voice_form_settings_v1';
const SESSIONS_KEY = 'telugu_voice_form_sessions_v1';
const CUSTOM_TEMPLATES_KEY = 'telugu_voice_form_custom_templates_v1';

export function getOrCreateDeviceKey(): string {
  const existing = localStorage.getItem('telugu_voice_device_key');
  if (existing) return existing;
  const newKey = 'tvf-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
  localStorage.setItem('telugu_voice_device_key', newKey);
  return newKey;
}

export function getUserSettings(): UserSettings {
  const deviceKey = getOrCreateDeviceKey();
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        language: parsed.language || 'te-IN',
        voiceSource: parsed.voiceSource || 'auto',
        speakingSpeed: parsed.speakingSpeed || 0.95,
        applicantName: parsed.applicantName || '',
        deviceKey,
      };
    }
  } catch (e) {
    console.error('Failed reading settings', e);
  }
  return {
    language: 'te-IN',
    voiceSource: 'auto',
    speakingSpeed: 0.95,
    applicantName: '',
    deviceKey,
  };
}

export function saveUserSettings(settings: Partial<UserSettings>): UserSettings {
  const current = getUserSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

export function getInitialDemoSession(): FormSession {
  return {
    id: 'demo-session-income-01',
    templateId: 'income-certificate',
    formTitleEn: 'Application for Integrated Income Certificate',
    formTitleTe: 'సమగ్ర ఆదాయ ధృవీకరణ పత్రం దరఖాస్తు',
    applicantName: 'Venkateswarlu Rao',
    status: 'draft',
    answers: {
      'q1': {
        questionId: 'q1',
        rawTelugu: 'వెంకటేశ్వర్లు రావు',
        englishTranslation: 'Venkateswarlu Rao',
        updatedAt: new Date().toISOString(),
        isConfirmed: true,
      },
      'q2': {
        questionId: 'q2',
        rawTelugu: 'శ్రీనివాస రావు',
        englishTranslation: 'Srinivasa Rao',
        updatedAt: new Date().toISOString(),
        isConfirmed: true,
      },
      'q3': {
        questionId: 'q3',
        rawTelugu: 'పురుషుడు',
        englishTranslation: 'Male',
        updatedAt: new Date().toISOString(),
        isConfirmed: true,
      },
      'q4': {
        questionId: 'q4',
        rawTelugu: '15 ఆగస్టు 1990',
        englishTranslation: '1990-08-15',
        updatedAt: new Date().toISOString(),
        isConfirmed: true,
      },
      'q6': {
        questionId: 'q6',
        rawTelugu: '9848022338',
        englishTranslation: '9848022338',
        updatedAt: new Date().toISOString(),
        isConfirmed: true,
      },
    },
    checklist: {
      'aadhaar': true,
      'ration-card': true,
    },
    attachedDocs: {
      'aadhaar': 'aadhaar_masked.pdf',
      'ration-card': 'ration_card_copy.jpg',
    },
    pdfGeneratedCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getSessions(): FormSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Migrate any old session templateIds if present
        const migrated = parsed.map((s) => {
          if (s.templateId === 'telugu-income-cert') {
            return { ...s, templateId: 'income-certificate' };
          }
          return s;
        });
        return migrated;
      }
    }
  } catch (e) {
    console.error('Failed reading sessions', e);
  }
  // Return initial demo session and persist it
  const initial = [getInitialDemoSession()];
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(initial));
  } catch (_) {}
  return initial;
}

export function getSessionById(id: string): FormSession | null {
  const sessions = getSessions();
  return sessions.find((s) => s.id === id) || null;
}

export function saveSession(session: FormSession): void {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.unshift(session);
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function clearAllSessions(): void {
  localStorage.removeItem(SESSIONS_KEY);
}

export function getCustomTemplates(): FormTemplate[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading custom templates', e);
  }
  return [];
}

export function saveCustomTemplate(template: FormTemplate): void {
  const templates = getCustomTemplates();
  templates.unshift(template);
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
}

export function getAllTemplates(): FormTemplate[] {
  return [...SAMPLE_TEMPLATES, ...getCustomTemplates()];
}

export function getTemplateById(id: string): FormTemplate | undefined {
  return getAllTemplates().find((t) => t.id === id);
}

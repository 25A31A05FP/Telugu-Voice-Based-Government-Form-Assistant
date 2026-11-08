export type FieldType = 'text' | 'number' | 'date' | 'select' | 'tel' | 'textarea';

export interface FormQuestion {
  id: string;
  fieldKey: string;
  labelEn: string;
  labelTe: string;
  questionTe: string;
  questionEn: string;
  hintTe?: string;
  hintEn?: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // for select type
  validationType?: 'aadhaarLast4' | 'mobile' | 'pincode' | 'income' | 'none';
}

export interface DocumentChecklistItem {
  id: string;
  titleEn: string;
  titleTe: string;
  descriptionEn: string;
  descriptionTe: string;
  required: boolean;
  isReady: boolean;
  attachedFileName?: string;
}

export interface FormTemplate {
  id: string;
  titleEn: string;
  titleTe: string;
  descriptionEn: string;
  descriptionTe: string;
  badge?: string;
  questions: FormQuestion[];
  requiredDocuments: DocumentChecklistItem[];
  category: 'government' | 'education' | 'custom';
}

export interface AnswerItem {
  questionId: string;
  rawTelugu: string;
  englishTranslation: string;
  updatedAt: string;
  isConfirmed: boolean;
}

export interface FormSession {
  id: string;
  templateId: string;
  formTitleEn: string;
  formTitleTe: string;
  applicantName: string;
  createdAt: string;
  updatedAt: string;
  answers: Record<string, AnswerItem>;
  checklist: Record<string, boolean>; // docId -> ready
  attachedDocs: Record<string, string>; // docId -> fileName
  status: 'draft' | 'completed';
  pdfGeneratedCount: number;
}

export interface UserSettings {
  language: 'te-IN' | 'en-IN';
  voiceSource: 'auto' | 'device' | 'ai';
  speakingSpeed: number; // 0.75 - 1.25
  applicantName: string;
  deviceKey: string;
}

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { HomeView } from './components/HomeView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { NewApplicationView } from './components/NewApplicationView.tsx';
import { VoiceWorkspace } from './components/VoiceWorkspace.tsx';
import { ReviewFormView } from './components/ReviewFormView.tsx';
import { ChecklistView } from './components/ChecklistView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { UploadFormView } from './components/UploadFormView.tsx';
import { PreviewPdfModal } from './components/PreviewPdfModal.tsx';
import { FormSession, FormTemplate } from './types/form.ts';
import {
  getSessions,
  saveSession,
  deleteSession,
  clearAllSessions,
  getAllTemplates,
  getTemplateById,
  getUserSettings,
} from './utils/storage.ts';

export default function App() {
  const [route, setRoute] = useState<string>('home');
  const [sessions, setSessions] = useState<FormSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('income-certificate');
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Load stored sessions on mount
  useEffect(() => {
    const loaded = getSessions();
    setSessions(loaded);

    // Support ?autostart=1 as required by testability instructions
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      if (loaded.length > 0) {
        setActiveSessionId(loaded[0].id);
        setRoute(`workspace/${loaded[0].id}`);
      } else {
        setRoute('new');
      }
    }
  }, []);

  const refreshSessions = () => {
    setSessions(getSessions());
  };

  const handleNavigate = (newRoute: string) => {
    // Parse nested route e.g. "workspace/123", "form/123", "checklist/123"
    if (newRoute.startsWith('workspace/')) {
      const id = newRoute.split('/')[1];
      setActiveSessionId(id);
    } else if (newRoute.startsWith('form/')) {
      const id = newRoute.split('/')[1];
      setActiveSessionId(id);
    } else if (newRoute.startsWith('checklist/')) {
      const id = newRoute.split('/')[1];
      setActiveSessionId(id);
    }
    setRoute(newRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartSession = (templateId: string, applicantName: string) => {
    const template = getTemplateById(templateId);
    if (!template) return;

    const newSessionId = 'ses-' + Math.random().toString(36).substring(2, 9);
    const newSession: FormSession = {
      id: newSessionId,
      templateId,
      formTitleEn: template.titleEn,
      formTitleTe: template.titleTe,
      applicantName: applicantName || getUserSettings().applicantName || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      answers: {},
      checklist: {},
      attachedDocs: {},
      status: 'draft',
      pdfGeneratedCount: 0,
    };

    saveSession(newSession);
    refreshSessions();
    setActiveSessionId(newSessionId);
    setRoute(`workspace/${newSessionId}`);
  };

  const handleUpdateSession = (updated: FormSession) => {
    saveSession(updated);
    refreshSessions();
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    refreshSessions();
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setRoute('dashboard');
    }
  };

  const handleClearAllData = () => {
    clearAllSessions();
    refreshSessions();
    setActiveSessionId(null);
    setRoute('home');
  };

  const routeSessionId = route.includes('/') ? route.split('/')[1] : null;
  const currentSessionId = routeSessionId || activeSessionId;
  const activeSession = currentSessionId
    ? sessions.find((s) => s.id === currentSessionId) || null
    : null;
  const activeTemplate = activeSession
    ? getTemplateById(activeSession.templateId) || null
    : null;

  // Determine which view to render
  const renderCurrentView = () => {
    if (route === 'home') {
      return (
        <HomeView
          onNavigate={handleNavigate}
          onSelectTemplate={(tplId) => setSelectedTemplateId(tplId)}
        />
      );
    }

    if (route === 'dashboard' || route === 'documents' || route === 'history') {
      return (
        <DashboardView
          sessions={sessions}
          onNavigate={handleNavigate}
          onDeleteSession={handleDeleteSession}
          onSelectSession={(id) => {
            setActiveSessionId(id);
            setRoute(`workspace/${id}`);
          }}
        />
      );
    }

    if (route === 'new') {
      return (
        <NewApplicationView
          onStartSession={handleStartSession}
          onNavigate={handleNavigate}
        />
      );
    }

    if (route === 'upload') {
      return (
        <UploadFormView
          onNavigate={handleNavigate}
          onStartSession={handleStartSession}
        />
      );
    }

    if (route === 'settings') {
      return (
        <SettingsView
          onNavigate={handleNavigate}
          onClearData={handleClearAllData}
        />
      );
    }

    if (route.startsWith('workspace/') && activeSession && activeTemplate) {
      return (
        <VoiceWorkspace
          session={activeSession}
          template={activeTemplate}
          onUpdateSession={handleUpdateSession}
          onNavigate={handleNavigate}
        />
      );
    }

    if (route.startsWith('form/') && activeSession && activeTemplate) {
      return (
        <ReviewFormView
          session={activeSession}
          template={activeTemplate}
          onUpdateSession={handleUpdateSession}
          onNavigate={handleNavigate}
          onOpenPdfPreview={() => setShowPdfModal(true)}
        />
      );
    }

    if (route.startsWith('checklist/') && activeSession && activeTemplate) {
      return (
        <ChecklistView
          session={activeSession}
          template={activeTemplate}
          onUpdateSession={handleUpdateSession}
          onNavigate={handleNavigate}
        />
      );
    }

    // Default fallback to home
    return (
      <HomeView
        onNavigate={handleNavigate}
        onSelectTemplate={(tplId) => setSelectedTemplateId(tplId)}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfb] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar
        currentRoute={route}
        onNavigate={handleNavigate}
        activeSessionId={activeSessionId}
      />

      <main className="flex-1">
        {renderCurrentView()}
      </main>

      <Footer onNavigate={handleNavigate} />

      {/* PDF Visual Preview Modal */}
      {showPdfModal && activeSession && activeTemplate && (
        <PreviewPdfModal
          session={activeSession}
          template={activeTemplate}
          onClose={() => setShowPdfModal(false)}
          onUpdateSession={handleUpdateSession}
        />
      )}
    </div>
  );
}

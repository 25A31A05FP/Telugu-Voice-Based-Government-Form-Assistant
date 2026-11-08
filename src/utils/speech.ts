// Speech Synthesis and Audio Recording Utility for Telugu Voice Form Assistant

let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

export async function hasNativeTeluguVoice(): Promise<boolean> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const hasTelugu = voices.some((v) => v.lang.toLowerCase().startsWith('te'));
      resolve(hasTelugu);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      const hasTelugu = voices.some((v) => v.lang.toLowerCase().startsWith('te'));
      resolve(hasTelugu);
    };
    // fallback timeout
    setTimeout(() => {
      const v = window.speechSynthesis.getVoices();
      resolve(v.some((x) => x.lang.toLowerCase().startsWith('te')));
    }, 500);
  });
}

export function stopSpeaking(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {
      // ignore
    }
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
    currentUtterance = null;
  }
}

export interface SpeakOptions {
  speed?: number;
  voiceSource?: 'auto' | 'device' | 'ai';
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export async function speakQuestion(text: string, options: SpeakOptions = {}): Promise<void> {
  stopSpeaking();
  const { speed = 0.95, voiceSource = 'auto', onStart, onEnd, onError } = options;

  if (!text || !text.trim()) {
    onEnd?.();
    return;
  }

  // Strategy 1: If device voice specifically forced and browser has it
  if (voiceSource === 'device') {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      const teluguVoice = voices.find((v) => v.lang.toLowerCase().startsWith('te'));
      if (teluguVoice) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.voice = teluguVoice;
        utter.rate = speed;
        utter.lang = 'te-IN';
        utter.onstart = () => onStart?.();
        utter.onend = () => onEnd?.();
        utter.onerror = (e) => onError?.(e);
        currentUtterance = utter;
        window.speechSynthesis.speak(utter);
        return;
      }
    }
  }

  // Strategy 2: High-fidelity AI speech synthesis from server (/api/tts)
  // This produces authentic, natural pronunciation for Telugu & English
  try {
    onStart?.();
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        speed,
        voice: 'Kore',
      }),
    });

    if (!res.ok) {
      throw new Error(`TTS server error (${res.status})`);
    }

    const data = await res.json();
    if (!data.audioBase64) {
      throw new Error('No audio returned from speech service');
    }

    const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
    const audio = new Audio(audioUrl);
    currentAudio = audio;

    audio.playbackRate = Math.max(0.75, Math.min(1.5, speed));
    audio.onended = () => {
      currentAudio = null;
      onEnd?.();
    };
    audio.onerror = (e) => {
      currentAudio = null;
      onError?.(e);
      fallbackWebSpeech(text, speed, onStart, onEnd, onError);
    };

    await audio.play();
  } catch (err) {
    console.warn('AI TTS failed, trying fallback WebSpeech:', err);
    fallbackWebSpeech(text, speed, onStart, onEnd, onError);
  }
}

function fallbackWebSpeech(
  text: string,
  speed: number,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = speed;
      utter.lang = 'te-IN';
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang.toLowerCase().startsWith('te')) || voices[0];
      if (match) utter.voice = match;

      utter.onstart = () => onStart?.();
      utter.onend = () => onEnd?.();
      utter.onerror = (e) => onError?.(e);
      currentUtterance = utter;
      window.speechSynthesis.speak(utter);
      return;
    } catch (e) {
      onError?.(e);
      onEnd?.();
    }
  } else {
    onEnd?.();
  }
}

export interface RecordingSession {
  stop: () => Promise<{ audioBlob: Blob; audioBase64: string }>;
  cancel: () => void;
}

export async function startAudioRecording(
  onVolumeChange?: (vol: number) => void
): Promise<RecordingSession> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let animId: number | null = null;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(1, average / 128);
        onVolumeChange?.(normalized);
        animId = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    }
  } catch (e) {
    console.warn('AudioContext setup error (non-fatal):', e);
  }

  // Determine supported mime type
  let mimeType = 'audio/webm';
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    mimeType = 'audio/webm;codecs=opus';
  } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
    mimeType = 'audio/mp4';
  } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
    mimeType = 'audio/ogg';
  }

  const mediaRecorder = new MediaRecorder(stream, { mimeType });
  const chunks: BlobPart[] = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  mediaRecorder.start(100);

  const cleanup = () => {
    if (animId) cancelAnimationFrame(animId);
    if (source) source.disconnect();
    if (analyser) analyser.disconnect();
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(() => {});
    }
    stream.getTracks().forEach((track) => track.stop());
  };

  return {
    stop: () => {
      return new Promise<{ audioBlob: Blob; audioBase64: string }>((resolve, reject) => {
        mediaRecorder.onstop = () => {
          cleanup();
          const blob = new Blob(chunks, { type: mimeType });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            resolve({
              audioBlob: blob,
              audioBase64: base64data,
            });
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(blob);
        };
        try {
          mediaRecorder.stop();
        } catch (e) {
          cleanup();
          reject(e);
        }
      });
    },
    cancel: () => {
      try {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      } catch (e) {
        // ignore
      }
      cleanup();
    },
  };
}

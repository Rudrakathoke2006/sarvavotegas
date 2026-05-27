/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndianLanguage } from "../types";

const languageSpeechCodes: Record<IndianLanguage, string> = {
  en: "en-US",
  hi: "hi-IN",
  bn: "bn-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  te: "te-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  gu: "gu-IN",
  pa: "pa-IN",
};

// Simple speaker wrapper
export function speakText(text: string, language: IndianLanguage = "en", enabled: boolean = true) {
  if (!enabled || typeof window === "undefined" || !window.speechSynthesis) return;

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageSpeechCodes[language] || "en-US";
  
  // Find a voice suitable for the language if possible
  const voices = window.speechSynthesis.getVoices();
  const langMatch = voices.find(v => v.lang.startsWith(utterance.lang.substring(0, 2)));
  if (langMatch) {
    utterance.voice = langMatch;
  }
  
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

// Simulated/actual voice command module
export interface VoiceCommandListener {
  onCommand: (phrase: string) => void;
  onListeningStateChange: (listening: boolean) => void;
  onError: (error: string) => void;
}

export function startSpeechCommandRecognition(
  language: IndianLanguage = "en",
  callbacks: VoiceCommandListener
): { stop: () => void } {
  if (typeof window === "undefined") {
    return { stop: () => {} };
  }

  // Use browser SpeechRecognition if available
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn("Speech recognition not natively supported in this browser. Fallback to mock micro commands trigger.");
    callbacks.onListeningStateChange(true);
    
    // Simulate speech detection of a selection in 3 seconds as a test cue
    const timer = setTimeout(() => {
      // Pick a random command or notify
      callbacks.onListeningStateChange(false);
    }, 4000);

    return {
      stop: () => clearTimeout(timer),
    };
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = languageSpeechCodes[language] || "en-US";

  recognition.onstart = () => {
    callbacks.onListeningStateChange(true);
  };

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript || "";
    callbacks.onCommand(transcript);
  };

  recognition.onerror = (event: any) => {
    callbacks.onError(event.error || "Speech input failed");
  };

  recognition.onend = () => {
    callbacks.onListeningStateChange(false);
  };

  try {
    recognition.start();
  } catch (err: any) {
    console.error("Speech Recognition start error:", err);
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch (e) {}
    },
  };
}

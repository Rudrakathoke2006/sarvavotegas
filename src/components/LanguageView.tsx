/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { IndianLanguage } from "../types";
import { speakText } from "../lib/speech";
import { Languages, Check, ArrowRight, Volume2 } from "lucide-react";
import { motion } from "motion/react";

interface LanguageViewProps {
  currentLanguage: IndianLanguage;
  voiceGuideEnabled: boolean;
  onSelectLanguage: (lang: IndianLanguage) => void;
  onToggleVoiceGuide: (enabled: boolean) => void;
  onNext: () => void;
}

const languagesList: Array<{ id: IndianLanguage; native: string; english: string; greeting: string }> = [
  { id: "en", native: "English", english: "English", greeting: "Welcome to SarvaVote. Please select your voting language." },
  { id: "hi", native: "हिन्दी", english: "Hindi", greeting: "सर्ववोट में आपका स्वागत है। कृपया अपनी गुप्त मतदान भाषा चुनें।" },
  { id: "bn", native: "বাংলা", english: "Bengali", greeting: "সর্বভোটে আপনাকে স্বাগত। অনুগ্রহ করে আপনার ভোটিং ভাষা নির্বাচন করুন।" },
  { id: "mr", native: "मराठी", english: "Marathi", greeting: "सर्ववोटमध्ये आपले स्वागत आहे. कृपया तुमची मतदानाची भाषा निवडा." },
  { id: "ta", native: "தமிழ்", english: "Tamil", greeting: "சர்வவோட் உங்களை வரவேற்கிறது. உங்கள் வாக்குப்பதிவு மொழியைத் தேர்ந்தெடுக்கவும்." },
  { id: "te", native: "తెలుగు", english: "Telugu", greeting: "సర్వవోట్ మీకు స్వాగతం పలుకుతోంది. దయచేసి మీ ఓటింగ్ భాషను ఎంచుకోండి." },
  { id: "kn", native: "ಕನ್ನಡ", english: "Kannada", greeting: "ಸರ್ವವೋಟ್‌ಗೆ ನಿಮಗೆ ಸುಸ್ವಾಗತ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮತದಾನದ ಭಾಷೆಯನ್ನು ಆರಿಸಿ." },
  { id: "ml", native: "മലയാളം", english: "Malayalam", greeting: "സർവ്വവോട്ടിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ വോട്ടിംഗ് ഭാഷ തിരഞ്ഞെടുക്കുക." },
  { id: "gu", native: "ગુજરાતી", english: "Gujarati", greeting: "સર્વવોટમાં આપનું સ્વાગત છે. કૃપા કરીને તમારી મતદાન ભાષા પસંદ કરો." },
  { id: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi", greeting: "ਸਰਵਵੋਟ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਵੋਟਿੰਗ ਭਾਸ਼ਾ ਚੁਣੋ।" },
];

export function LanguageView({
  currentLanguage,
  voiceGuideEnabled,
  onSelectLanguage,
  onToggleVoiceGuide,
  onNext,
}: LanguageViewProps) {
  
  const handleSelect = (langId: IndianLanguage, greeting: string) => {
    onSelectLanguage(langId);
    // Explicitly speak greeting in selected language to show voice guide capabilities!
    speakText(greeting, langId, voiceGuideEnabled);
  };

  const handleToggleVoice = (checked: boolean) => {
    onToggleVoiceGuide(checked);
    if (checked) {
      const activeLangObj = languagesList.find(l => l.id === currentLanguage) || languagesList[0];
      setTimeout(() => {
        speakText(`Voice guide active. ${activeLangObj.greeting}`, currentLanguage, true);
      }, 100);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-3xl border border-slate-150 shadow-sm space-y-8" id="language-view-container">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-orange-100">
          <Languages className="w-6 h-6" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Select Your Voting Language
        </h2>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          Choose your preferred regional language. This language will configure all text labels, audio readings, and AI chatbot simplify features.
        </p>
      </div>

      {/* Voice Guide Toggle Card */}
      <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${voiceGuideEnabled ? "bg-orange-500 text-white animate-pulse" : "bg-slate-200 text-slate-500"}`}>
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              Bilingual Voice Guide Assistant
            </h4>
            <p className="text-xs text-slate-500">
              Auto-read all instructions aloud in your selected regional accent.
            </p>
          </div>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            id="toggle-voice-guide-audio"
            type="checkbox"
            checked={voiceGuideEnabled}
            onChange={(e) => handleToggleVoice(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
        </label>
      </div>

      {/* Grid of Indian Languages */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" id="language-grid">
        {languagesList.map((lang) => {
          const isSelected = currentLanguage === lang.id;
          return (
            <button
              key={lang.id}
              id={`lang-btn-${lang.id}`}
              onClick={() => handleSelect(lang.id, lang.greeting)}
              className={`p-4 rounded-xl border text-left transition duration-150 relative cursor-pointer group flex flex-col justify-between h-24 ${
                isSelected
                  ? "border-orange-500 bg-orange-50/50 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div>
                <span className={`text-lg font-bold block ${isSelected ? "text-orange-900" : "text-slate-800"}`}>
                  {lang.native}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {lang.english}
                </span>
              </div>
              
              {isSelected && (
                <div className="absolute right-3 bottom-3 w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-white">
                  <Check className="w-3 h-3 stroke-[3px]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          id="btn-lang-continue"
          onClick={onNext}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition duration-150 flex items-center gap-2 cursor-pointer text-sm"
        >
          Continue to Accessibility Setup
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

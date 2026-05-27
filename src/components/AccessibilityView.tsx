/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AccessibilityModeType } from "../types";
import { speakText } from "../lib/speech";
import { 
  Eye, 
  Mic, 
  VolumeX, 
  Contrast, 
  Hand, 
  BookOpen, 
  Check, 
  ArrowRight, 
  ArrowLeft 
} from "lucide-react";
import { motion } from "motion/react";

interface AccessibilityViewProps {
  currentMode: AccessibilityModeType;
  voiceGuideEnabled: boolean;
  onSelectMode: (mode: AccessibilityModeType) => void;
  onBack: () => void;
  onNext: () => void;
}

const accessibilityModes: Array<{
  id: AccessibilityModeType;
  title: string;
  target: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  speechPrompt: string;
}> = [
  {
    id: "visual",
    title: "Standard Visual Mode",
    target: "General Users",
    description: "Standard visual interface featuring fluid grids, optimized typography matching system layout, full keyboard navigation and comprehensive ARIA descriptions.",
    icon: Eye,
    color: "bg-blue-50 text-blue-600 border-blue-100",
    speechPrompt: "Selected standard visual mode.",
  },
  {
    id: "voice",
    title: "Full Voice Mode",
    target: "Visually Impaired",
    description: "A completely hands-free voting mode driven by spoken voice commands. Integrates Text-to-Speech systems to query and navigate cards.",
    icon: Mic,
    color: "bg-purple-50 text-purple-600 border-purple-100",
    speechPrompt: "Selected full hands-free voice mode. You will be prompted to command by voice.",
  },
  {
    id: "audio",
    title: "Assisted Audio Mode",
    target: "Low-Literacy Citizens",
    description: "Simplifies UI with high-contrast graphic icons. Every label, button actions, and manifesto details are read aloud automatically.",
    icon: VolumeX,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    speechPrompt: "Selected assisted audio mode. Content will play aloud automatically upon hover.",
  },
  {
    id: "contrast",
    title: "High Contrast & Large Text",
    target: "Elderly & Low-Vision",
    description: "Switches to high-contrast Navy, Saffron, and White visual grids. Significantly enlarges text blocks (min 18pt) and buttons to prevent fatigue.",
    icon: Contrast,
    color: "bg-orange-50 text-orange-600 border-orange-100",
    speechPrompt: "Selected high contrast interface with large typography standards.",
  },
  {
    id: "gesture",
    title: "Camera Gesture Mode",
    target: "Motor Disabilities",
    description: "Controls pages with simple video gestures: Thumbs-Up [👍] triggers Confirmation, and Open-Palm [✋] triggers Cancel/Back.",
    icon: Hand,
    color: "bg-rose-50 text-rose-600 border-rose-100",
    speechPrompt: "Selected hardware gesture mode. Camera access will be activated.",
  },
  {
    id: "dyslexia",
    title: "Dyslexia Friendly Mode",
    target: "Reading Difficulties",
    description: "Renders the web-app using wide-spacing sans layout, increased line-height buffers, pastel backgrounds, and color-coded components.",
    icon: BookOpen,
    color: "bg-sky-50 text-sky-600 border-sky-100",
    speechPrompt: "Selected dyslexia friendly spacing mode. Background colors will dim to pastel shades.",
  },
];

export function AccessibilityView({
  currentMode,
  voiceGuideEnabled,
  onSelectMode,
  onBack,
  onNext,
}: AccessibilityViewProps) {
  
  const handleSelect = (mode: AccessibilityModeType, speechPrompt: string) => {
    onSelectMode(mode);
    speakText(speechPrompt, "en", voiceGuideEnabled);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-3xl border border-slate-150 shadow-sm space-y-8" id="accessibility-view-container">
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Choose Interaction Mode
        </h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          We believe democracy should leave no citizen behind. Select an optimization mode configured for your specific accessibility preferences.
        </p>
      </div>

      {/* Mode selectors */}
      <div className="grid md:grid-cols-2 gap-4">
        {accessibilityModes.map((mode) => {
          const isSelected = currentMode === mode.id;
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              id={`access-mode-btn-${mode.id}`}
              onClick={() => handleSelect(mode.id, mode.speechPrompt)}
              className={`p-5 rounded-2xl border text-left flex gap-4 transition duration-150 relative cursor-pointer ${
                isSelected
                  ? "border-orange-500 bg-orange-50/25 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center border ${mode.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-base">
                    {mode.title}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {mode.target}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  {mode.description}
                </p>
              </div>

              {isSelected && (
                <div className="absolute right-4 top-4 w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-white">
                  <Check className="w-3 h-3 stroke-[3px]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
        <button
          id="btn-access-back"
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Languages
        </button>
        
        <button
          id="btn-access-continue"
          onClick={onNext}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer shadow-md"
        >
          Proceed to Verification
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

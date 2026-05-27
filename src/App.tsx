/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Voter, 
  Candidate, 
  BlockchainBlock, 
  IndianLanguage, 
  AccessibilityModeType 
} from "./types";
import { speakText } from "./lib/speech";

// Import Views
import { LandingView } from "./components/LandingView";
import { LanguageView } from "./components/LanguageView";
import { AccessibilityView } from "./components/AccessibilityView";
import { AuthView } from "./components/AuthView";
import { OtpView } from "./components/OtpView";
import { CandidateView } from "./components/CandidateView";
import { VotingView } from "./components/VotingView";
import { ConfirmationView } from "./components/ConfirmationView";
import { ReceiptView } from "./components/ReceiptView";
import { HelpdeskWidget } from "./components/HelpdeskWidget";
import { AdminDashboard } from "./components/AdminDashboard";

// Lucide icons
import { 
  MessageSquare, 
  Home, 
  Users, 
  ShieldCheck, 
  Sliders, 
  Globe, 
  LogOut,
  HelpCircle,
  Award
} from "lucide-react";

export default function App() {
  const [step, setStep] = useState<
    "landing" | "language" | "accessibility" | "auth" | "otp" | "candidate" | "voting" | "confirmation" | "receipt" | "admin"
  >("landing");

  const [voter, setVoter] = useState<Voter | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [blockData, setBlockData] = useState<any | null>(null);
  const [language, setLanguage] = useState<IndianLanguage>("en");
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityModeType>("visual");
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState(false);
  const [isHelpdeskOpen, setIsHelpdeskOpen] = useState(false);

  // Trigger global help instruction speeches when step shifts
  useEffect(() => {
    if (!voiceGuideEnabled) return;

    switch (step) {
      case "landing":
        speakText("Welcome to SarvaVote v2. Please select secure voter portal to start.", "en", true);
        break;
      case "language":
        speakText("Select your primary regional language.", "en", true);
        break;
      case "accessibility":
        speakText("Choose accessibility mode to configure layouts based on your usability requirements.", "en", true);
        break;
      case "auth":
        speakText("Enter Elector ID credentials or sign up a new card account.", "en", true);
        break;
      case "otp":
        speakText("Type your six-digit authentication code.", "en", true);
        break;
      case "candidate":
        speakText("constituency nominee listing. Tap manifesto bullets to simplify policy details.", "en", true);
        break;
      case "voting":
        speakText("Balot card review. Hold thumbs up or press confirm button.", "en", true);
        break;
      case "confirmation":
        speakText("Creating immutable secure ledger index. Writing transactions.", "en", true);
        break;
      case "receipt":
        speakText("Your ballot receipt. Keep receipt ID key for public audits.", "en", true);
        break;
    }
  }, [step]);

  const handleStartVoterJourney = () => {
    setStep("language");
  };

  const handleSelectLanguage = (lang: IndianLanguage) => {
    setLanguage(lang);
  };

  const handleSelectAccessibilityMode = (mode: AccessibilityModeType) => {
    setAccessibilityMode(mode);
  };

  const handlePrefNext = async () => {
    setStep("auth");
  };

  const handleAuthSuccess = async (authenticatedVoter: Voter, needsOtp: boolean) => {
    // Save selections onto the back-end voter session
    try {
      const resp = await fetch("/api/auth/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId: authenticatedVoter.voterId,
          language,
          accessibilityMode
        })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setVoter(data.voter);
      } else {
        setVoter(authenticatedVoter);
      }
    } catch (e) {
      setVoter(authenticatedVoter);
    }

    if (needsOtp) {
      setStep("otp");
    } else {
      setStep("candidate");
    }
  };

  const handleOtpVerified = (verifiedVoter: Voter) => {
    setVoter(verifiedVoter);
    setStep("candidate");
  };

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setStep("voting");
  };

  const handleCastVote = (candidateId: string) => {
    setStep("confirmation");
  };

  const handleProceedToReceipt = (generatedBlock: any) => {
    setBlockData(generatedBlock);
    setStep("receipt");
  };

  const handleGoHome = () => {
    // Reset wizard session
    setVoter(null);
    setSelectedCandidate(null);
    setBlockData(null);
    setStep("landing");
  };

  const handleLogout = () => {
    handleGoHome();
    speakText("Session locked. Returning to home landing.", "en", voiceGuideEnabled);
  };

  // Determine design themes based on selected interactive Accessibility Modes
  let containerTheme = "bg-slate-50 text-slate-800 font-sans";
  let contentCardStyle = "bg-white border-slate-200";

  if (accessibilityMode === "contrast") {
    // High-Contrast Navy/Saffron/White
    containerTheme = "bg-slate-950 text-white font-sans tracking-wide";
    contentCardStyle = "bg-slate-900 border-orange-500 shadow-xl border-2";
  } else if (accessibilityMode === "dyslexia") {
    // Pastel Calm background, Wide Letter Spacing
    containerTheme = "bg-amber-50/15 text-slate-900 font-sans tracking-widest leading-relaxed";
    contentCardStyle = "bg-emerald-50/25 border-emerald-300 shadow-sm";
  } else if (accessibilityMode === "audio") {
    containerTheme = "bg-slate-50 text-slate-850 font-sans leading-loose";
  }

  return (
    <div className={`min-h-screen flex flex-col justify-between ${containerTheme}`} id="sarvavote-root-app">
      {/* Platform Navigation Header */}
      <header className="bg-slate-900 text-slate-200 border-b border-slate-800 shrink-0 select-none shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <button 
            onClick={handleGoHome}
            className="flex items-center gap-2 px-1 focus:ring-1 focus:ring-orange-500 outline-none cursor-pointer"
            id="bar-brand"
          >
            <div className="w-8 h-8 bg-orange-600 text-white rounded-lg flex items-center justify-center font-black text-sm">
              SV
            </div>
            <span className="font-extrabold text-base text-white tracking-tight">SarvaVote AI</span>
          </button>

          {/* Quick Context Indicators */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            {voter && (
              <div className="hidden md:flex items-center gap-1.5 bg-slate-800 text-slate-300 px-3 py-1 rounded-full uppercase text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                VOTER: {voter.voterId.substring(0, 10)}
              </div>
            )}

            {step !== "landing" && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-[10px] uppercase">
                <Globe className="w-3.5 h-3.5" />
                Language: {language.toUpperCase()}
              </div>
            )}

            {step !== "landing" && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-[10px] uppercase">
                <Sliders className="w-3.5 h-3.5" />
                Preset: {accessibilityMode}
              </div>
            )}

            {/* Logout/Leave session */}
            {voter && (
              <button
                id="btn-nav-logout"
                onClick={handleLogout}
                className="hover:text-red-400 text-slate-300 flex items-center gap-1 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Session</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-8 md:py-12 px-4 md:px-8 flex flex-col justify-center">
        {step === "landing" && (
          <LandingView 
            onStartVoting={handleStartVoterJourney} 
            onOpenHelpdesk={() => setIsHelpdeskOpen(true)}
            onOpenAdmin={() => setStep("admin")}
          />
        )}

        {step === "language" && (
          <LanguageView
            currentLanguage={language}
            voiceGuideEnabled={voiceGuideEnabled}
            onSelectLanguage={handleSelectLanguage}
            onToggleVoiceGuide={setVoiceGuideEnabled}
            onNext={() => setStep("accessibility")}
          />
        )}

        {step === "accessibility" && (
          <AccessibilityView
            currentMode={accessibilityMode}
            voiceGuideEnabled={voiceGuideEnabled}
            onSelectMode={handleSelectAccessibilityMode}
            onBack={() => setStep("language")}
            onNext={handlePrefNext}
          />
        )}

        {step === "auth" && (
          <AuthView 
            onAuthSuccess={handleAuthSuccess}
            voiceGuideEnabled={voiceGuideEnabled}
          />
        )}

        {step === "otp" && voter && (
          <OtpView
            voter={voter}
            voiceGuideEnabled={voiceGuideEnabled}
            onOtpVerified={handleOtpVerified}
            onCancel={() => setStep("auth")}
          />
        )}

        {step === "candidate" && (
          <CandidateView
            language={language}
            accessibilityMode={accessibilityMode}
            voiceGuideEnabled={voiceGuideEnabled}
            onSelectCandidate={handleSelectCandidate}
            onBack={() => setStep("accessibility")}
          />
        )}

        {step === "voting" && voter && selectedCandidate && (
          <VotingView
            voterId={voter.voterId}
            selectedCandidate={selectedCandidate}
            language={language}
            accessibilityMode={accessibilityMode}
            voiceGuideEnabled={voiceGuideEnabled}
            onCastVote={handleCastVote}
            onBack={() => setStep("candidate")}
          />
        )}

        {step === "confirmation" && voter && selectedCandidate && (
          <ConfirmationView
            voterId={voter.voterId}
            selectedCandidateSymbol={selectedCandidate.symbol}
            selectedCandidateName={selectedCandidate.name}
            voiceGuideEnabled={voiceGuideEnabled}
            onProceedToReceipt={handleProceedToReceipt}
          />
        )}

        {step === "receipt" && voter && (
          <ReceiptView
            voterName={voter.name}
            voterId={voter.voterId}
            blockData={blockData}
            voiceGuideEnabled={voiceGuideEnabled}
            onGoHome={handleGoHome}
          />
        )}

        {step === "admin" && (
          <AdminDashboard onClose={() => setStep("landing")} />
        )}
      </main>

      {/* Floating AI Helpdesk Drawer Widget */}
      {isHelpdeskOpen ? (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm px-4">
          <HelpdeskWidget 
            language={language} 
            voiceGuideEnabled={voiceGuideEnabled}
            onClose={() => setIsHelpdeskOpen(false)}
          />
        </div>
      ) : (
        <button
          id="btn-floating-helpdesk-trigger"
          onClick={() => {
            setIsHelpdeskOpen(true);
            speakText("Opening SarvaVote AI assistance widget.", "en", voiceGuideEnabled);
          }}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 text-white p-4 rounded-full shadow-2xl shadow-orange-500/20 active:scale-95 transition flex items-center justify-center cursor-pointer border border-orange-400"
          title="Open AI conversational help widget"
        >
          <MessageSquare className="w-6 h-6 shrink-0" />
        </button>
      )}

      {/* Footer copyright */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 text-xs py-5 shrink-0 select-none">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Award className="w-4 h-4 text-orange-500" />
            <span>SarvaVote AI v2.0 Hackathon Build</span>
          </div>
          <p>© 2026 Government-Grade Public Systems. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

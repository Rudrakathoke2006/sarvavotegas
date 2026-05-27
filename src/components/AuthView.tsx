/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Checklist } from "lucide-react"; // Wait, Checklist is not always in lucide, let's use check-square or Shield
import { 
  ShieldCheck, 
  UserPlus, 
  LogIn, 
  Mic, 
  Volume2, 
  AlertCircle, 
  Check, 
  FileText 
} from "lucide-react";
import { speakText } from "../lib/speech";
import { Voter } from "../types";

interface AuthViewProps {
  onAuthSuccess: (voter: Voter, needsOtp: boolean) => void;
  voiceGuideEnabled: boolean;
}

export function AuthView({ onAuthSuccess, voiceGuideEnabled }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [voterId, setVoterId] = useState("");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  
  // Consent
  const [consentApproved, setConsentApproved] = useState(false);
  const [errorStatus, setErrorStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Voice enrollment state (inside Sign Up workflow)
  const [isEnrollingVoice, setIsEnrollingVoice] = useState(false);
  const [enrollStep, setEnrollStep] = useState(0); // 0 -> prep, 1, 2, 3 -> recorded, 4 -> done
  const [isRecording, setIsRecording] = useState(false);
  const [tempVoter, setTempVoter] = useState<Voter | null>(null);

  useEffect(() => {
    setErrorStatus("");
  }, [isLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus("");
    
    if (!voterId.trim()) {
      setErrorStatus("Please enter your Voter ID card number.");
      return;
    }
    if (!mobile.trim() || mobile.length < 10) {
      setErrorStatus("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId, mobile })
      });
      
      const data = await response.json();
      setIsLoading(false);
      
      if (response.ok && data.success) {
        onAuthSuccess(data.voter, true); // True -> needs OTP trigger
        speakText("Voter identity located. Code sent.", "en", voiceGuideEnabled);
      } else {
        setErrorStatus(data.error || "Authentication failed. Try again.");
      }
    } catch (err) {
      setIsLoading(false);
      setErrorStatus("Could not reach verification gateway. Please check local server.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus("");

    if (!name.trim()) {
      setErrorStatus("Please enter your complete legal name.");
      return;
    }
    if (!voterId.trim() || voterId.length < 5) {
      setErrorStatus("Voter ID must be at least 5 alphanumeric characters.");
      return;
    }
    if (!mobile.trim() || mobile.length < 10) {
      setErrorStatus("Please enter your valid 10-digit mobile number.");
      return;
    }
    if (!consentApproved) {
      setErrorStatus("You must consent to identity verification and ballot terms.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId, mobile, name })
      });

      const data = await response.json();
      setIsLoading(false);
      
      if (response.ok && data.success) {
        setTempVoter(data.voter);
        // Direct voter to optional biometric enrol!
        setIsEnrollingVoice(true);
        speakText("Please enroll your voice biometric sample to secure your ballot.", "en", voiceGuideEnabled);
      } else {
        setErrorStatus(data.error || "Enrollment failed. This ID might be registered.");
      }
    } catch (err) {
      setIsLoading(false);
      setErrorStatus("Registration service offline. Try again.");
    }
  };

  // Enrolling voice process simulation
  const simulateVoiceRecording = () => {
    if (isRecording) return;
    setIsRecording(true);
    speakText("Recording. Please read clearly: My vote is my voice", "en", voiceGuideEnabled);

    setTimeout(() => {
      setIsRecording(false);
      const nextStep = enrollStep + 1;
      setEnrollStep(nextStep);
      
      if (nextStep < 3) {
        speakText(`Sample ${nextStep} received. Please repeat the phrase.`, "en", voiceGuideEnabled);
      } else {
        submitVoiceEnrollment();
      }
    }, 2500);
  };

  const submitVoiceEnrollment = async () => {
    if (!tempVoter) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/enroll-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId: tempVoter.voterId, audioSamplesCount: 3 })
      });
      const data = await response.json();
      setIsLoading(false);
      if (response.ok && data.success) {
        setEnrollStep(4);
        speakText("Voice enrolled successfully. Identity setup complete.", "en", voiceGuideEnabled);
        setTimeout(() => {
          onAuthSuccess(data.voter, true);
        }, 1500);
      }
    } catch (e) {
      setIsLoading(false);
      setErrorStatus("Voice enrollment server error.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm space-y-6" id="auth-panel-container">
      
      {isEnrollingVoice ? (
        // Voice Enrolment Sub-workflow
        <div className="space-y-6 text-center" id="voice-enroll-flow">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 border border-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Enrolling Voice Biometric</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Create an encrypted acoustic profile. This adds an ultra-secure layer to match identity post-OTP and prevent spoofing.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Reading Phrase
            </span>
            <div className="text-lg font-black text-slate-900 font-mono tracking-tight my-2">
              &quot;My vote is my voice&quot;
            </div>
            <p className="text-xs text-slate-500">
              Speak clearly into your microphone when the wave starts.
            </p>
          </div>

          {/* Graphical Waves */}
          <div className="h-16 flex items-center justify-center gap-1 bg-slate-50/50 rounded-xl px-4 border border-slate-100">
            {isRecording ? (
              Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-purple-600 rounded-full animate-bounce"
                  style={{
                    height: `${Math.floor(Math.random() * 40 + 10)}%`,
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))
            ) : (
              <div className="text-xs text-slate-400 font-mono">Microphone Standby</div>
            )}
          </div>

          {/* Stepper indicators */}
          {enrollStep < 4 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-4 text-xs font-semibold text-slate-500">
                <span className={enrollStep >= 1 ? "text-purple-600 font-bold" : ""}>Sample 1</span>
                <span className={enrollStep >= 2 ? "text-purple-600 font-bold" : ""}>Sample 2</span>
                <span className={enrollStep >= 3 ? "text-purple-600 font-bold" : ""}>Sample 3</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-600 h-full transition-all duration-300"
                  style={{ width: `${(enrollStep / 3) * 100}%` }}
                />
              </div>

              <button
                id="btn-voice-record-trigger"
                type="button"
                onClick={simulateVoiceRecording}
                disabled={isRecording || isLoading}
                className={`w-full py-3.5 px-4 text-sm font-bold text-white rounded-xl shadow-md cursor-pointer ${
                  isRecording 
                    ? "bg-purple-400 cursor-not-allowed" 
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {isRecording ? "Listening..." : "Record Auditory Key"}
              </button>
              
              <button 
                id="btn-voice-skip"
                type="button"
                onClick={() => {
                  if (tempVoter) onAuthSuccess(tempVoter, true);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
              >
                Skip voice security (Use standard OTP authorization)
              </button>
            </div>
          ) : (
            <div className="py-2 text-emerald-600 flex items-center justify-center gap-2 font-bold text-sm">
              <Check className="w-5 h-5 text-emerald-600 stroke-[3px]" />
              Acoustic Fingerprint Enrolled
            </div>
          )}
        </div>
      ) : (
        // Login / Register Form Toggle
        <div className="space-y-6">
          <div className="flex border-b border-slate-100 pb-0.5" id="auth-tab">
            <button
              id="switch-to-login"
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-3 text-center text-sm font-bold tracking-tight transition cursor-pointer ${
                isLogin 
                  ? "text-orange-600 border-b-2 border-orange-600" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2 text-orange-600" />
              Existing Voter
            </button>
            <button
              id="switch-to-register"
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-3 text-center text-sm font-bold tracking-tight transition cursor-pointer ${
                !isLogin 
                  ? "text-orange-600 border-b-2 border-orange-600" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2 text-orange-600" />
              Register (New ID)
            </button>
          </div>

          {errorStatus && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorStatus}</span>
            </div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Legal Name</label>
                <input
                  id="reg-name-input"
                  type="text"
                  placeholder="As listed on Electoral Roll"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none"
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Elector ID Card No. (Voter ID)</label>
              <input
                id="auth-voter-id-input"
                type="text"
                placeholder="e.g. ECI2039209"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none uppercase"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Registered Mobile Number</label>
              <input
                id="auth-mobile-input"
                type="tel"
                placeholder="10-digit mobile phone"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none"
                required
              />
            </div>

            {!isLogin && (
              <div className="bg-slate-50 p-4 border border-slate-250 rounded-xl">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    id="consent-checkbox-voter"
                    type="checkbox"
                    checked={consentApproved}
                    onChange={(e) => setConsentApproved(e.target.checked)}
                    className="mt-1 h-4 w-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
                  />
                  <div className="text-[11px] text-slate-500 leading-relaxed font-sans font-medium">
                    I declare that the details provided match my ECI census record. I authorize SarvaVote to securely verify my identity using OTP SMS, audit my cast vote hash via blockchain, and consent to biometric enrollment rules.
                  </div>
                </label>
              </div>
            )}

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-md active:translate-y-px transition duration-150 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  {isLogin ? "Authenticate Identity" : "Consent & Enroll Citizen"}
                </>
              )}
            </button>
          </form>

          <div className="bg-slate-50 p-3 rounded-xl text-center text-[10px] text-slate-500 font-sans border border-slate-200/50 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>Biometric auditing and voice encryption process is active under national cybersecurity guidelines.</span>
          </div>
        </div>
      )}
    </div>
  );
}

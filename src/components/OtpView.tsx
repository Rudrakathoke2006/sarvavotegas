/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { speakText } from "../lib/speech";
import { Voter } from "../types";
import { 
  KeyRound, 
  RefreshCw, 
  Lock, 
  Mic, 
  Activity, 
  Volume2, 
  ArrowRight,
  Fingerprint
} from "lucide-react";

interface OtpViewProps {
  voter: Voter;
  voiceGuideEnabled: boolean;
  onOtpVerified: (voter: Voter) => void;
  onCancel: () => void;
}

export function OtpView({ voter, voiceGuideEnabled, onOtpVerified, onCancel }: OtpViewProps) {
  const [pin, setPin] = useState("");
  const [timerCount, setTimerCount] = useState(59);
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [mockSentCode, setMockSentCode] = useState("");

  // Secondary Biometrics post-OTP
  const [voiceVerified, setVoiceVerified] = useState(false);
  const [isMeasuringVoice, setIsMeasuringVoice] = useState(false);
  const [voiceConfidence, setVoiceConfidence] = useState<number | null>(null);

  useEffect(() => {
    // Initial OTP dispatch trigger
    triggerOtpDispatch();

    const interval = setInterval(() => {
      setTimerCount((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const triggerOtpDispatch = async () => {
    setIsResending(true);
    setErrorMessage("");
    try {
      const resp = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId: voter.voterId })
      });
      const data = await resp.json();
      setIsResending(false);
      if (resp.ok && data.success) {
        setMockSentCode(data.code);
        setTimerCount(59);
        speakText("Please check your mobile phone for the six-digit verification pin code.", "en", voiceGuideEnabled);
      }
    } catch (e) {
      setIsResending(false);
      setErrorMessage("Could not reach OTP dispatch server.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (pin.length !== 6) {
      setErrorMessage("Please enter exactly 6 numeric digits.");
      return;
    }

    setIsVerifying(true);
    try {
      const resp = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId: voter.voterId, pin })
      });
      const data = await resp.json();
      setIsVerifying(false);

      if (resp.ok && data.success) {
        // If the voter has already enrolled in voice profile biometrics, trigger voice validation!
        if (voter.voiceEnrolled) {
          triggerVoiceBiometricMatch();
        } else {
          onOtpVerified(data.voter);
        }
      } else {
        setErrorMessage(data.error || "Incorrect pin entered. Try again.");
      }
    } catch (error) {
      setIsVerifying(false);
      setErrorMessage("Verification server is unreachable.");
    }
  };

  // Simulated Voice profile match post-OTP
  const triggerVoiceBiometricMatch = () => {
    setIsMeasuringVoice(true);
    speakText("OTP Verified. Commencing voice profile security matching. Speak clearly when the activity bar flashes.", "en", voiceGuideEnabled);

    setTimeout(async () => {
      // API call to match profile
      try {
        const resp = await fetch("/api/auth/verify-voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voterId: voter.voterId })
        });
        const data = await resp.json();
        setIsMeasuringVoice(false);
        if (resp.ok && data.success) {
          setVoiceVerified(true);
          setVoiceConfidence(data.confidence);
          speakText(`Voice matched successfully with ${data.confidence.toFixed(1)} percent confidence. Entering candidacy menu.`, "en", voiceGuideEnabled);
          
          setTimeout(() => {
            onOtpVerified(data.voter);
          }, 2000);
        } else {
          setErrorMessage(data.error || "Acoustic fingerprint mismatch. Biometric check failed.");
          speakText("Biometric verification did not match.", "en", voiceGuideEnabled);
        }
      } catch (err) {
        setIsMeasuringVoice(false);
        setErrorMessage("Biometrics server error.");
      }
    }, 4000);
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-sm space-y-6" id="otp-view-container">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto border border-orange-100">
          <KeyRound className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">SMS Pass Key Verification</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          We sent a temporary 6-digit pin code to mobile <span className="font-bold text-slate-800">*****{voter.mobile ? voter.mobile.slice(-4) : "0000"}</span>.
        </p>
      </div>

      {isMeasuringVoice ? (
        // Voice verification step
        <div className="space-y-6 text-center" id="voice-auth-processing">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">Validating Voice Identity</h4>
            <p className="text-xs text-slate-500">Checking physical frequency harmonics against registered signature.</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden flex flex-col items-center justify-center py-6">
            <Activity className="w-10 h-10 text-purple-600 animate-pulse mb-2" />
            <div className="text-xs font-mono font-bold text-purple-700 uppercase tracking-widest animate-pulse">
              ANALYZING PROFILE MATCH
            </div>
            {/* Animated bar progress */}
            <div className="w-24 bg-slate-200 h-1 rounded-full overflow-hidden mt-3">
              <div className="bg-purple-600 h-full animate-[shimmer_1.5s_infinite]" style={{ width: "60%" }} />
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Hold micro device close to source. Anti-spoof analysis detects pre-recorded replay tampering.
          </div>
        </div>
      ) : voiceVerified ? (
        // Voice match success
        <div className="text-center space-y-4" id="voice-auth-success">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
            <Fingerprint className="w-5 h-5 stroke-[2.5px]" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">Security Checks Cleared!</h4>
            <p className="text-xs text-emerald-600 font-semibold">
              Voice Match: {voiceConfidence ? voiceConfidence.toFixed(1) : "96.4"}% Confirmed
            </p>
          </div>
          <div className="text-xs text-slate-400">Redirecting to candidate listings...</div>
        </div>
      ) : (
        // Simple OTP PIN input form
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sandbox Help Helper */}
          {mockSentCode && (
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 text-orange-850 text-xs space-y-1">
              <div className="font-bold text-[10px] uppercase tracking-wider text-orange-700">Sandbox Preview Gateway</div>
              <p>Type this simulation pin code: <span className="font-mono font-black text-sm text-orange-950 bg-white px-2 py-0.5 rounded border border-orange-200">{mockSentCode}</span></p>
            </div>
          )}

          <div className="space-y-1.5 text-center">
            <label className="text-xs font-bold text-slate-700 block">Enter 6-Digit OTP</label>
            <input
              id="otp-pin-input-field"
              type="text"
              maxLength={6}
              placeholder="0 0 0 0 0 0"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="w-full text-center font-mono text-2xl font-black tracking-[10px] py-3.5 border border-slate-200 hover:border-slate-300 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
              required
            />
          </div>

          <div className="flex justify-between items-center text-xs font-semibold px-1 text-slate-500">
            <span>
              {timerCount > 0 ? (
                `Resend code in ${timerCount}s`
              ) : (
                <button
                  id="btn-otp-resend"
                  type="button"
                  onClick={triggerOtpDispatch}
                  disabled={isResending}
                  className="text-orange-600 hover:text-orange-700 underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Resend Pin
                </button>
              )}
            </span>
            
            <button
              id="btn-otp-cancel"
              type="button"
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 underline cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <button
            id="btn-otp-verify-submit"
            type="submit"
            disabled={isVerifying}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isVerifying ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Secure Validation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

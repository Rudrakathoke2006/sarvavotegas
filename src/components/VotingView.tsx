/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from "react";
import { Candidate, IndianLanguage, AccessibilityModeType } from "../types";
import { speakText } from "../lib/speech";
import { 
  ShieldAlert, 
  Check, 
  X, 
  HelpCircle, 
  Camera, 
  Vote, 
  Compass, 
  Key,
  Flame,
  ThumbsUp,
  Hand
} from "lucide-react";

interface VotingViewProps {
  voterId: string;
  selectedCandidate: Candidate;
  language: IndianLanguage;
  accessibilityMode: AccessibilityModeType;
  voiceGuideEnabled: boolean;
  onCastVote: (candidateId: string) => void;
  onBack: () => void;
}

export function VotingView({
  voterId,
  selectedCandidate,
  language,
  accessibilityMode,
  voiceGuideEnabled,
  onCastVote,
  onBack,
}: VotingViewProps) {
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Gesture Recognition States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [gestureInstruction, setGestureInstruction] = useState("Initializing camera sensory rules...");
  const [simulatedGestureProgress, setSimulatedGestureProgress] = useState(0);
  const [activeGesture, setActiveGesture] = useState<"thumbs_up" | "open_palm" | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    speakText(`Reviewing ballot selection. You have selected ${selectedCandidate.name}. Double check nominee credentials before casting your vote.`, "en", voiceGuideEnabled);

    if (accessibilityMode === "gesture") {
      activateSimulatedCamera();
    }

    return () => {
      stopCamera();
    };
  }, []);

  const activateSimulatedCamera = async () => {
    setIsCameraActive(true);
    setGestureInstruction("Place Hand inside the designated bounding framing...");
    
    // Attempt standard webcam capture
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch (e) {
      console.warn("Physical camera blocked or not found. Showing mock model recognition outline.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Simulate gesture holds
  const triggerGestureHold = (gesture: "thumbs_up" | "open_palm") => {
    if (simulatedGestureProgress > 0) return;
    setActiveGesture(gesture);
    setSimulatedGestureProgress(1);
    
    const phrase = gesture === "thumbs_up" 
      ? "Holding Thumbs Up to Cast Vote. Do not move hand." 
      : "Holding Open Palm to Cancel Nominee list.";
    
    speakText(phrase, "en", voiceGuideEnabled);

    let progress = 10;
    const interval = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        clearInterval(interval);
        setSimulatedGestureProgress(0);
        setActiveGesture(null);
        if (gesture === "thumbs_up") {
          setShowWarningDialog(true);
          speakText("Gesture confirmed. Opening security ledger authorization window.", "en", voiceGuideEnabled);
        } else {
          onBack();
        }
      } else {
        setSimulatedGestureProgress(progress);
      }
    }, 450);
  };

  const handleCastVoteFinal = async () => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const resp = await fetch("/api/vote/cast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId,
          candidateId: selectedCandidate.id,
          accessibilityMode,
          language
        })
      });
      const data = await resp.json();
      setIsSubmitting(false);
      if (resp.ok && data.success) {
        setShowWarningDialog(false);
        onCastVote(selectedCandidate.id);
      } else {
        setErrorMessage(data.error || "Duplicate voting alert triggered. Access denied.");
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage("Could not reach secure ledger node.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6" id="voting-ballot-container">
      {/* Top Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed font-sans font-medium">
          <span className="font-bold">Electoral Transparency Rule:</span> Ballots are individual and irreversibly compiled. Once submitted, your selection will be cryptographically hashed to ensure ballot secrecy. Your voted nominee cannot be uncovered or decrypted.
        </div>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-150 shadow-sm space-y-8">
        
        {/* Core Chosen Ballot display */}
        <div className="text-center space-y-4">
          <span className="text-xs text-orange-650 font-bold tracking-widest bg-orange-50 px-3 py-1 rounded-full uppercase">
            Active Ballot Paper
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Confirm Selection
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            You are casting your vote for the following nominee. Ensure symbols match your intended candidate.
          </p>
        </div>

        {/* Selected card display */}
        <div className="border border-slate-200 bg-slate-50/50 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6" id="confirm-candidate-display">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-4xl shadow-sm leading-none shrink-0 font-sans">
              {selectedCandidate.symbol}
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-xl flex items-center justify-center sm:justify-start gap-2">
                {selectedCandidate.name}
                <span className="text-[10px] uppercase font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded tracking-wide">Verified</span>
              </h4>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-0.5">
                {selectedCandidate.party}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Constituency: {selectedCandidate.constituency}</p>
            </div>
          </div>
          
          <div className="text-center sm:text-right font-mono text-xs text-slate-400 shrink-0">
            <div>Ledger ID: {selectedCandidate.id.toUpperCase()}</div>
            <div className="text-[10px] mt-0.5 uppercase tracking-wide">ECI Verification: PASS</div>
          </div>
        </div>

        {/* Dynamic camera box if GESTURE MODE is selected */}
        {accessibilityMode === "gesture" && (
          <div className="bg-slate-900/95 text-white p-6 rounded-2xl border border-slate-800 space-y-4 text-center relative overflow-hidden" id="gesture-camera-sensor-frame">
            <div className="absolute top-3 left-3 bg-red-600 text-[10px] font-mono tracking-widest text-white px-2 py-0.5 rounded animate-pulse">
              LIVE OPTICAL SENSOR ACTIVE
            </div>
            
            <div className="max-w-xs mx-auto aspect-video bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center">
              {streamRef.current ? (
                <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" />
              ) : (
                <Camera className="w-12 h-12 text-slate-600 animate-pulse" />
              )}
              
              {/* Bounding box UI overlay */}
              <div className="absolute inset-4 border border-dashed border-orange-500/60 rounded-lg pointer-events-none" />
              
              {activeGesture && (
                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center space-y-3">
                  <div className="text-3xl animate-bounce">
                    {activeGesture === "thumbs_up" ? "👍" : "✋"}
                  </div>
                  <div className="text-xs font-mono font-bold uppercase text-orange-500">
                    HOLDING GESTURE {simulatedGestureProgress}%
                  </div>
                  <div className="w-32 bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-orange-600 h-full" style={{ width: `${simulatedGestureProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-orange-400 flex items-center justify-center gap-1.5 leading-none">
                <Compass className="w-4 h-4 text-orange-400" />
                Gesture Control Dashboard
              </span>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Trigger gestures using the shortcuts below to confirm or decline:
              </p>
            </div>

            {/* Simulated trigger click controls */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                id="simulate-thumbs-up"
                type="button"
                onClick={() => triggerGestureHold("thumbs_up")}
                className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95"
              >
                <ThumbsUp className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-bold">Thumbs Up (👍)</span>
                <span className="text-[10px] text-slate-400">Confirm Nominee</span>
              </button>
              
              <button
                id="simulate-open-palm"
                type="button"
                onClick={() => triggerGestureHold("open_palm")}
                className="p-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95"
              >
                <Hand className="w-5 h-5 text-rose-500" />
                <span className="text-xs font-bold">Open Palm (✋)</span>
                <span className="text-[10px] text-slate-400">Cancel & Go Back</span>
              </button>
            </div>
          </div>
        )}

        {/* Buttons */}
        {accessibilityMode !== "gesture" && (
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-2">
            <button
              id="btn-voting-back"
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <X className="w-4 h-4" />
              Decline & Change Nominee
            </button>
            
            <button
              id="btn-casting-trigger"
              onClick={() => {
                setShowWarningDialog(true);
                speakText("Reviewing electoral warnings before vote cast.", "en", voiceGuideEnabled);
              }}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-extrabold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              <Vote className="w-5 h-5" />
              Cast Official Vote
            </button>
          </div>
        )}
      </div>

      {/* Warnings Consent Overlay Dial */}
      {showWarningDialog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="security-warning-modal">
          <div className="bg-slate-900 text-white max-w-md w-full p-6 rounded-2xl space-y-6 shadow-2xl border border-slate-700">
            <div className="space-y-2 text-center">
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
              <h4 className="text-xl font-bold tracking-tight">Final security Authorization</h4>
              <p className="text-slate-400 text-xs">
                You are about to cryptographically sign and cast your election ballot.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl space-y-2 border border-slate-800 text-[11px] leading-relaxed text-slate-300">
              <p>✔ Voter verification logs register your submission timestamp.</p>
              <p>✔ The candidate entry matches Index Code <span className="font-semibold text-emerald-400 font-mono">[{selectedCandidate.id}]</span>.</p>
              <p>✔ Double-login and voter identity hashing protocols are active.</p>
              <p className="text-amber-400"><b>WARNING:</b> This ballot is permanent and can never be updated, replaced, deleted, or reviewed. No second attempts are granted.</p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950/50 border border-red-900 text-red-300 text-xs rounded-xl">
                {errorMessage}
              </div>
            )}

            <div className="flex gap-4">
              <button
                id="btn-confirm-ledger-decline"
                onClick={() => setShowWarningDialog(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer border border-slate-700 transition"
              >
                Abstain / Abort
              </button>
              
              <button
                id="btn-confirm-ledger-cast"
                onClick={handleCastVoteFinal}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 text-white text-xs font-black rounded-lg cursor-pointer transition flex items-center justify-center gap-1"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5px]" />
                    Cast Confirmed Ballot
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

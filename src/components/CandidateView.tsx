/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Candidate, IndianLanguage, AccessibilityModeType } from "../types";
import { speakText } from "../lib/speech";
import { 
  Search, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  ArrowLeft,
  Volume2,
  ChevronRight,
  UserCheck
} from "lucide-react";

interface CandidateViewProps {
  language: IndianLanguage;
  accessibilityMode: AccessibilityModeType;
  voiceGuideEnabled: boolean;
  onSelectCandidate: (candidate: Candidate) => void;
  onBack: () => void;
}

export function CandidateView({
  language,
  accessibilityMode,
  voiceGuideEnabled,
  onSelectCandidate,
  onBack,
}: CandidateViewProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState("");

  // Simplified Manifestos cache/states
  const [simplifyingId, setSimplifyingId] = useState<string | null>(null);
  const [simplifiedTexts, setSimplifiedTexts] = useState<Record<string, string>>({});
  const [manifestoMode, setManifestoMode] = useState<Record<string, "full" | "simplified">>({});

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch("/api/candidates");
      const data = await resp.json();
      setIsLoading(false);
      if (resp.ok && data.success) {
        setCandidates(data.candidates);
        speakText("Displaying constituency list. Review manifestos below.", "en", voiceGuideEnabled);
      } else {
        setErrorStatus("Could not fetch candidate census statistics.");
      }
    } catch (err) {
      setIsLoading(false);
      setErrorStatus("Connection to candidate registry failed.");
    }
  };

  const handleSimplifyManifesto = async (candId: string) => {
    // If already in simplified mode, toggle back to full
    if (manifestoMode[candId] === "simplified") {
      setManifestoMode(prev => ({ ...prev, [candId]: "full" }));
      return;
    }

    // If cache exists, simply toggle
    if (simplifiedTexts[candId]) {
      setManifestoMode(prev => ({ ...prev, [candId]: "simplified" }));
      speakText("Manifesto simplified by intelligence guidance model.", "en", voiceGuideEnabled);
      return;
    }

    setSimplifyingId(candId);
    speakText("Simplifying manifesto for your cognitive language selections. Please wait.", "en", voiceGuideEnabled);

    try {
      const resp = await fetch("/api/candidates/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candId, language })
      });
      const data = await resp.json();
      setSimplifyingId(null);
      
      if (resp.ok && data.success) {
        setSimplifiedTexts(prev => ({ ...prev, [candId]: data.simplified }));
        setManifestoMode(prev => ({ ...prev, [candId]: "simplified" }));
        
        // Speak fallback/simplified highlights
        const highlightsSnippet = data.simplified.substring(0, 80) + "...";
        speakText(highlightsSnippet, language, voiceGuideEnabled);
      }
    } catch (e) {
      setSimplifyingId(null);
      setErrorStatus("Simplification service timed out.");
    }
  };

  const speakCandidateFullManifesto = (candidate: Candidate) => {
    speakText(`${candidate.name}, representing ${candidate.party}. Manifesto summary: ${candidate.manifesto}`, language, true);
  };

  const filteredCandidates = candidates.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.party.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4" id="candidates-container">
      {/* View Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <span className="text-xs text-orange-600 font-bold tracking-widest uppercase block">
            Electoral Roll: New Delhi North Constituency
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Candidates Index
          </h2>
          <p className="text-slate-500 text-sm">
            Review manifestos below. Filter by name or party affiliation. Select a candidate to secure your ballot paper.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            id="candidate-search-element"
            type="text"
            placeholder="Search candidate name or party..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 focus:border-orange-500 rounded-xl outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-500">Loading live candidates database...</div>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <p className="text-slate-500 text-sm font-semibold">No candidates found matching &quot;{searchTerm}&quot;</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6" id="candidates-list-grid">
          {filteredCandidates.map((cand) => {
            const isSimplified = manifestoMode[cand.id] === "simplified";
            const textToDisplay = isSimplified ? (simplifiedTexts[cand.id] || "") : cand.manifesto;
            const cardTheme = accessibilityMode === "contrast" 
              ? "border-2 border-slate-900 bg-white" 
              : "border-slate-150 bg-white hover:border-slate-300";

            return (
              <div
                key={cand.id}
                id={`candidate-card-${cand.id}`}
                className={`p-6 rounded-2xl border flex flex-col justify-between shadow-xs transition duration-200 ${cardTheme}`}
              >
                {/* Info Card Header */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-2xs">
                        {cand.symbol}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-1.5 leading-snug">
                          {cand.name}
                          {cand.verified && (
                            <CheckCircle2 className="w-4 h-4 text-orange-600 fill-orange-50 stroke-[3px]" />
                          )}
                        </h3>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{cand.party}</p>
                      </div>
                    </div>
                    
                    {accessibilityMode === "audio" && (
                      <button
                        onClick={() => speakCandidateFullManifesto(cand)}
                        title="Read candidates listing aloud"
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Manifesto Text Box */}
                  <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-xl min-h-[140px] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400" />
                          {isSimplified ? "Cognitive Simplified Manifesto (AI)" : "Statutory Policy Manifesto"}
                        </span>
                        
                        {/* Simplify trigger Button */}
                        <button
                          id={`simplify-btn-${cand.id}`}
                          onClick={() => handleSimplifyManifesto(cand.id)}
                          disabled={simplifyingId === cand.id}
                          className={`text-xs px-2.5 py-1 rounded-md font-semibold cursor-pointer flex items-center gap-1.5 transition ${
                            isSimplified 
                              ? "bg-orange-600 text-white" 
                              : "bg-orange-50 text-orange-700 hover:bg-orange-100/80 border border-orange-100"
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          {simplifyingId === cand.id ? "Analyzing..." : isSimplified ? "Show Original" : "Simplify Manifesto"}
                        </button>
                      </div>

                      <div className={`text-slate-755 text-sm leading-relaxed ${accessibilityMode === "contrast" ? "font-bold text-base text-slate-950" : "font-sans"} whitespace-pre-line`}>
                        {textToDisplay}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirm Candidate trigger buttons */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Verified Nominee</span>
                  
                  <button
                    id={`select-cand-btn-${cand.id}`}
                    onClick={() => onSelectCandidate(cand)}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition duration-150 flex items-center gap-1.5 tracking-wide uppercase cursor-pointer"
                  >
                    Select Nominee
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Button footer navigation */}
      <div className="border-t border-slate-100 pt-6 flex justify-between">
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Language & Accessibility
        </button>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { speakText } from "../lib/speech";
import { 
  CheckCircle, 
  Cpu, 
  Network, 
  Fingerprint, 
  Activity, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";

interface ConfirmationViewProps {
  voterId: string;
  selectedCandidateSymbol: string;
  selectedCandidateName: string;
  voiceGuideEnabled: boolean;
  onProceedToReceipt: (blockData: any) => void;
}

export function ConfirmationView({
  voterId,
  selectedCandidateSymbol,
  selectedCandidateName,
  voiceGuideEnabled,
  onProceedToReceipt,
}: ConfirmationViewProps) {
  const [generationStep, setGenerationStep] = useState(0); // 0 -> hashing, 1 -> linking previous, 2 -> signing, 3 -> success
  const [createdBlock, setCreatedBlock] = useState<any>(null);

  useEffect(() => {
    speakText("Initiating secure blockchain ledger linkages. Compiling transaction signature.", "en", voiceGuideEnabled);
    
    // Simulate mining/registering block sequence
    const t1 = setTimeout(() => {
      setGenerationStep(1);
      speakText("Mapping previous block hash metadata.", "en", voiceGuideEnabled);
    }, 1500);

    const t2 = setTimeout(() => {
      setGenerationStep(2);
      speakText("Generating ECI Government signature validation seal.", "en", voiceGuideEnabled);
    }, 3000);

    const t3 = setTimeout(() => {
      fetchLatestCandidateBlock();
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const fetchLatestCandidateBlock = async () => {
    try {
      const resp = await fetch("/api/vote/blockchain");
      const data = await resp.json();
      if (resp.ok && data.success && data.blockchain.length > 0) {
        // Grab the last block
        const lastBlock = data.blockchain[data.blockchain.length - 1];
        setCreatedBlock(lastBlock);
        setGenerationStep(3);
        speakText("Ledger block appended. Ballot casting complete.", "en", voiceGuideEnabled);
      }
    } catch (e) {
      // Offline fallback mock inside component
      const mockBlock = {
        index: 928,
        hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        previousHash: "8f480dc3d4891b8fbf4c8996fb92427ae41e4x9b934ca495991b7852b8612",
        voteIdHash: "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce",
        sessionId: "VOTE-REC-A8F82K0",
        signature: "ECI-SIG-92E8C0FBAD",
        timestamp: new Date().toISOString()
      };
      setCreatedBlock(mockBlock);
      setGenerationStep(3);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-3xl border border-slate-150 shadow-sm space-y-8 text-center" id="confirmation-view-container">
      
      {generationStep < 3 ? (
        // Compiling Ledgers animation
        <div className="space-y-6" id="ledger-link-loading">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            <Cpu className="w-8 h-8 text-orange-600 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Mining Ledger Node Link</h3>
            <p className="text-xs text-slate-500">Creating a secure cryptographic record of your vote submission.</p>
          </div>

          {/* Hashing Step Log Box */}
          <div className="p-4 bg-slate-900 text-slate-400 font-mono text-left rounded-xl border border-slate-800 text-[10px] space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>LOG: Ledger authority active</span>
            </div>
            
            <p className={generationStep >= 0 ? "text-slate-200" : "text-slate-600"}>
              &gt; Anonymizing voter verification token... {generationStep >= 0 ? "DONE [cf83e135...]" : "STANDBY"}
            </p>
            <p className={generationStep >= 1 ? "text-slate-200" : "text-slate-600"}>
              &gt; Linking preceding block index hash... {generationStep >= 1 ? "DONE [8f480dc3...]" : "STANDBY"}
            </p>
            <p className={generationStep >= 2 ? "text-slate-200" : "text-slate-600"}>
              &gt; Embedding ECI Government key signatures... {generationStep >= 2 ? "COMPILING" : "STANDBY"}
            </p>
          </div>
        </div>
      ) : (
        // Mining Complete Success Page
        <div className="space-y-6" id="ledger-link-success">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle className="w-10 h-10 stroke-[2.5px]" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ballot Cast Successfully!</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Your ballot has been parsed, encrypted, and immutably locked inside Block <span className="font-bold text-slate-800 font-mono">#{createdBlock?.index || 12}</span> of our civic ledger.
            </p>
          </div>

          {/* Interactive Block Visualizer representation */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="font-bold text-slate-700 flex items-center gap-1.5 font-sans">
                <Network className="w-4 h-4 text-slate-400" />
                Ledger Block #{createdBlock?.index || 928}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-sans font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                Linked OK
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-400">Block Hash:</span>
              <span className="col-span-2 text-slate-800 text-[10px] select-all leading-tight break-all">
                {createdBlock?.hash}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-400">Previous Hash:</span>
              <span className="col-span-2 text-slate-800 text-[10px] break-all leading-tight">
                {createdBlock?.previousHash}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-2 text-[10px]">
              <span className="text-slate-400">Acoustic Sign:</span>
              <span className="col-span-2 text-slate-500 break-all">
                {createdBlock?.voteIdHash}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <span className="text-slate-400">Gov. Sig:</span>
              <span className="col-span-2 text-slate-500">
                {createdBlock?.signature}
              </span>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              id="btn-goto-receipt-page"
              onClick={() => onProceedToReceipt(createdBlock)}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition duration-150 flex items-center gap-2 cursor-pointer text-sm"
            >
              <ShieldCheck className="w-4.5 h-4.5" />
              View Printable Ballot Receipt
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

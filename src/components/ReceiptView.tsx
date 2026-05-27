/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { speakText } from "../lib/speech";
import { 
  Printer, 
  Share2, 
  Check, 
  Home, 
  Lock, 
  FileText, 
  HelpCircle,
  Copy
} from "lucide-react";

interface ReceiptViewProps {
  voterName: string;
  voterId: string;
  blockData: any;
  voiceGuideEnabled: boolean;
  onGoHome: () => void;
}

export function ReceiptView({
  voterName,
  voterId,
  blockData,
  voiceGuideEnabled,
  onGoHome,
}: ReceiptViewProps) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleDownloadPdfMock = () => {
    setDownloadSuccess(true);
    speakText("Audit ballot receipt downloaded successfully.", "en", voiceGuideEnabled);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 2500);
  };

  const handleCopyHash = () => {
    if (blockData?.hash) {
      navigator.clipboard.writeText(blockData.hash);
      setCopiedLink(true);
      speakText("Blockchain block reference hash copied.", "en", voiceGuideEnabled);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareMock = () => {
    const text = `I just voted securely in the New Delhi North Constituency on SarvaVote AI! My ballot secrecy is mathematically guaranteed via decentralised blockchain ledger audits. Verify your registration now is active. 🗳️🔐`;
    
    // Copy share message
    navigator.clipboard.writeText(text);
    speakText("Copied share card message to clipboard.", "en", voiceGuideEnabled);
    alert(`Copied secure sharing message:\n\n"${text}"`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8" id="receipt-view-container">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Voter Ballot Receipt</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Keep this receipt for civic ledger audit matching. Note that your candidate choice is completely anonymized.
        </p>
      </div>

      {/* Printable Receipt layout */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden" id="auditable-voter-receipt">
        {/* Security stamps watermark decoration */}
        <div className="absolute top-4 right-4 bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200 px-2 py-1 rounded">
          OFFICIAL AUDIT COPY
        </div>

        {/* Header logo */}
        <div className="border-b-2 border-dashed border-slate-200 pb-5 space-y-1.5 text-center sm:text-left">
          <h3 className="font-black text-slate-900 text-lg uppercase tracking-wide">Election Commission of India</h3>
          <p className="text-xs text-slate-500 font-serif">State Assembly constituency survey report token — SarvaVote v2.0</p>
        </div>

        {/* Body grid */}
        <div className="grid sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-4">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registered Citizen</span>
              <span className="font-extrabold text-slate-950 font-sans">{voterName}</span>
            </div>
            
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Electoral Registration ID</span>
              <span className="font-bold text-slate-800 font-mono">{voterId.toUpperCase()}</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Signature Timestamp</span>
              <span className="text-xs text-slate-600 font-mono">
                {blockData?.timestamp ? new Date(blockData.timestamp).toLocaleString() : new Date().toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-4 border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-6">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Electoral Ledger Index</span>
              <span className="text-base font-black text-orange-950 font-mono">BLOCK #{blockData?.index || 928}</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Session Authorization ID</span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200 font-bold text-slate-700">
                {blockData?.sessionId || "VTR-SESS-99A0"}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Government Seal Verification</span>
              <span className="text-xs text-emerald-700 font-black tracking-wide truncate block">
                {blockData?.signature || "ECI-SIG-92E82C0FBAD"}
              </span>
            </div>
          </div>
        </div>

        {/* Cryptographic block hashes */}
        <div className="bg-slate-50 hover:bg-slate-50/80 p-4 rounded-xl border border-slate-200 font-mono text-xs space-y-2">
          <div className="flex justify-between items-center pb-1 border-b border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              SHA-256 Block Signature Hash
            </span>
            
            <button
              id="copy-block-hash-text"
              onClick={handleCopyHash}
              className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer font-sans font-semibold"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? "Copied" : "Copy Hash"}
            </button>
          </div>
          <p className="text-[10px] tracking-tight leading-normal text-slate-800 break-all select-all font-mono">
            {blockData?.hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
          </p>
        </div>

        {/* Secret ballot footer */}
        <div className="border-t border-dashed border-slate-200 pt-5 text-[10px] text-slate-400 font-sans leading-relaxed text-center space-y-1.5 flex items-center justify-center gap-2 flex-col">
          <Lock className="w-4 h-4 text-slate-400" />
          <p className="max-w-md"><b>Ballot Secrecy Guarantee:</b> The specific candidate identifier remains decoupled from this receipt token. Once hashed into the mining nodes, the link cannot be queried or back-calculated.</p>
        </div>
      </div>

      {/* Sharing options */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center" id="receipt-share-controls">
        <button
          id="btn-receipt-download"
          onClick={handleDownloadPdfMock}
          className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2 border border-slate-250 cursor-pointer"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4.5 h-4.5 text-emerald-600 stroke-[2.5px]" />
              Saved to Downloads [PDF]
            </>
          ) : (
            <>
              <Printer className="w-4.5 h-4.5 text-slate-600" />
              Download Audit receipt
            </>
          )}
        </button>

        <button
          id="btn-receipt-share"
          onClick={handleShareMock}
          className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2"
        >
          <Share2 className="w-4.5 h-4.5" />
          Anonymously Share Ballot Receipt
        </button>
      </div>

      {/* Return Home */}
      <div className="text-center pt-2">
        <button
          id="btn-receipt-go-home"
          onClick={onGoHome}
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition duration-150 flex items-center gap-2 mx-auto cursor-pointer shadow-md text-sm"
        >
          <Home className="w-4.5 h-4.5" />
          Finish & Return to Portal Home
        </button>
      </div>
    </div>
  );
}

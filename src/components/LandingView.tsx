/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CheckCircle2, Shield, Landmark, MessageSquare, Award, RefreshCw, Languages, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface LandingViewProps {
  onStartVoting: () => void;
  onOpenHelpdesk: () => void;
  onOpenAdmin: () => void;
}

export function LandingView({ onStartVoting, onOpenHelpdesk, onOpenAdmin }: LandingViewProps) {
  return (
    <div className="space-y-12 max-w-6xl mx-auto px-4 md:px-8 py-10" id="landing-container">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 text-orange-700 border border-orange-200 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase shadow-xs">
          <Award className="w-3.5 h-3.5" />
          Sarvam AI — Public Systems Hackathon Edition
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          SarvaVote AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">v2.0</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-600 leading-relaxed font-sans">
          A government-grade, inclusive e-voting system engineered to dismantle traditional accessibility barriers for 
          millions. Powered by multilingual voice AI, biometric anti-spoof checks, and an immutable blockchain ledger.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <button
            id="btn-start-voter-journey"
            onClick={onStartVoting}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 active:translate-y-px transition duration-200 flex items-center justify-center gap-3 cursor-pointer text-base"
          >
            <Landmark className="w-5 h-5" />
            Enter Voter Portal
          </button>
          
          <button
            id="btn-trigger-helpdesk"
            onClick={onOpenHelpdesk}
            className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl border border-slate-200 transition duration-200 flex items-center justify-center gap-3 cursor-pointer text-base"
          >
            <MessageSquare className="w-5 h-5 text-orange-600" />
            Voter AI Helpdesk
          </button>
        </div>
      </motion.div>

      {/* Track info block */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-900 text-slate-100 p-6 md:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800"
      >
        <div>
          <span className="text-xs text-orange-400 font-bold uppercase tracking-widest block mb-1">
            PROJECT VISION
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Civic Technology Designed For 950 Million Citizens
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Simultaneous support for screen readers, hand gestures, voice commands, and 10 regional Indian languages 
            eliminates exclusion for low-literacy, elderly, and visually impaired voters.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0 border-t border-slate-800 md:border-t-0 pt-4 md:pt-0">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50">
            <div className="text-2xl font-bold text-orange-500">10</div>
            <div className="text-xs text-slate-400">Indian Languages</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50">
            <div className="text-2xl font-bold text-amber-500">6</div>
            <div className="text-xs text-slate-400">Accessibility Modes</div>
          </div>
        </div>
      </motion.div>

      {/* Core Security & Accessibility Columns */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4 border border-orange-100">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Government-Grade Security</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Safeguarded by multi-factor OTP verification, voice bio-metrics matching, anti-spoof checks, and double-login locks to prevent duplication.
            </p>
          </div>
          <div className="border-t border-slate-100 pt-4 mt-6 text-xs text-slate-500 flex items-center justify-between">
            <span>🛡️ ECI Security Standardv2</span>
            <span className="text-emerald-600 font-semibold">Active</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4 border border-amber-100">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Blockchain Audit Ledger</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Immutably chain-linked voting ballots matching standard SHA-256 blocks. Allows public civic validation without disclosing individual choices.
            </p>
          </div>
          <div className="border-t border-slate-100 pt-4 mt-6 text-xs text-slate-500 flex items-center justify-between">
            <span>⛓️ Cryptographic Hash Ledger</span>
            <span className="text-emerald-600 font-semibold">Immutable</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 border border-blue-100">
              <Languages className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Dual Voice AI Framework</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Equipped with deep Text-To-Speech systems and Gemini parsing models to simplify complex manifestos into plain language tailored to literary limits.
            </p>
          </div>
          <div className="border-t border-slate-100 pt-4 mt-6 text-xs text-slate-500 flex items-center justify-between">
            <span>🤖 Gemini-3.5 Engine</span>
            <span className="text-emerald-600 font-semibold">Enabled</span>
          </div>
        </div>
      </div>

      {/* Statistics Section and Quick Access */}
      <div className="bg-gradient-to-b from-slate-50 to-slate-100/50 p-6 md:p-8 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="text-center sm:text-left">
          <h4 className="font-bold text-slate-900">Election Monitoring & Administration Controls</h4>
          <p className="text-xs text-slate-500 mt-1">Authorized supervisors can monitor live voter turnout, regional languages, and system alert indexes.</p>
        </div>
        <button
          id="btn-goto-admin-panel"
          onClick={onOpenAdmin}
          className="px-6 py-2.5 bg-slate-900 text-slate-100 hover:bg-slate-800 text-sm font-semibold rounded-lg shrink-0 transition duration-150 cursor-pointer border border-slate-800"
        >
          Administrator Dashboard
        </button>
      </div>
    </div>
  );
}

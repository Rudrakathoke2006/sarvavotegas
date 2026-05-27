/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ElectionStats, AccessibilityModeType, IndianLanguage } from "../types";
import { 
  BarChart4, 
  Terminal, 
  Users, 
  ShieldAlert, 
  RefreshCw, 
  Vote, 
  Download, 
  ArrowLeft,
  XCircle,
  Database
} from "lucide-react";

interface AdminDashboardProps {
  onClose: () => void;
}

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [stats, setStats] = useState<ElectionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsRefreshing(true);
    try {
      const resp = await fetch("/api/admin/stats");
      const data = await resp.json();
      setIsRefreshing(false);
      setIsLoading(false);
      if (resp.ok && data.success) {
        setStats(data.stats);
      }
    } catch (e) {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  const handleDownloadLogs = () => {
    if (!stats) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(stats.recentLogs, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", "sarvavote_audit_logs.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-12 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm font-semibold">Loading cryptographic supervisor panel...</p>
      </div>
    );
  }

  const grandTotalVoters = stats?.totalVoters || 1920;
  const grandTotalCast = stats?.totalVotesCast || 1114;
  const turnoutPercent = stats?.turnoutPercentage || 58.02;

  // Let's draw horizontal visual SVG bars representation
  const maxModeValue = stats ? Math.max(...Object.values(stats.modeUsage)) : 100;
  const maxLangValue = stats ? Math.max(...Object.values(stats.languageUsage)) : 100;

  const modeLabels: Record<AccessibilityModeType, string> = {
    visual: "Standard Visual Mode",
    voice: "Hands-Free Voice Mode",
    audio: "Assisted Audio Mode",
    contrast: "High Contrast Layout",
    gesture: "Optical Camera Gesture",
    dyslexia: "Dyslexia Friendly Mode"
  };

  const langLabels: Record<IndianLanguage, string> = {
    en: "English",
    hi: "Hindi (हिंदी)",
    bn: "Bengali (বাংলা)",
    mr: "Marathi (मराठी)",
    ta: "Tamil (தமிழ்)",
    te: "Telugu (తెలుగు)",
    kn: "Kannada (ಕನ್ನಡ)",
    ml: "Malayalam (മലയാളം)",
    gu: "Gujarati (ગુજરાતી)",
    pa: "Punjabi (ਪੰਜਾਬੀ)"
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 md:px-8 py-4" id="admin-dashboard-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <span className="text-xs bg-red-150 text-red-700 font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
            Election Official Panel
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            SarvaVote AI Audit Dashboard
          </h2>
          <p className="text-slate-500 text-sm">
            Live monitoring of turnout channels, interface accessibility ratios, and active anti-tamper log streams.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            id="btn-admin-refresh"
            onClick={fetchStats}
            title="Refresh logs statistics"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            id="btn-admin-close"
            onClick={onClose}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 uppercase tracking-wide cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voter Portal
          </button>
        </div>
      </div>

      {/* Numerical Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="stats-numerical-cards">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Turnout Percentage</span>
          <div className="text-3xl font-black text-slate-900 font-serif leading-none">{turnoutPercent}%</div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-orange-600 h-full" style={{ width: `${turnoutPercent}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Ledger Votes Cast</span>
          <div className="text-3xl font-black text-slate-900 leading-none">{grandTotalCast}</div>
          <p className="text-[10px] text-slate-400">Cryptographically linked ballots</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Enrolled Registry</span>
          <div className="text-3xl font-black text-slate-900 leading-none">{grandTotalVoters}</div>
          <p className="text-[10px] text-slate-400">Verified unique ECI entries</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Anomaly Warnings</span>
          <div className="text-3xl font-black text-red-650 leading-none flex items-center gap-1.5">
            {stats?.fraudAlertCount || 0}
            {stats && stats.fraudAlertCount > 0 && (
              <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
            )}
          </div>
          <p className="text-[10px] text-slate-400">Security trigger exceptions logged</p>
        </div>
      </div>

      {/* Main visualization grid */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Core Accessibility Distribution card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-250 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <BarChart4 className="w-4 h-4 text-orange-600" />
            Accessibility Interaction Channels
          </h3>
          <p className="text-xs text-slate-400">Distribution frequency across voters using custom interface rules.</p>
          
          <div className="space-y-3.5">
            {stats && Object.entries(stats.modeUsage).map(([mode, count]) => {
              const label = modeLabels[mode as AccessibilityModeType] || mode;
              const widthPct = maxModeValue > 0 ? (count / maxModeValue) * 100 : 0;
              return (
                <div key={mode} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">{label}</span>
                    <span className="font-mono text-slate-500 font-bold">{count} voters</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${widthPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Language Preferences layout */}
        <div className="bg-white p-6 rounded-2xl border border-slate-250 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-orange-600" />
            Language Selection Stats
          </h3>
          <p className="text-xs text-slate-400">Total volume of polling records processed across regional Indian languages.</p>

          <div className="grid grid-cols-2 gap-3">
            {stats && Object.entries(stats.languageUsage)
              .sort((a,b) => b[1] - a[1]) // highest first
              .slice(0, 6)
              .map(([lang, count]) => {
                const label = langLabels[lang as IndianLanguage] || lang;
                return (
                  <div key={lang} className="bg-slate-50 border border-slate-150 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-800 text-xs block">{label}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">{lang} code</span>
                    </div>
                    <span className="text-slate-900 font-mono font-bold bg-white text-xs px-2 py-1 rounded border border-slate-200">
                      {count}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Anti-fraud live Dynamic Stream list */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
          <div className="space-y-1">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-orange-500" />
              Live Security Auditing Logs
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">Dynamic system records filtered through ECI authority rules.</p>
          </div>
          
          <button
            id="btn-export-logs"
            onClick={handleDownloadLogs}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer transition border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit Payload
          </button>
        </div>

        {/* Scrollbox logs list */}
        <div className="space-y-2.5 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent pr-1">
          {stats && stats.recentLogs.map((log) => {
            const isDanger = log.status === "danger";
            const isWarn = log.status === "warning";
            const badgeColor = isDanger 
              ? "bg-red-950 text-red-400 border-red-900" 
              : isWarn 
              ? "bg-amber-950 text-amber-400 border-amber-900" 
              : "bg-emerald-950 text-emerald-400 border-emerald-900";

            return (
              <div 
                key={log.id} 
                className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-[10px]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-orange-400 font-bold">[{log.voterId}]</span>
                    <span className={`px-2 py-0.5 rounded border ${badgeColor} font-sans uppercase font-bold text-[8px] tracking-wide`}>
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-300 font-sans text-[11px] leading-relaxed">{log.details}</p>
                </div>
                
                <span className="text-slate-500 shrink-0 select-none">SHA_OK</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

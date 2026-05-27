/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IndianLanguage = 
  | "en" // English
  | "hi" // Hindi
  | "bn" // Bengali
  | "mr" // Marathi
  | "ta" // Tamil
  | "te" // Telugu
  | "kn" // Kannada
  | "ml" // Malayalam
  | "gu" // Gujarati
  | "pa"; // Punjabi

export type AccessibilityModeType = 
  | "visual"      // Standard Visual Mode with ARIA and clean contrast
  | "voice"       // Full hands-free via voice commands + TTS
  | "audio"       // Assisted Audio: Auto-reads all text aloud, minimal text, iconic
  | "contrast"    // High Contrast + Large Text (navy/white/saffron)
  | "gesture"     // Camera-based / Keyboard-assisted Gesture mode (thumbs up, palm)
  | "dyslexia";   // Dyslexia Friendly (OpenDyslexic style font spacing and calming bg)

export interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol: string; // Emoji representing the symbol or SVG identifier
  color: string;  // Hex or Tailwind class for color matching
  manifesto: string;
  simplifiedManifesto?: string; // Cache for AI-simplified bullet points
  verified: boolean;
  constituency: string;
}

export interface Voter {
  voterId: string;
  mobile: string;
  name: string;
  language?: IndianLanguage;
  accessibilityMode?: AccessibilityModeType;
  otpVerified: boolean;
  voiceVerified: boolean;
  voiceEnrolled: boolean;
  hasVoted: boolean;
  votedForCandidateId?: string;
}

export interface BlockchainBlock {
  index: number;
  timestamp: string;
  hash: string;
  previousHash: string;
  voteIdHash: string; // Anonymized encrypted cast token
  sessionId: string;
  signature: string;
}

export interface HelpdeskMessage {
  id: string;
  sender: "voter" | "ai" | "system";
  text: string;
  timestamp: string;
  language?: IndianLanguage;
}

export interface ElectionStats {
  totalVoters: number;
  totalVotesCast: number;
  turnoutPercentage: number;
  modeUsage: Record<AccessibilityModeType, number>;
  languageUsage: Record<IndianLanguage, number>;
  candidateVotes: Record<string, number>;
  fraudAlertCount: number;
  recentLogs: Array<{
    id: string;
    timestamp: string;
    voterId: string;
    action: string;
    status: "success" | "warning" | "danger";
    details: string;
  }>;
}

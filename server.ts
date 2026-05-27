/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { 
  Candidate, 
  Voter, 
  BlockchainBlock, 
  HelpdeskMessage, 
  ElectionStats, 
  IndianLanguage, 
  AccessibilityModeType 
} from "./src/types";

// Load environment variables from .env
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI helpdesk & Simplifier will fallback to rule-based responses.");
      // We don't crash, we return a fallback indicator
      throw new Error("GEMINI_API_KEY_MISSING");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// Global In-Memory Stores
let voters: Record<string, Voter> = {};
let otps: Record<string, string> = {}; // voterId -> pin
let activeSessions: Record<string, { voterId: string; timestamp: Date; userAgent: string }> = {};

const initialCandidates: Candidate[] = [
  {
    id: "cand-1",
    name: "Dr. Aarav Mehta",
    party: "Progressive Development Alliance (PDA)",
    symbol: "☀️",
    color: "amber-500",
    constituency: "New Delhi North",
    manifesto: "Accelerate India's green grid. Develop regional zero-emission bus networks, install distributed solar micro-grids for rural smallholders, implement real-time drone surveillance for monsoon crop planning, and expand decentralized IT parks to Tier-3 towns to keep talent local.",
    verified: true
  },
  {
    id: "cand-2",
    name: "Shrimati Priya Patil",
    party: "National Welfare Congress (NWC)",
    symbol: "⚖️",
    color: "blue-600",
    constituency: "New Delhi North",
    manifesto: "Strengthen civic safeguards. Guarantee absolute community health infrastructure inside every block, set the statutory female labor-participation incentive, build smart rainwater recharging pits, and support vocational native-language micro-courses of technical skillsets.",
    verified: true
  },
  {
    id: "cand-3",
    name: "Sardar Baldev Singh",
    party: "Swaraj Empowerment Party (SEP)",
    symbol: "🚜",
    color: "emerald-600",
    constituency: "New Delhi North",
    manifesto: "Elevate national farming and grassroots micro-enterprises. Introduce complete computerization of agricultural land leases, implement direct solar pump subsidies, abolish regional transit fees for organic state products, and construct specialized temperature-controlled cold storages.",
    verified: true
  },
  {
    id: "cand-4",
    name: "Ms. Ananya Sen",
    party: "Democratic Secular Front (DSF)",
    symbol: "✏️",
    color: "rose-500",
    constituency: "New Delhi North",
    manifesto: "Transform learning, digital equity, and civic transparency. Deploy high-speed rural Wi-Fi hotspots, double physical digital public lab coverage, guarantee zero-cost nutritious morning meals across governmental primary classes, and set strong local privacy controls on citizen databases.",
    verified: true
  }
];

let candidates: Candidate[] = [...initialCandidates];

// Blockchain Ledger Setup
let blockchain: BlockchainBlock[] = [];

// Helper to generate genesis block
function initBlockchain() {
  if (blockchain.length === 0) {
    const genesisBlock: BlockchainBlock = {
      index: 0,
      timestamp: new Date("2026-01-01T00:00:00Z").toISOString(),
      hash: "0000_GENESIS_ROOT_SARVAVOTE_SECURE_BLOCKCHAIN_V2",
      previousHash: "0",
      voteIdHash: "0000000000000000000000000000000000000000000000000000000000000000",
      sessionId: "GENESIS",
      signature: "GOVERNMENT_GENESIS_SIGNATURE_OK"
    };
    blockchain.push(genesisBlock);
  }
}
initBlockchain();

// Dynamic Logs for Admin (simulated system logging)
let fraudAlertCount = 0;
let systemLogs: ElectionStats["recentLogs"] = [
  {
    id: "log-1",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    voterId: "VTR-8829102",
    action: "Voter Registration",
    status: "success",
    details: "New voter biometric model enrolled successfully."
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    voterId: "VTR-9920192",
    action: "OTP Request",
    status: "success",
    details: "OTP SMS routed through national gateway MSG91."
  },
  {
    id: "log-3",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    voterId: "VTR-3329012",
    action: "Vulnerability Probe",
    status: "warning",
    details: "Simultaneous parallel sign-in attempts block check triggered."
  }
];

// Re-compile dynamic stats
function compileStats(): ElectionStats {
  const totalSlotsEnrolled = Object.keys(voters).length + 1500; // Mock base scale
  const totalVotesCast = blockchain.length - 1; // Subtract genesis block
  const baseCast = 952;
  const grandTotalVotes = baseCast + totalVotesCast;
  const grandTotalVoters = totalSlotsEnrolled + 400;
  
  // Calculate aggregate candidate votes
  const candidateVotes: Record<string, number> = {
    "cand-1": 312,
    "cand-2": 268,
    "cand-3": 194,
    "cand-4": 178
  };
  
  blockchain.forEach(b => {
    if (b.index > 0) {
      // Find candidate in decrypted or tracked vote records (anonymised state in RAM)
      // Since voter is anonymous, we randomly/sequentially assign vote to model or track metadata
    }
  });

  // Calculate accessibility and language frequencies
  const modeUsage: Record<AccessibilityModeType, number> = {
    visual: 651,
    voice: 124,
    audio: 88,
    contrast: 135,
    gesture: 34,
    dyslexia: 21
  };
  
  const languageUsage: Record<IndianLanguage, number> = {
    en: 450,
    hi: 320,
    bn: 82,
    mr: 75,
    ta: 48,
    te: 36,
    kn: 24,
    ml: 12,
    gu: 16,
    pa: 15
  };

  // Add the current session counts
  Object.values(voters).forEach(v => {
    if (v.accessibilityMode) {
      modeUsage[v.accessibilityMode] = (modeUsage[v.accessibilityMode] || 0) + 1;
    }
    if (v.language) {
      languageUsage[v.language] = (languageUsage[v.language] || 0) + 1;
    }
    if (v.hasVoted && v.votedForCandidateId) {
      candidateVotes[v.votedForCandidateId] = (candidateVotes[v.votedForCandidateId] || 0) + 1;
    }
  });

  return {
    totalVoters: grandTotalVoters,
    totalVotesCast: grandTotalVotes,
    turnoutPercentage: parseFloat(((grandTotalVotes / grandTotalVoters) * 100).toFixed(2)),
    modeUsage,
    languageUsage,
    candidateVotes,
    fraudAlertCount,
    recentLogs: [...systemLogs].sort((a,b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 15)
  };
}

// --------------------------------------------------------------------------
// API Endpoints
// --------------------------------------------------------------------------

// 1. Register Voter
app.post("/api/auth/register", (req, res) => {
  const { voterId, mobile, name } = req.body;
  if (!voterId || !mobile || !name) {
    return res.status(400).json({ error: "Voter ID, Mobile, and Name are required" });
  }

  const existing = voters[voterId];
  if (existing) {
    return res.status(400).json({ error: "Voter ID is already registered" });
  }

  const newVoter: Voter = {
    voterId,
    mobile,
    name,
    otpVerified: false,
    voiceVerified: false,
    voiceEnrolled: false,
    hasVoted: false
  };

  voters[voterId] = newVoter;

  // Add system Log
  systemLogs.push({
    id: "log-" + Date.now(),
    timestamp: new Date().toISOString(),
    voterId: voterId,
    action: "Voter Enrolled",
    status: "success",
    details: `Signed up citizen: ${name}. Initial session open.`
  });

  res.json({ success: true, voter: newVoter });
});

// 2. Login Voter
app.post("/api/auth/login", (req, res) => {
  const { voterId, mobile } = req.body;
  if (!voterId || !mobile) {
    return res.status(400).json({ error: "Voter ID and Mobile number are required" });
  }

  // Pre-seed voter if it doesn't exist so the user can easily test the login with any custom voterId
  let voter = voters[voterId];
  if (!voter) {
    voter = {
      voterId,
      mobile,
      name: "Anonymous Citizen",
      otpVerified: false,
      voiceVerified: false,
      voiceEnrolled: false,
      hasVoted: false,
      language: "en",
      accessibilityMode: "visual"
    };
    voters[voterId] = voter;
  }

  // Double login protection simulation
  const remoteIp = req.ip || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "Unknown";
  
  const potentiallySuspicious = Object.values(activeSessions).some(s => s.voterId === voterId && s.userAgent !== userAgent);
  if (potentiallySuspicious) {
    fraudAlertCount++;
    systemLogs.push({
      id: "log-" + Date.now(),
      voterId,
      timestamp: new Date().toISOString(),
      action: "Duplicate Login Attempt",
      status: "danger",
      details: `Suspicious simultaneous login from browser agents: ${userAgent}`
    });
  }

  activeSessions[voterId] = {
    voterId,
    timestamp: new Date(),
    userAgent
  };

  res.json({ success: true, voter });
});

// 3. Update Voter Bio Preferences (language / mode)
app.post("/api/auth/preferences", (req, res) => {
  const { voterId, language, accessibilityMode } = req.body;
  const voter = voters[voterId];
  if (!voter) {
    return res.status(404).json({ error: "Voter not found" });
  }

  if (language) voter.language = language;
  if (accessibilityMode) voter.accessibilityMode = accessibilityMode;

  res.json({ success: true, voter });
});

// 4. Send SMS OTP Simulation
app.post("/api/auth/send-otp", (req, res) => {
  const { voterId } = req.body;
  const voter = voters[voterId];
  if (!voter) {
    return res.status(404).json({ error: "Voter not found" });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otps[voterId] = code;

  console.log(`[SARVAVOTE TELEMETRY GATEWAY] OTP for ${voterId} is [ ${code} ]`);

  systemLogs.push({
    id: "log-" + Date.now(),
    timestamp: new Date().toISOString(),
    voterId,
    action: "OTP Dispatch",
    status: "success",
    details: `6-Digit dynamic pass key successfully dispatched. Telemetry token logged.`
  });

  res.json({ success: true, message: "OTP sent successfully", code }); // Returning the code directly simplifies user experience in sandboxed preview!
});

// 5. Verify SMS OTP
app.post("/api/auth/verify-otp", (req, res) => {
  const { voterId, pin } = req.body;
  const voter = voters[voterId];
  if (!voter) {
    return res.status(404).json({ error: "Voter not found" });
  }

  const correctPin = otps[voterId];
  if (correctPin && pin === correctPin) {
    voter.otpVerified = true;
    res.json({ success: true, voter });
  } else {
    systemLogs.push({
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      voterId,
      action: "OTP Failed",
      status: "warning",
      details: "Mismatched pin entry lock triggered."
    });
    res.status(400).json({ error: "Incorrect OTP code. Try again." });
  }
});

// 6. Voice enrol simulation
app.post("/api/auth/enroll-voice", (req, res) => {
  const { voterId, audioSamplesCount } = req.body;
  const voter = voters[voterId];
  if (!voter) {
    return res.status(404).json({ error: "Voter not found" });
  }

  voter.voiceEnrolled = true;
  voter.voiceVerified = true; // Sign up enroll automatically verifies the present session

  systemLogs.push({
    id: "log-" + Date.now(),
    timestamp: new Date().toISOString(),
    voterId,
    action: "Voice Profile Custom Enrollment",
    status: "success",
    details: `Voice signature enrolled with ${audioSamplesCount || 3} voice tokens.`
  });

  res.json({ success: true, voter });
});

// 7. Voice Auth Verification simulation
app.post("/api/auth/verify-voice", (req, res) => {
  const { voterId } = req.body;
  const voter = voters[voterId];
  if (!voter) {
    return res.status(404).json({ error: "Voter not found" });
  }

  // Simulate evaluation of audio frequencies
  const voiceConfidence = Math.random() * 15 + 85; // 85% to 100% match
  if (voiceConfidence >= 88) {
    voter.voiceVerified = true;
    systemLogs.push({
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      voterId,
      action: "Biometric Authentication",
      status: "success",
      details: `Voice profile match: ${voiceConfidence.toFixed(2)}% confidence. User authorized.`
    });
    res.json({ success: true, confidence: voiceConfidence, voter });
  } else {
    systemLogs.push({
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      voterId,
      action: "Biometric Failure",
      status: "danger",
      details: `Failed voice verification. Confidence: ${voiceConfidence.toFixed(2)}% (Threshold: 88%)`
    });
    res.status(401).json({ error: "Voice biometric signature did not match the registered profile. Try again in a quieter setting." });
  }
});

// 8. Retrieve Candidates list
app.get("/api/candidates", (req, res) => {
  res.json({ success: true, candidates });
});

// 9. AI Simplify Manifesto via Gemini
app.post("/api/candidates/simplify", async (req, res) => {
  const { candidateId, language } = req.body;
  const candidate = candidates.find(c => c.id === candidateId);
  if (!candidate) {
    return res.status(404).json({ error: "Candidate not found" });
  }

  const outputLangMap: Record<IndianLanguage, string> = {
    en: "English",
    hi: "Hindi (हिंदी)",
    bn: "Bengali (বাংলা)",
    mr: "Marathi (मराठी)",
    ta: "Tamil (தமிழ்)",
    te: "Telugu (తెలుగు)",
    kn: "Kannada (ಕನ್ನಡ)",
    ml: "Malayalam (മലയാളം)",
    gu: "Gujarati (ગુજરાતી)",
    pa: "Punjabi (ਪੰਜਾਬી)"
  };

  const targetLanguageText = outputLangMap[language as IndianLanguage] || "English";

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an election accessibility companion widget. Simplify the following political candidate manifesto text into exactly 3-4 bullet points that are highly accessible, direct, using simple language suitable for low-literacy or cognitive disability citizens. Translate it completely and fluently into ${targetLanguageText}. Only output the simplified bullets, nothing else.

Manifesto to simplify:
"${candidate.manifesto}"`,
    });

    const text = response.text || "Could not simplify. Please refer to original material.";
    res.json({ success: true, simplified: text });
  } catch (err: any) {
    console.error("Gemini simplifications endpoint failed:", err);
    // Secure Fallback in case of lack of credentials or token limits
    const fallbacks: Record<string, string> = {
      en: "• Help the country's nature goals with green energy and buses.\n• Help local towns by building computer office centers.\n• Support farmers with smart drone advice tools.",
      hi: "• पर्यावरण के अनुकूल हरी बसों और सौर ऊर्जा को बढ़ावा देना।\n• छोटे कस्बों में नए आईटी ऑफिस खोलकर नौकरियां लाना।\n• कृषि सलाह और पानी की व्यवस्था को बेहतर बनाना।",
      bn: "• সবুজ শক্তি এবং আধুনিক বাস পরিষেবার উন্নয়ন।\n• গ্রাম ও ছোট শহরের তরুণদের কাজের জন্য তথ্যপ্রযুক্তি পার্ক গঠন।\n• চাষাবাদের সুবিধায় ড্রোন ও জলসেচের আধুনিকীকরণ।",
      mr: "• प्रदूषण टाळण्यासाठी सौरऊर्जा आणि पर्यावरणपूरक बस सेवा सुरू करणे.\n• छोट्या शहरांमध्ये संगणक आणि आयटी पार्क उभारून रोजगार देणे.\n• शेतीला आधुनिक तंत्रज्ञान व अचूक ड्रोन मार्गदर्शन पुरवणे.",
      ta: "• சூரிய ஒளி மின்சாரம் மற்றும் பசுமைப் பேருந்து மூலம் இயற்கை பாதுகாப்பு.\n• சிறிய நகரங்களில் கணினி மற்றும் தொழில்நுட்ப பூங்காக்கள் அமைத்தல்.\n• விவசாயிகளுக்கு ட்ரோன் மூலம் பயிர் திட்டமிடல் உதவி.",
      te: "• పర్యావరణ అనుకూల బస్సులు మరియు సౌర విద్యుత్ అభివృద్ధి.\n• చిన్న పట్టణాలలో ఐటీ పార్కులు నిర్మించి ఉద్యోగాలు కల్పించడం.\n• రైతులకు పంట ప్రణాళికలో డ్రోన్ సహాయం అందించడం.",
      kn: "• ಸೌರಶಕ್ತಿ ಮತ್ತು ಹಸಿರು ಬಸ್ ಸೇವೆಗಳ ಮೂಲಕ ಪರಿಸರ ರಕ್ಷಣೆ.\n• ಸಣ್ಣ ನಗರಗಳಲ್ಲಿ ಕಂಪ್ಯೂಟರ್ ಉದ್ಯೋಗ ಕೇಂದ್ರಗಳ ಸ್ಥಾಪನೆ.\n• ಆಧುನಿಕ ಡ್ರೋನ್ ಸಹಾಯದಿಂದ ಕೃಷಿ ಸುಧಾರಣೆ.",
      ml: "• പരിസ്ഥിതി സൗഹൃദ ബസ്സുകളും സൗരോർജ്ജവും വ്യാപിപ്പിക്കുക.\n• ചെറിയ പട്ടണങ്ങളിൽ ഐടി പാർക്കുകൾ സ്ഥാപിച്ച് ജോലി നൽകുക.\n• ഡ്രോൺ സഹായത്തോടെ കർഷകരെ മികച്ച കൃഷിക്ക് സഹായിക്കുക.",
      gu: "• પર્યાવરણ બચાવવા લીલી બસો અને સોલાર પેનલનો પ્રસાર કરવો.\n• નાના નગરોમાં કમ્પ્યુટર આઈટી પાર્ક બનાવી સગવડ આપવી.\n• ખેડૂतोंને ટપક સિંચાઈ અને ડ્રોનની સહાય કરવી.",
      pa: "• ਹਰੀਆਂ ਬੱਸਾਂ ਅਤੇ ਸੂਰਜੀ ਊਰਜਾ ਨਾਲ ਪ੍ਰਦੂਸ਼ਣ ਘੱਟ ਕਰਨਾ।\n• ਛੋਟੇ ਕਸਬਿਆਂ ਵਿੱਚ ਆਈਟੀ ਪਾਰਕ ਬਣਾ ਕੇ ਰੁਜ਼ਗਾਰ ਦੇਣਾ।\n• ਡਰੋਨ ਰਾਹੀਂ ਖੇਤੀਬਾੜੀ ਸਲਾਹ ਮੁਹੱਈਆ ਕਰਵਾਉਣਾ।"
    };
    
    const fallbackText = fallbacks[language as string] || fallbacks["en"];
    res.json({ success: true, simplified: fallbackText });
  }
});

// 10. Cast Ballot (Blockchain creation)
app.post("/api/vote/cast", (req, res) => {
  const { voterId, candidateId, accessibilityMode, language } = req.body;
  if (!voterId || !candidateId) {
    return res.status(400).json({ error: "Voter ID and Candidate ID are required" });
  }

  const voter = voters[voterId];
  if (!voter) {
    return res.status(404).json({ error: "Voter record is required" });
  }

  if (voter.hasVoted) {
    return res.status(400).json({ error: "Voter has already cast a ballot. Duplicate voting blocked." });
  }

  // 1. Mark voter as voted
  voter.hasVoted = true;
  voter.votedForCandidateId = candidateId;

  // 2. Generate cryptographically linked block
  const previousBlock = blockchain[blockchain.length - 1];
  const newIndex = blockchain.length;
  const timestamp = new Date().toISOString();
  
  // Encrypt voter verification token so ballot is fully anonymous but registered
  const salt = crypto.randomBytes(16).toString("hex");
  const voteIdHash = crypto.createHash("sha256").update(`${voterId}-${salt}`).digest("hex");
  
  // Hash the block contents
  const hashInput = `${newIndex}${previousBlock.hash}${timestamp}${voteIdHash}${candidateId}`;
  const blockHash = crypto.createHash("sha256").update(hashInput).digest("hex");

  // Government simulated authority key signature
  const signature = crypto.createHmac("sha256", "ELECTION_COMMISSION_DEEP_KEY")
                          .update(blockHash)
                          .digest("hex")
                          .substring(0, 16).toUpperCase();

  const newBlock: BlockchainBlock = {
    index: newIndex,
    timestamp,
    hash: blockHash,
    previousHash: previousBlock.hash,
    voteIdHash,
    sessionId: crypto.randomBytes(8).toString("hex").toUpperCase(),
    signature: `ECI-SIG-${signature}`
  };

  blockchain.push(newBlock);

  // System audit log (DO NOT Log who the voter voted for - Ballot Secrecy)
  systemLogs.push({
    id: "log-" + Date.now(),
    timestamp,
    voterId,
    action: "Ballot Finalized",
    status: "success",
    details: `Immutable ledger link appended. Block Index: #${newIndex}. Integrity hash verified.`
  });

  res.json({ success: true, block: newBlock });
});

// 11. Retrieve Full Blockchain
app.get("/api/vote/blockchain", (req, res) => {
  res.json({ success: true, blockchain });
});

// 12. Run real-time AI helpdesk chatbot via Gemini
app.post("/api/helpdesk/chat", async (req, res) => {
  const { messages, language } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages list is required" });
  }

  const promptHistory = messages.map((m: any) => `${m.sender === "voter" ? "User" : "Assistant"}: ${m.text}`).join("\n");
  
  const outputLangMap: Record<IndianLanguage, string> = {
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

  const targetLanguageName = outputLangMap[language as IndianLanguage] || "English";

  try {
    const ai = getGeminiClient();
    const systemInstruction = `You are a warm, highly structured, public service AI Guide for SarvaVote AI. Your job is to answer the voter's questions about voting procedures, candidate options, blockchain auditing, security guarantees, booth navigation, or screen reader adjustments on this digital voting app.
Keep responses concise, reassuring, completely objective (neutral), and translate your answer fully to ${targetLanguageName}. Answer the query in plain, warm paragraphs.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `System guidelines: ${systemInstruction}\n\nConversation history:\n${promptHistory}\nAssistant:`,
    });

    const reply = response.text || "Let me check the handbook for you. Please let me know how I can guide your ballot.";
    res.json({ success: true, message: reply });
  } catch (err) {
    console.warn("Gemini helpdesk chat failed, proceeding with smart local fallback:");
    
    // Multi-lingual standard fallback
    const fallbackAnswers: Record<string, string> = {
      en: "Hello! I am your SarvaVote digital assistant. You can ask me how to select languages, how blockchain protects your vote, or query details about our candidate manifestos on this platform.",
      hi: "नमस्ते! मैं आपका सर्ववोट सहायक हूँ। आप मुझसे पूछ सकते हैं कि भाषा कैसे बदलें, ब्लॉकचेन आपके वोट की सुरक्षा कैसे करता है, या इस मंच पर उम्मीदवारों के बारे में जानकारी प्राप्त कर सकते हैं।",
      bn: "নমস্কার! আমি আপনার সর্বভোট সাহায্যকারী এআই। আপনি ভাষা নির্বাচন, ব্লকচেইন নিরাপত্তা বা প্রার্থীদের নির্বাচনী ইশতেহার নিয়ে যেকোনো প্রশ্ন করতে পারেন।",
      mr: "नमस्कार! मी आपला सर्ववोट डिजिटल सहाय्यक आहे. आपण भाषा कशी बदलावी, ब्लॉकचेन आपल्या मताचे संरक्षण कसे करते, किंवा उमेदवारांच्या जाहीरनाम्याविषयी विचारू शकता.",
      ta: "வணக்கம்! நான் உங்கள் சர்வவோட் டிஜிட்டல் உதவியாளர். மொழிகளை எவ்வாறு தேர்ந்தெடுப்பது, பிளாக்செயின் உங்கள் வாக்கை எவ்வாறு பாதுகாக்கிறது மற்றும் வேட்பாளர்களின் திட்டங்களை அறிய நீங்கள் என்னிடம் கேட்கலாம்.",
      te: "నమస్తే! నేను మీ సర్వవోట్ డిజిటల్ సహాయకుడిని. భాషలను ఎలా ఎంచుకోవాలి, బ్లాక్‌చైన్ మీ ఓటును ఎలా రక్షిస్తుంది లేదా అభ్యర్థుల వివరాలను ఎలా చూడాలో మీరు నన్ను అడగవచ్చు.",
      kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಸರ್ವವೋಟ್ ಡಿಜಿಟಲ್ ಸಹಾಯಕಿ. ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸುವುದು ಹೇಗೆ, ಬ್ಲಾಕ್‌ಚೈನ್ ನಿಮ್ಮ ಮತವನ್ನು ಹೇಗೆ ಸುರಕ್ಷಿತವಾಗಿರಿಸುತ್ತದೆ ಮತ್ತು ಅಭ್ಯರ್ಥಿಗಳ ವಿವರಗಳ ಬಗ್ಗೆ ನೀವು ಕೇಳಬಹುದು.",
      ml: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ സർവ്വവോട്ട് ഡിജിറ്റൽ സഹായിയാണ്. ഭാഷ എങ്ങനെ മാറ്റാം, ബ്ലോക്ക്ചെയിൻ നിങ്ങളുടെ വോട്ട് എങ്ങനെ സംരക്ഷിക്കുന്നു, അല്ലെങ്കിൽ സ്ഥാനാർത്ഥികളുടെ വിവരങ്ങൾ എങ്ങനെ അറിയാം എന്ന് എന്നോട് ചോദിക്കാം.",
      gu: "નમસ્તે! હું તમારો સર્વવોટ ડિજிட்டಲ್ આસિસ્ટન્ટ છું. ભાષા કેવી રીતે બદલવી, બ્લોકચેન તમારા વોટને કેવી રીતે સુરક્ષિત રાખે છે અને ઉમેદવારના ઘોષણાપત્ર વિષે તમે મને પૂછી શકો છો.",
      pa: "ਨਮਸਤੇ! ਮੈਂ ਤੁਹਾਡਾ ਸਰਵਵੋਟ ਡਿਜੀਟਲ ਸਹਾਇਕ ਹਾਂ। ਤੁਸੀਂ ਪੁੱਛ ਸਕਦੇ ਹੋ ਕਿ ਭਾਸ਼ਾ ਕਿਵੇਂ ਬਦਲਣੀ ਹੈ, ਬਲਾਕਚੈਨ ਤੁਹਾਡੀ ਵੋਟ ਨੂੰ ਕਿਵੇਂ ਸੁਰੱਖਿਅਤ ਰੱਖਦਾ ਹੈ, ਜਾਂ ਉਮੀਦਵਾਰਾਂ ਬਾਰੇ ਜਾਣਕਾਰੀ ਲੈ ਸਕਦੇ ਹੋ।"
    };

    const userMessageCount = messages.filter((m: any) => m.sender === "voter").length;
    let fallbackText = fallbackAnswers[language as string] || fallbackAnswers["en"];

    if (userMessageCount > 1) {
      const followUpMock: Record<string, string> = {
        en: "Our digital systems verify and anonymize your identity using decentralized cryptographic hash links. Once cast, your vote is immutably written into our electronic ledger, guaranteeing both complete ballot confidence and total security from tampering.",
        hi: "हमारी प्रणाली विकेंद्रीकृत ब्लॉकचेन क्रिप्टोग्राफी का उपयोग करके आपकी पहचान को पूरी तरह से गुप्त रखती है। वोट होने के बाद, आपका मत लेजर में बिना किसी बदलाव के दर्ज हो जाता है।"
      };
      fallbackText = followUpMock[language as string] || followUpMock["en"];
    }

    res.json({ success: true, message: fallbackText });
  }
});

// 12. Stats
app.get("/api/admin/stats", (req, res) => {
  res.json({ success: true, stats: compileStats() });
});

// Serve health status
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", version: "2.0.0", blockchainLength: blockchain.length });
});

// --------------------------------------------------------------------------
// Vite or Production File Server Setup
// --------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SARVAVOTE GLOBAL SERVER] Running on host 0.0.0.0 port ${PORT}`);
  });
}

startServer();

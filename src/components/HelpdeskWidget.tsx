/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { HelpdeskMessage, IndianLanguage } from "../types";
import { speakText } from "../lib/speech";
import { 
  MessageSquare, 
  Send, 
  X, 
  Volume2, 
  HelpCircle, 
  Sparkles, 
  ArrowRight,
  BookOpen
} from "lucide-react";

interface HelpdeskWidgetProps {
  language: IndianLanguage;
  voiceGuideEnabled: boolean;
  onClose: () => void;
}

const standardFaqs: Array<{ q: string; a: string; q_hi: string; a_hi: string }> = [
  {
    q: "How does the blockchain protect my vote?",
    a: "Every vote is compiled into an immutable SHA-256 block hash. It secures and proves participation without revealing candidate selections.",
    q_hi: "ब्लॉकचेन मेरे वोट की सुरक्षा कैसे करता है?",
    a_hi: "प्रत्येक वोट को एक अपरिवर्तनीय SHA-256 ब्लॉक हैश में संकलित किया जाता है। यह उम्मीदवार के चयन को प्रकट किए बिना भागीदारी को सुरक्षित करता है।"
  },
  {
    q: "Can I change my candidate choice after cast?",
    a: "No, under standard constitutional laws, e-ballots are finalized immediately. Once committed to the ledger block, the choice is irreversibly signed.",
    q_hi: "क्या मैं मतदान के बाद अपना उम्मीदवार बदल सकता हूँ?",
    a_hi: "नहीं, संवैधानिक कानूनों के तहत, ई-मतपत्र तुरंत अंतिम रूप ले लेते हैं। एक बार लेजर ब्लॉक में दर्ज होने के बाद विकल्प को बदला नहीं जा सकता।"
  },
  {
    q: "Why do we need Voice Bio-metrics?",
    a: "Your voice profile ensures only you can access your ballot credentials. It detects pre-recorded replay fraud and prevents parallel login spoofing.",
    q_hi: "हमें वॉयस बायोमेट्रिक्स की आवश्यकता क्यों है?",
    a_hi: "आपकी आवाज़ का प्रोफाइल यह सुनिश्चित करता है कि केवल आप ही अपने मतपत्र क्रेडेंशियल्स का उपयोग कर सकें। यह रिकॉर्डिंग धोखेबाज़ी को रोकता है।"
  }
];

export function HelpdeskWidget({ language, voiceGuideEnabled, onClose }: HelpdeskWidgetProps) {
  const [messages, setMessages] = useState<HelpdeskMessage[]>([
    {
      id: "wel-1",
      sender: "ai",
      text: "Namaste! I am your SarvaVote digital assistant. You can ask me how language selections work, how blockchain protects your ballot, or candidate qualification lists.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Translate initial welcome based on language
    if (language !== "en") {
      const trans: Record<string, string> = {
        hi: "नमस्ते! मैं आपका सर्ववोट डिजिटल सहायक हूँ। आप मुझसे पूछ सकते हैं कि भाषा चयन कैसे काम करता है, ब्लॉकचेन आपके मतपत्र की सुरक्षा कैसे करता है, या उम्मीदवार सूचियों के बारे में जानकारी प्राप्त कर सकते हैं।",
        bn: "নমস্কার! আমি আপনার সর্বভোট সাহায্যকারী ডিজিটাল এআই। আপনি ভাষা পরিবর্তন, ব্লকচেইন নিরাপত্তা বা প্রার্থীদের নির্বাচনী ইশতেহার নিয়ে যেকোনো প্রশ্ন করতে পারেন।",
        mr: "नमस्कार! मी आपला सर्ववोट डिजिटल सहाय्यक आहे. आपण भाषा कशी बदलावी, ब्लॉकचेन आपल्या मताचे संरक्षण कसे करते, किंवा उमेदवारांच्या जाहीरनाम्याविषयी विचारू शकता.",
        ta: "வணக்கம்! நான் உங்கள் சர்வவோட் டிஜிட்டல் உதவியாளர். மொழிகளை எவ்வாறு தேர்ந்தெடுப்பது, பிளாக்செயின் உங்கள் வாக்கை எவ்வாறு பாதுகாக்கிறது மற்றும் வேட்பாளர்களின் திட்டங்களை அறிய நீங்கள் என்னிடம் கேட்கலாம்.",
        te: "నమస్తే! నేను మీ సర్వవోట్ డిజిటల్ సహాయకుడిని. భాషలను ఎలా ఎంచుకోవాలి, బ్లాక్‌చైన్ మీ ఓటును ఎలా రక్షిస్తుంది లేదా అభ్యర్థుల వివరాలను ఎలా చూడాలో మీరు నన్ను అడగవచ్చు.",
        kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಸರ್ವವೋಟ್ ಡಿಜಿಟಲ್ ಸಹಾಯಕಿ. ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸುವುದು ಹೇಗೆ, ಬ್ಲಾಕ್‌ಚೈನ್ ನಿಮ್ಮ ಮತವನ್ನು ಹೇಗೆ ಸುರಕ್ಷಿತವಾಗಿರಿಸುತ್ತದೆ ಮತ್ತು ಅಭ್ಯರ್ಥಿಗಳ ವಿವರಗಳ ಬಗ್ಗೆ ನೀವು ಕೇಳಬಹುದು.",
        ml: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ സർവ്വവോട്ട് ഡിജിറ്റൽ സഹായിയാണ്. ഭാഷ എങ്ങനെ മാറ്റാം, ബ്ലോക്ക്ചെയിൻ നിങ്ങളുടെ വോട്ട് എങ്ങനെ സംരക്ഷിക്കുന്നു, അല്ലെങ്കിൽ സ്ഥാനാർത്ഥികളുടെ വിവരങ്ങൾ എങ്ങനെ അറിയാം എന്ന് എന്നോട് ചോദിക്കാം.",
        gu: "નમસ્તે! હું તમારો સર્વવોટ ડિજिटल આસિસ્ટન્ટ છું. ભાષા કેવી રીતે બદલવી, બ્લોકચેન તમારા વોટને કેવી રીતે સુરક્ષિત રાખે છે અને ઉમેદવારના ઘોષણાપત્ર વિષે તમે મને પૂછી શકો છો.",
        pa: "ਨਮਸਤੇ! ਮੈਂ ਤੁਹਾਡਾ ਸਰਵਵੋਟ ਡਿਜੀਟਲ ਸਹਾਇਕ ਹਾਂ। ਤੁਸੀਂ ਪੁੱਛ ਸਕਦੇ ਹੋ ਕਿ ਭਾਸ਼ਾ ਕਿਵੇਂ ਬਦਲਣੀ ਹੈ, ਬਲਾਕਚੈਨ ਤੁਹਾਡੀ ਵੋਟ ਨੂੰ ਕਿਵੇਂ ਸੁਰੱਖਿਅਤ ਰੱਖਦਾ ਹੈ, ਜਾਂ ਉਮੀਦਵਾਰਾਂ ਬਾਰੇ ਜਾਣਕਾਰੀ ਲੈ ਸਕਦੇ ਹੋ।"
      };
      const localizedWel = trans[language] || trans["en"];
      setMessages([
        {
          id: "wel-1",
          sender: "ai",
          text: localizedWel,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [language]);

  useEffect(() => {
    scrollLatest();
  }, [messages]);

  const scrollLatest = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: HelpdeskMessage = {
      id: "msg-" + Date.now(),
      sender: "voter",
      text: inputText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/helpdesk/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          messages: [...messages, userMsg].map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok && data.success) {
        const aiMsg: HelpdeskMessage = {
          id: "msg-ai-" + Date.now(),
          sender: "ai",
          text: data.message,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMsg]);
        speakText(data.message, language, voiceGuideEnabled);
      }
    } catch (e) {
      setIsLoading(false);
      const errMsg: HelpdeskMessage = {
        id: "msg-err-" + Date.now(),
        sender: "system",
        text: "Public gateway is currently busy. Please review FAQs or request support at offline booths.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  const speakFaqValue = (text: string) => {
    speakText(text, language, true);
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-900 text-white rounded-3xl border border-slate-800 overflow-hidden shadow-2xl" id="helpdesk-widget-container">
      {/* Widget Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-4 shrink-0 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center animate-pulse">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
              ECI AI Helpdesk Widget
              <Sparkles className="w-3.5 h-3.5 text-amber-200 fill-amber-300" />
            </h4>
            <span className="text-[10px] text-orange-100 font-medium">Bilingual Citizen Assistant</span>
          </div>
        </div>
        
        <button
          id="btn-helpdesk-close"
          onClick={onClose}
          className="p-1.5 hover:bg-white/15 text-white rounded-full transition cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs flex flex-col justify-between scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <div className="space-y-4">
          {/* FAQ Accordions block */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[10px] uppercase font-bold text-orange-400 tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Frequently Asked Questions (FAQs)
            </div>
            
            <div className="space-y-1.5">
              {standardFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                const questionText = language === "hi" ? faq.q_hi : faq.q;
                const answerText = language === "hi" ? faq.a_hi : faq.a;

                return (
                  <div key={idx} className="border-b border-slate-800/60 pb-1.5 last:border-b-0 last:pb-0">
                    <button
                      id={`faq-btn-${idx}`}
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left font-bold text-slate-200 hover:text-white flex justify-between items-center py-1 cursor-pointer"
                    >
                      <span>{questionText}</span>
                      <ChevronRightArrow isOpen={isOpen} />
                    </button>
                    
                    {isOpen && (
                      <div className="text-slate-400 leading-relaxed pt-1 flex items-start gap-1">
                        <span>{answerText}</span>
                        <button 
                          onClick={() => speakFaqValue(answerText)}
                          className="text-orange-400 hover:text-orange-500 shrink-0 cursor-pointer p-0.5"
                          title="Read FAQ answer aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversation feeds */}
          <div className="space-y-3">
            {messages.map((m) => {
              const isAi = m.sender === "ai";
              const isSys = m.sender === "system";
              return (
                <div
                  key={m.id}
                  className={`flex ${isAi ? "justify-start" : isSys ? "justify-center" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 space-y-1 ${
                      isAi
                        ? "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-750"
                        : isSys
                        ? "bg-amber-950/45 border border-amber-900 text-amber-300 text-[11px] font-sans rounded-xl font-medium"
                        : "bg-orange-600 text-white rounded-tr-none"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                    <div className="text-[9px] text-right text-slate-400/90 font-mono">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-400 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                  <span>AI typing...</span>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>
        </div>
      </div>

      {/* Input Form footer */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2 shrink-0">
        <input
          id="helpdesk-chat-text-input"
          type="text"
          placeholder="Ask AI e.g., 'how does ledger audit work?'"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl outline-none focus:border-orange-500 text-slate-100 placeholder-slate-500"
        />
        
        <button
          id="btn-helpdesk-chat-submit"
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

function ChevronRightArrow({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-3.5 h-3.5 transition-transform duration-150 text-orange-400 ${isOpen ? "rotate-90" : ""}`}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

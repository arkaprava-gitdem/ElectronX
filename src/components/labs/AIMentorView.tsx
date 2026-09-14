import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Cpu,
  Zap,
  CheckCircle2,
  Copy,
  Lightbulb,
  Terminal,
  Activity
} from 'lucide-react';
import Markdown from 'react-markdown';
import { findLocalMentorAnswer } from '../../data/mentorKnowledge';
import { LabViewId } from '../../types';

interface AIMentorViewProps {
  onNavigate: (view: LabViewId, detailId?: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
  isAiGenerated?: boolean;
}

const QUICK_PROMPTS = [
  'Why is Silicon preferred over Germanium?',
  'Explain difference between Zener and Avalanche breakdown.',
  'How does the Early effect alter BJT output characteristics?',
  'Derive built-in potential formula from drift-diffusion equilibrium.',
  'Why do power MOSFETs not suffer from thermal runaway?',
  'Test me with 3 viva questions on PN junction diodes.',
  'How do I calculate the ripple factor of a bridge rectifier?',
  'Explain pinch-off in JFET versus saturation in MOSFET.',
];

export const AIMentorView: React.FC<AIMentorViewProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'mentor',
      text: `### Welcome to ElectronX AI Semiconductor Mentor
I am your interactive engineering tutor for **Basic Electronic Devices (PCCEC301)**. 

Ask me any conceptual question, request a step-by-step numerical derivation, troubleshoot a lab circuit, or ask to be tested with oral viva questions!

Try selecting one of the suggested engineering queries below or type your own question.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputVal, setInputVal] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsLoading(true);

    try {
      // Send request to server-side Gemini API proxy
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });

      const data = await res.json();

      let answerText = '';
      let isAi = false;

      if (data.hasApiKey && data.answer) {
        answerText = data.answer;
        isAi = true;
      } else {
        // Fallback to local syllabus knowledge base
        answerText = findLocalMentorAnswer(query);
        isAi = false;
      }

      const mentorMsg: ChatMessage = {
        id: `mentor-${Date.now()}`,
        sender: 'mentor',
        text: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAiGenerated: isAi,
      };

      setMessages((prev) => [...prev, mentorMsg]);
    } catch (err) {
      // Local fallback on any network exception
      const fallbackAnswer = findLocalMentorAnswer(query);
      const mentorMsg: ChatMessage = {
        id: `mentor-${Date.now()}`,
        sender: 'mentor',
        text: fallbackAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAiGenerated: false,
      };
      setMessages((prev) => [...prev, mentorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#181a2e] to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              AI INSTRUCTOR
            </span>
            <span className="text-xs font-mono text-slate-400">Intelligent Semiconductor Tutor</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-cyan-400" />
            <span>AI Semiconductor Mentor & Viva Examiner</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Powered by modern Google Gemini reasoning and an offline syllabus engineering database. Explains derivations, troubleshoots circuits, and conducts oral viva exam prep.
          </p>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome-reset',
                sender: 'mentor',
                text: 'Chat history cleared. How can I assist with your semiconductor lab investigations today?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>CLEAR CHAT</span>
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono text-slate-400 block uppercase font-bold px-1">
          Recommended Engineering Queries:
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-cyan-300 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:p-6 space-y-4 min-h-[480px] max-h-[620px] overflow-y-auto">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-2 px-1 text-[10px] font-mono text-slate-400">
                <span>{isUser ? 'You (Student)' : 'ElectronX AI Mentor'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
                {!isUser && msg.isAiGenerated && (
                  <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 text-[9px]">
                    Gemini Live
                  </span>
                )}
              </div>

              <div
                className={`p-4 rounded-2xl max-w-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-tr-xs font-mono'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs shadow-md space-y-3'
                }`}
              >
                {isUser ? (
                  <p>{msg.text}</p>
                ) : (
                  <div className="markdown-body prose prose-invert prose-xs sm:prose-sm max-w-none text-slate-200">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                )}

                {!isUser && (
                  <div className="flex items-center justify-end pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>COPY RESPONSE</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 w-fit">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono text-cyan-300">
              Synthesizing semiconductor physics response...
            </span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Query Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask about built-in potential, BJT Q-point, MOSFET saturation, derivations, viva questions..."
          className="flex-1 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner"
        />
        <button
          id="send-mentor-message-btn"
          type="submit"
          disabled={!inputVal.trim() || isLoading}
          className="px-5 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs font-mono transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">SEND</span>
        </button>
      </form>
    </div>
  );
};

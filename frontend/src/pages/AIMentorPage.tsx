import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  HelpCircle,
  Bug,
  Split,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { MentorConversation, MentorMessage } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { CodeBlock } from '../components/common/CodeBlock';

export const AIMentorPage: React.FC = () => {
  const [conversations, setConversations] = useState<MentorConversation[]>([]);
  const [activeConv, setActiveConv] = useState<MentorConversation | null>(null);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'explain' | 'python_vs_java' | 'debug' | 'progressive_hint' | 'quiz' | 'explain_back'>('explain');
  const [topicContext, setTopicContext] = useState('OOP Foundations & Inheritance');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const list = await api.listConversations();
      setConversations(list);
      if (list.length > 0 && !activeConv) {
        selectConversation(list[0]);
      } else if (list.length === 0) {
        // Create initial default conversation
        startNewConversation('explain', 'OOP Foundations');
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  const selectConversation = async (conv: MentorConversation) => {
    try {
      const detail = await api.getConversation(conv.id);
      setActiveConv(detail);
      setMessages(detail.messages);
      setSelectedMode(detail.mode as any);
      setTopicContext(detail.topic_context || 'Java Concepts');
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to get conversation', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startNewConversation = async (mode: any, topic: string) => {
    try {
      const newConv = await api.createConversation({
        mode,
        topic_context: topic,
        title: `${mode.toUpperCase().replace('_', ' ')}: ${topic}`,
      });
      setConversations([newConv, ...conversations]);
      setActiveConv(newConv);
      setMessages(newConv.messages);
      setSelectedMode(mode);
      setTopicContext(topic);
    } catch (err) {
      console.error('Failed to start conversation', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv || sending) return;

    const userText = inputMessage;
    setInputMessage('');
    setSending(true);

    // Optimistically add user message
    const tempUserMsg: MentorMessage = {
      id: Date.now(),
      conversation_id: activeConv.id,
      role: 'user',
      content: userText,
      hint_level: 0,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const reply = await api.sendMessage(activeConv.id, userText);
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const modes = [
    {
      id: 'explain',
      title: 'Explain Mode',
      desc: 'Beginner-friendly breakdown with real-world analogies',
      icon: BookOpen,
      color: 'emerald',
    },
    {
      id: 'python_vs_java',
      title: 'Python vs Java',
      desc: 'Compare Python syntax and runtime with Java OOP equivalents',
      icon: Split,
      color: 'sky',
    },
    {
      id: 'debug',
      title: 'Debug Mode',
      desc: 'Diagnose compiler errors, NullPointers, and logic bugs',
      icon: Bug,
      color: 'rose',
    },
    {
      id: 'progressive_hint',
      title: 'Progressive Hints',
      desc: 'One gentle hint at a time without spoiling the answer',
      icon: Lightbulb,
      color: 'amber',
    },
    {
      id: 'quiz',
      title: 'Curated Quiz',
      desc: 'Targeted questions from the curated practice bank',
      icon: GraduationCap,
      color: 'purple',
    },
    {
      id: 'explain_back',
      title: 'Explain It Back',
      desc: 'Explain concepts in your own words; get evaluated',
      icon: MessageSquare,
      color: 'teal',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <Bot className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Autonomous Java Tutor
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">AI Java Mentor</h1>
          <p className="text-xs text-slate-400 mt-1">
            Context-aware mentor with 6 specialized learning modes. Advisory educational feedback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple">JDK 21 Context Active</Badge>
        </div>
      </div>

      {/* Mode Selector Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = selectedMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => startNewConversation(m.id, topicContext)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500 shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 mb-2 shrink-0 text-emerald-400" />
              <div>
                <div className="font-semibold text-xs text-slate-200 leading-tight">{m.title}</div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{m.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Chat Interface */}
      <Card className="h-[650px] flex flex-col p-0 overflow-hidden bg-slate-900 border-slate-800">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-200">
                {activeConv?.title || 'Java Mentor Session'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Focus: <span className="text-emerald-400">{topicContext}</span> &bull; Mode: <span className="uppercase text-slate-300">{selectedMode.replace('_', ' ')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={topicContext}
              onChange={(e) => setTopicContext(e.target.value)}
              placeholder="Change topic focus..."
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-600 outline-none focus:border-emerald-500 w-48"
            />
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed space-y-2 ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-950/40'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-invert max-w-none text-xs sm:text-sm">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          {sending && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Mentor is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              required
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask Java Mentor in ${selectedMode.replace('_', ' ')} mode (e.g. "How does method overriding work in Java vs Python?")...`}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
            <Button
              type="submit"
              variant="quest"
              size="md"
              isLoading={sending}
              icon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

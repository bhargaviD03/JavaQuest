import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Users, Zap, BookOpen, BrainCircuit, Trophy } from 'lucide-react';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Navbar */}
      <header className="h-20 border-b border-slate-800/80 px-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">JavaQuest</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link to="/register">
            <Button variant="quest">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider animate-pulse">
          <Zap className="w-4 h-4 fill-emerald-400" />
          Companion-Powered Gamified Java Platform
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Don't just learn Java. <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
            Become confident in Java.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Designed specifically to complement your institute classes. Enter what your instructor taught today, practice with curated challenges, get progressive AI mentoring, and study alongside your companion.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="quest" size="lg" className="w-full sm:w-auto" icon={<ArrowRight className="w-5 h-5" />}>
              Start Learning Now
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Sign In to Your Journey
            </Button>
          </Link>
        </div>

        {/* Pillars / Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Today's Institute Topic</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Log the exact OOP topic taught in class today. Receive a 9-step focused practice session with analogies, bug hunts, and code walkthroughs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Companion Pair Learning</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Study together with separate accounts. Submit challenge answers independently without seeing each other's code until both submit, then compare side-by-side.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Contextual AI Mentor</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              6 targeted modes including Python vs Java comparison, progressive one-by-one hints, compiler debugging, and explain-it-back evaluation.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>JavaQuest &copy; 2026. Built with precision for Java learners & companions.</p>
      </footer>
    </div>
  );
};

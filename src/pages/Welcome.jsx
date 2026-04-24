import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, Globe, ChevronDown, Moon, CheckCircle, 
  ArrowRight, PlayCircle, Star, Wallet, Target, 
  Leaf, BatteryFull, Lock, ShieldCheck, Zap
} from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="antialiased text-slate-900 min-h-screen flex flex-col gradient-bg font-sans">
      {/* Header / Utility Bar */}
      <header className="w-full flex justify-between items-center px-6 py-4 lg:px-12 lg:py-6 z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Layers size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">LifeOS</span>
        </div>
        
        <div className="flex items-center gap-4">

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl mx-auto py-12 lg:py-0">
        <div className="w-full grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Column: Value Prop & CTAs */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium mb-6">
              <CheckCircle size={14} />
              <span>O Único Sistema Que Você Precisa</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Sua vida <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">em perfeito foco.</span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
              Assuma o controle total integrando suas finanças, produtividade, bem-estar e metas de longo prazo em um único ecossistema inteligente. Deixe o caos para trás.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10">
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-lg shadow-brand-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Criar Conta Grátis <ArrowRight size={18} />
              </button>
            </div>
            
            {/* Social Proof mini */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">+2k</div>
              </div>
              <div className="text-sm text-slate-600">
                <div className="flex text-amber-400">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                </div>
                <span className="font-medium">4.9/5</span> de usuários focados
              </div>
            </div>
          </div>
          
          {/* Right Column: Holistic Ecosystem Preview */}
          <div className="relative w-full max-w-lg mx-auto lg:mx-0">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-indigo-50 rounded-[2rem] transform rotate-3 scale-105 opacity-50 z-0"></div>
            
            {/* Main Container - REMOVIDO BLUR PARA PERFORMANCE */}
            <div className="bg-white rounded-[24px] p-6 shadow-xl border border-slate-100 relative z-10 w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-slate-800">Seu Ecossistema</h3>
                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-md">Sincronizado</span>
              </div>

              <div className="space-y-4">
                {/* Finance Card */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-default group">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Wallet size={24} />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-semibold text-slate-800">Controle Financeiro</h4>
                    <p className="text-xs text-slate-500">Saldo, dívidas e investimentos</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800">R$ 12.450</span>
                  </div>
                </div>

                {/* Productivity Card */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-default group">
                  <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Target size={24} />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-semibold text-slate-800">Metas & Hábitos</h4>
                    <p className="text-xs text-slate-500">Planejamento e rotina diária</p>
                  </div>
                  <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-purple-500 rounded-full"></div>
                  </div>
                </div>

                {/* Wellness Card */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-default group">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Leaf size={24} />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-semibold text-slate-800">Energia & Bem-estar</h4>
                    <p className="text-xs text-slate-500">Foco, psicologia e alertas</p>
                  </div>
                  <div className="flex gap-1 text-emerald-500">
                    <BatteryFull size={16} />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Lock size={12} className="text-slate-400" />
                  Dados 100% criptografados de ponta a ponta
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Privacy Summary */}
      <footer className="w-full py-6 px-6 border-t border-slate-200/50 bg-white/50 mt-auto z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>
            Ao criar uma conta, você concorda com nossos <a href="#" className="text-brand-600 hover:underline">Termos de Serviço</a> e <a href="#" className="text-brand-600 hover:underline">Política de Privacidade</a>.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium"><ShieldCheck size={14} /> Privacidade Garantida</span>
            <a href="#" className="hover:text-slate-800 transition-colors font-medium">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
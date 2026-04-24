import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, Globe, ChevronDown, Moon, ArrowLeft, 
  Building2, FileInput, Plus, Sliders, CalendarCheck,
  Zap, Check, ShieldHalf, Forward
} from 'lucide-react';

const StepTwo = () => {
  const navigate = useNavigate();

  // --- ESTADOS DE FUNCIONALIDADE REAL ---
  
  // Bancos: Nubank começa conectado como no seu 3.html
  const [connectedBanks, setConnectedBanks] = useState(['Nubank']);
  
  // Toggles de Regras
  const [rules, setRules] = useState({
    sync: true,
    autoTag: true,
    roundup: false
  });

  // Assinaturas
  const [subscriptions, setSubscriptions] = useState(['Netflix', 'Spotify', 'Academia']);

  // --- HANDLERS ---
  const toggleBank = (bank) => {
    setConnectedBanks(prev => 
      prev.includes(bank) ? prev.filter(b => b !== bank) : [...prev, bank]
    );
  };

  const toggleRule = (id) => {
    setRules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="antialiased text-slate-900 min-h-screen flex flex-col gradient-bg font-sans">
      
      {/* Header Estilizado */}
      <header className="w-full flex justify-between items-center px-6 py-4 lg:px-12 lg:py-6 z-10 relative">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Layers size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">LifeOS</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600">
            <Globe size={14} className="text-slate-400" />
            <span>PT-BR</span>
            <ChevronDown size={12} className="text-slate-400" />
          </div>
          <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
            <Moon size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-4xl mx-auto py-8">
        
        {/* Container Principal - Sólido para máxima performance */}
        <div className="w-full bg-white rounded-[24px] shadow-xl flex flex-col overflow-hidden border border-slate-100">
            
            {/* Progress Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <button 
                  onClick={() => navigate('/step-one')}
                  className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                    <ArrowLeft size={16} /> Voltar
                </button>
                
                <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-brand-600 tracking-wider uppercase mb-1">Passo 2 de 2</span>
                    <div className="flex gap-2">
                        <div className="w-8 h-1.5 rounded-full bg-brand-600"></div>
                        <div className="w-8 h-1.5 rounded-full bg-brand-600"></div>
                    </div>
                </div>
                
                <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 text-sm font-medium">
                    Pular <Forward size={16} />
                </button>
            </div>

            {/* Form Content */}
            <div className="px-8 py-10 lg:px-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">Conectar & Integrar</h1>
                    <p className="text-slate-600 max-w-xl mx-auto">Sincronize suas contas e defina regras inteligentes para automatizar sua gestão.</p>
                </div>

                <div className="space-y-10">
                    
                    {/* Bancos/Cartões */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Building2 size={20} className="text-brand-500" /> Bancos e Cartões
                            </h2>
                            <button className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                                <FileInput size={14} /> IMPORTAR CSV
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['Nubank', 'Itaú', 'Bradesco'].map(bank => {
                                const isConnected = connectedBanks.includes(bank);
                                return (
                                    <div 
                                        key={bank}
                                        onClick={() => toggleBank(bank)}
                                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-3 relative ${
                                            isConnected ? 'border-brand-500 bg-brand-50/50 shadow-md shadow-brand-100/20' : 'border-slate-100 bg-white hover:border-brand-200 hover:shadow-sm'
                                        }`}
                                    >
                                        {isConnected && (
                                            <div className="absolute top-3 right-3 flex h-2 w-2">
                                                <span className="animate-ping absolute h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                                                <span className="relative rounded-full h-2 w-2 bg-brand-500"></span>
                                            </div>
                                        )}
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border transition-colors ${
                                            isConnected ? 'bg-white text-brand-600 border-brand-100 shadow-sm' : 'bg-slate-50 text-slate-300 border-slate-100'
                                        }`}>{bank[0]}</div>
                                        <div className="text-center">
                                            <p className={`text-sm font-bold ${isConnected ? 'text-slate-900' : 'text-slate-500'}`}>{bank}</p>
                                            <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isConnected ? 'text-brand-600' : 'text-slate-400'}`}>
                                                {isConnected ? 'Conectado' : 'Conectar'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="p-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors min-h-[120px]">
                                <Plus size={20} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Adicionar Outro</span>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* Regras e Automação (Toggles Funcionais) */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                            <Sliders size={20} className="text-brand-500" /> Regras de Automação
                        </h2>
                        
                        <div className="space-y-3">
                            {[
                                { id: 'sync', t: 'Sincronização Diária', d: 'Atualiza saldos e transações automaticamente às 06:00.' },
                                { id: 'autoTag', t: 'Auto-Categorização Inteligente', d: 'Organiza gastos por categorias (ex: Alimentação, Lazer) via IA.' },
                                { id: 'roundup', t: 'Arredondamento para Investimentos', d: 'Guarda os centavos das compras em um cofre de poupança.' }
                            ].map(rule => (
                                <div 
                                    key={rule.id} 
                                    onClick={() => toggleRule(rule.id)}
                                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 cursor-pointer transition-all"
                                >
                                    <div className="pr-4">
                                        <p className="text-sm font-bold text-slate-800">{rule.t}</p>
                                        <p className="text-xs text-slate-500">{rule.d}</p>
                                    </div>
                                    <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${rules[rule.id] ? 'bg-brand-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${rules[rule.id] ? 'left-6' : 'left-1'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/*lifestyle & Sync */}
                    <section className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <CalendarCheck size={18} className="text-brand-500" /> Assinaturas Ativas
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {subscriptions.map(item => (
                                    <div key={item} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm text-xs font-bold text-slate-700">
                                        <div className={`w-1.5 h-1.5 rounded-full ${item === 'Netflix' ? 'bg-red-500' : item === 'Spotify' ? 'bg-green-500' : 'bg-blue-400'}`} />
                                        {item}
                                    </div>
                                ))}
                                <button className="w-8 h-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:bg-slate-50">
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <Zap size={18} className="text-brand-500" /> Integrações de Rotina
                            </h3>
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm font-black">G</div>
                                <div className="flex-grow">
                                    <p className="text-[11px] font-bold text-slate-800">Google Calendar</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Sincronizar vencimentos</p>
                                </div>
                                <button className="px-3 py-1.5 rounded-lg text-[10px] font-black text-brand-600 border border-brand-200 bg-white hover:bg-brand-50 transition-colors shadow-sm">CONECTAR</button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-10 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    Concluir Configuração <Check size={20} />
                </button>
            </div>
        </div>
      </main>

      {/* Footer Fiel ao Design */}
      <footer className="w-full py-6 px-6 border-t border-slate-100 bg-white/80 mt-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p>Ao continuar, concorda com os <span className="text-brand-600 underline cursor-pointer">Termos</span> e <span className="text-brand-600 underline cursor-pointer">Privacidade</span>.</p>
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-emerald-500"><ShieldHalf size={14} /> Dados Criptografados</span>
                <span className="hover:text-slate-800 cursor-pointer transition-colors">Suporte</span>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default StepTwo;
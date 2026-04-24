import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, Globe, ChevronDown, Moon, ArrowLeft, 
  Wallet, BatteryMedium, Sun, CloudSun, ArrowRight, 
  Bell, Forward, ShieldCheck 
} from 'lucide-react';

const StepOne = () => {
  const navigate = useNavigate();
  
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [debts, setDebts] = useState([]);
  const [energy, setEnergy] = useState('');
  const [orgLevel, setOrgLevel] = useState(3);
  const [alerts, setAlerts] = useState({ due: true, habits: true });
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!income || !expenses || !energy) {
      setError('Preencha os campos obrigatórios (Renda, Despesas e Energia) para continuar.');
      setTimeout(() => setError(''), 4000);
      return;
    }
    setError('');
    navigate('/step-two');
  };

  const toggleDebt = (debt) => {
    setDebts(prev => 
      prev.includes(debt) ? prev.filter(d => d !== debt) : [...prev, debt]
    );
  };

  return (
    <div className="antialiased text-slate-900 min-h-screen flex flex-col gradient-bg font-sans">
      
      {/* Header / Utility Bar */}
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
          <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600">
            <Moon size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-4xl mx-auto py-8">
        
        {/* Form Container - Sólido para Performance */}
        <div className="w-full bg-white rounded-[24px] shadow-xl flex flex-col overflow-hidden border border-slate-100">
            
            {/* Progress & Navigation Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <button 
                  onClick={() => navigate('/')}
                  className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                    <ArrowLeft size={16} /> Voltar
                </button>
                
                <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-brand-600 tracking-wider uppercase mb-1">Passo 1 de 2</span>
                    <div className="flex gap-2">
                        <div className="w-8 h-1.5 rounded-full bg-brand-600"></div>
                        <div className="w-8 h-1.5 rounded-full bg-slate-200"></div>
                    </div>
                </div>
                
                <button 
                  onClick={() => navigate('/step-two')}
                  className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                    Pular <Forward size={16} />
                </button>
            </div>

            {/* Form Content */}
            <div className="px-8 py-10 lg:px-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">Mapeamento de Perfil</h1>
                    <p className="text-slate-600 max-w-xl mx-auto">Para personalizar seu ecossistema, precisamos entender um pouco sobre sua realidade financeira e estilo de vida atual.</p>
                    
                    {/* Alerta de Erro Visual */}
                    {error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-lg animate-pulse">
                        {error}
                      </div>
                    )}
                </div>

                <div className="space-y-10">
                    
                    {/* Section: Finanças Básicas */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Wallet size={20} className="text-brand-500" /> Finanças Básicas
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Renda Mensal (Aproximada)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-500 sm:text-sm">R$</span>
                                    </div>
                                    <input 
                                      type="number" 
                                      value={income}
                                      onChange={(e) => setIncome(e.target.value)}
                                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all ${!income && error ? 'border-red-300 bg-red-50/50' : 'border-slate-200 bg-slate-50/50'}`} 
                                      placeholder="0,00" 
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Despesas Fixas</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-500 sm:text-sm">R$</span>
                                    </div>
                                    <input 
                                      type="number" 
                                      value={expenses}
                                      onChange={(e) => setExpenses(e.target.value)}
                                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all ${!expenses && error ? 'border-red-300 bg-red-50/50' : 'border-slate-200 bg-slate-50/50'}`} 
                                      placeholder="0,00" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-slate-700">Principais Dívidas (Se houver)</label>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Opcional</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {['Cartão de Crédito', 'Financiamento Imobiliário', 'Empréstimo Pessoal', 'Veículo', 'Nenhuma'].map((item) => (
                                    <button
                                      key={item}
                                      onClick={() => toggleDebt(item)}
                                      className={`px-4 py-2 rounded-full border text-sm transition-all ${
                                        debts.includes(item) 
                                        ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-200' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
                                      }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* Section: Rotina e Energia */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <BatteryMedium size={20} className="text-brand-500" /> Rotina & Energia
                        </h2>
                        
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">Como avalia sua energia ao longo do dia?</label>
                                <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 p-1 rounded-2xl transition-all ${!energy && error ? 'bg-red-50 ring-1 ring-red-200' : ''}`}>
                                    {[
                                      { id: 'manhã', label: 'Matutino', icon: <Sun size={24} />, sub: 'Mais energia pela manhã' },
                                      { id: 'tarde', label: 'Constante', icon: <CloudSun size={24} />, sub: 'Equilibrado o dia todo' },
                                      { id: 'noite', label: 'Noturno', icon: <Moon size={24} />, sub: 'Mais focado à noite' }
                                    ].map((opt) => (
                                        <button
                                          key={opt.id}
                                          onClick={() => setEnergy(opt.id)}
                                          className={`p-4 rounded-xl border transition-all flex flex-col items-center text-center gap-2 ${
                                            energy === opt.id 
                                            ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' 
                                            : 'border-slate-200 bg-white hover:border-brand-300'
                                          }`}
                                        >
                                            <div className={energy === opt.id ? 'text-brand-600' : 'text-slate-400'}>{opt.icon}</div>
                                            <span className="font-bold text-slate-700 text-sm">{opt.label}</span>
                                            <span className="text-[10px] text-slate-500">{opt.sub}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-slate-700">Nível de Organização Atual</label>
                                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded">
                                      {orgLevel <= 3 ? 'Caótico' : orgLevel <= 7 ? 'Razoável' : 'Muito Organizado'}
                                    </span>
                                </div>
                                <input 
                                  type="range" min="1" max="10" 
                                  value={orgLevel}
                                  onChange={(e) => setOrgLevel(e.target.value)}
                                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600" 
                                />
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Caótico</span>
                                    <span>Razoável</span>
                                    <span>Organizado</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* Section: Alertas e Preferências */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Bell size={20} className="text-brand-500" /> Preferências de Alertas
                        </h2>
                        
                        <div className="space-y-4">
                            {[
                              { id: 'due', title: 'Alertas de Vencimento', desc: 'Contas a pagar e assinaturas próximas do vencimento.' },
                              { id: 'habits', title: 'Lembretes de Hábitos', desc: 'Avisos diários baseados nos seus horários de maior energia.' }
                            ].map((alert) => (
                                <label key={alert.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white cursor-pointer transition-all">
                                    <input 
                                      type="checkbox" 
                                      checked={alerts[alert.id]}
                                      onChange={() => setAlerts(p => ({...p, [alert.id]: !p[alert.id]}))}
                                      className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 mt-1" 
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{alert.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{alert.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Footer Actions - Agora chama handleNext */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button 
                  onClick={handleNext}
                  className="px-10 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    Próximo Passo <ArrowRight size={18} />
                </button>
            </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 border-t border-slate-200/50 bg-white/50 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <p>
                LifeOS &copy; 2024 — <a href="#" className="text-brand-600 hover:underline">Privacidade</a> e <a href="#" className="text-brand-600 hover:underline">Termos</a>.
            </p>
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><ShieldCheck size={14} /> Dados Protegidos</span>
                <a href="#" className="hover:text-slate-800 transition-colors">Suporte</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default StepOne;
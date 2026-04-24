import React, { useMemo, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Layers, Globe, ChevronDown, Moon, LayoutGrid, Wallet, 
  FileText, RotateCcw, HandCoins, TrendingUp, Target, 
  BatteryMedium, Zap, Brain, Bell, History, User, 
  Trophy, Plus, CheckCircle2, Flame, Gift, Medal, 
  Utensils, ShieldCheck, BookOpen, Dumbbell, Check
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// --- DADOS CONGELADOS (Performance Máxima) ---
const MENU_ITEMS = Object.freeze([
  { name: "Painel Unificado", path: "/dashboard", icon: LayoutGrid, section: 1 },
  { name: "Dinheiro", path: "/dinheiro", icon: Wallet, section: 1 },
  { name: "Contas & Boletos", path: "/contas", icon: FileText, section: 1 },
  { name: "Assinaturas", path: "/assinaturas", icon: RotateCcw, section: 1 },
  { name: "Dívidas", path: "/dividas", icon: HandCoins, section: 1 },
  { name: "Investimentos", path: "/investimentos", icon: TrendingUp, section: 1 },
  { name: "Metas & Desafios", path: "/metas", icon: Target, section: 2 },
  { name: "Rotina/Hábitos/Energia", path: "/rotina", icon: BatteryMedium, section: 2 },
  { name: "Produtividade/Decisões", path: "/produtividade", icon: Zap, section: 2 },
  { name: "Planejamento/Psicologia", path: "/planejamento", icon: Brain, section: 3 },
  { name: "Alertas/Previsões", path: "/alertas", icon: Bell, section: 3 },
  { name: "Histórico", path: "/historico", icon: History, section: 3 },
  { name: "Perfil", path: "/perfil", icon: User, section: 3 },
]);

const META_1_DATA = Object.freeze([
  { value: 10 }, { value: 15 }, { value: 13 }, { value: 20 }, { value: 25 }, { value: 35 }, { value: 42 }
]);

const META_2_DATA = Object.freeze([
  { value: 5 }, { value: 8 }, { value: 12 }, { value: 15 }, { value: 18 }, { value: 25 }, { value: 30 }
]);

// --- SUB-COMPONENTES OTIMIZADOS ---

const SidebarItem = memo(({ item, currentPath, onClick, showDivider }) => {
  const isActive = currentPath === item.path;
  const MenuIcon = item.icon;
  
  return (
    <React.Fragment>
      {showDivider && <div className="my-2 border-t border-slate-200/50" />}
      <button 
        onClick={() => onClick(item.path)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
          isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <MenuIcon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
        {item.name}
      </button>
    </React.Fragment>
  );
});

const KpiCard = memo(({ title, value, badgeIcon: BadgeIcon, badgeText, badgeClass, subTextLeft, subTextRight, subTextRightClass, dark }) => (
  <div className={`rounded-[24px] p-5 shadow-sm border ${dark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'} flex flex-col hover:shadow-md transition-shadow`}>
    <div className="flex justify-between items-start mb-2">
      <h3 className={`text-sm font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</h3>
      <div className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${badgeClass}`}>
        <BadgeIcon size={12} /> {badgeText}
      </div>
    </div>
    <span className={`text-3xl font-bold mt-1 ${dark ? 'text-white' : 'text-slate-900'}`}>{value}</span>
    <div className={`mt-4 flex items-center justify-between text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
      <span>{subTextLeft}</span>
      <span className={`font-medium ${subTextRightClass}`}>{subTextRight}</span>
    </div>
  </div>
));

const GoalSparkline = memo(({ data, color, gradientId }) => (
  <div className="w-full h-[60px] mt-2">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#${gradientId})`} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
));

const GoalCard = memo(({ title, target, current, percent, colorClass, bgClass, data, chartColor, gradientId }) => (
  <div>
    <div className="flex justify-between items-end mb-2">
      <div>
        <span className="text-sm font-semibold text-slate-900 block">{title}</span>
        <span className="text-xs text-slate-500">Meta: {target}</span>
      </div>
      <div className="text-right">
        <span className="text-sm font-bold text-slate-900 block">{current}</span>
        <span className={`text-xs font-medium ${colorClass}`}>{percent}%</span>
      </div>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex mb-2">
      <div className={`${bgClass} h-full rounded-l-full`} style={{ width: `${percent}%` }}></div>
    </div>
    <GoalSparkline data={data} color={chartColor} gradientId={gradientId} />
  </div>
));

// --- COMPONENTE PRINCIPAL ---

const Metas = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="antialiased text-slate-900 font-sans min-h-screen flex flex-col" 
         style={{ background: 'radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 50%, #f1f5f9 100%)' }}>
      
      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 lg:px-12 z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Layers size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">LifeOS</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-600 cursor-pointer shadow-sm">
            <Globe size={14} className="text-slate-400" />
            <span>PT-BR</span>
            <ChevronDown size={12} className="text-slate-400 ml-1" />
          </div>
          <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Moon size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 w-full max-w-[1440px] mx-auto px-4 lg:px-8 pb-8 gap-6">
        
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/50 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
            <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" alt="User" className="w-8 h-8 rounded-full object-cover" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800">Ana Silva</span>
              <span className="text-xs text-slate-500">Plano Premium</span>
            </div>
            <ChevronDown size={12} className="text-slate-400 ml-auto" />
          </div>

          <nav className="flex flex-col gap-1">
            {MENU_ITEMS.map((item, index) => (
              <SidebarItem 
                key={item.name}
                item={item}
                currentPath={location.pathname}
                onClick={navigate}
                showDivider={index > 0 && MENU_ITEMS[index-1].section !== item.section}
              />
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
            
          {/* Top Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Metas & Desafios</h1>
              <p className="text-sm text-slate-500 mt-1">Acompanhe seu progresso financeiro e hábitos diários.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
                <Trophy size={16} /> Conquistas
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                <Plus size={16} /> Nova Meta
              </button>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              
            {/* Coluna Esquerda */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                
              {/* Resumo KPI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <KpiCard 
                  title="Metas Concluídas" value="85%" badgeIcon={CheckCircle2} badgeText="12" 
                  badgeClass="bg-blue-50 text-blue-600 border border-blue-100"
                  subTextLeft="Progresso Geral:" subTextRight="+5% este mês" subTextRightClass="text-blue-600"
                />
                <KpiCard 
                  title="Dias de Foco" value="14 Dias" badgeIcon={Flame} badgeText="14" dark={true}
                  badgeClass="bg-slate-800 text-blue-400 border border-slate-700"
                  subTextLeft="Sequência Atual:" subTextRight="Melhor: 21" subTextRightClass="text-blue-400"
                />
                <KpiCard 
                  title="Economia Desafios" value="R$ 450,00" badgeIcon={Wallet} badgeText="" 
                  badgeClass="bg-slate-50 text-slate-400 hover:bg-slate-100 cursor-pointer"
                  subTextLeft="Este mês:" subTextRight="+ R$ 120,00" subTextRightClass="text-green-600"
                />
              </div>

              {/* Metas Financeiras Ativas */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Metas Financeiras Ativas</h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Ver todas</button>
                </div>
                
                <div className="flex flex-col gap-6">
                  <GoalCard 
                    title="Viagem Europa 2025" target="R$ 20.000,00" current="R$ 8.500,00" percent={42}
                    colorClass="text-blue-600" bgClass="bg-blue-600" data={META_1_DATA} chartColor="#2563eb" gradientId="meta1"
                  />
                  <GoalCard 
                    title="Troca de Carro" target="R$ 50.000,00" current="R$ 15.000,00" percent={30}
                    colorClass="text-green-600" bgClass="bg-green-500" data={META_2_DATA} chartColor="#22c55e" gradientId="meta2"
                  />
                </div>
              </div>

              {/* Cronograma de Marcos & Recompensas */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Próximos Passos & Recompensas</h3>
                
                <div className="relative border-l-2 border-slate-100 ml-3 pl-6 flex flex-col gap-8">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-semibold text-slate-900 block">Atingir R$ 10k na Viagem</span>
                        <span className="text-xs text-slate-500">Previsto para Outubro</span>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-purple-50 text-purple-600 text-xs font-medium border border-purple-100 flex items-center gap-2">
                        <Gift size={12} /> Jantar Especial
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-200 border-4 border-white"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-semibold text-slate-900 block">60 Dias de Hábitos</span>
                        <span className="text-xs text-slate-500">Faltam 46 dias</span>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-orange-50 text-orange-600 text-xs font-medium border border-orange-100 flex items-center gap-2">
                        <Medal size={12} /> Badge Ouro
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Coluna Direita */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                
              {/* Desafios Gamificados Grid */}
              <div className="bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-800 text-white flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white">Desafios Ativos</h3>
                  <button className="px-3 py-1 rounded-full border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800">Ver todos</button>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                        <Utensils size={18} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white block">30 Dias sem Delivery</span>
                        <span className="text-xs text-slate-400">Economia est.: R$ 300</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300">Progresso</span>
                      <span className="font-medium text-blue-400">15/30 Dias</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden flex">
                      <div className="bg-blue-500 h-full rounded-l-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/30">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white block">Reserva de Emergência</span>
                        <span className="text-xs text-slate-400">Aporte mensal constante</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300">Progresso</span>
                      <span className="font-medium text-green-400">R$ 25k / R$ 30k</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden flex">
                      <div className="bg-green-500 h-full rounded-l-full" style={{ width: '83%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Painel Vinculação Hábitos */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Hábitos & Produtividade</h3>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <BookOpen size={14} />
                      </div>
                      <span className="text-sm font-medium text-slate-900">Leitura (30 min)</span>
                    </div>
                    <button className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                      <Check size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
                        <Dumbbell size={14} />
                      </div>
                      <span className="text-sm font-medium text-slate-900">Exercício</span>
                    </div>
                    <button className="w-6 h-6 rounded-md border border-slate-300 text-slate-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-colors">
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </main>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 px-6 border-t border-slate-200 bg-white mt-auto z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>
            Ao continuar, você concorda com nossos <a href="#" className="text-blue-600 hover:underline">Termos de Serviço</a> e <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium"><ShieldCheck size={14} className="text-emerald-600" /> Privacidade Garantida</span>
            <a href="#" className="hover:text-slate-800 transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Metas;
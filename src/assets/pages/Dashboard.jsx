import React, { useMemo, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Layers, Globe, ChevronDown, Moon, LayoutGrid, Wallet, 
  FileText, RotateCcw, HandCoins, TrendingUp, Target, 
  BatteryMedium, Zap, Brain, Bell, History, User, 
  Plus, Ellipsis, TriangleAlert, Droplets, PiggyBank, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- DADOS CONGELADOS ---
const CHART_DATA = Object.freeze([
  { name: '01', receitas: 1000, despesas: 500 },
  { name: '05', receitas: 1500, despesas: 800 },
  { name: '10', receitas: 1200, despesas: 1500 },
  { name: '15', receitas: 3000, despesas: 1600 },
  { name: '20', receitas: 3200, despesas: 2100 },
  { name: '25', receitas: 3100, despesas: 2500 },
  { name: '30', receitas: 4500, despesas: 2800 },
]);

// --- ESTRUTURA DO MENU COM PATHS (ROTAS) ---
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

// --- SUB-COMPONENTES OTIMIZADOS ---

const SidebarItem = memo(({ item, currentPath, onClick, showDivider }) => {
  const isActive = currentPath === item.path;

  return (
    <React.Fragment>
      {showDivider && <div className="my-2 border-t border-slate-200/50" />}
      <button 
        onClick={() => onClick(item.path)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
          isActive ? 'bg-[#eff6ff] text-[#2563eb]' : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        <item.icon size={18} className={isActive ? 'text-[#2563eb]' : 'text-slate-400'} />
        {item.name}
      </button>
    </React.Fragment>
  );
});

const StatCard = memo(({ title, value, icon: Icon, trend, badge, subtext, color }) => {
  const colorStyles = {
    blue: "bg-blue-50 text-[#2563eb]",
    red: "bg-red-50 text-red-500",
    yellow: "bg-yellow-50 text-yellow-500",
    green: "bg-green-50 text-green-500"
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${colorStyles[color]}`}>
          <Icon size={18} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <TrendingUp size={12} className="text-green-500" /> {trend}
          </span>
        )}
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color === 'red' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
            {badge}
          </span>
        )}
      </div>
      <span className="text-sm text-slate-500 font-medium">{title}</span>
      <div className="flex items-end gap-2 mt-1">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {subtext && <span className="text-sm text-emerald-500 font-medium mb-1">{subtext}</span>}
      </div>
    </div>
  );
});

const AlertTile = memo(({ title, desc, icon: Icon, color }) => {
  const colorStyles = {
    red: "bg-red-50 text-red-500",
    blue: "bg-blue-50 text-blue-500",
    green: "bg-green-50 text-green-500"
  };

  return (
    <div className="flex gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-slate-200 transition-colors cursor-pointer">
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${colorStyles[color]}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
});

// --- COMPONENTE PRINCIPAL ---

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const ChartSection = useMemo(() => (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={CHART_DATA}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.5)" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
          <Area type="monotone" name="Receitas" dataKey="receitas" stroke="#10B981" strokeWidth={3} fill="transparent" isAnimationActive={false} />
          <Area type="monotone" name="Despesas" dataKey="despesas" stroke="#EF4444" strokeWidth={3} fill="transparent" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  ), []);

  return (
    <div className="antialiased text-slate-900 font-sans min-h-screen flex flex-col relative overflow-x-hidden" 
         style={{ background: 'radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 50%, #f1f5f9 100%)' }}>
      
      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 lg:px-12 lg:py-6 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Layers size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight">LifeOS</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#e2e8f0] text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">
            <Globe size={14} className="text-slate-400" />
            <span>PT-BR</span>
            <ChevronDown size={12} className="ml-1 text-slate-400" />
          </div>
          <button className="w-9 h-9 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
            <Moon size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 w-full max-w-[1440px] mx-auto px-4 lg:px-8 pb-8 gap-6 relative z-10">
        
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/50 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
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
                currentPath={currentPath}
                onClick={navigate}
                showDivider={index > 0 && MENU_ITEMS[index-1].section !== item.section}
              />
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Boa tarde, Ana</h1>
              <p className="text-sm text-slate-500 mt-1">Aqui está o resumo da sua vida financeira e rotina hoje.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                {['Hoje', '7 Dias', 'Mês'].map(t => (
                  <button key={t} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${t === 'Hoje' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>{t}</button>
                ))}
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors">
                <Plus size={16} /> Novo Registro
              </button>
            </div>
          </div>

          {/* Grid de Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Saldo Atual" value="R$ 14.250,00" icon={Wallet} trend="+2.4%" color="blue" />
            <StatCard title="A Vencer (7 dias)" value="R$ 1.840,50" icon={FileText} badge="Hoje" color="red" />
            <StatCard title="Energia Hoje" value="85%" icon={Zap} subtext="Ótimo" color="yellow" />
            <StatCard title="Produtividade" value="Alta" icon={CheckCircle2} badge="3/5 Tarefas" color="green" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Gráfico */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-semibold text-slate-800">Fluxo do Mês</h3>
                <button className="text-slate-400 hover:text-slate-600"><Ellipsis size={20} /></button>
              </div>
              {ChartSection}
            </div>

            {/* Lista de Alertas */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-semibold text-slate-800">Alertas do Dia</h3>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">3</span>
              </div>
              <div className="flex flex-col gap-4">
                <AlertTile title="Fatura Cartão Nubank" desc="Vence hoje • R$ 1.250,00" icon={TriangleAlert} color="red" />
                <AlertTile title="Beber Água" desc="Você está 400ml abaixo da meta." icon={Droplets} color="blue" />
                <AlertTile title="Reserva de Emergência" desc="Sugestão: Guardar R$ 200 hoje." icon={PiggyBank} color="green" />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 px-6 border-t border-slate-200 bg-white mt-auto z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>Ao continuar, concordas com os nossos <a href="#" className="text-[#2563eb] hover:underline">Termos</a> e <a href="#" className="text-[#2563eb] hover:underline">Privacidade</a>.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium"><ShieldCheck size={14} className="text-emerald-500" /> Privacidade Garantida</span>
            <a href="#" className="hover:text-slate-800 transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
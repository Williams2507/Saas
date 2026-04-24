import React, { useState, useMemo, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Layers, Globe, ChevronDown, Moon, LayoutGrid, Wallet, 
  FileText, RotateCcw, HandCoins, TrendingUp, Target, 
  BatteryMedium, Zap, Brain, Bell, History, User, 
  Search, Plus, ChevronRight, Lightbulb, Calendar, 
  ArrowUpCircle, Clock, Play, Music, Activity, Cloud, 
  Ellipsis, ShieldCheck
} from 'lucide-react';
// IMPORTANTE: Precisa ter rodado 'npm install recharts'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- DADOS DO GRÁFICO (Evolução de Gastos) ---
const CHART_DATA = [
  { name: 'Nov', value: 650 },
  { name: 'Dez', value: 680 },
  { name: 'Jan', value: 720 },
  { name: 'Fev', value: 710 },
  { name: 'Mar', value: 750 },
  { name: 'Abr', value: 845.90 },
];

const INITIAL_SUBSCRIPTIONS = [
  {
    id: 1,
    name: "Netflix",
    plan: "Plano Standard (Mensal)",
    category: "Entretenimento",
    date: "18 Abr 2026",
    daysLeft: "Em 3 dias",
    price: 39.90,
    usage: "Alto",
    icon: Play,
    colorClass: "bg-red-50 text-red-600 border-red-200",
    rowClass: ""
  },
  {
    id: 2,
    name: "Spotify",
    plan: "Plano Duo (Mensal)",
    category: "Entretenimento",
    date: "22 Abr 2026",
    daysLeft: "Em 7 dias",
    price: 27.90,
    usage: "Alto",
    icon: Music,
    colorClass: "bg-green-50 text-green-600 border-green-200",
    rowClass: ""
  },
  {
    id: 3,
    name: "Gympass",
    plan: "Plano Silver (Mensal)",
    category: "Saúde",
    date: "05 Mai 2026",
    daysLeft: "Em 20 dias",
    price: 119.90,
    usage: "Baixo",
    icon: Activity,
    colorClass: "bg-slate-100 text-slate-600 border-slate-200",
    rowClass: "bg-red-50/50" // Destacado em vermelho
  },
  {
    id: 4,
    name: "Dropbox",
    plan: "Plus 2TB (Anual)",
    category: "Software",
    date: "12 Nov 2026",
    daysLeft: "Em 7 meses",
    price: 599.00,
    monthlyEquiv: "Equiv. R$ 49,91/mês",
    usage: "Médio",
    icon: Cloud,
    colorClass: "bg-blue-50 text-blue-600 border-blue-200",
    rowClass: ""
  }
];

const MENU_ITEMS = [
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
];

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

const UsageBadge = memo(({ usage }) => {
  let colorStyles = "";
  let dotClass = "";
  
  if (usage === 'Alto') {
    colorStyles = "bg-green-50 text-green-700 border-green-200";
    dotClass = "bg-green-500";
  } else if (usage === 'Médio') {
    colorStyles = "bg-yellow-50 text-yellow-700 border-yellow-200";
    dotClass = "bg-yellow-500";
  } else {
    colorStyles = "bg-red-50 text-red-700 border-red-200";
    dotClass = "bg-red-500";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorStyles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span> {usage}
    </span>
  );
});

const Assinaturas = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [filter, setFilter] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubscriptions = useMemo(() => {
    return INITIAL_SUBSCRIPTIONS.filter(sub => {
      const matchesFilter = filter === 'Todas' || sub.category === filter;
      const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  return (
    <div className="antialiased text-slate-900 font-sans min-h-screen flex flex-col" 
         style={{ background: 'radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 50%, #f1f5f9 100%)' }}>
      
      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 lg:px-12 lg:py-6 z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Layers size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight">LifeOS</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50">
            <Globe size={14} className="text-slate-400" />
            <span>PT-BR</span>
            <ChevronDown size={12} className="ml-1 text-slate-400" />
          </div>
          <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-50">
            <Moon size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 w-full max-w-[1440px] mx-auto px-4 lg:px-8 pb-8 gap-6">
        
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
                currentPath={location.pathname}
                onClick={navigate}
                showDivider={index > 0 && MENU_ITEMS[index-1].section !== item.section}
              />
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Gestão de Assinaturas</h1>
              <p className="text-sm text-slate-500 mt-1">Controle de serviços recorrentes, uso percebido e otimização de gastos.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar assinatura..." 
                  className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors whitespace-nowrap">
                <Plus size={16} /> Nova Assinatura
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            
            {/* Esquerda: Métricas e Gráfico */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Gasto Mensal</h3>
                  </div>
                  <span className="text-3xl font-bold text-slate-900 mt-1">R$ 845,90</span>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-red-50 text-red-600 border border-red-100">
                      <TrendingUp size={10} /> +12% vs Mês Anterior
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Assinaturas Ativas</h3>
                  </div>
                  <span className="text-3xl font-bold text-slate-900 mt-1">14</span>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-500">3 categorias principais</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Potencial de Economia</h3>
                  </div>
                  <span className="text-3xl font-bold text-green-600 mt-1">R$ 120,00</span>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-green-50 text-green-600 border border-green-100">
                      <Lightbulb size={10} /> 2 Recomendações
                    </span>
                  </div>
                </div>
              </div>

              {/* GRÁFICO AQUI */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Evolução de Gastos</h3>
                    <p className="text-xs text-slate-500 mt-1">Acompanhe a variação do seu custo fixo com assinaturas.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100">
                    <Calendar size={14} />
                    <span>Últimos 6 Meses</span>
                    <ChevronDown size={14} />
                  </div>
                </div>
                
                {/* Contêiner Forçado para o Gráfico */}
                <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `R$ ${val}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} 
                        formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Gasto Mensal']}
                      />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

              </div>
            </div>

            {/* Direita: Alertas */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Atenção Necessária</h3>
                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center">3</span>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-xl border border-red-100 bg-red-50 flex gap-3">
                    <div className="mt-0.5 text-red-500"><ArrowUpCircle size={18} /></div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Aumento de Preço</h4>
                      <p className="text-xs text-slate-600 mt-1">A assinatura do <strong>Netflix</strong> subirá de R$ 39,90 para R$ 44,90 no próximo mês.</p>
                      <div className="mt-3 flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Renegociar</button>
                        <button className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200">Avaliar Cancelamento</button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-yellow-100 bg-yellow-50 flex gap-3">
                    <div className="mt-0.5 text-yellow-500"><BatteryMedium size={18} /></div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Baixo Uso Percebido</h4>
                      <p className="text-xs text-slate-600 mt-1">Você não acessa o <strong>Gympass</strong> há 45 dias. Deseja pausar?</p>
                      <div className="mt-3 flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Pausar (30 dias)</button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50 flex gap-3">
                    <div className="mt-0.5 text-blue-500"><Clock size={18} /></div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Renovação Anual Próxima</h4>
                      <p className="text-xs text-slate-600 mt-1">O <strong>Amazon Prime</strong> será renovado automaticamente em 5 dias (R$ 119,00).</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Assinaturas */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-lg font-semibold text-slate-900">Suas Assinaturas</h3>
              <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
                {['Todas', 'Entretenimento', 'Software', 'Saúde'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      filter === f ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Serviço</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4">Próximo Débito</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4 text-center">Uso Percebido</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map(sub => {
                    const Icon = sub.icon;
                    return (
                      <tr key={sub.id} className={`hover:bg-slate-50 transition-colors group border-b border-slate-100 ${sub.rowClass}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${sub.colorClass}`}>
                              <Icon size={18} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{sub.name}</p>
                              <p className="text-xs text-slate-500">{sub.plan}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">{sub.category}</td>
                        <td className="px-6 py-4">
                          <p className="text-slate-900 text-sm">{sub.date}</p>
                          <p className={`text-xs font-medium ${sub.daysLeft.includes('dias') && parseInt(sub.daysLeft.replace(/\D/g, '')) <= 5 ? 'text-blue-600' : 'text-slate-500'}`}>
                            {sub.daysLeft}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 text-sm">
                            R$ {sub.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          {sub.monthlyEquiv && <p className="text-xs text-slate-500">{sub.monthlyEquiv}</p>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <UsageBadge usage={sub.usage} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                            <Ellipsis size={18} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredSubscriptions.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                        Nenhuma assinatura encontrada para esta busca/filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <footer className="w-full py-6 px-6 border-t border-slate-200 bg-white mt-auto z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p>© 2026 LifeOS. Seus dados estão seguros e criptografados.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-emerald-600"><ShieldCheck size={14} /> Privacidade Ativa</span>
            <span className="cursor-pointer hover:text-blue-600 transition-colors">Termos</span>
            <span className="cursor-pointer hover:text-blue-600 transition-colors">Suporte</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Assinaturas;
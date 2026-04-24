import React, { useState, useMemo, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Layers, Globe, ChevronDown, Moon, LayoutGrid, Wallet, 
  FileText, RotateCcw, HandCoins, TrendingUp, Target, 
  BatteryMedium, Zap, Brain, Bell, History, User, 
  Search, Plus, Upload, ArrowUp, Calendar, Minus, 
  ArrowRightLeft, CircleDollarSign, PiggyBank, 
  TrendingDown, Filter, Ellipsis, ShieldCheck
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip
} from 'recharts';

// --- DADOS CONGELADOS (Performance Máxima) ---
const PERF_DATA = Object.freeze([
  { name: 'Jan', carteira: 100, cdi: 100 },
  { name: 'Fev', carteira: 102, cdi: 101 },
  { name: 'Mar', carteira: 105, cdi: 103 },
  { name: 'Abr', carteira: 104, cdi: 103.5 },
  { name: 'Mai', carteira: 108, cdi: 105 },
  { name: 'Jun', carteira: 110, cdi: 106 },
  { name: 'Jul', carteira: 112, cdi: 107 },
  { name: 'Ago', carteira: 111, cdi: 108 },
  { name: 'Set', carteira: 115, cdi: 109 },
  { name: 'Out', carteira: 118, cdi: 110 },
  { name: 'Nov', carteira: 122, cdi: 111 },
  { name: 'Dez', carteira: 125, cdi: 112 },
]);

const ALLOC_DATA = Object.freeze([
  { name: 'Renda Fixa', value: 52.4, color: '#3b82f6' },
  { name: 'Ações (BR)', value: 24.1, color: '#a855f7' },
  { name: 'FIIs', value: 15.5, color: '#fb923c' },
  { name: 'Internacional', value: 8.0, color: '#22c55e' },
]);

const INITIAL_ASSETS = Object.freeze([
  {
    id: 1,
    code: 'RF',
    codeBg: 'bg-blue-50 text-blue-600 border-blue-100',
    name: 'Tesouro IPCA+ 2035',
    sub: 'Rico Corretora',
    cat: 'Renda Fixa',
    amount: 'R$ 25.000,00',
    avgPrice: '-',
    currentPrice: '-',
    balance: 'R$ 28.450,20',
    rent: '+13,8%',
    isUp: true
  },
  {
    id: 2,
    code: 'EQ',
    codeBg: 'bg-purple-50 text-purple-600 border-purple-100',
    name: 'WEGE3',
    sub: 'Ações Brasil',
    cat: 'Ações',
    amount: '200',
    avgPrice: 'R$ 34,50',
    currentPrice: 'R$ 38,50',
    balance: 'R$ 7.700,00',
    rent: '+11,5%',
    isUp: true
  },
  {
    id: 3,
    code: 'FI',
    codeBg: 'bg-orange-50 text-orange-600 border-orange-100',
    name: 'MXRF11',
    sub: 'Fundos Imobiliários',
    cat: 'FIIs',
    amount: '450',
    avgPrice: 'R$ 10,20',
    currentPrice: 'R$ 10,05',
    balance: 'R$ 4.522,50',
    rent: '-1,4%',
    isUp: false
  }
]);

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

const OperationItem = memo(({ icon: Icon, title, date, value, subtext, colorClass, isPositive }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm border ${colorClass}`}>
        <Icon size={16} />
      </div>
      <div>
        <span className="text-sm font-semibold text-slate-900 block">{title}</span>
        <span className="text-xs text-slate-500">{date}</span>
      </div>
    </div>
    <div className="text-right">
      <span className={`text-sm font-bold block ${isPositive ? 'text-green-600' : 'text-slate-900'}`}>{value}</span>
      <span className="text-xs text-slate-500">{subtext}</span>
    </div>
  </div>
));

const AssetRow = memo(({ asset }) => (
  <tr className="hover:bg-slate-50 transition-colors group">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${asset.codeBg}`}>
          {asset.code}
        </div>
        <div>
          <span className="font-medium text-slate-900 block">{asset.name}</span>
          <span className="text-[10px] text-slate-500">{asset.sub}</span>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 text-slate-600 text-sm">{asset.cat}</td>
    <td className="px-6 py-4 font-medium text-slate-900 text-sm">{asset.amount}</td>
    <td className="px-6 py-4 text-slate-600 text-sm">{asset.avgPrice}</td>
    <td className="px-6 py-4 text-slate-600 text-sm">{asset.currentPrice}</td>
    <td className="px-6 py-4 font-medium text-slate-900 text-sm">{asset.balance}</td>
    <td className="px-6 py-4">
      <span className={`inline-flex items-center gap-1 font-medium text-sm ${asset.isUp ? 'text-green-600' : 'text-red-500'}`}>
        {asset.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {asset.rent}
      </span>
    </td>
    <td className="px-6 py-4 text-right">
      <button className="text-slate-400 hover:text-blue-600 transition-colors">
        <Ellipsis size={18} />
      </button>
    </td>
  </tr>
));

// --- COMPONENTE PRINCIPAL ---

const Investimentos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  // Lógica de Busca Rápida
  const filteredAssets = useMemo(() => {
    return INITIAL_ASSETS.filter(asset => 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.cat.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Gráfico Memoizado de Performance
  const PerformanceChart = useMemo(() => (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={PERF_DATA} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
          <LineTooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} 
          />
          <Line type="monotone" dataKey="carteira" name="Minha Carteira" stroke="#2563eb" strokeWidth={3} dot={{r: 4}} isAnimationActive={false} />
          <Line type="monotone" dataKey="cdi" name="CDI" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  ), []);

  // Gráfico Memoizado de Alocação (Donut)
  const AllocationChart = useMemo(() => (
    <div className="relative w-full h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={ALLOC_DATA}
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            isAnimationActive={false}
            stroke="none"
          >
            {ALLOC_DATA.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <PieTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        </PieChart>
      </ResponsiveContainer>
      {/* Texto Centralizado Nativo */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xs text-slate-500 font-medium">Total</span>
        <span className="text-lg font-bold text-slate-900">R$ 142k</span>
      </div>
    </div>
  ), []);

  return (
    <div className="antialiased text-slate-900 font-sans min-h-screen flex flex-col" 
         style={{ background: 'radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 50%, #f1f5f9 100%)' }}>
      
      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 lg:px-12 z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Layers size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight">LifeOS</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50">
            <Globe size={14} className="text-slate-400" />
            <span>PT-BR</span>
            <ChevronDown size={12} className="text-slate-400" />
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
          
          {/* Top Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Investimentos</h1>
              <p className="text-sm text-slate-500 mt-1">Gestão de portfólio, rentabilidade e alocação de ativos.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
                <Upload size={16} /> Importar
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                <Plus size={16} /> Nova Operação
              </button>
            </div>
          </div>

          {/* Grid Layout Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            
            {/* Coluna Esquerda */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Patrimônio Total</h3>
                    <div className="px-2 py-1 rounded-md bg-green-50 text-green-600 text-xs font-medium flex items-center gap-1 border border-green-100">
                      <ArrowUp size={10} /> 12,4%
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-slate-900 mt-1">R$ 142.847,84</span>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>Rendimento (Mês):</span>
                    <span className="text-green-600 font-medium">+ R$ 2.450,00</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Rentabilidade (12m)</h3>
                    <div className="px-2 py-1 rounded-md bg-green-50 text-green-600 text-xs font-medium flex items-center gap-1 border border-green-100">
                      <ArrowUp size={10} /> 4,2%
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-slate-900 mt-1">16,8%</span>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>CDI Acumulado:</span>
                    <span className="text-slate-700 font-medium">11,2%</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Proventos (Ano)</h3>
                    <div className="p-1.5 rounded-md bg-slate-50 text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors">
                      <Calendar size={14} />
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-slate-900 mt-1">R$ 8.420,50</span>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>Yield (DY):</span>
                    <span className="text-blue-600 font-medium">6,2% a.a.</span>
                  </div>
                </div>
              </div>

              {/* Gráfico de Performance */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-slate-900">Rentabilidade vs Benchmark</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">1M</button>
                    <button className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">6M</button>
                    <button className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-medium">1A</button>
                    <button className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">TUDO</button>
                  </div>
                </div>
                {PerformanceChart}
              </div>

              {/* Metas e Rebalanceamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Objetivos */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-semibold text-slate-900">Objetivos</h3>
                    <button className="text-blue-600 hover:text-blue-700"><Plus size={16} /></button>
                  </div>
                  
                  <div className="flex flex-col gap-5">
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <div>
                          <span className="text-sm font-semibold text-slate-900 block">Independência Financeira</span>
                          <span class="text-xs text-slate-500">Meta: R$ 2.000.000,00</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">R$ 142.847,84</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-l-full" style={{ width: '7.1%' }}></div>
                        </div>
                        <span className="text-xs font-medium text-blue-600 w-8">7%</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <div>
                          <span className="text-sm font-semibold text-slate-900 block">Reserva de Emergência</span>
                          <span className="text-xs text-slate-500">Meta: R$ 30.000,00</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">R$ 25.000,00</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-green-500 h-full rounded-l-full" style={{ width: '83.3%' }}></div>
                        </div>
                        <span className="text-xs font-medium text-green-600 w-8">83%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rebalanceamento */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-semibold text-slate-900">Rebalanceamento</h3>
                    <button className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100">Sugerido</button>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">
                          <ArrowUp size={14} />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-900 block">Ações (Brasil)</span>
                          <span className="text-xs text-slate-500">Abaixo da meta (20%)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 block">+ R$ 2.500</span>
                        <span className="text-xs text-green-600 font-medium">Comprar</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs">
                          <Minus size={14} />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-900 block">Renda Fixa</span>
                          <span className="text-xs text-slate-500">Acima da meta (50%)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 block">- R$ 1.200</span>
                        <span className="text-xs text-slate-500 font-medium">Manter</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Alocação (Donut) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">Alocação de Ativos</h3>
                  <button className="text-slate-400 hover:text-slate-600"><Ellipsis size={18} /></button>
                </div>
                
                {AllocationChart}
                
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
                      <span className="text-slate-600">Renda Fixa</span>
                    </div>
                    <span className="font-semibold text-slate-900">52.4%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]"></span>
                      <span className="text-slate-600">Ações (BR)</span>
                    </div>
                    <span className="font-semibold text-slate-900">24.1%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#fb923c]"></span>
                      <span className="text-slate-600">FIIs</span>
                    </div>
                    <span className="font-semibold text-slate-900">15.5%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>
                      <span className="text-slate-600">Internacional</span>
                    </div>
                    <span className="font-semibold text-slate-900">8.0%</span>
                  </div>
                </div>
              </div>

              {/* Últimas Operações */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex-1 flex flex-col min-h-[300px]">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-semibold text-slate-900">Últimas Operações</h3>
                  <button className="px-3 py-1 rounded-full border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Ver todas</button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
                  <OperationItem 
                    icon={ArrowRightLeft} 
                    title="Compra WEGE3" 
                    date="15 Jul 2024 • Rico" 
                    value="- R$ 1.540,00" 
                    subtext="40 cotas" 
                    colorClass="bg-blue-50 text-blue-600 border-blue-100" 
                    isPositive={false} 
                  />
                  <OperationItem 
                    icon={CircleDollarSign} 
                    title="Dividendo MXRF11" 
                    date="14 Jul 2024 • NuInvest" 
                    value="+ R$ 45,60" 
                    subtext="Rendimento" 
                    colorClass="bg-green-50 text-green-600 border-green-100" 
                    isPositive={true} 
                  />
                  <OperationItem 
                    icon={PiggyBank} 
                    title="Aporte Tesouro IPCA" 
                    date="10 Jul 2024 • Rico" 
                    value="- R$ 3.000,00" 
                    subtext="Aporte" 
                    colorClass="bg-slate-100 text-slate-600 border-slate-200" 
                    isPositive={false} 
                  />
                  <OperationItem 
                    icon={CircleDollarSign} 
                    title="JCP ITSA4" 
                    date="05 Jul 2024 • NuInvest" 
                    value="+ R$ 28,40" 
                    subtext="Rendimento" 
                    colorClass="bg-green-50 text-green-600 border-green-100" 
                    isPositive={true} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Posição Atual */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-lg font-semibold text-slate-900">Posição Atual</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar ativo..." 
                    className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-48 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <Filter size={14} /> Filtros
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Ativo / Produto</th>
                    <th className="px-6 py-4 font-medium">Categoria</th>
                    <th className="px-6 py-4 font-medium">Qtd / Valor Apl.</th>
                    <th className="px-6 py-4 font-medium">Preço Médio</th>
                    <th className="px-6 py-4 font-medium">Preço Atual</th>
                    <th className="px-6 py-4 font-medium">Saldo Bruto</th>
                    <th className="px-6 py-4 font-medium">Rentabilidade</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssets.map(asset => (
                    <AssetRow key={asset.id} asset={asset} />
                  ))}
                  {filteredAssets.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                        Nenhum ativo encontrado para "{searchTerm}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 px-6 border-t border-slate-200 bg-white mt-auto z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p>Ao continuar, concorda com os nossos <a href="#" className="text-blue-600 hover:underline">Termos de Serviço</a> e <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-emerald-600"><ShieldCheck size={14} /> Privacidade Garantida</span>
            <span className="cursor-pointer hover:text-blue-600 transition-colors">Suporte</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Investimentos;
import React, { useState, useMemo, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Layers, Globe, ChevronDown, Moon, LayoutGrid, Wallet, 
  FileText, RotateCcw, HandCoins, TrendingUp, Target, 
  BatteryMedium, Zap, Brain, Bell, History, User, 
  Search, Plus, Ellipsis, ArrowRight, Calculator, 
  CreditCard, Landmark, Filter, MoreVertical, ShieldCheck
} from 'lucide-react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- DADOS CONGELADOS (Performance Máxima) ---
const CHART_DATA = Object.freeze([
  { name: 'Jan', avalanche: 14520, minimo: 14520 },
  { name: 'Fev', avalanche: 13200, minimo: 13500 },
  { name: 'Mar', avalanche: 11800, minimo: 12500 },
  { name: 'Abr', avalanche: 10500, minimo: 11500 },
  { name: 'Mai', avalanche: 9200,  minimo: 10500 },
  { name: 'Jun', avalanche: 8000,  minimo: 9500 },
  { name: 'Jul', avalanche: 6800,  minimo: 8500 },
  { name: 'Ago', avalanche: 5600,  minimo: 7500 },
  { name: 'Set', avalanche: 4400,  minimo: 6500 },
  { name: 'Out', avalanche: 3200,  minimo: 5500 },
  { name: 'Nov', avalanche: 2000,  minimo: 4500 },
  { name: 'Dez', avalanche: 800,   minimo: 3500 },
]);

const INITIAL_DEBTS = Object.freeze([
  {
    id: 1,
    creditor: "Nubank",
    type: "Cartão de Crédito",
    balance: 5678.00,
    installment: 850.00,
    cet: "12,5% a.m.",
    status: "Atrasado",
    icon: CreditCard,
    iconColor: "text-purple-600 bg-purple-100",
    cetColor: "text-red-600 bg-red-50 border-red-100",
    statusColor: "text-yellow-700 bg-yellow-50 border-yellow-200",
    statusDot: "bg-yellow-500",
    hasSimulation: true
  },
  {
    id: 2,
    creditor: "Itaú",
    type: "Empréstimo Pessoal",
    balance: 8345.00,
    installment: 650.45,
    cet: "3,2% a.m.",
    status: "Em dia",
    icon: Landmark,
    iconColor: "text-orange-600 bg-orange-100",
    cetColor: "text-slate-600 bg-slate-100 border-slate-200",
    statusColor: "text-green-700 bg-green-50 border-green-200",
    statusDot: "bg-green-500",
    hasSimulation: false
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

const MetricCard = memo(({ title, value, linkText, linkColor }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <div className="p-1.5 rounded-md bg-slate-50 text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors">
        <Ellipsis size={16} />
      </div>
    </div>
    <span className={`text-3xl font-bold mt-1 ${title.includes('Juros') ? 'text-red-600' : 'text-slate-900'}`}>
      {value}
    </span>
    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
      <span className={`text-sm cursor-pointer font-medium hover:opacity-80 transition-opacity ${linkColor}`}>
        {linkText}
      </span>
      <ArrowRight size={14} className={linkColor} />
    </div>
  </div>
));

const ActiveDebtCard = memo(({ title, amount, cet, priority, priorityClass, progress, progressColor, progressBg, icon: Icon, iconBg }) => (
  <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${iconBg}`}>
          <Icon size={14} />
        </div>
        <span className="font-semibold text-slate-900">{title}</span>
      </div>
      <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={16} /></button>
    </div>
    <div className="mb-2">
      <span className="text-2xl font-bold text-slate-900">{amount}</span>
    </div>
    <div className="flex justify-between items-center text-xs text-slate-500 mb-3">
      <span>CET: {cet}</span>
      <span className={`font-medium ${priorityClass}`}>{priority}</span>
    </div>
    <div className="w-full bg-slate-200 rounded-full h-1.5">
      <div className={`${progressColor} h-1.5 rounded-full`} style={{ width: `${progress}%` }}></div>
    </div>
    <div className="mt-2 text-xs text-slate-500 text-right">{progress}% Pago</div>
  </div>
));

const DebtRow = memo(({ debt }) => {
  const Icon = debt.icon;
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${debt.iconColor}`}>
            <Icon size={16} />
          </div>
          <span className="font-medium text-slate-900">{debt.creditor}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-slate-600 text-sm">{debt.type}</td>
      <td className="px-6 py-4 font-medium text-slate-900 text-sm">
        R$ {debt.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </td>
      <td className="px-6 py-4 text-slate-600 text-sm">
        R$ {debt.installment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${debt.cetColor}`}>
          {debt.cet}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${debt.statusColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${debt.statusDot}`}></span> {debt.status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        {debt.hasSimulation && (
          <button className="text-blue-600 hover:text-blue-700 text-xs font-medium mr-3">Simular</button>
        )}
        <button className="text-slate-400 hover:text-slate-600"><Ellipsis size={18} /></button>
      </td>
    </tr>
  );
});

// --- COMPONENTE PRINCIPAL ---

const Dividas = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  // Lógica de Filtro Simples
  const filteredDebts = useMemo(() => {
    return INITIAL_DEBTS.filter(debt => 
      debt.creditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debt.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Gráfico memoizado (ComposedChart com Area e Line nativo do Recharts)
  const ChartSection = useMemo(() => (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAvalanche" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `R$ ${val/1000}k`} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} 
            formatter={(value, name) => [`R$ ${value.toLocaleString('pt-BR')}`, name]}
          />
          <Area 
            type="monotone" 
            dataKey="avalanche" 
            name="Efeito Avalanche"
            stroke="#10B981" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorAvalanche)" 
            isAnimationActive={false} 
          />
          <Line 
            type="monotone" 
            dataKey="minimo" 
            name="Pagamento Mínimo"
            stroke="#9CA3AF" 
            strokeDasharray="5 5" 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={false} 
          />
        </ComposedChart>
      </ResponsiveContainer>
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
              <h1 className="text-2xl font-bold text-slate-900">Gestão de Dívidas</h1>
              <p className="text-sm text-slate-500 mt-1">Controle estratégico para quitação e otimização de juros.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
                <Calculator size={16} /> Simulador
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                <Plus size={16} /> Nova Dívida
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            
            {/* Esquerda: Métricas e Gráfico */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Cards Superiores */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <MetricCard 
                  title="Saldo Devedor Total" 
                  value="R$ 14.520,32" 
                  linkText="Ver detalhes" 
                  linkColor="text-blue-600" 
                />
                <MetricCard 
                  title="Comprometimento Mensal" 
                  value="R$ 1.800,45" 
                  linkText="Ver resumo" 
                  linkColor="text-slate-600" 
                />
                <MetricCard 
                  title="Juros Estimados (Ano)" 
                  value="R$ 3.120,78" 
                  linkText="Analisar impacto" 
                  linkColor="text-slate-600" 
                />
              </div>

              {/* Gráfico de Projeção */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Projeção de Quitação</h3>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="strategy" className="text-blue-600 focus:ring-blue-500 w-4 h-4" defaultChecked />
                        <span className="text-sm text-slate-600">Efeito Avalanche (Maior Juros)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="strategy" className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                        <span className="text-sm text-slate-600">Bola de Neve (Menor Saldo)</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Mensal</button>
                    <button className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-sm font-medium">Anual</button>
                  </div>
                </div>
                {ChartSection}
              </div>
            </div>

            {/* Direita: Dívidas Ativas */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Dívidas Ativas</h3>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <Plus size={14} /> Adicionar
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <ActiveDebtCard 
                    title="Cartão Nubank"
                    amount="R$ 5.678,00"
                    cet="12,5% a.m."
                    priority="Prioridade Alta"
                    priorityClass="text-red-600"
                    progress={25}
                    progressColor="bg-red-500"
                    icon={CreditCard}
                    iconBg="bg-red-100 text-red-600"
                  />
                  <ActiveDebtCard 
                    title="Empréstimo Itaú"
                    amount="R$ 8.345,00"
                    cet="3,2% a.m."
                    priority="Em dia"
                    priorityClass="text-blue-600"
                    progress={60}
                    progressColor="bg-blue-500"
                    icon={Landmark}
                    iconBg="bg-blue-100 text-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Inventário */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-lg font-semibold text-slate-900">Inventário de Dívidas</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-48 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  <Filter size={14} /> Filtros
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-medium flex items-center gap-2 cursor-pointer hover:text-slate-700">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                      Credor
                    </th>
                    <th className="px-6 py-4 font-medium">Tipo</th>
                    <th className="px-6 py-4 font-medium">Saldo Atual</th>
                    <th className="px-6 py-4 font-medium">Parcela</th>
                    <th className="px-6 py-4 font-medium">CET</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDebts.map(debt => (
                    <DebtRow key={debt.id} debt={debt} />
                  ))}
                  {filteredDebts.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                        Nenhuma dívida encontrada.
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

export default Dividas;
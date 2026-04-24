import React, { useMemo, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Layers, Globe, ChevronDown, Moon, LayoutGrid, Wallet, 
  FileText, RotateCcw, HandCoins, TrendingUp, Target, 
  BatteryMedium, Zap, Brain, Bell, History, User, 
  Plus, Ellipsis, ArrowDown, ArrowUp, ArrowRight, RotateCw, // <-- Corrigido aqui (RotateCw)
  Search, ListFilter, MoreVertical, ShieldCheck, 
  Monitor, Send, DollarSign 
} from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- DADOS CONGELADOS (Performance Máxima) ---
const CHART_DATA = Object.freeze([
  { name: 'Jan', value: 30000 },
  { name: 'Fev', value: 25000 },
  { name: 'Mar', value: 45000, active: true },
  { name: 'Abr', value: 32000 },
  { name: 'Mai', value: 38000 },
  { name: 'Jun', value: 22000 },
  { name: 'Jul', value: 28000 },
]);

const ACCOUNTS_DATA = Object.freeze([
  { id: 1, name: 'Nubank', balance: 'R$ 12.678,00', type: 'Corrente', status: 'Ativa', color: 'purple', initials: 'NU' },
  { id: 2, name: 'Itaú', balance: 'R$ 5.345,00', type: 'Poupança', status: 'Ativa', color: 'yellow', initials: 'IT' },
]);

const TRANSACTIONS_DATA = Object.freeze([
  { id: 1, title: 'Assinatura Software', category: 'Software', tag: 'Sugestão', account: 'Nubank', date: '17 Abr, 2026', time: '03:45 PM', amount: 'R$ 145,00', status: 'Concluído', isIncome: false, icon: Monitor, color: 'blue' },
  { id: 2, title: 'Passagem Aérea', category: 'Viagem', account: 'Itaú', date: '15 Abr, 2026', time: '11:30 AM', amount: 'R$ 1.250,00', status: 'Pendente', isIncome: false, icon: Send, color: 'orange' },
  { id: 3, title: 'Salário Tech Corp', category: 'Renda Fixa', account: 'Itaú', date: '05 Abr, 2026', time: '09:00 AM', amount: '+ R$ 12.500,00', status: 'Concluído', isIncome: true, icon: DollarSign, color: 'green' },
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
          isActive ? 'bg-[#eff6ff] text-[#2563eb]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <MenuIcon size={18} className={isActive ? 'text-[#2563eb]' : 'text-slate-400'} />
        {item.name}
      </button>
    </React.Fragment>
  );
});

const FinanceCard = memo(({ title, subtitle, value, icon: Icon, trend, trendUp, linkText, color }) => {
  const isBlue = color === 'blue';
  
  if (isBlue) {
    return (
      <div className="rounded-2xl p-6 shadow-sm border border-blue-800 flex flex-col bg-[#1e3a8a] text-white relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Icon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-100">{title}</h3>
              <p className="text-xs text-blue-200">{subtitle}</p>
            </div>
          </div>
          <button className="text-white/70 hover:text-white"><Ellipsis size={20} /></button>
        </div>
        <div className="flex items-end gap-3 mt-2 relative z-10">
          <span className="text-3xl font-bold">{value}</span>
          <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full text-white mb-1 flex items-center gap-1">
            {trend} <ArrowUp size={10} />
          </span>
        </div>
        <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center text-sm font-medium text-blue-100 hover:text-white cursor-pointer relative z-10 transition-colors">
          {linkText} <ArrowRight size={14} />
        </div>
      </div>
    );
  }

  const colorStyles = color === 'green' 
    ? { bg: 'bg-green-50', text: 'text-green-600', border: 'border-slate-100' }
    : { bg: 'bg-red-50', text: 'text-red-600', border: 'border-slate-100' };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${colorStyles.bg} flex items-center justify-center ${colorStyles.text}`}>
            <Icon size={18} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600"><Ellipsis size={20} /></button>
      </div>
      <div className="flex items-end gap-3 mt-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        <span className={`text-xs font-medium ${colorStyles.bg} px-2 py-1 rounded-full ${colorStyles.text} mb-1 flex items-center gap-1`}>
          {trend} {trendUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
        </span>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-medium text-slate-500 hover:text-slate-800 cursor-pointer transition-colors">
        {linkText} <ArrowRight size={14} />
      </div>
    </div>
  );
});

const AccountItem = memo(({ account }) => {
  const bgColors = { purple: 'bg-purple-100 text-purple-600', yellow: 'bg-yellow-100 text-yellow-600' };
  
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${bgColors[account.color]}`}>
            {account.initials}
          </div>
          <span className="text-sm font-semibold text-slate-800">{account.name}</span>
        </div>
        <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={16} /></button>
      </div>
      <span className="text-lg font-bold text-slate-900">{account.balance}</span>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{account.status}</span>
        <span className="text-[10px] text-slate-500">{account.type}</span>
      </div>
    </div>
  );
});

const TransactionRow = memo(({ tx }) => {
  const iconColors = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-500',
    green: 'bg-green-50 text-green-600'
  };

  const statusColors = tx.status === 'Concluído' 
    ? 'bg-green-50 text-green-700' 
    : 'bg-yellow-50 text-yellow-700';

  const TxIcon = tx.icon; 

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">
        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColors[tx.color]}`}>
            <TxIcon size={14} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{tx.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500">{tx.category}</span>
              {tx.tag && (
                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                   <Zap size={10} /> {tx.tag}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-slate-600">{tx.account}</span>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-slate-800">{tx.date}</p>
        <p className="text-xs text-slate-500">{tx.time}</p>
      </td>
      <td className="px-6 py-4">
        <span className={`text-sm font-medium ${tx.isIncome ? 'text-green-600' : 'text-slate-900'}`}>
          {tx.amount}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Concluído' ? 'bg-green-500' : 'bg-yellow-500'}`}></span> {tx.status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <Ellipsis size={18} />
        </button>
      </td>
    </tr>
  );
});

// --- COMPONENTE PRINCIPAL ---

const Dinheiro = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Gráfico de Barras Memoizado (Sem Lag)
  const ChartSection = useMemo(() => (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={0}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="transparent" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(v) => `${v/1000}k`} tickCount={6} domain={[0, 50000]} />
          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']} />
          <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={36} isAnimationActive={false}>
            {CHART_DATA.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.active ? '#1e3a8a' : '#dcfce7'} />
            ))}
          </Bar>
        </BarChart>
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#e2e8f0] text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
            <Globe size={14} className="text-slate-400" />
            <span>PT-BR</span>
            <ChevronDown size={12} className="ml-1 text-slate-400" />
          </div>
          <button className="w-9 h-9 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
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

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          
          {/* Top Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dinheiro</h1>
              <p className="text-sm text-slate-500 mt-1">Gerencie suas entradas, saídas e fluxo de caixa.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 text-slate-800">Este Mês</button>
                <button className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 hover:text-slate-800">Mês Passado</button>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                <RotateCw size={16} /> {/* <-- Atualizado aqui também */}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors">
                <Plus size={16} /> Nova Transação
              </button>
            </div>
          </div>

          {/* Cards Financeiros (3 Colunas) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <FinanceCard title="Saldo Atual" subtitle="Visão Geral & Gastos" value="R$ 20.520,32" icon={Wallet} trend="+1.5%" trendUp={true} linkText="Ver detalhes" color="blue" />
            <FinanceCard title="Entradas" subtitle="Receitas do Mês" value="R$ 15.800,45" icon={ArrowDown} trend="+3.2%" trendUp={true} linkText="Ver resumo" color="green" />
            <FinanceCard title="Saídas" subtitle="Despesas do Mês" value="R$ 8.120,78" icon={ArrowUp} trend="-4.7%" trendUp={false} linkText="Analisar gastos" color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Contas Widget */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Minhas Contas</h3>
                  <p className="text-xs text-slate-500 mt-1">Saldos atualizados</p>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors">
                  <Plus size={14} /> Adicionar
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {ACCOUNTS_DATA.map(acc => (
                  <AccountItem key={acc.id} account={acc} />
                ))}
              </div>
            </div>

            {/* Fluxo de Caixa Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Fluxo de Caixa</h3>
                  <p className="text-2xl font-bold text-slate-900 mt-1">R$ 14.323,44</p>
                </div>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button className="px-4 py-1.5 text-xs font-medium rounded-md text-slate-600 hover:text-slate-800">Mensal</button>
                  <button className="px-4 py-1.5 text-xs font-medium rounded-md bg-[#1e3a8a] text-white shadow-sm">Anual</button>
                </div>
              </div>
              {ChartSection}
            </div>
          </div>

          {/* Lista de Transações (Tabela) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-8 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-base font-semibold text-slate-800">Atividades Recentes</h3>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Buscar transações..." className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                  Filtros <ListFilter size={14} />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-10">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Atividade</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Conta</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data & Hora</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TRANSACTIONS_DATA.map(tx => (
                    <TransactionRow key={tx.id} tx={tx} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 px-6 border-t border-slate-200 bg-white mt-auto z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>Ao continuar, você concorda com nossos <a href="#" className="text-[#2563eb] hover:underline">Termos de Serviço</a> e <a href="#" className="text-[#2563eb] hover:underline">Política de Privacidade</a>.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium"><ShieldCheck size={14} className="text-emerald-500" /> Privacidade Garantida</span>
            <a href="#" className="hover:text-slate-800 transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dinheiro;
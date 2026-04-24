import React, { useEffect, useState, useMemo, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layers,
  ChevronDown,
  LayoutGrid,
  Wallet,
  FileText,
  RotateCcw,
  HandCoins,
  TrendingUp,
  TrendingDown,
  Plus,
  Ellipsis,
  X,
  LogOut,
  Loader2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

// --- UTILITÁRIOS ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0));
};

const getDaysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

const getDemoTransactions = (userId) => {
  const now = new Date();

  const createDate = (daysAgo, hour = 12) => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  };

  return [
    {
      user_id: userId,
      type: 'receita',
      value: 5200,
      description: 'Salário mensal',
      created_at: createDate(18, 9)
    },
    {
      user_id: userId,
      type: 'receita',
      value: 850,
      description: 'Projeto freelancer',
      created_at: createDate(9, 15)
    },
    {
      user_id: userId,
      type: 'receita',
      value: 320,
      description: 'Venda de item usado',
      created_at: createDate(2, 18)
    },
    {
      user_id: userId,
      type: 'receita',
      value: 150,
      description: 'Reembolso',
      created_at: createDate(0, 10)
    },
    {
      user_id: userId,
      type: 'despesa',
      value: 1650,
      description: 'Aluguel',
      created_at: createDate(15, 8)
    },
    {
      user_id: userId,
      type: 'despesa',
      value: 430,
      description: 'Mercado',
      created_at: createDate(7, 19)
    },
    {
      user_id: userId,
      type: 'despesa',
      value: 189.9,
      description: 'Conta de luz',
      created_at: createDate(5, 14)
    },
    {
      user_id: userId,
      type: 'despesa',
      value: 79.9,
      description: 'Streaming',
      created_at: createDate(3, 20)
    },
    {
      user_id: userId,
      type: 'despesa',
      value: 120,
      description: 'Transporte',
      created_at: createDate(1, 9)
    },
    {
      user_id: userId,
      type: 'despesa',
      value: 65,
      description: 'Almoço',
      created_at: createDate(0, 13)
    }
  ];
};

const MENU_ITEMS = [
  { name: 'Painel Unificado', path: '/dashboard', icon: LayoutGrid, section: 1 },
  { name: 'Dinheiro', path: '/dinheiro', icon: Wallet, section: 1 },
  { name: 'Contas & Boletos', path: '/contas', icon: FileText, section: 1 },
  { name: 'Assinaturas', path: '/assinaturas', icon: RotateCcw, section: 1 },
  { name: 'Dívidas', path: '/dividas', icon: HandCoins, section: 1 },
  { name: 'Investimentos', path: '/investimentos', icon: TrendingUp, section: 1 }
];

// --- COMPONENTES MENORES ---
const SidebarItem = memo(({ item, currentPath, onClick, showDivider }) => {
  const isActive =
    currentPath === item.path ||
    (currentPath === '/' && item.path === '/dashboard');

  return (
    <>
      {showDivider && <div className="my-2 border-t border-slate-200/50" />}

      <button
        type="button"
        onClick={() => onClick(item.path)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
          isActive
            ? 'bg-[#eff6ff] text-[#2563eb]'
            : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        <item.icon
          size={18}
          className={isActive ? 'text-[#2563eb]' : 'text-slate-400'}
        />
        {item.name}
      </button>
    </>
  );
});

const StatCard = memo(({ title, value, icon: Icon, color }) => {
  const colorStyles = {
    blue: 'bg-blue-50 text-[#2563eb]',
    red: 'bg-red-50 text-red-500',
    green: 'bg-green-50 text-green-500',
    slate: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${colorStyles[color]}`}
        >
          <Icon size={18} />
        </div>
      </div>

      <span className="text-sm text-slate-500 font-medium">{title}</span>

      <div className="flex items-end gap-2 mt-1">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
      </div>
    </div>
  );
});

// --- COMPONENTE PRINCIPAL ---
const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, sessionLoading } = useAuth();
  const [transactions, setTransactions] = useState(() =>
    getDemoTransactions('preview-user').map((item, index) => ({
      id: `preview-${index}`,
      type: item.type,
      value: Number(item.value),
      desc: item.description,
      date: new Date(item.created_at)
    }))
  );
  const [timeFilter, setTimeFilter] = useState('Mês');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    type: 'despesa',
    value: '',
    desc: ''
  });

  const normalizeTransactions = (items) => {
    return (items || []).map((item) => ({
      id: item.id,
      type: item.type,
      value: Number(item.value),
      desc: item.description,
      date: new Date(item.created_at)
    }));
  };

  useEffect(() => {
    if (sessionLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      setLoadingData(true);
      setError('');
      await fetchTransactions(user);
      setLoadingData(false);
    };

    loadData();
  }, [sessionLoading, user, navigate]);

  const fetchTransactions = async (currentUser = user) => {
    if (!currentUser) return;

    const { data, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (transactionsError) {
      console.error('Erro ao carregar transactions:', transactionsError);
      setError(`Erro ao carregar seus registros: ${transactionsError.message}`);
      return;
    }

    let finalData = data || [];

    if (finalData.length === 0) {
      const demoTransactions = getDemoTransactions(currentUser.id);

      const { data: insertedDemoData, error: demoError } = await supabase
        .from('transactions')
        .insert(demoTransactions)
        .select();

      if (demoError) {
        console.error('Erro ao criar dados demo:', demoError);
        setError(`Erro ao criar dados de demonstração: ${demoError.message}`);
        return;
      }

      finalData = (insertedDemoData || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }

    setTransactions(normalizeTransactions(finalData));
  };

  const filteredData = useMemo(() => {
    const now = new Date();

    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);

      if (timeFilter === 'Hoje') {
        return txDate.toDateString() === now.toDateString();
      }

      if (timeFilter === '7 Dias') {
        const diffTime = now - txDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }

      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    });
  }, [transactions, timeFilter]);

  const stats = useMemo(() => {
    const receitas = filteredData
      .filter((t) => t.type === 'receita')
      .reduce((acc, curr) => acc + curr.value, 0);

    const despesas = filteredData
      .filter((t) => t.type === 'despesa')
      .reduce((acc, curr) => acc + curr.value, 0);

    const saldoPeriodo = receitas - despesas;

    const totalReceitas = transactions
      .filter((t) => t.type === 'receita')
      .reduce((acc, curr) => acc + curr.value, 0);

    const totalDespesas = transactions
      .filter((t) => t.type === 'despesa')
      .reduce((acc, curr) => acc + curr.value, 0);

    const saldoTotal = totalReceitas - totalDespesas;

    return {
      receitas,
      despesas,
      saldoPeriodo,
      saldoTotal
    };
  }, [filteredData, transactions]);

  const chartData = useMemo(() => {
    const aggregated = {};

    if (timeFilter === 'Hoje') {
      ['Manhã', 'Tarde', 'Noite'].forEach((k) => {
        aggregated[k] = {
          name: k,
          receitas: 0,
          despesas: 0
        };
      });

      filteredData.forEach((tx) => {
        const hour = new Date(tx.date).getHours();
        const block = hour < 12 ? 'Manhã' : hour < 18 ? 'Tarde' : 'Noite';

        aggregated[block][tx.type === 'receita' ? 'receitas' : 'despesas'] +=
          tx.value;
      });
    } else if (timeFilter === '7 Dias') {
      for (let i = 6; i >= 0; i--) {
        const d = getDaysAgo(i);
        const name = d.toLocaleDateString('pt-BR', { weekday: 'short' });

        if (!aggregated[name]) {
          aggregated[name] = {
            name,
            receitas: 0,
            despesas: 0,
            dateStr: d.toDateString()
          };
        }
      }

      filteredData.forEach((tx) => {
        const d = new Date(tx.date);
        const name = d.toLocaleDateString('pt-BR', { weekday: 'short' });

        if (aggregated[name]) {
          aggregated[name][tx.type === 'receita' ? 'receitas' : 'despesas'] +=
            tx.value;
        }
      });
    } else {
      ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'].forEach((k) => {
        aggregated[k] = {
          name: k,
          receitas: 0,
          despesas: 0
        };
      });

      filteredData.forEach((tx) => {
        const date = new Date(tx.date).getDate();

        const week =
          date <= 7
            ? 'Sem 1'
            : date <= 14
              ? 'Sem 2'
              : date <= 21
                ? 'Sem 3'
                : 'Sem 4';

        aggregated[week][tx.type === 'receita' ? 'receitas' : 'despesas'] +=
          tx.value;
      });
    }

    return Object.values(aggregated);
  }, [filteredData, timeFilter]);

  const handleNovoRegistro = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate('/login');
      return;
    }

    const value = Number(formData.value);

    if (!value || Number.isNaN(value) || value <= 0) {
      setError('Digite um valor válido.');
      return;
    }

    if (!formData.desc.trim()) {
      setError('Digite uma descrição.');
      return;
    }

    setSaving(true);

    const { data, error: insertError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: formData.type,
        value,
        description: formData.desc.trim()
      })
      .select()
      .single();

    setSaving(false);

    if (insertError) {
      console.error('Erro ao salvar registro:', insertError);
      setError(`Erro ao salvar registro: ${insertError.message}`);
      return;
    }

    const newTx = {
      id: data.id,
      type: data.type,
      value: Number(data.value),
      desc: data.description,
      date: new Date(data.created_at)
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsModalOpen(false);

    setFormData({
      type: 'despesa',
      value: '',
      desc: ''
    });
  };

  const handleResetDemoData = async () => {
    if (!user || resetting) return;

    const confirmReset = window.confirm(
      'Tem certeza que deseja resetar seus dados? Isso vai apagar seus registros atuais e recriar os dados de demonstração.'
    );

    if (!confirmReset) return;

    setResetting(true);
    setError('');

    try {
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      const demoTransactions = getDemoTransactions(user.id);

      const { data: insertedDemoData, error: insertError } = await supabase
        .from('transactions')
        .insert(demoTransactions)
        .select();

      if (insertError) throw insertError;

      const sortedData = (insertedDemoData || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setTransactions(normalizeTransactions(sortedData));
    } catch (err) {
      console.error('Erro ao resetar dados demo:', err);
      setError(`Erro ao resetar dados: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Usuário';

  return (
    <div
      className="antialiased text-slate-900 font-sans min-h-screen flex flex-col relative overflow-x-hidden"
      style={{
        background:
          'radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 50%, #f1f5f9 100%)'
      }}
    >
      {/* Modal de Novo Registro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Novo Registro</h2>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleNovoRegistro}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'receita' })}
                    className={`py-2 px-4 rounded-lg border font-medium transition-colors ${
                      formData.type === 'receita'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Receita
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'despesa' })}
                    className={`py-2 px-4 rounded-lg border font-medium transition-colors ${
                      formData.type === 'despesa'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Despesa
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Valor (R$)
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descrição
                </label>

                <input
                  type="text"
                  required
                  value={formData.desc}
                  onChange={(e) =>
                    setFormData({ ...formData, desc: e.target.value })
                  }
                  placeholder="Ex: Salário, Conta de Luz..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-4 py-3 bg-[#2563eb] hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Registro'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 lg:px-12 lg:py-6 z-10">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Layers size={18} />
          </div>

          <span className="font-bold text-xl tracking-tight">LifeOS</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDemoData}
            disabled={resetting}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {resetting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Resetando...
              </>
            ) : (
              <>
                <RotateCcw size={16} />
                Resetar dados
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      <div className="flex flex-1 w-full max-w-[1440px] mx-auto px-4 lg:px-8 pb-8 gap-6 relative z-10">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/50 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-800 truncate">
                {displayName}
              </span>

              <span className="text-xs text-slate-500 truncate">
                {user?.email}
              </span>
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
                showDivider={
                  index > 0 && MENU_ITEMS[index - 1].section !== item.section
                }
              />
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Resumo Financeiro
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Sua visão consolidada, atualizada por usuário.
                {loadingData && <span className="ml-2 text-xs text-blue-500">Atualizando...</span>}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                {['Hoje', '7 Dias', 'Mês'].map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTimeFilter(t)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      timeFilter === t
                        ? 'bg-slate-100 text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
              >
                <Plus size={16} />
                Novo Registro
              </button>
            </div>
          </div>

          {error && !isModalOpen && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Saldo Geral"
              value={formatCurrency(stats.saldoTotal)}
              icon={Wallet}
              color="blue"
            />

            <StatCard
              title={`Entradas (${timeFilter})`}
              value={formatCurrency(stats.receitas)}
              icon={TrendingUp}
              color="green"
            />

            <StatCard
              title={`Saídas (${timeFilter})`}
              value={formatCurrency(stats.despesas)}
              icon={TrendingDown}
              color="red"
            />

            <StatCard
              title={`Balanço (${timeFilter})`}
              value={formatCurrency(stats.saldoPeriodo)}
              icon={FileText}
              color="slate"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Gráfico */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-semibold text-slate-800">
                  Fluxo ({timeFilter})
                </h3>

                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Ellipsis size={20} />
                </button>
              </div>

              <div className="h-[300px] min-h-[300px] w-full min-w-0">
                {chartData.length > 0 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(226, 232, 240, 0.5)"
                      />

                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: '#94a3b8',
                          fontSize: 12
                        }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: '#94a3b8',
                          fontSize: 12
                        }}
                      />

                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                        }}
                      />

                      <Area
                        type="monotone"
                        name="Receitas"
                        dataKey="receitas"
                        stroke="#10B981"
                        strokeWidth={3}
                        fillOpacity={0.1}
                        fill="#10B981"
                        isAnimationActive
                      />

                      <Area
                        type="monotone"
                        name="Despesas"
                        dataKey="despesas"
                        stroke="#EF4444"
                        strokeWidth={3}
                        fillOpacity={0.1}
                        fill="#EF4444"
                        isAnimationActive
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Últimos Registros */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-semibold text-slate-800">
                  Últimos Registros
                </h3>

                <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {filteredData.length}
                </span>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2">
                {filteredData.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center mt-4">
                    Nenhuma transação neste período.
                  </p>
                ) : (
                  [...filteredData]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5)
                    .map((tx) => (
                      <div
                        key={tx.id}
                        className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {tx.desc}
                          </p>

                          <p className="text-xs text-slate-500">
                            {new Date(tx.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>

                        <span
                          className={`text-sm font-bold ${
                            tx.type === 'receita'
                              ? 'text-emerald-500'
                              : 'text-red-500'
                          }`}
                        >
                          {tx.type === 'receita' ? '+' : '-'}{' '}
                          {formatCurrency(tx.value)}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
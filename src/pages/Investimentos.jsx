import React, { useState, useMemo, memo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layers, Globe, ChevronDown, LayoutGrid, Wallet,
  FileText, RotateCcw, HandCoins, TrendingUp,
  Search, Plus, Upload, ArrowUp, Calendar, Minus,
  ArrowRightLeft, CircleDollarSign, PiggyBank,
  TrendingDown, Filter, Ellipsis, ShieldCheck, Bell,
  X, CheckCircle2, Trash2, Eye, Edit3, Download,
  Target, BarChart3, RefreshCw, DollarSign, AlertCircle,
  ArrowDown, Info, Copy, PieChart as PieChartIcon
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip
} from 'recharts';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

// --- HELPERS ---
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const parseCurrency = (value) => {
  if (typeof value === 'number') return value;
  return Number(
    String(value || '0')
      .replace(/\s/g, '')
      .replace('R$', '')
      .replace('+', '')
      .replace(/\./g, '')
      .replace(',', '.')
  ) || 0;
};

const formatPercent = (value) => `${Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;

const categoryConfig = {
  'Renda Fixa': { code: 'RF', codeBg: 'bg-blue-50 text-blue-600 border-blue-100', color: '#3b82f6' },
  'Ações': { code: 'EQ', codeBg: 'bg-purple-50 text-purple-600 border-purple-100', color: '#a855f7' },
  'FIIs': { code: 'FI', codeBg: 'bg-orange-50 text-orange-600 border-orange-100', color: '#fb923c' },
  'Internacional': { code: 'IN', codeBg: 'bg-green-50 text-green-600 border-green-100', color: '#22c55e' },
  'Cripto': { code: 'CR', codeBg: 'bg-yellow-50 text-yellow-700 border-yellow-100', color: '#eab308' },
};

const categoryOptions = Object.keys(categoryConfig);
const brokerOptions = ['Rico Corretora', 'NuInvest', 'XP Investimentos', 'Banco Inter', 'Ações Brasil'];
const operationTypes = ['Compra', 'Venda', 'Provento', 'Aporte'];

const MENU_ITEMS = Object.freeze([
  { name: 'Painel Unificado', path: '/dashboard', icon: LayoutGrid, section: 1 },
  { name: 'Dinheiro', path: '/dinheiro', icon: Wallet, section: 1 },
  { name: 'Contas & Boletos', path: '/contas', icon: FileText, section: 1 },
  { name: 'Assinaturas', path: '/assinaturas', icon: RotateCcw, section: 1 },
  { name: 'Dívidas', path: '/dividas', icon: HandCoins, section: 1 },
  { name: 'Investimentos', path: '/investimentos', icon: TrendingUp, section: 1 },
]);

const INITIAL_ASSETS = Object.freeze([
  {
    id: 1,
    name: 'Tesouro IPCA+ 2035',
    broker: 'Rico Corretora',
    category: 'Renda Fixa',
    quantity: 25000,
    avgPrice: 1,
    currentPrice: 1.138008,
    invested: 25000,
  },
  {
    id: 2,
    name: 'WEGE3',
    broker: 'Ações Brasil',
    category: 'Ações',
    quantity: 200,
    avgPrice: 34.5,
    currentPrice: 38.5,
    invested: 6900,
  },
  {
    id: 3,
    name: 'MXRF11',
    broker: 'NuInvest',
    category: 'FIIs',
    quantity: 450,
    avgPrice: 10.2,
    currentPrice: 10.05,
    invested: 4590,
  },
  {
    id: 4,
    name: 'IVVB11',
    broker: 'XP Investimentos',
    category: 'Internacional',
    quantity: 36,
    avgPrice: 285,
    currentPrice: 326.4,
    invested: 10260,
  },
]);

const INITIAL_OPERATIONS = Object.freeze([
  { id: 1, type: 'Compra', assetName: 'WEGE3', date: '2026-04-15', broker: 'Rico Corretora', value: 1540, quantity: 40, category: 'Ações' },
  { id: 2, type: 'Provento', assetName: 'MXRF11', date: '2026-04-14', broker: 'NuInvest', value: 45.6, quantity: 450, category: 'FIIs' },
  { id: 3, type: 'Aporte', assetName: 'Tesouro IPCA+ 2035', date: '2026-04-10', broker: 'Rico Corretora', value: 3000, quantity: 3000, category: 'Renda Fixa' },
  { id: 4, type: 'Provento', assetName: 'ITSA4', date: '2026-04-05', broker: 'NuInvest', value: 28.4, quantity: 120, category: 'Ações' },
]);

const INITIAL_GOALS = Object.freeze([
  { id: 1, name: 'Independência Financeira', target: 2000000, linkedCategory: 'Todas' },
  { id: 2, name: 'Reserva de Emergência', target: 30000, linkedCategory: 'Renda Fixa' },
]);



const toDbAsset = (asset, userId) => ({
  user_id: userId,
  name: asset.name,
  broker: asset.broker,
  category: asset.category,
  quantity: Number(asset.quantity || 0),
  avg_price: Number(asset.avgPrice || 0),
  current_price: Number(asset.currentPrice || 0),
  invested: Number(asset.invested || 0),
});

const normalizeAsset = (item) => ({
  id: item.id,
  name: item.name,
  broker: item.broker,
  category: item.category,
  quantity: Number(item.quantity || 0),
  avgPrice: Number(item.avg_price || 0),
  currentPrice: Number(item.current_price || 0),
  invested: Number(item.invested || 0),
});

const toDbOperation = (operation, userId) => ({
  user_id: userId,
  type: operation.type,
  asset_name: operation.assetName,
  operation_date: operation.date,
  broker: operation.broker,
  value: Number(operation.value || 0),
  quantity: Number(operation.quantity || 0),
  price: Number(operation.price || 0),
  category: operation.category,
});

const normalizeOperation = (item) => ({
  id: item.id,
  type: item.type,
  assetName: item.asset_name,
  date: item.operation_date,
  broker: item.broker,
  value: Number(item.value || 0),
  quantity: Number(item.quantity || 0),
  price: Number(item.price || 0),
  category: item.category,
});

const toDbGoal = (goal, userId) => ({
  user_id: userId,
  name: goal.name,
  target: Number(goal.target || 0),
  linked_category: goal.linkedCategory || 'Todas',
});

const normalizeGoal = (item) => ({
  id: item.id,
  name: item.name,
  target: Number(item.target || 0),
  linkedCategory: item.linked_category || 'Todas',
});

const getDemoAssets = (userId) => INITIAL_ASSETS.map((asset) => toDbAsset(asset, userId));
const getDemoOperations = (userId) => INITIAL_OPERATIONS.map((operation) => toDbOperation(operation, userId));
const getDemoGoals = (userId) => INITIAL_GOALS.map((goal) => toDbGoal(goal, userId));

const BASE_PERF = Object.freeze([
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
]);

// --- COMPONENTES ---
const Modal = ({ title, subtitle, children, onClose, width = 'max-w-xl' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
    <button aria-label="Fechar modal" onClick={onClose} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
    <div className={`relative w-full ${width} rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden`}>
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100">
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-semibold text-slate-600">{label}</span>
    {children}
  </label>
);

const inputClass = 'w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all';

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

const OperationItem = memo(({ operation, onClick }) => {
  const isPositive = operation.type === 'Provento' || operation.type === 'Venda';
  const iconMap = { Compra: ArrowRightLeft, Venda: ArrowRightLeft, Provento: CircleDollarSign, Aporte: PiggyBank };
  const Icon = iconMap[operation.type] || ArrowRightLeft;
  const colorClass = isPositive ? 'bg-green-50 text-green-600 border-green-100' : operation.type === 'Aporte' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-100';

  return (
    <button onClick={() => onClick(operation)} className="flex items-center justify-between text-left hover:bg-slate-50 rounded-xl p-1 -m-1 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm border ${colorClass}`}>
          <Icon size={16} />
        </div>
        <div>
          <span className="text-sm font-semibold text-slate-900 block">{operation.type} {operation.assetName}</span>
          <span className="text-xs text-slate-500">{operation.date.split('-').reverse().join('/')} • {operation.broker}</span>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-sm font-bold block ${isPositive ? 'text-green-600' : 'text-slate-900'}`}>{isPositive ? '+ ' : '- '}{formatCurrency(operation.value)}</span>
        <span className="text-xs text-slate-500">{operation.type === 'Provento' ? 'Rendimento' : `${operation.quantity} ${operation.category === 'Renda Fixa' ? 'valor apl.' : 'cotas'}`}</span>
      </div>
    </button>
  );
});

const AssetRow = memo(({ asset, onAction }) => {
  const config = categoryConfig[asset.category] || categoryConfig['Renda Fixa'];
  const balance = asset.quantity * asset.currentPrice;
  const rent = asset.invested ? ((balance - asset.invested) / asset.invested) * 100 : 0;
  const isUp = rent >= 0;
  const isFixed = asset.category === 'Renda Fixa';

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${config.codeBg}`}>{config.code}</div>
          <div>
            <span className="font-medium text-slate-900 block">{asset.name}</span>
            <span className="text-[10px] text-slate-500">{asset.broker}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-slate-600 text-sm">{asset.category}</td>
      <td className="px-6 py-4 font-medium text-slate-900 text-sm">{isFixed ? formatCurrency(asset.quantity) : asset.quantity.toLocaleString('pt-BR')}</td>
      <td className="px-6 py-4 text-slate-600 text-sm">{isFixed ? '-' : formatCurrency(asset.avgPrice)}</td>
      <td className="px-6 py-4 text-slate-600 text-sm">{isFixed ? '-' : formatCurrency(asset.currentPrice)}</td>
      <td className="px-6 py-4 font-medium text-slate-900 text-sm">{formatCurrency(balance)}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1 font-medium text-sm ${isUp ? 'text-green-600' : 'text-red-500'}`}>
          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {rent >= 0 ? '+' : ''}{formatPercent(rent)}
        </span>
      </td>
      <td className="px-6 py-4 text-right relative">
        <button onClick={() => onAction('menu', asset)} className="text-slate-400 hover:text-blue-600 transition-colors">
          <Ellipsis size={18} />
        </button>
      </td>
    </tr>
  );
});

const GoalCard = ({ goal, current, onDetails }) => {
  const progress = goal.target ? Math.min(100, (current / goal.target) * 100) : 0;
  return (
    <button onClick={() => onDetails(goal)} className="w-full text-left">
      <div className="flex justify-between items-end mb-1">
        <div>
          <span className="text-sm font-semibold text-slate-900 block">{goal.name}</span>
          <span className="text-xs text-slate-500">Meta: {formatCurrency(goal.target)}</span>
        </div>
        <span className="text-sm font-bold text-slate-900">{formatCurrency(current)}</span>
      </div>
      <div className="flex items-center gap-3 mt-1">
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div className={`${goal.linkedCategory === 'Renda Fixa' ? 'bg-green-500' : 'bg-blue-600'} h-full rounded-l-full`} style={{ width: `${progress}%` }} />
        </div>
        <span className={`text-xs font-medium w-10 ${goal.linkedCategory === 'Renda Fixa' ? 'text-green-600' : 'text-blue-600'}`}>{Math.round(progress)}%</span>
      </div>
    </button>
  );
};

// --- COMPONENTE PRINCIPAL ---
const Investimentos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, sessionLoading } = useAuth();

  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [operations, setOperations] = useState(INITIAL_OPERATIONS);
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [chartRange, setChartRange] = useState('1A');
  const [operationModalOpen, setOperationModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [activeAsset, setActiveAsset] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [toast, setToast] = useState('');
  const [syncing, setSyncing] = useState(false);

  const [newOperation, setNewOperation] = useState({
    type: 'Compra',
    assetName: '',
    category: 'Ações',
    broker: 'Rico Corretora',
    quantity: '',
    price: '',
    date: '2026-04-24',
  });

  const [newGoal, setNewGoal] = useState({ name: '', target: '', linkedCategory: 'Todas' });

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };


  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  const fetchInvestments = async (currentUser = user) => {
    if (!currentUser) return;
    setSyncing(true);

    const [assetsRes, operationsRes, goalsRes] = await Promise.all([
      supabase.from('investment_assets').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: true }),
      supabase.from('investment_operations').select('*').eq('user_id', currentUser.id).order('operation_date', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('investment_goals').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: true }),
    ]);

    if (assetsRes.error || operationsRes.error || goalsRes.error) {
      console.error('Erro ao carregar investimentos:', assetsRes.error || operationsRes.error || goalsRes.error);
      showToast(`Erro ao carregar investimentos: ${(assetsRes.error || operationsRes.error || goalsRes.error)?.message}`);
      setSyncing(false);
      return;
    }

    let assetsData = assetsRes.data || [];
    let operationsData = operationsRes.data || [];
    let goalsData = goalsRes.data || [];

    if (assetsData.length === 0 && operationsData.length === 0 && goalsData.length === 0) {
      const [insertedAssets, insertedOperations, insertedGoals] = await Promise.all([
        supabase.from('investment_assets').insert(getDemoAssets(currentUser.id)).select(),
        supabase.from('investment_operations').insert(getDemoOperations(currentUser.id)).select(),
        supabase.from('investment_goals').insert(getDemoGoals(currentUser.id)).select(),
      ]);

      if (insertedAssets.error || insertedOperations.error || insertedGoals.error) {
        console.error('Erro ao criar dados demo de investimentos:', insertedAssets.error || insertedOperations.error || insertedGoals.error);
        showToast(`Erro ao criar dados demo: ${(insertedAssets.error || insertedOperations.error || insertedGoals.error)?.message}`);
        setSyncing(false);
        return;
      }

      assetsData = insertedAssets.data || [];
      operationsData = insertedOperations.data || [];
      goalsData = insertedGoals.data || [];
    }

    setAssets(assetsData.map(normalizeAsset));
    setOperations(operationsData.map(normalizeOperation));
    setGoals(goalsData.map(normalizeGoal));
    setSyncing(false);
  };

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    fetchInvestments(user);
  }, [sessionLoading, user, navigate]);

  const persistAssets = async (nextAssets) => {
    if (!user) return nextAssets;

    const { error: deleteError } = await supabase
      .from('investment_assets')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      showToast(`Erro ao salvar ativos: ${deleteError.message}`);
      return nextAssets;
    }

    if (nextAssets.length === 0) {
      setAssets([]);
      return [];
    }

    const { data, error } = await supabase
      .from('investment_assets')
      .insert(nextAssets.map((asset) => toDbAsset(asset, user.id)))
      .select();

    if (error) {
      showToast(`Erro ao salvar ativos: ${error.message}`);
      return nextAssets;
    }

    const normalized = (data || []).map(normalizeAsset);
    setAssets(normalized);
    return normalized;
  };

  const persistOperations = async (nextOperations) => {
    if (!user) return nextOperations;

    const { error: deleteError } = await supabase
      .from('investment_operations')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      showToast(`Erro ao salvar operações: ${deleteError.message}`);
      return nextOperations;
    }

    if (nextOperations.length === 0) {
      setOperations([]);
      return [];
    }

    const { data, error } = await supabase
      .from('investment_operations')
      .insert(nextOperations.map((operation) => toDbOperation(operation, user.id)))
      .select();

    if (error) {
      showToast(`Erro ao salvar operações: ${error.message}`);
      return nextOperations;
    }

    const normalized = (data || [])
      .map(normalizeOperation)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    setOperations(normalized);
    return normalized;
  };

  const persistGoals = async (nextGoals) => {
    if (!user) return nextGoals;

    const { error: deleteError } = await supabase
      .from('investment_goals')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      showToast(`Erro ao salvar metas: ${deleteError.message}`);
      return nextGoals;
    }

    if (nextGoals.length === 0) {
      setGoals([]);
      return [];
    }

    const { data, error } = await supabase
      .from('investment_goals')
      .insert(nextGoals.map((goal) => toDbGoal(goal, user.id)))
      .select();

    if (error) {
      showToast(`Erro ao salvar metas: ${error.message}`);
      return nextGoals;
    }

    const normalized = (data || []).map(normalizeGoal);
    setGoals(normalized);
    return normalized;
  };

  const enrichedAssets = useMemo(() => {
    return assets.map((asset) => ({
      ...asset,
      balance: asset.quantity * asset.currentPrice,
      rentPercent: asset.invested ? ((asset.quantity * asset.currentPrice - asset.invested) / asset.invested) * 100 : 0,
    }));
  }, [assets]);

  const totals = useMemo(() => {
    const totalBalance = enrichedAssets.reduce((sum, asset) => sum + asset.balance, 0);
    const totalInvested = enrichedAssets.reduce((sum, asset) => sum + asset.invested, 0);
    const monthlyIncome = operations.filter((op) => op.type === 'Provento' && op.date.startsWith('2026-04')).reduce((sum, op) => sum + op.value, 0);
    const yearlyIncome = operations.filter((op) => op.type === 'Provento').reduce((sum, op) => sum + op.value, 0) + 8346.5;
    const rent12m = totalInvested ? ((totalBalance - totalInvested) / totalInvested) * 100 + 5.2 : 0;
    const cdi = 11.2;
    const dy = totalBalance ? (yearlyIncome / totalBalance) * 100 : 0;
    return { totalBalance, totalInvested, monthlyIncome, yearlyIncome, rent12m, cdi, dy };
  }, [enrichedAssets, operations]);

  const allocationData = useMemo(() => {
    const groups = categoryOptions.map((cat) => {
      const value = enrichedAssets.filter((asset) => asset.category === cat).reduce((sum, asset) => sum + asset.balance, 0);
      return { name: cat, value, color: categoryConfig[cat].color };
    }).filter((item) => item.value > 0);

    return groups.map((item) => ({ ...item, percent: totals.totalBalance ? (item.value / totals.totalBalance) * 100 : 0 }));
  }, [enrichedAssets, totals.totalBalance]);

  const performanceData = useMemo(() => {
    const currentIndex = totals.totalInvested ? (totals.totalBalance / totals.totalInvested) * 100 : 100;
    const all = [...BASE_PERF, { name: 'Dez', carteira: Number(currentIndex.toFixed(2)), cdi: 112 }];
    if (chartRange === '1M') return all.slice(-2);
    if (chartRange === '6M') return all.slice(-6);
    return all;
  }, [totals.totalBalance, totals.totalInvested, chartRange]);

  const filteredAssets = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return enrichedAssets
      .filter((asset) => categoryFilter === 'Todas' || asset.category === categoryFilter)
      .filter((asset) => !q || [asset.name, asset.category, asset.broker].some((value) => String(value).toLowerCase().includes(q)));
  }, [searchTerm, enrichedAssets, categoryFilter]);

  const rebalanceSuggestions = useMemo(() => {
    const target = { 'Renda Fixa': 50, Ações: 25, FIIs: 15, Internacional: 10, Cripto: 0 };
    return allocationData
      .map((item) => {
        const diff = (target[item.name] || 0) - item.percent;
        const amount = Math.abs(diff / 100) * totals.totalBalance;
        return { ...item, target: target[item.name] || 0, diff, amount };
      })
      .filter((item) => Math.abs(item.diff) >= 2)
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  }, [allocationData, totals.totalBalance]);

  const resetData = async () => {
    if (!user) {
      showToast('Faça login novamente para resetar seus investimentos.');
      navigate('/login');
      return;
    }

    setSyncing(true);
    setSearchTerm('');
    setCategoryFilter('Todas');
    setChartRange('1A');

    const [deleteAssets, deleteOperations, deleteGoals] = await Promise.all([
      supabase.from('investment_assets').delete().eq('user_id', user.id),
      supabase.from('investment_operations').delete().eq('user_id', user.id),
      supabase.from('investment_goals').delete().eq('user_id', user.id),
    ]);

    if (deleteAssets.error || deleteOperations.error || deleteGoals.error) {
      showToast(`Erro ao resetar dados: ${(deleteAssets.error || deleteOperations.error || deleteGoals.error)?.message}`);
      setSyncing(false);
      return;
    }

    const [insertedAssets, insertedOperations, insertedGoals] = await Promise.all([
      supabase.from('investment_assets').insert(getDemoAssets(user.id)).select(),
      supabase.from('investment_operations').insert(getDemoOperations(user.id)).select(),
      supabase.from('investment_goals').insert(getDemoGoals(user.id)).select(),
    ]);

    if (insertedAssets.error || insertedOperations.error || insertedGoals.error) {
      showToast(`Erro ao recriar dados demo: ${(insertedAssets.error || insertedOperations.error || insertedGoals.error)?.message}`);
      setSyncing(false);
      return;
    }

    setAssets((insertedAssets.data || []).map(normalizeAsset));
    setOperations((insertedOperations.data || []).map(normalizeOperation));
    setGoals((insertedGoals.data || []).map(normalizeGoal));
    setSyncing(false);
    showToast('Dados de investimentos restaurados.');
  };

  const buildNextAssetsFromOperation = (currentAssets, operation) => {
    const existing = currentAssets.find((asset) => asset.name.toLowerCase() === operation.assetName.toLowerCase());

    if (operation.type === 'Provento') return currentAssets;

    if (operation.type === 'Venda' && existing) {
      const nextQuantity = Math.max(0, Number(existing.quantity) - Number(operation.quantity));
      const soldCost = Number(existing.avgPrice) * Math.min(Number(existing.quantity), Number(operation.quantity));

      return currentAssets
        .map((asset) => asset.id === existing.id ? {
          ...asset,
          quantity: nextQuantity,
          invested: Math.max(0, Number(asset.invested) - soldCost),
        } : asset)
        .filter((asset) => Number(asset.quantity) > 0.0001);
    }

    if (existing) {
      const addedValue = Number(operation.value || 0);
      const nextQuantity = existing.category === 'Renda Fixa'
        ? Number(existing.quantity) + Number(operation.value || 0)
        : Number(existing.quantity) + Number(operation.quantity || 0);
      const nextInvested = Number(existing.invested || 0) + addedValue;
      const nextAvg = existing.category === 'Renda Fixa' ? 1 : nextInvested / nextQuantity;

      return currentAssets.map((asset) => asset.id === existing.id ? {
        ...asset,
        quantity: nextQuantity,
        invested: nextInvested,
        avgPrice: nextAvg,
        currentPrice: operation.type === 'Compra' ? Number(operation.price || asset.currentPrice) : asset.currentPrice,
      } : asset);
    }

    const isFixed = operation.category === 'Renda Fixa';

    return [...currentAssets, {
      id: `local-${Date.now()}`,
      name: operation.assetName,
      broker: operation.broker,
      category: operation.category,
      quantity: isFixed ? Number(operation.value || 0) : Number(operation.quantity || 0),
      avgPrice: isFixed ? 1 : Number(operation.price || 0),
      currentPrice: isFixed ? 1.03 : Number(operation.price || 0),
      invested: Number(operation.value || 0),
    }];
  };

  const handleCreateOperation = async (event) => {
    event.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    const quantity = parseCurrency(newOperation.quantity);
    const price = parseCurrency(newOperation.price);
    const isProvento = newOperation.type === 'Provento';
    const isFixed = newOperation.category === 'Renda Fixa';
    const value = isProvento || isFixed ? price || parseCurrency(newOperation.quantity) : quantity * price;

    if (!newOperation.assetName.trim() || !value || (!isProvento && !isFixed && !quantity)) {
      showToast('Preencha ativo, quantidade e valor/preço corretamente.');
      return;
    }

    const operation = {
      id: `local-op-${Date.now()}`,
      type: newOperation.type,
      assetName: newOperation.assetName.trim().toUpperCase(),
      date: newOperation.date,
      broker: newOperation.broker,
      value,
      quantity: isFixed ? value : quantity,
      price: isFixed ? 1 : price,
      category: newOperation.category,
    };

    const nextOperations = [operation, ...operations];
    const nextAssets = buildNextAssetsFromOperation(assets, operation);

    setOperations(nextOperations);
    setAssets(nextAssets);
    await persistOperations(nextOperations);
    await persistAssets(nextAssets);

    setOperationModalOpen(false);
    setNewOperation({ type: 'Compra', assetName: '', category: 'Ações', broker: 'Rico Corretora', quantity: '', price: '', date: '2026-04-24' });
    showToast(`${operation.type} de ${operation.assetName} registrada.`);
  };

  const handleCreateGoal = async (event) => {
    event.preventDefault();
    const target = parseCurrency(newGoal.target);

    if (!newGoal.name.trim() || !target) {
      showToast('Preencha nome e valor da meta.');
      return;
    }

    const nextGoals = [...goals, {
      id: `local-goal-${Date.now()}`,
      name: newGoal.name.trim(),
      target,
      linkedCategory: newGoal.linkedCategory,
    }];

    setGoals(nextGoals);
    await persistGoals(nextGoals);

    setNewGoal({ name: '', target: '', linkedCategory: 'Todas' });
    setGoalModalOpen(false);
    showToast('Nova meta adicionada.');
  };

  const handleAssetAction = async (action, asset) => {
    if (action === 'menu') {
      setActiveAsset(asset);
      return;
    }

    if (action === 'details') {
      setDetailModal({ kind: 'asset', asset });
      setActiveAsset(null);
      return;
    }

    if (action === 'buy') {
      setNewOperation({ type: 'Compra', assetName: asset.name, category: asset.category, broker: asset.broker, quantity: '', price: asset.currentPrice, date: '2026-04-24' });
      setOperationModalOpen(true);
      setActiveAsset(null);
      return;
    }

    if (action === 'sell') {
      setNewOperation({ type: 'Venda', assetName: asset.name, category: asset.category, broker: asset.broker, quantity: '', price: asset.currentPrice, date: '2026-04-24' });
      setOperationModalOpen(true);
      setActiveAsset(null);
      return;
    }

    if (action === 'delete') {
      const nextAssets = assets.filter((item) => item.id !== asset.id);
      setAssets(nextAssets);
      await persistAssets(nextAssets);
      setActiveAsset(null);
      showToast(`${asset.name} removido da carteira.`);
    }
  };

  const applyImport = async () => {
    const imported = {
      id: `local-import-${Date.now()}`,
      name: 'CDB 110% CDI',
      broker: 'Banco Inter',
      category: 'Renda Fixa',
      quantity: 12500,
      avgPrice: 1,
      currentPrice: 1.018,
      invested: 12500,
    };

    const importedOperation = {
      id: `local-import-op-${Date.now() + 1}`,
      type: 'Aporte',
      assetName: imported.name,
      date: '2026-04-24',
      broker: imported.broker,
      value: 12500,
      quantity: 12500,
      price: 1,
      category: 'Renda Fixa',
    };

    const nextAssets = [...assets, imported];
    const nextOperations = [importedOperation, ...operations];

    setAssets(nextAssets);
    setOperations(nextOperations);
    await persistAssets(nextAssets);
    await persistOperations(nextOperations);

    setImportModalOpen(false);
    showToast('Importação simulada concluída: CDB 110% CDI adicionado.');
  };

  const getGoalCurrent = (goal) => {
    if (goal.linkedCategory === 'Todas') return totals.totalBalance;
    return enrichedAssets.filter((asset) => asset.category === goal.linkedCategory).reduce((sum, asset) => sum + asset.balance, 0);
  };

  const PerformanceChart = useMemo(() => (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={performanceData} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <LineTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
          <Line type="monotone" dataKey="carteira" name="Minha Carteira" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false} />
          <Line type="monotone" dataKey="cdi" name="CDI" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  ), [performanceData]);

  const AllocationChart = useMemo(() => (
    <div className="relative w-full h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={allocationData} innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" isAnimationActive={false} stroke="none">
            {allocationData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
          </Pie>
          <PieTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value) => formatCurrency(value)} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xs text-slate-500 font-medium">Total</span>
        <span className="text-lg font-bold text-slate-900">{formatCurrency(totals.totalBalance)}</span>
      </div>
    </div>
  ), [allocationData, totals.totalBalance]);

  return (
    <div className="antialiased text-slate-900 font-sans min-h-screen flex flex-col"
      style={{ background: 'radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 50%, #f1f5f9 100%)' }}>

      {toast && (
        <div className="fixed top-5 right-5 z-[60] flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 text-sm shadow-xl">
          <CheckCircle2 size={16} className="text-emerald-300" /> {toast}
        </div>
      )}

      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 lg:px-12 z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Layers size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight">LifeOS</span>
        </div>
        <div className="flex items-center gap-4">

        </div>
      </header>

      <div className="flex flex-1 w-full max-w-[1440px] mx-auto px-4 lg:px-8 pb-8 gap-6">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/50 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-800 truncate">{displayName}</span>
              <span className="text-xs text-slate-500 truncate">{user?.email}</span>
            </div>
            <ChevronDown size={12} className="text-slate-400 ml-auto" />
          </div>

          <nav className="flex flex-col gap-1">
            {MENU_ITEMS.map((item, index) => (
              <SidebarItem key={item.name} item={item} currentPath={location.pathname} onClick={navigate} showDivider={index > 0 && MENU_ITEMS[index - 1].section !== item.section} />
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Top Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Investimentos</h1>
              <p className="text-sm text-slate-500 mt-1">
                Gestão de portfólio, rentabilidade e alocação de ativos.
                {syncing && <span className="ml-2 text-xs text-blue-500 font-medium">Sincronizando...</span>}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={resetData} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
                <RefreshCw size={16} /> Resetar
              </button>
              <button onClick={() => setImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
                <Upload size={16} /> Importar
              </button>
              <button onClick={() => setOperationModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
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
                <button onClick={() => setDetailModal({ kind: 'portfolio' })} className="text-left bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Patrimônio Total</h3>
                    <div className="px-2 py-1 rounded-md bg-green-50 text-green-600 text-xs font-medium flex items-center gap-1 border border-green-100">
                      <ArrowUp size={10} /> {formatPercent(totals.rent12m)}
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(totals.totalBalance)}</span>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>Rendimento (Mês):</span>
                    <span className="text-green-600 font-medium">+ {formatCurrency(totals.monthlyIncome + 2450)}</span>
                  </div>
                </button>

                <button onClick={() => setChartRange('1A')} className="text-left bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Rentabilidade (12m)</h3>
                    <div className="px-2 py-1 rounded-md bg-green-50 text-green-600 text-xs font-medium flex items-center gap-1 border border-green-100">
                      <ArrowUp size={10} /> +{formatPercent(Math.max(0, totals.rent12m - totals.cdi))}
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-slate-900 mt-1">{formatPercent(totals.rent12m)}</span>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>CDI Acumulado:</span>
                    <span className="text-slate-700 font-medium">{formatPercent(totals.cdi)}</span>
                  </div>
                </button>

                <button onClick={() => setDetailModal({ kind: 'income' })} className="text-left bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Proventos (Ano)</h3>
                    <div className="p-1.5 rounded-md bg-slate-50 text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors">
                      <Calendar size={14} />
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(totals.yearlyIncome)}</span>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>Yield (DY):</span>
                    <span className="text-blue-600 font-medium">{formatPercent(totals.dy)} a.a.</span>
                  </div>
                </button>
              </div>

              {/* Gráfico de Performance */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-slate-900">Rentabilidade vs Benchmark</h3>
                  <div className="flex gap-2">
                    {['1M', '6M', '1A', 'TUDO'].map((range) => (
                      <button key={range} onClick={() => setChartRange(range)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${chartRange === range ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{range}</button>
                    ))}
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
                    <button onClick={() => setGoalModalOpen(true)} className="text-blue-600 hover:text-blue-700"><Plus size={16} /></button>
                  </div>

                  <div className="flex flex-col gap-5">
                    {goals.map((goal) => <GoalCard key={goal.id} goal={goal} current={getGoalCurrent(goal)} onDetails={(item) => setDetailModal({ kind: 'goal', goal: item })} />)}
                  </div>
                </div>

                {/* Rebalanceamento */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-semibold text-slate-900">Rebalanceamento</h3>
                    <button onClick={() => setDetailModal({ kind: 'rebalance' })} className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100">Sugerido</button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {rebalanceSuggestions.slice(0, 2).map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${item.diff > 0 ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-600'}`}>
                            {item.diff > 0 ? <ArrowUp size={14} /> : <Minus size={14} />}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-slate-900 block">{item.name}</span>
                            <span className="text-xs text-slate-500">{item.diff > 0 ? 'Abaixo' : 'Acima'} da meta ({item.target}%)</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900 block">{item.diff > 0 ? '+ ' : '- '}{formatCurrency(item.amount)}</span>
                          <span className={`text-xs font-medium ${item.diff > 0 ? 'text-green-600' : 'text-slate-500'}`}>{item.diff > 0 ? 'Comprar' : 'Manter'}</span>
                        </div>
                      </div>
                    ))}
                    {rebalanceSuggestions.length === 0 && (
                      <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-700 flex gap-2">
                        <CheckCircle2 size={16} /> Carteira dentro das metas de alocação.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Alocação */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">Alocação de Ativos</h3>
                  <button onClick={() => setDetailModal({ kind: 'allocation' })} className="text-slate-400 hover:text-slate-600"><Ellipsis size={18} /></button>
                </div>

                {AllocationChart}

                <div className="flex flex-col gap-2 mt-4">
                  {allocationData.map((item) => (
                    <button key={item.name} onClick={() => setCategoryFilter(item.name)} className="flex items-center justify-between text-sm hover:bg-slate-50 rounded-lg p-1 -mx-1 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900">{formatPercent(item.percent)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Últimas Operações */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex-1 flex flex-col min-h-[300px]">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-semibold text-slate-900">Últimas Operações</h3>
                  <button onClick={() => setDetailModal({ kind: 'operations' })} className="px-3 py-1 rounded-full border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Ver todas</button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
                  {operations.slice(0, 6).map((operation) => <OperationItem key={operation.id} operation={operation} onClick={(op) => setDetailModal({ kind: 'operation', operation: op })} />)}
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
                <button onClick={() => setFilterModalOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
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
                  {filteredAssets.map((asset) => <AssetRow key={asset.id} asset={asset} onAction={handleAssetAction} />)}
                  {filteredAssets.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-slate-500">Nenhum ativo encontrado para “{searchTerm}”.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Menu ativo */}
      {activeAsset && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveAsset(null)}>
          <div onClick={(e) => e.stopPropagation()} className="absolute right-8 top-1/2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl p-2">
            <button onClick={() => handleAssetAction('details', activeAsset)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50"><Eye size={15} /> Ver detalhes</button>
            <button onClick={() => handleAssetAction('buy', activeAsset)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-green-700 hover:bg-green-50"><ArrowUp size={15} /> Comprar mais</button>
            <button onClick={() => handleAssetAction('sell', activeAsset)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-orange-700 hover:bg-orange-50"><ArrowDown size={15} /> Vender</button>
            <button onClick={() => handleAssetAction('delete', activeAsset)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50"><Trash2 size={15} /> Remover ativo</button>
          </div>
        </div>
      )}

      {/* Modal Nova Operação */}
      {operationModalOpen && (
        <Modal title="Nova Operação" subtitle="Registre compra, venda, aporte ou provento." onClose={() => setOperationModalOpen(false)} width="max-w-2xl">
          <form onSubmit={handleCreateOperation} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {operationTypes.map((type) => (
                <button key={type} type="button" onClick={() => setNewOperation((prev) => ({ ...prev, type }))} className={`px-3 py-2.5 rounded-xl border text-sm font-medium ${newOperation.type === type ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}>{type}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Ativo / Produto">
                <input className={inputClass} value={newOperation.assetName} onChange={(e) => setNewOperation((prev) => ({ ...prev, assetName: e.target.value }))} placeholder="Ex: WEGE3, MXRF11, CDB..." />
              </Field>
              <Field label="Categoria">
                <select className={inputClass} value={newOperation.category} onChange={(e) => setNewOperation((prev) => ({ ...prev, category: e.target.value }))}>
                  {categoryOptions.map((cat) => <option key={cat}>{cat}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label={newOperation.category === 'Renda Fixa' || newOperation.type === 'Provento' ? 'Valor total' : 'Quantidade'}>
                <input className={inputClass} value={newOperation.quantity} onChange={(e) => setNewOperation((prev) => ({ ...prev, quantity: e.target.value }))} placeholder="0" />
              </Field>
              <Field label={newOperation.category === 'Renda Fixa' || newOperation.type === 'Provento' ? 'Valor alternativo' : 'Preço unitário'}>
                <input className={inputClass} value={newOperation.price} onChange={(e) => setNewOperation((prev) => ({ ...prev, price: e.target.value }))} placeholder="R$ 0,00" />
              </Field>
              <Field label="Data">
                <input type="date" className={inputClass} value={newOperation.date} onChange={(e) => setNewOperation((prev) => ({ ...prev, date: e.target.value }))} />
              </Field>
            </div>

            <Field label="Corretora">
              <select className={inputClass} value={newOperation.broker} onChange={(e) => setNewOperation((prev) => ({ ...prev, broker: e.target.value }))}>
                {brokerOptions.map((broker) => <option key={broker}>{broker}</option>)}
              </select>
            </Field>

            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-700 flex gap-2">
              <Info size={16} className="text-blue-600 flex-shrink-0" />
              Compras e aportes atualizam a posição. Vendas reduzem a quantidade. Proventos entram em “Últimas Operações” e nos proventos do ano.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setOperationModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Registrar operação</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Importar */}
      {importModalOpen && (
        <Modal title="Importar Carteira" subtitle="Simulação para apresentação, sem conexão real com corretora." onClose={() => setImportModalOpen(false)}>
          <div className="p-6 space-y-4">
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-slate-50">
              <Upload size={28} className="mx-auto text-slate-400 mb-3" />
              <p className="text-sm font-semibold text-slate-800">Importar extrato CEI/B3 ou corretora</p>
              <p className="text-xs text-slate-500 mt-1">Nesta apresentação, o botão adiciona um CDB fictício coerente ao portfólio.</p>
            </div>
            <button onClick={applyImport} className="w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Simular importação</button>
          </div>
        </Modal>
      )}

      {/* Modal Meta */}
      {goalModalOpen && (
        <Modal title="Novo Objetivo" subtitle="Crie uma meta vinculada à carteira ou a uma classe específica." onClose={() => setGoalModalOpen(false)}>
          <form onSubmit={handleCreateGoal} className="p-6 space-y-4">
            <Field label="Nome da meta"><input className={inputClass} value={newGoal.name} onChange={(e) => setNewGoal((prev) => ({ ...prev, name: e.target.value }))} placeholder="Ex: Casa, aposentadoria..." /></Field>
            <Field label="Valor alvo"><input className={inputClass} value={newGoal.target} onChange={(e) => setNewGoal((prev) => ({ ...prev, target: e.target.value }))} placeholder="R$ 0,00" /></Field>
            <Field label="Vincular a"><select className={inputClass} value={newGoal.linkedCategory} onChange={(e) => setNewGoal((prev) => ({ ...prev, linkedCategory: e.target.value }))}><option>Todas</option>{categoryOptions.map((cat) => <option key={cat}>{cat}</option>)}</select></Field>
            <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setGoalModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button><button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Criar meta</button></div>
          </form>
        </Modal>
      )}

      {/* Modal Filtros */}
      {filterModalOpen && (
        <Modal title="Filtros da Carteira" subtitle="Filtre a posição atual por classe de ativo." onClose={() => setFilterModalOpen(false)} width="max-w-lg">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {['Todas', ...categoryOptions].map((cat) => <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-2 rounded-lg border text-sm font-medium ${categoryFilter === cat ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}>{cat}</button>)}
            </div>
            <div className="flex justify-end gap-3"><button onClick={() => setCategoryFilter('Todas')} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Limpar</button><button onClick={() => setFilterModalOpen(false)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Aplicar</button></div>
          </div>
        </Modal>
      )}

      {/* Modal Detalhes */}
      {detailModal && (
        <Modal title="Detalhes" subtitle="Dados coerentes com o estado atual da carteira." onClose={() => setDetailModal(null)} width="max-w-lg">
          <div className="p-6 space-y-4">
            {detailModal.kind === 'asset' && (
              <>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4"><p className="text-xs text-slate-500">{detailModal.asset.category}</p><p className="text-xl font-bold text-slate-900 mt-1">{detailModal.asset.name}</p><p className="text-sm text-slate-500 mt-1">{detailModal.asset.broker}</p></div>
                <div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-slate-100 p-3"><span className="text-xs text-slate-500">Saldo</span><p className="font-bold mt-1">{formatCurrency(detailModal.asset.balance)}</p></div><div className="rounded-xl border border-slate-100 p-3"><span className="text-xs text-slate-500">Rentabilidade</span><p className={`font-bold mt-1 ${detailModal.asset.rentPercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>{formatPercent(detailModal.asset.rentPercent)}</p></div></div>
              </>
            )}
            {detailModal.kind === 'portfolio' && <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-blue-700 text-sm">Patrimônio atual: <strong>{formatCurrency(totals.totalBalance)}</strong>. Valor investido: <strong>{formatCurrency(totals.totalInvested)}</strong>.</div>}
            {detailModal.kind === 'income' && <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-green-700 text-sm">Proventos do ano: <strong>{formatCurrency(totals.yearlyIncome)}</strong>. DY estimado: <strong>{formatPercent(totals.dy)} a.a.</strong></div>}
            {detailModal.kind === 'goal' && <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm"><p className="font-bold text-slate-900">{detailModal.goal.name}</p><p className="text-slate-500 mt-1">Meta de {formatCurrency(detailModal.goal.target)} vinculada a {detailModal.goal.linkedCategory}.</p></div>}
            {detailModal.kind === 'operation' && <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm"><p className="font-bold text-slate-900">{detailModal.operation.type} {detailModal.operation.assetName}</p><p className="text-slate-500 mt-1">{formatCurrency(detailModal.operation.value)} em {detailModal.operation.date.split('-').reverse().join('/')}.</p></div>}
            {['allocation', 'rebalance', 'operations'].includes(detailModal.kind) && <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600">Resumo disponível na própria tela. Os dados mudam conforme operações, importações e filtros aplicados.</div>}
          </div>
        </Modal>
      )}

      {/* Footer */}
      <footer className="w-full py-6 px-6 border-t border-slate-200 bg-white mt-auto z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p>Ao continuar, concorda com os nossos <a href="#" className="text-blue-600 hover:underline">Termos de Serviço</a> e <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>.</p>
          <div className="flex items-center gap-6"><span className="flex items-center gap-1 text-emerald-600"><ShieldCheck size={14} /> Privacidade Garantida</span><span className="cursor-pointer hover:text-blue-600 transition-colors">Suporte</span></div>
        </div>
      </footer>
    </div>
  );
};

export default Investimentos;

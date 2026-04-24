import React, { useEffect, useMemo, memo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layers, Globe, ChevronDown, LayoutGrid, Wallet,
  FileText, RotateCcw, HandCoins, TrendingUp,
  Plus, Ellipsis, ArrowDown, ArrowUp, ArrowRight, RotateCw,
  Search, ListFilter, MoreVertical, ShieldCheck,
  Monitor, Send, DollarSign, X, CalendarDays, Building2,
  ReceiptText, CheckCircle2, Clock3, Copy, Trash2, Eye,
  CircleDollarSign, BadgeCheck, AlertCircle, Bell, Loader2, LogOut
} from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

// --- HELPERS ---
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

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

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
});

const formatDateLabel = (isoDate) => {
  const date = new Date(`${isoDate}T12:00:00`);
  return dateFormatter.format(date).replace('.', '');
};

const formatTimeLabel = (time) => {
  if (!time) return '09:00';
  const [hour, minute] = time.split(':');
  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);
  return timeFormatter.format(date);
};

const getTodayISO = () => new Date().toISOString().slice(0, 10);

const getMonthKey = (isoDate) => String(isoDate || '').slice(0, 7);
const CURRENT_MONTH = '2026-04';
const LAST_MONTH = '2026-03';

const getInitials = (name) => {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'BC';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

const colorOptions = [
  { value: 'purple', label: 'Roxo' },
  { value: 'yellow', label: 'Amarelo' },
  { value: 'blue', label: 'Azul' },
  { value: 'green', label: 'Verde' },
  { value: 'orange', label: 'Laranja' },
];

const bankSuggestions = [
  { name: 'Nubank', initials: 'NU', color: 'purple', type: 'Corrente' },
  { name: 'Itaú', initials: 'IT', color: 'yellow', type: 'Poupança' },
  { name: 'Banco do Brasil', initials: 'BB', color: 'blue', type: 'Corrente' },
  { name: 'Santander', initials: 'ST', color: 'orange', type: 'Corrente' },
  { name: 'Inter', initials: 'IN', color: 'orange', type: 'Digital' },
  { name: 'Caixa', initials: 'CX', color: 'blue', type: 'Poupança' },
];

const categoryIconMap = {
  Software: Monitor,
  Viagem: Send,
  'Renda Fixa': DollarSign,
  Alimentação: ReceiptText,
  Transporte: Send,
  Freelance: CircleDollarSign,
  Banco: Building2,
  Outros: ReceiptText,
};

const categoryColorMap = {
  Software: 'blue',
  Viagem: 'orange',
  'Renda Fixa': 'green',
  Alimentação: 'orange',
  Transporte: 'blue',
  Freelance: 'green',
  Banco: 'purple',
  Outros: 'blue',
};

const getDemoAccounts = (userId) => [
  { user_id: userId, name: 'Nubank', balance: 12678, type: 'Corrente', status: 'Ativa', color: 'purple', initials: 'NU' },
  { user_id: userId, name: 'Itaú', balance: 5345, type: 'Poupança', status: 'Ativa', color: 'yellow', initials: 'IT' },
];

const getDemoTransactions = (userId) => [
  {
    user_id: userId,
    title: 'Assinatura Software',
    category: 'Software',
    tag: 'Sugestão',
    account_name: 'Nubank',
    transaction_date: '2026-04-17',
    time_raw: '15:45',
    amount_value: 145,
    status: 'Concluído',
    is_income: false,
  },
  {
    user_id: userId,
    title: 'Passagem Aérea',
    category: 'Viagem',
    tag: '',
    account_name: 'Itaú',
    transaction_date: '2026-04-15',
    time_raw: '11:30',
    amount_value: 1250,
    status: 'Pendente',
    is_income: false,
  },
  {
    user_id: userId,
    title: 'Salário Tech Corp',
    category: 'Renda Fixa',
    tag: '',
    account_name: 'Itaú',
    transaction_date: '2026-04-05',
    time_raw: '09:00',
    amount_value: 12500,
    status: 'Concluído',
    is_income: true,
  },
  {
    user_id: userId,
    title: 'Projeto Freelance',
    category: 'Freelance',
    tag: 'Recorrente',
    account_name: 'Nubank',
    transaction_date: '2026-03-22',
    time_raw: '14:20',
    amount_value: 4800,
    status: 'Concluído',
    is_income: true,
  },
  {
    user_id: userId,
    title: 'Mercado Mensal',
    category: 'Alimentação',
    tag: '',
    account_name: 'Nubank',
    transaction_date: '2026-03-12',
    time_raw: '18:10',
    amount_value: 720,
    status: 'Concluído',
    is_income: false,
  },
];

const MENU_ITEMS = Object.freeze([
  { name: 'Painel Unificado', path: '/dashboard', icon: LayoutGrid, section: 1 },
  { name: 'Dinheiro', path: '/dinheiro', icon: Wallet, section: 1 },
  { name: 'Contas & Boletos', path: '/contas', icon: FileText, section: 1 },
  { name: 'Assinaturas', path: '/assinaturas', icon: RotateCcw, section: 1 },
  { name: 'Dívidas', path: '/dividas', icon: HandCoins, section: 1 },
  { name: 'Investimentos', path: '/investimentos', icon: TrendingUp, section: 1 },
]);

// --- COMPONENTES BASE ---
const Modal = ({ title, subtitle, children, onClose, width = 'max-w-xl' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
    <button
      type="button"
      aria-label="Fechar modal"
      onClick={onClose}
      className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
    />
    <div className={`relative w-full ${width} rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden`}>
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100"
        >
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

const inputClass = 'w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all';

const SidebarItem = memo(({ item, currentPath, onClick, showDivider }) => {
  const isActive = currentPath === item.path || (currentPath === '/' && item.path === '/dashboard');
  const MenuIcon = item.icon;

  return (
    <React.Fragment>
      {showDivider && <div className="my-2 border-t border-slate-200/50" />}
      <button
        type="button"
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

const FinanceCard = memo(({ title, subtitle, value, icon: Icon, trend, trendUp, linkText, color, onClick }) => {
  const isBlue = color === 'blue';

  if (isBlue) {
    return (
      <div className="rounded-2xl p-6 shadow-sm border border-blue-800 flex flex-col bg-[#1e3a8a] text-white relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
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
          <button type="button" onClick={onClick} className="text-white/70 hover:text-white"><Ellipsis size={20} /></button>
        </div>
        <div className="flex items-end gap-3 mt-2 relative z-10">
          <span className="text-3xl font-bold">{value}</span>
          <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full text-white mb-1 flex items-center gap-1">
            {trend} <ArrowUp size={10} />
          </span>
        </div>
        <button type="button" onClick={onClick} className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center text-sm font-medium text-blue-100 hover:text-white relative z-10 transition-colors text-left">
          {linkText} <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  const colorStyles = color === 'green'
    ? { bg: 'bg-green-50', text: 'text-green-600' }
    : { bg: 'bg-red-50', text: 'text-red-600' };

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
        <button type="button" onClick={onClick} className="text-slate-400 hover:text-slate-600"><Ellipsis size={20} /></button>
      </div>
      <div className="flex items-end gap-3 mt-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        <span className={`text-xs font-medium ${colorStyles.bg} px-2 py-1 rounded-full ${colorStyles.text} mb-1 flex items-center gap-1`}>
          {trend} {trendUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
        </span>
      </div>
      <button type="button" onClick={onClick} className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors text-left">
        {linkText} <ArrowRight size={14} />
      </button>
    </div>
  );
});

const AccountItem = memo(({ account, onMenu }) => {
  const bgColors = {
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${bgColors[account.color] || bgColors.blue}`}>
            {account.initials}
          </div>
          <span className="text-sm font-semibold text-slate-800">{account.name}</span>
        </div>
        <button type="button" onClick={() => onMenu(account)} className="text-slate-400 hover:text-slate-600"><MoreVertical size={16} /></button>
      </div>
      <span className="text-lg font-bold text-slate-900">{formatCurrency(account.balance)}</span>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{account.status}</span>
        <span className="text-[10px] text-slate-500">{account.type}</span>
      </div>
    </div>
  );
});

const TransactionRow = memo(({ tx, checked, onCheck, onAction }) => {
  const iconColors = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-500',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const statusColors = tx.status === 'Concluído'
    ? 'bg-green-50 text-green-700'
    : 'bg-yellow-50 text-yellow-700';

  const TxIcon = categoryIconMap[tx.category] || ReceiptText;
  const color = categoryColorMap[tx.category] || 'blue';

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onCheck(tx.id)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColors[color]}`}>
            <TxIcon size={14} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{tx.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500">{tx.category}</span>
              {tx.tag && (
                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <BadgeCheck size={10} /> {tx.tag}
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
        <p className="text-sm text-slate-800">{formatDateLabel(tx.isoDate)}</p>
        <p className="text-xs text-slate-500">{formatTimeLabel(tx.timeRaw)}</p>
      </td>
      <td className="px-6 py-4">
        <span className={`text-sm font-medium ${tx.isIncome ? 'text-green-600' : 'text-slate-900'}`}>
          {tx.isIncome ? '+ ' : ''}{formatCurrency(tx.amountValue)}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Concluído' ? 'bg-green-500' : 'bg-yellow-500'}`} /> {tx.status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="relative inline-flex">
          <button
            type="button"
            onClick={() => onAction('menu', tx)}
            className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Ellipsis size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
});

// --- COMPONENTE PRINCIPAL ---
const Dinheiro = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const { user, sessionLoading } = useAuth();
  const [accounts, setAccounts] = useState(() =>
    getDemoAccounts('preview-user').map((account, index) => ({
      id: `preview-account-${index}`,
      name: account.name,
      balance: Number(account.balance || 0),
      type: account.type || 'Corrente',
      status: account.status || 'Ativa',
      color: account.color || 'blue',
      initials: account.initials || getInitials(account.name),
    }))
  );
  const [transactions, setTransactions] = useState(() =>
    getDemoTransactions('preview-user').map((tx, index) => ({
      id: `preview-transaction-${index}`,
      title: tx.title,
      category: tx.category,
      tag: tx.tag || '',
      account: tx.account_name,
      isoDate: tx.transaction_date,
      timeRaw: tx.time_raw || '09:00',
      amountValue: Number(tx.amount_value || 0),
      status: tx.status || 'Pendente',
      isIncome: Boolean(tx.is_income),
    }))
  );
  const [period, setPeriod] = useState('current');
  const [chartMode, setChartMode] = useState('annual');
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [summaryModal, setSummaryModal] = useState(null);
  const [activeTx, setActiveTx] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [savingTransaction, setSavingTransaction] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    status: 'Todos',
    account: 'Todas',
    type: 'Todos',
    category: 'Todas',
  });

  const [newTransaction, setNewTransaction] = useState({
    title: '',
    category: 'Software',
    account: '',
    isoDate: getTodayISO(),
    timeRaw: '09:00',
    amountValue: '',
    status: 'Concluído',
    isIncome: false,
    tag: '',
  });

  const [newAccount, setNewAccount] = useState({
    name: '',
    balance: '',
    type: 'Corrente',
    status: 'Ativa',
    color: 'blue',
    initials: '',
  });

  const normalizeAccounts = (items) => (items || []).map((account) => ({
    id: account.id,
    name: account.name,
    balance: Number(account.balance || 0),
    type: account.type || 'Corrente',
    status: account.status || 'Ativa',
    color: account.color || 'blue',
    initials: account.initials || getInitials(account.name),
  }));

  const normalizeTransactions = (items) => (items || []).map((tx) => ({
    id: tx.id,
    title: tx.title,
    category: tx.category,
    tag: tx.tag || '',
    account: tx.account_name,
    isoDate: tx.transaction_date,
    timeRaw: tx.time_raw || '09:00',
    amountValue: Number(tx.amount_value || 0),
    status: tx.status || 'Pendente',
    isIncome: Boolean(tx.is_income),
  }));

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const fetchMoneyData = async (currentUser = user) => {
    if (!currentUser) return;

    setError('');

    const { data: accountRows, error: accountError } = await supabase
      .from('money_accounts')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: true });

    if (accountError) {
      console.error('Erro ao carregar money_accounts:', accountError);
      setError(`Erro ao carregar contas: ${accountError.message}`);
      return;
    }

    const { data: transactionRows, error: transactionError } = await supabase
      .from('money_transactions')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('transaction_date', { ascending: false })
      .order('time_raw', { ascending: false });

    if (transactionError) {
      console.error('Erro ao carregar money_transactions:', transactionError);
      setError(`Erro ao carregar transações: ${transactionError.message}`);
      return;
    }

    let finalAccounts = accountRows || [];
    let finalTransactions = transactionRows || [];

    if (finalAccounts.length === 0) {
      const { data: insertedAccounts, error: demoAccountsError } = await supabase
        .from('money_accounts')
        .insert(getDemoAccounts(currentUser.id))
        .select();

      if (demoAccountsError) {
        console.error('Erro ao criar contas demo:', demoAccountsError);
        setError(`Erro ao criar contas demo: ${demoAccountsError.message}`);
        return;
      }

      finalAccounts = insertedAccounts || [];
    }

    if (finalTransactions.length === 0) {
      const { data: insertedTransactions, error: demoTransactionsError } = await supabase
        .from('money_transactions')
        .insert(getDemoTransactions(currentUser.id))
        .select();

      if (demoTransactionsError) {
        console.error('Erro ao criar transações demo:', demoTransactionsError);
        setError(`Erro ao criar transações demo: ${demoTransactionsError.message}`);
        return;
      }

      finalTransactions = insertedTransactions || [];
    }

    setAccounts(normalizeAccounts(finalAccounts));
    setTransactions(normalizeTransactions(finalTransactions));

    const normalizedAccounts = normalizeAccounts(finalAccounts);
    setNewTransaction((prev) => ({
      ...prev,
      account: prev.account || normalizedAccounts[0]?.name || '',
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
      await fetchMoneyData(user);
      setLoadingData(false);
    };

    loadData();
  }, [sessionLoading, user, navigate]);

  const visibleMonth = period === 'current' ? CURRENT_MONTH : LAST_MONTH;

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();

    return transactions
      .filter((tx) => getMonthKey(tx.isoDate) === visibleMonth)
      .filter((tx) => {
        if (!q) return true;
        return [tx.title, tx.category, tx.account, tx.status, tx.tag]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));
      })
      .filter((tx) => filters.status === 'Todos' || tx.status === filters.status)
      .filter((tx) => filters.account === 'Todas' || tx.account === filters.account)
      .filter((tx) => filters.type === 'Todos' || (filters.type === 'Entrada' ? tx.isIncome : !tx.isIncome))
      .filter((tx) => filters.category === 'Todas' || tx.category === filters.category)
      .sort((a, b) => new Date(`${b.isoDate}T${b.timeRaw}`) - new Date(`${a.isoDate}T${a.timeRaw}`));
  }, [transactions, search, filters, visibleMonth]);

  const totals = useMemo(() => {
    const periodTx = transactions.filter((tx) => getMonthKey(tx.isoDate) === visibleMonth);
    const income = periodTx.filter((tx) => tx.isIncome).reduce((sum, tx) => sum + Number(tx.amountValue), 0);
    const expense = periodTx.filter((tx) => !tx.isIncome).reduce((sum, tx) => sum + Number(tx.amountValue), 0);
    const balance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
    const cashFlow = income - expense;

    return { income, expense, balance, cashFlow, periodTx };
  }, [accounts, transactions, visibleMonth]);

  const categories = useMemo(() => {
    const all = transactions.map((tx) => tx.category).filter(Boolean);
    return ['Todas', ...Array.from(new Set(all))];
  }, [transactions]);

  const chartData = useMemo(() => {
    if (chartMode === 'monthly') {
      const days = ['01-07', '08-14', '15-21', '22-30'];
      return days.map((range) => {
        const [start, end] = range.split('-').map(Number);
        const value = transactions
          .filter((tx) => getMonthKey(tx.isoDate) === visibleMonth)
          .filter((tx) => {
            const day = Number(tx.isoDate.slice(8, 10));
            return day >= start && day <= end;
          })
          .reduce((sum, tx) => sum + (tx.isIncome ? tx.amountValue : -tx.amountValue), 0);

        return { name: range, value: Math.max(value, 0), active: range === '15-21' };
      });
    }

    const months = [
      { key: '2026-01', name: 'Jan', base: 30000 },
      { key: '2026-02', name: 'Fev', base: 25000 },
      { key: '2026-03', name: 'Mar', base: 45000 },
      { key: '2026-04', name: 'Abr', base: 32000 },
      { key: '2026-05', name: 'Mai', base: 38000 },
      { key: '2026-06', name: 'Jun', base: 22000 },
      { key: '2026-07', name: 'Jul', base: 28000 },
    ];

    return months.map((month) => {
      const monthTx = transactions.filter((tx) => getMonthKey(tx.isoDate) === month.key);
      const dynamicValue = monthTx.reduce((sum, tx) => sum + (tx.isIncome ? tx.amountValue : -tx.amountValue), 0);
      return {
        name: month.name,
        value: Math.max(month.base + dynamicValue, 0),
        active: month.key === visibleMonth,
      };
    });
  }, [transactions, visibleMonth, chartMode]);

  const applyAccountBalanceDelta = async (accountName, amount, isIncome, direction = 1) => {
    const currentAccount = accounts.find((account) => account.name === accountName);
    if (!currentAccount) return null;

    const signedAmount = isIncome ? Number(amount) : -Number(amount);
    const nextBalance = Math.max(Number(currentAccount.balance) + signedAmount * direction, 0);

    const { error: updateError } = await supabase
      .from('money_accounts')
      .update({ balance: nextBalance })
      .eq('id', currentAccount.id)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    setAccounts((prev) => prev.map((account) => (
      account.id === currentAccount.id ? { ...account, balance: nextBalance } : account
    )));

    return nextBalance;
  };

  const resetData = async () => {
    if (!user || resetting) return;

    const confirmReset = window.confirm(
      'Tem certeza que deseja resetar os dados desta tela? Isso apaga as contas/transações atuais e recria os dados de apresentação.'
    );

    if (!confirmReset) return;

    setResetting(true);
    setError('');

    try {
      const { error: deleteTransactionsError } = await supabase
        .from('money_transactions')
        .delete()
        .eq('user_id', user.id);

      if (deleteTransactionsError) throw deleteTransactionsError;

      const { error: deleteAccountsError } = await supabase
        .from('money_accounts')
        .delete()
        .eq('user_id', user.id);

      if (deleteAccountsError) throw deleteAccountsError;

      const { data: insertedAccounts, error: insertAccountsError } = await supabase
        .from('money_accounts')
        .insert(getDemoAccounts(user.id))
        .select();

      if (insertAccountsError) throw insertAccountsError;

      const { data: insertedTransactions, error: insertTransactionsError } = await supabase
        .from('money_transactions')
        .insert(getDemoTransactions(user.id))
        .select();

      if (insertTransactionsError) throw insertTransactionsError;

      const normalizedAccounts = normalizeAccounts(insertedAccounts);
      setAccounts(normalizedAccounts);
      setTransactions(normalizeTransactions(insertedTransactions));
      setSearch('');
      setFilters({ status: 'Todos', account: 'Todas', type: 'Todos', category: 'Todas' });
      setSelectedIds([]);
      setNewTransaction((prev) => ({ ...prev, account: normalizedAccounts[0]?.name || '' }));
      showToast('Dados de apresentação restaurados.');
    } catch (err) {
      console.error('Erro ao resetar dados:', err);
      setError(`Erro ao resetar dados: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  const handleCreateTransaction = async (event) => {
    event.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    const amount = parseCurrency(newTransaction.amountValue);

    if (!newTransaction.title.trim() || !amount || !newTransaction.account) {
      showToast('Preencha título, conta e valor da transação.');
      return;
    }

    setSavingTransaction(true);
    setError('');

    try {
      const payload = {
        user_id: user.id,
        title: newTransaction.title.trim(),
        category: newTransaction.category,
        tag: newTransaction.tag.trim(),
        account_name: newTransaction.account,
        transaction_date: newTransaction.isoDate,
        time_raw: newTransaction.timeRaw,
        amount_value: amount,
        status: newTransaction.status,
        is_income: Boolean(newTransaction.isIncome),
      };

      const { data, error: insertError } = await supabase
        .from('money_transactions')
        .insert(payload)
        .select()
        .single();

      if (insertError) throw insertError;

      const tx = normalizeTransactions([data])[0];
      setTransactions((prev) => [tx, ...prev]);

      if (tx.status === 'Concluído') {
        await applyAccountBalanceDelta(tx.account, tx.amountValue, tx.isIncome, 1);
      }

      setTransactionModalOpen(false);
      setNewTransaction({
        title: '',
        category: 'Software',
        account: accounts[0]?.name || '',
        isoDate: getTodayISO(),
        timeRaw: '09:00',
        amountValue: '',
        status: 'Concluído',
        isIncome: false,
        tag: '',
      });
      showToast('Nova transação adicionada com sucesso.');
    } catch (err) {
      console.error('Erro ao criar transação:', err);
      setError(`Erro ao criar transação: ${err.message}`);
      showToast('Não foi possível salvar a transação.');
    } finally {
      setSavingTransaction(false);
    }
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    const name = newAccount.name.trim();
    const balance = parseCurrency(newAccount.balance);

    if (!name) {
      showToast('Informe o nome do banco ou carteira.');
      return;
    }

    if (accounts.some((account) => account.name.toLowerCase() === name.toLowerCase())) {
      showToast('Essa conta já existe no dashboard.');
      return;
    }

    setSavingAccount(true);
    setError('');

    try {
      const payload = {
        user_id: user.id,
        name,
        balance,
        type: newAccount.type,
        status: newAccount.status,
        color: newAccount.color,
        initials: (newAccount.initials || getInitials(name)).slice(0, 2).toUpperCase(),
      };

      const { data, error: insertError } = await supabase
        .from('money_accounts')
        .insert(payload)
        .select()
        .single();

      if (insertError) throw insertError;

      const account = normalizeAccounts([data])[0];
      setAccounts((prev) => [...prev, account]);
      setNewTransaction((prev) => ({ ...prev, account: account.name }));
      setAccountModalOpen(false);
      setNewAccount({ name: '', balance: '', type: 'Corrente', status: 'Ativa', color: 'blue', initials: '' });
      showToast(`${account.name} adicionada em Minhas Contas.`);
    } catch (err) {
      console.error('Erro ao criar conta:', err);
      setError(`Erro ao criar conta: ${err.message}`);
      showToast('Não foi possível adicionar a conta.');
    } finally {
      setSavingAccount(false);
    }
  };

  const handleTransactionAction = async (action, tx) => {
    if (action === 'menu') {
      setActiveTx(tx);
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (action === 'complete') {
        if (tx.status === 'Concluído') {
          setActiveTx(null);
          showToast('Essa transação já está concluída.');
          return;
        }

        const { error: updateError } = await supabase
          .from('money_transactions')
          .update({ status: 'Concluído' })
          .eq('id', tx.id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        await applyAccountBalanceDelta(tx.account, tx.amountValue, tx.isIncome, 1);
        setTransactions((prev) => prev.map((item) => item.id === tx.id ? { ...item, status: 'Concluído' } : item));
        setActiveTx(null);
        showToast('Transação marcada como concluída.');
      }

      if (action === 'duplicate') {
        const payload = {
          user_id: user.id,
          title: `${tx.title} (cópia)`,
          category: tx.category,
          tag: tx.tag || '',
          account_name: tx.account,
          transaction_date: getTodayISO(),
          time_raw: tx.timeRaw || '09:00',
          amount_value: tx.amountValue,
          status: 'Pendente',
          is_income: tx.isIncome,
        };

        const { data, error: insertError } = await supabase
          .from('money_transactions')
          .insert(payload)
          .select()
          .single();

        if (insertError) throw insertError;

        const copy = normalizeTransactions([data])[0];
        setTransactions((prev) => [copy, ...prev]);
        setActiveTx(null);
        showToast('Transação duplicada como pendente.');
      }

      if (action === 'delete') {
        const { error: deleteError } = await supabase
          .from('money_transactions')
          .delete()
          .eq('id', tx.id)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        if (tx.status === 'Concluído') {
          await applyAccountBalanceDelta(tx.account, tx.amountValue, tx.isIncome, -1);
        }

        setTransactions((prev) => prev.filter((item) => item.id !== tx.id));
        setSelectedIds((prev) => prev.filter((id) => id !== tx.id));
        setActiveTx(null);
        showToast('Transação removida da lista.');
      }

      if (action === 'view') {
        setSummaryModal(tx);
        setActiveTx(null);
      }
    } catch (err) {
      console.error('Erro na ação da transação:', err);
      setError(`Erro na ação da transação: ${err.message}`);
      showToast('Não foi possível concluir essa ação.');
    }
  };

  const handleBulkComplete = async () => {
    if (!user || selectedIds.length === 0) return;

    const pendingSelected = transactions.filter((tx) => selectedIds.includes(tx.id) && tx.status !== 'Concluído');

    try {
      const { error: updateError } = await supabase
        .from('money_transactions')
        .update({ status: 'Concluído' })
        .in('id', pendingSelected.map((tx) => tx.id))
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      for (const tx of pendingSelected) {
        await applyAccountBalanceDelta(tx.account, tx.amountValue, tx.isIncome, 1);
      }

      setTransactions((prev) => prev.map((tx) => selectedIds.includes(tx.id) ? { ...tx, status: 'Concluído' } : tx));
      setSelectedIds([]);
      showToast('Transações selecionadas foram concluídas.');
    } catch (err) {
      console.error('Erro ao concluir em lote:', err);
      setError(`Erro ao concluir transações: ${err.message}`);
      showToast('Não foi possível concluir as selecionadas.');
    }
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    const visibleIds = filteredTransactions.map((tx) => tx.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : visibleIds);
  };

  const selectedSuggestion = (suggestion) => {
    setNewAccount((prev) => ({
      ...prev,
      name: suggestion.name,
      initials: suggestion.initials,
      color: suggestion.color,
      type: suggestion.type,
    }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  const ChartSection = useMemo(() => (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={0}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="transparent" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} tickCount={6} domain={[0, 'auto']} />
          <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} formatter={(value) => [formatCurrency(value), 'Valor']} />
          <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={36} isAnimationActive={false}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.active ? '#1e3a8a' : '#dcfce7'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  ), [chartData]);

  return (
    <div className="antialiased text-slate-900 font-sans min-h-screen flex flex-col relative overflow-x-hidden"
      style={{ background: 'radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 50%, #f1f5f9 100%)' }}>

      {toast && (
        <div className="fixed top-5 right-5 z-[60] flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 text-sm shadow-xl">
          <CheckCircle2 size={16} className="text-emerald-300" />
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 lg:px-12 lg:py-6 z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Layers size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight">LifeOS</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetData}
            disabled={resetting}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {resetting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Resetando...
              </>
            ) : (
              <>
                <RotateCw size={16} />
                Resetar dados
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium shadow-sm"
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
              <span className="text-sm font-semibold text-slate-800 truncate">{displayName}</span>
              <span className="text-xs text-slate-500 truncate">{user?.email}</span>
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
                showDivider={index > 0 && MENU_ITEMS[index - 1].section !== item.section}
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
              <p className="text-sm text-slate-500 mt-1">Gerencie suas entradas, saídas e fluxo de caixa por usuário.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                <button
                  type="button"
                  onClick={() => setPeriod('current')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md ${period === 'current' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Este Mês
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('last')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md ${period === 'last' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Mês Passado
                </button>
              </div>
              <button
                type="button"
                onClick={() => setTransactionModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
              >
                <Plus size={16} /> Nova Transação
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Cards Financeiros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <FinanceCard title="Saldo Atual" subtitle="Visão Geral & Gastos" value={formatCurrency(totals.balance)} icon={Wallet} trend="+1.5%" trendUp linkText="Ver detalhes" color="blue" onClick={() => setSummaryModal({ kind: 'balance' })} />
            <FinanceCard title="Entradas" subtitle="Receitas do Mês" value={formatCurrency(totals.income)} icon={ArrowDown} trend="+3.2%" trendUp linkText="Ver resumo" color="green" onClick={() => setFilters((prev) => ({ ...prev, type: 'Entrada' }))} />
            <FinanceCard title="Saídas" subtitle="Despesas do Mês" value={formatCurrency(totals.expense)} icon={ArrowUp} trend="-4.7%" trendUp={false} linkText="Analisar gastos" color="red" onClick={() => setFilters((prev) => ({ ...prev, type: 'Saída' }))} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Contas Widget */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Minhas Contas</h3>
                  <p className="text-xs text-slate-500 mt-1">Saldos atualizados</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAccountModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                >
                  <Plus size={14} /> Adicionar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {accounts.map((acc) => (
                  <AccountItem key={acc.id} account={acc} onMenu={(account) => setSummaryModal({ kind: 'account', account })} />
                ))}
              </div>
            </div>

            {/* Fluxo de Caixa Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Fluxo de Caixa</h3>
                  <p className={`text-2xl font-bold mt-1 ${totals.cashFlow >= 0 ? 'text-slate-900' : 'text-red-600'}`}>{formatCurrency(totals.cashFlow)}</p>
                </div>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setChartMode('monthly')}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md ${chartMode === 'monthly' ? 'bg-[#1e3a8a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    Mensal
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode('annual')}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md ${chartMode === 'annual' ? 'bg-[#1e3a8a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    Anual
                  </button>
                </div>
              </div>
              {ChartSection}
            </div>
          </div>

          {/* Lista de Transações */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-8 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <h3 className="text-base font-semibold text-slate-800">Atividades Recentes</h3>
                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkComplete}
                    className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full hover:bg-green-100"
                  >
                    <CheckCircle2 size={13} /> Concluir {selectedIds.length}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar transações..."
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Filtros <ListFilter size={14} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-10">
                      <input
                        type="checkbox"
                        checked={filteredTransactions.length > 0 && filteredTransactions.every((tx) => selectedIds.includes(tx.id))}
                        onChange={toggleAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Atividade</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Conta</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data & Hora</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      checked={selectedIds.includes(tx.id)}
                      onCheck={toggleSelected}
                      onAction={handleTransactionAction}
                    />
                  ))}
                </tbody>
              </table>

              {filteredTransactions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <AlertCircle size={28} className="text-slate-300 mb-3" />
                  <p className="text-sm font-semibold text-slate-700">Nenhuma transação encontrada</p>
                  <p className="text-xs text-slate-500 mt-1">Tente limpar a busca ou mudar os filtros.</p>
                </div>
              )}
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

      {/* Menu da linha */}
      {activeTx && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveTx(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-8 top-1/2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-2"
          >
            <button type="button" onClick={() => handleTransactionAction('view', activeTx)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50">
              <Eye size={15} /> Ver detalhes
            </button>
            <button type="button" onClick={() => handleTransactionAction('complete', activeTx)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50">
              <CheckCircle2 size={15} /> Marcar como concluída
            </button>
            <button type="button" onClick={() => handleTransactionAction('duplicate', activeTx)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50">
              <Copy size={15} /> Duplicar como pendente
            </button>
            <button type="button" onClick={() => handleTransactionAction('delete', activeTx)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50">
              <Trash2 size={15} /> Remover
            </button>
          </div>
        </div>
      )}

      {/* Modal Nova Transação */}
      {transactionModalOpen && (
        <Modal
          title="Nova Transação"
          subtitle="Adicione uma entrada ou saída vinculada a uma conta existente."
          onClose={() => setTransactionModalOpen(false)}
        >
          <form onSubmit={handleCreateTransaction} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tipo">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTransaction((prev) => ({ ...prev, isIncome: true, category: prev.category === 'Software' ? 'Freelance' : prev.category }))}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium ${newTransaction.isIncome ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-600'}`}
                  >
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTransaction((prev) => ({ ...prev, isIncome: false, category: prev.category === 'Freelance' ? 'Software' : prev.category }))}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium ${!newTransaction.isIncome ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-600'}`}
                  >
                    Saída
                  </button>
                </div>
              </Field>

              <Field label="Status">
                <select className={inputClass} value={newTransaction.status} onChange={(e) => setNewTransaction((prev) => ({ ...prev, status: e.target.value }))}>
                  <option>Concluído</option>
                  <option>Pendente</option>
                </select>
              </Field>
            </div>

            <Field label="Título">
              <input className={inputClass} value={newTransaction.title} onChange={(e) => setNewTransaction((prev) => ({ ...prev, title: e.target.value }))} placeholder="Ex: Pagamento cliente, mercado, assinatura..." />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Categoria">
                <select className={inputClass} value={newTransaction.category} onChange={(e) => setNewTransaction((prev) => ({ ...prev, category: e.target.value }))}>
                  <option>Software</option>
                  <option>Viagem</option>
                  <option>Renda Fixa</option>
                  <option>Alimentação</option>
                  <option>Transporte</option>
                  <option>Freelance</option>
                  <option>Banco</option>
                  <option>Outros</option>
                </select>
              </Field>

              <Field label="Conta vinculada">
                <select className={inputClass} value={newTransaction.account} onChange={(e) => setNewTransaction((prev) => ({ ...prev, account: e.target.value }))}>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.name}>{account.name} · {formatCurrency(account.balance)}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Valor">
                <input className={inputClass} value={newTransaction.amountValue} onChange={(e) => setNewTransaction((prev) => ({ ...prev, amountValue: e.target.value }))} placeholder="R$ 0,00" />
              </Field>
              <Field label="Data">
                <input type="date" className={inputClass} value={newTransaction.isoDate} onChange={(e) => setNewTransaction((prev) => ({ ...prev, isoDate: e.target.value }))} />
              </Field>
              <Field label="Hora">
                <input type="time" className={inputClass} value={newTransaction.timeRaw} onChange={(e) => setNewTransaction((prev) => ({ ...prev, timeRaw: e.target.value }))} />
              </Field>
            </div>

            <Field label="Tag opcional">
              <input className={inputClass} value={newTransaction.tag} onChange={(e) => setNewTransaction((prev) => ({ ...prev, tag: e.target.value }))} placeholder="Ex: Sugestão, Recorrente, Revisar" />
            </Field>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-xs text-slate-500 flex gap-2">
              <Clock3 size={16} className="text-slate-400 flex-shrink-0" />
              Transações concluídas atualizam automaticamente o saldo da conta escolhida no Supabase. Transações pendentes aparecem na tabela, mas não mexem no saldo até serem concluídas.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setTransactionModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" disabled={savingTransaction} className="px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                {savingTransaction && <Loader2 size={16} className="animate-spin" />}
                {savingTransaction ? 'Salvando...' : 'Adicionar transação'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Adicionar Conta */}
      {accountModalOpen && (
        <Modal
          title="Adicionar Conta Bancária"
          subtitle="Cadastre uma conta coerente com o dashboard financeiro."
          onClose={() => setAccountModalOpen(false)}
        >
          <form onSubmit={handleCreateAccount} className="p-6 space-y-5">
            <div>
              <span className="text-xs font-semibold text-slate-600">Sugestões rápidas</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {bankSuggestions.map((bank) => (
                  <button
                    key={bank.name}
                    type="button"
                    onClick={() => selectedSuggestion(bank)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 text-left"
                  >
                    {bank.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Banco ou carteira">
                <input className={inputClass} value={newAccount.name} onChange={(e) => setNewAccount((prev) => ({ ...prev, name: e.target.value, initials: prev.initials || getInitials(e.target.value) }))} placeholder="Ex: Banco do Brasil" />
              </Field>
              <Field label="Saldo inicial">
                <input className={inputClass} value={newAccount.balance} onChange={(e) => setNewAccount((prev) => ({ ...prev, balance: e.target.value }))} placeholder="R$ 0,00" />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Tipo de conta">
                <select className={inputClass} value={newAccount.type} onChange={(e) => setNewAccount((prev) => ({ ...prev, type: e.target.value }))}>
                  <option>Corrente</option>
                  <option>Poupança</option>
                  <option>Digital</option>
                  <option>Investimento</option>
                  <option>Carteira</option>
                </select>
              </Field>
              <Field label="Iniciais">
                <input maxLength={2} className={inputClass} value={newAccount.initials} onChange={(e) => setNewAccount((prev) => ({ ...prev, initials: e.target.value.toUpperCase() }))} placeholder="BB" />
              </Field>
              <Field label="Cor">
                <select className={inputClass} value={newAccount.color} onChange={(e) => setNewAccount((prev) => ({ ...prev, color: e.target.value }))}>
                  {colorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </Field>
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-700 flex gap-2">
              <Building2 size={16} className="text-blue-600 flex-shrink-0" />
              A nova conta entra no card “Minhas Contas”, aparece no seletor de transações e passa a compor o Saldo Atual do usuário logado.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setAccountModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" disabled={savingAccount} className="px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                {savingAccount && <Loader2 size={16} className="animate-spin" />}
                {savingAccount ? 'Salvando...' : 'Adicionar conta'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Filtros */}
      {filtersOpen && (
        <Modal
          title="Filtros de Atividades"
          subtitle="Refine a lista mantendo o período selecionado no topo."
          onClose={() => setFiltersOpen(false)}
          width="max-w-lg"
        >
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Status">
                <select className={inputClass} value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
                  <option>Todos</option>
                  <option>Concluído</option>
                  <option>Pendente</option>
                </select>
              </Field>
              <Field label="Tipo">
                <select className={inputClass} value={filters.type} onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}>
                  <option>Todos</option>
                  <option>Entrada</option>
                  <option>Saída</option>
                </select>
              </Field>
              <Field label="Conta">
                <select className={inputClass} value={filters.account} onChange={(e) => setFilters((prev) => ({ ...prev, account: e.target.value }))}>
                  <option>Todas</option>
                  {accounts.map((account) => <option key={account.id}>{account.name}</option>)}
                </select>
              </Field>
              <Field label="Categoria">
                <select className={inputClass} value={filters.category} onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}>
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </Field>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-xs text-slate-500 flex gap-2">
              <CalendarDays size={16} className="text-slate-400 flex-shrink-0" />
              O filtro de tempo principal continua sendo “Este Mês” ou “Mês Passado”, para manter os cards, gráfico e tabela falando do mesmo período.
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFilters({ status: 'Todos', account: 'Todas', type: 'Todos', category: 'Todas' })}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Limpar filtros
              </button>
              <button type="button" onClick={() => setFiltersOpen(false)} className="px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700">Aplicar</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Resumo / Detalhe */}
      {summaryModal && (
        <Modal
          title={summaryModal.kind === 'balance' ? 'Resumo do Saldo' : summaryModal.kind === 'account' ? 'Detalhes da Conta' : 'Detalhes da Transação'}
          subtitle="Dados conectados ao estado atual da tela."
          onClose={() => setSummaryModal(null)}
          width="max-w-lg"
        >
          <div className="p-6 space-y-4">
            {summaryModal.kind === 'balance' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                    <p className="text-xs text-blue-700">Saldo total</p>
                    <p className="text-xl font-bold text-blue-950 mt-1">{formatCurrency(totals.balance)}</p>
                  </div>
                  <div className="rounded-xl bg-green-50 p-4 border border-green-100">
                    <p className="text-xs text-green-700">Fluxo do período</p>
                    <p className="text-xl font-bold text-green-800 mt-1">{formatCurrency(totals.cashFlow)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {accounts.map((account) => (
                    <div key={account.id} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                      <span className="text-slate-600">{account.name}</span>
                      <strong>{formatCurrency(account.balance)}</strong>
                    </div>
                  ))}
                </div>
              </>
            )}

            {summaryModal.kind === 'account' && (
              <>
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-xs text-slate-500">Conta</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{summaryModal.account.name}</p>
                  <p className="text-sm text-slate-500 mt-1">{summaryModal.account.type} · {summaryModal.account.status}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Saldo atual</span>
                  <strong>{formatCurrency(summaryModal.account.balance)}</strong>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Transações vinculadas</span>
                  <strong>{transactions.filter((tx) => tx.account === summaryModal.account.name).length}</strong>
                </div>
              </>
            )}

            {!summaryModal.kind && (
              <>
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-xs text-slate-500">Transação</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{summaryModal.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{summaryModal.category} · {summaryModal.account}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-slate-500">Valor</span>
                    <p className={`font-bold mt-1 ${summaryModal.isIncome ? 'text-green-600' : 'text-slate-900'}`}>{summaryModal.isIncome ? '+ ' : ''}{formatCurrency(summaryModal.amountValue)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-slate-500">Status</span>
                    <p className="font-bold mt-1">{summaryModal.status}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-slate-500">Data</span>
                    <p className="font-bold mt-1">{formatDateLabel(summaryModal.isoDate)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-slate-500">Hora</span>
                    <p className="font-bold mt-1">{formatTimeLabel(summaryModal.timeRaw)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dinheiro;

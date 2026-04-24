import React, { useState, useMemo, memo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layers, Globe, ChevronDown, LayoutGrid, Wallet,
  FileText, RotateCcw, HandCoins, TrendingUp,
  Search, Plus, Ellipsis, ArrowRight, Calculator,
  CreditCard, Landmark, Filter, ShieldCheck,
  X, Trash2, Edit, CheckCircle2, AlertCircle, Bell,
  DollarSign, BarChart3, Target, TrendingDown, Copy,
  Eye, Banknote, CalendarDays, RotateCw, Info, PiggyBank,
  ArrowDownCircle, ArrowUpCircle
} from 'lucide-react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

// --- UTILITÁRIOS ---
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

const TODAY = '2026-04-24';

const formatPercent = (value) => `${Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;

const getDebtVisuals = (type, cet, status) => {
  const isCard = type.includes('Cartão');
  const isFinancing = type.includes('Financiamento');

  return {
    icon: isCard ? 'CreditCard' : 'Landmark',
    iconColor: isCard
      ? 'text-purple-600 bg-purple-100'
      : isFinancing
        ? 'text-blue-600 bg-blue-100'
        : 'text-orange-600 bg-orange-100',
    cetColor: Number(cet) > 8
      ? 'text-red-600 bg-red-50 border-red-100'
      : Number(cet) > 4
        ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
        : 'text-slate-600 bg-slate-100 border-slate-200',
    statusColor: status === 'Atrasado'
      ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
      : status === 'Renegociando'
        ? 'text-blue-700 bg-blue-50 border-blue-200'
        : 'text-green-700 bg-green-50 border-green-200',
    statusDot: status === 'Atrasado' ? 'bg-yellow-500' : status === 'Renegociando' ? 'bg-blue-500' : 'bg-green-500',
  };
};

const buildDebt = (data, id = Date.now()) => {
  const visuals = getDebtVisuals(data.type, data.cet, data.status);
  return {
    id,
    creditor: data.creditor,
    type: data.type,
    balance: Number(data.balance || 0),
    originalBalance: Number(data.originalBalance || data.balance || 0),
    installment: Number(data.installment || 0),
    cet: Number(data.cet || 0),
    status: data.status || 'Em dia',
    dueDay: Number(data.dueDay || 10),
    account: data.account || 'Nubank',
    notes: data.notes || '',
    hasSimulation: true,
    ...visuals,
  };
};

const INITIAL_DEBTS = Object.freeze([
  buildDebt({
    creditor: 'Nubank',
    type: 'Cartão de Crédito',
    balance: 5678,
    originalBalance: 7200,
    installment: 850,
    cet: 12.5,
    status: 'Atrasado',
    dueDay: 8,
    account: 'Nubank',
    notes: 'Fatura em atraso com juros altos. Prioridade no método avalanche.',
  }, 1),
  buildDebt({
    creditor: 'Itaú',
    type: 'Empréstimo Pessoal',
    balance: 8345,
    originalBalance: 12000,
    installment: 650.45,
    cet: 3.2,
    status: 'Em dia',
    dueDay: 15,
    account: 'Itaú',
    notes: 'Contrato em dia, bom candidato para portabilidade se taxa menor aparecer.',
  }, 2),
  buildDebt({
    creditor: 'Banco do Brasil',
    type: 'Financiamento',
    balance: 18400,
    originalBalance: 25000,
    installment: 1180,
    cet: 1.85,
    status: 'Em dia',
    dueDay: 20,
    account: 'Banco do Brasil',
    notes: 'Taxa menor, não é prioridade no avalanche.',
  }, 3),
]);

const MENU_ITEMS = Object.freeze([
  { name: 'Painel Unificado', path: '/dashboard', icon: LayoutGrid, section: 1 },
  { name: 'Dinheiro', path: '/dinheiro', icon: Wallet, section: 1 },
  { name: 'Contas & Boletos', path: '/contas', icon: FileText, section: 1 },
  { name: 'Assinaturas', path: '/assinaturas', icon: RotateCcw, section: 1 },
  { name: 'Dívidas', path: '/dividas', icon: HandCoins, section: 1 },
  { name: 'Investimentos', path: '/investimentos', icon: TrendingUp, section: 1 },
]);

const ICONS = { CreditCard, Landmark };
const debtTypes = ['Cartão de Crédito', 'Empréstimo Pessoal', 'Financiamento', 'Cheque Especial', 'Outros'];
const statusOptions = ['Em dia', 'Atrasado', 'Renegociando'];
const accountOptions = ['Nubank', 'Itaú', 'Banco do Brasil'];


const toDbDebt = (debt, userId) => ({
  user_id: userId,
  creditor: debt.creditor,
  type: debt.type,
  balance: Number(debt.balance || 0),
  original_balance: Number(debt.originalBalance || debt.balance || 0),
  installment: Number(debt.installment || 0),
  cet: Number(debt.cet || 0),
  status: debt.status || 'Em dia',
  due_day: Number(debt.dueDay || 10),
  account: debt.account || 'Nubank',
  notes: debt.notes || '',
});

const normalizeDebt = (item) => buildDebt({
  creditor: item.creditor,
  type: item.type,
  balance: Number(item.balance || 0),
  originalBalance: Number(item.original_balance || item.balance || 0),
  installment: Number(item.installment || 0),
  cet: Number(item.cet || 0),
  status: item.status || 'Em dia',
  dueDay: Number(item.due_day || 10),
  account: item.account || 'Nubank',
  notes: item.notes || '',
}, item.id);

const getDemoDebts = (userId) => INITIAL_DEBTS.map((debt) => toDbDebt(debt, userId));

// --- SUB-COMPONENTES ---
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

const MetricCard = memo(({ title, value, linkText, linkColor, onClick, icon: Icon }) => (
  <button onClick={onClick} className="text-left bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <div className="p-1.5 rounded-md bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">
        {Icon ? <Icon size={16} /> : <Ellipsis size={16} />}
      </div>
    </div>
    <span className={`text-3xl font-bold mt-1 ${title.includes('Juros') ? 'text-red-600' : title.includes('Economia') ? 'text-green-600' : 'text-slate-900'}`}>
      {value}
    </span>
    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
      <span className={`text-sm font-medium hover:opacity-80 transition-opacity ${linkColor}`}>{linkText}</span>
      <ArrowRight size={14} className={linkColor} />
    </div>
  </button>
));

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onClose, 2600);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-5 right-5 z-[60] animate-in slide-in-from-top-3 fade-in duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
        type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        {type === 'success' ? <CheckCircle2 size={20} className="text-emerald-500" /> : <AlertCircle size={20} className="text-red-500" />}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600"><X size={16} /></button>
      </div>
    </div>
  );
};

const Modal = ({ title, subtitle, children, onClose, width = 'max-w-md' }) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
    <div className={`bg-white rounded-2xl w-full ${width} shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden`}>
      <div className="flex justify-between items-start gap-4 px-6 py-5 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
    {children}
  </label>
);

const inputClass = 'w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

// --- COMPONENTE PRINCIPAL ---
const Dividas = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, sessionLoading } = useAuth();

  const [debts, setDebts] = useState(INITIAL_DEBTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [strategy, setStrategy] = useState('avalanche');
  const [chartPeriod, setChartPeriod] = useState('mensal');
  const [extraPayment, setExtraPayment] = useState(300);
  const [selectedDebts, setSelectedDebts] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [toastNotif, setToastNotif] = useState({ message: '', type: 'success' });
  const [syncing, setSyncing] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [renegOpen, setRenegOpen] = useState(false);
  const [deleteOpen, setDeleteDialogOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    creditor: '',
    type: 'Cartão de Crédito',
    balance: '',
    originalBalance: '',
    installment: '',
    cet: '',
    status: 'Em dia',
    dueDay: 10,
    account: 'Nubank',
    notes: '',
  });

  const [paymentData, setPaymentData] = useState({ amount: '', kind: 'extra' });
  const [renegData, setRenegData] = useState({ newCet: '', newInstallment: '', discount: '', note: '' });

  const showToast = (message, type = 'success') => setToastNotif({ message, type });

  const fetchDebts = async (userId) => {
    if (!userId) return;

    setSyncing(true);

    const { data, error } = await supabase
      .from('debt_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao carregar dívidas:', error);
      showToast(`Erro ao carregar dívidas: ${error.message}`, 'error');
      setSyncing(false);
      return;
    }

    if ((data || []).length === 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('debt_items')
        .insert(getDemoDebts(userId))
        .select('*');

      if (insertError) {
        console.error('Erro ao criar dívidas demo:', insertError);
        showToast(`Erro ao criar dívidas demo: ${insertError.message}`, 'error');
        setSyncing(false);
        return;
      }

      setDebts((inserted || []).map(normalizeDebt));
      setSyncing(false);
      return;
    }

    setDebts((data || []).map(normalizeDebt));
    setSyncing(false);
  };

  const updateDebtInDatabase = async (debt) => {
    if (!user) {
      showToast('Aguarde a sessão carregar para salvar.', 'error');
      return null;
    }

    const { data, error } = await supabase
      .from('debt_items')
      .update(toDbDebt(debt, user.id))
      .eq('id', debt.id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao atualizar dívida:', error);
      showToast(`Erro ao atualizar dívida: ${error.message}`, 'error');
      return null;
    }

    return normalizeDebt(data);
  };

  useEffect(() => {
    if (sessionLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    fetchDebts(user.id);
  }, [sessionLoading, user, navigate]);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  const stats = useMemo(() => {
    const totalBalance = debts.reduce((acc, curr) => acc + curr.balance, 0);
    const totalInstallment = debts.reduce((acc, curr) => acc + curr.installment, 0);
    const estimatedInterest = debts.reduce((acc, curr) => acc + (curr.balance * (curr.cet / 100) * 12), 0);
    const avgCet = totalBalance ? debts.reduce((acc, curr) => acc + (curr.cet * curr.balance), 0) / totalBalance : 0;
    const overdue = debts.filter((debt) => debt.status === 'Atrasado').reduce((acc, curr) => acc + curr.balance, 0);
    const progress = debts.reduce((acc, curr) => acc + Math.max(0, (curr.originalBalance || curr.balance) - curr.balance), 0);
    const original = debts.reduce((acc, curr) => acc + (curr.originalBalance || curr.balance), 0);
    const progressPercent = original ? (progress / original) * 100 : 0;

    return { totalBalance, totalInstallment, estimatedInterest, avgCet, overdue, progress, original, progressPercent };
  }, [debts]);

  const filteredDebts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return debts
      .filter((debt) => statusFilter === 'Todos' || debt.status === statusFilter)
      .filter((debt) => !q || [debt.creditor, debt.type, debt.status, debt.account, debt.notes]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)));
  }, [searchTerm, debts, statusFilter]);

  const priorityDebts = useMemo(() => {
    const sorted = [...debts].filter((debt) => debt.balance > 0);
    if (strategy === 'avalanche') sorted.sort((a, b) => b.cet - a.cet);
    else sorted.sort((a, b) => a.balance - b.balance);
    return sorted;
  }, [debts, strategy]);

  const chartData = useMemo(() => {
    if (debts.length === 0) return [];

    const points = chartPeriod === 'mensal' ? 12 : 5;
    const stepMonths = chartPeriod === 'mensal' ? 1 : 12;
    const labels = chartPeriod === 'mensal'
      ? ['Hoje', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12']
      : ['Hoje', 'Ano 1', 'Ano 2', 'Ano 3', 'Ano 4', 'Ano 5'];

    const currentDebtsSim = debts.map((d) => ({ ...d }));
    const currentDebtsMin = debts.map((d) => ({ ...d }));
    const data = [];

    for (let i = 0; i <= points; i += 1) {
      const totalSim = currentDebtsSim.reduce((acc, d) => acc + d.balance, 0);
      const totalMin = currentDebtsMin.reduce((acc, d) => acc + d.balance, 0);

      data.push({
        name: labels[i],
        estrategia: Math.max(0, Math.round(totalSim)),
        minimo: Math.max(0, Math.round(totalMin)),
      });

      for (let m = 0; m < stepMonths; m += 1) {
        let extra = Number(extraPayment || 0);
        if (strategy === 'avalanche') currentDebtsSim.sort((a, b) => b.cet - a.cet);
        else currentDebtsSim.sort((a, b) => a.balance - b.balance);

        currentDebtsSim.forEach((d) => {
          if (d.balance > 0) {
            const interest = d.balance * (d.cet / 100);
            let payment = Math.min(d.installment, d.balance + interest);
            if (extra > 0 && d.balance > 0) {
              payment += extra;
              extra = 0;
            }
            d.balance = Math.max(0, d.balance + interest - payment);
          }
        });

        currentDebtsMin.forEach((d) => {
          if (d.balance > 0) {
            const interest = d.balance * (d.cet / 100);
            const payment = Math.min(d.installment * 0.9, d.balance + interest);
            d.balance = Math.max(0, d.balance + interest - payment);
          }
        });
      }
    }
    return data;
  }, [debts, strategy, chartPeriod, extraPayment]);

  const strategySavings = useMemo(() => {
    const last = chartData[chartData.length - 1];
    if (!last) return 0;
    return Math.max(0, last.minimo - last.estrategia);
  }, [chartData]);

  const handleSelectAll = (event) => {
    if (event.target.checked) setSelectedDebts(filteredDebts.map((d) => d.id));
    else setSelectedDebts([]);
  };

  const handleSelectOne = (id) => {
    setSelectedDebts((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  const resetData = async () => {
    if (!user || syncing) return;

    const confirmReset = window.confirm('Resetar os dados de dívidas deste usuário e recriar a apresentação?');
    if (!confirmReset) return;

    setSyncing(true);

    const { error: deleteError } = await supabase
      .from('debt_items')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Erro ao limpar dívidas:', deleteError);
      showToast(`Erro ao resetar dados: ${deleteError.message}`, 'error');
      setSyncing(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from('debt_items')
      .insert(getDemoDebts(user.id))
      .select('*');

    if (insertError) {
      console.error('Erro ao recriar dívidas demo:', insertError);
      showToast(`Erro ao recriar dados: ${insertError.message}`, 'error');
      setSyncing(false);
      return;
    }

    setDebts((data || []).map(normalizeDebt));
    setSearchTerm('');
    setStatusFilter('Todos');
    setStrategy('avalanche');
    setChartPeriod('mensal');
    setExtraPayment(300);
    setSelectedDebts([]);
    setSyncing(false);
    showToast('Dados de dívidas restaurados.');
  };

  const openCreateModal = () => {
    setDialogMode('create');
    setSelectedItem(null);
    setFormData({ creditor: '', type: 'Cartão de Crédito', balance: '', originalBalance: '', installment: '', cet: '', status: 'Em dia', dueDay: 10, account: 'Nubank', notes: '' });
    setDialogOpen(true);
    setActiveDropdown(null);
  };

  const openEditModal = (debt) => {
    setDialogMode('edit');
    setSelectedItem(debt);
    setFormData({
      creditor: debt.creditor,
      type: debt.type,
      balance: debt.balance,
      originalBalance: debt.originalBalance,
      installment: debt.installment,
      cet: debt.cet,
      status: debt.status,
      dueDay: debt.dueDay,
      account: debt.account,
      notes: debt.notes || '',
    });
    setDialogOpen(true);
    setActiveDropdown(null);
  };

  const openDeleteModal = (debt) => {
    setSelectedItem(debt);
    setDeleteDialogOpen(true);
    setActiveDropdown(null);
  };

  const openRenegotiateModal = (debt) => {
    setSelectedItem(debt);
    setRenegData({
      newCet: Math.max(0.9, Number(debt.cet) - 1.2).toFixed(2),
      newInstallment: Math.max(100, Number(debt.installment) * 0.9).toFixed(2),
      discount: debt.status === 'Atrasado' ? '8' : '3',
      note: 'Proposta simulada para apresentação.',
    });
    setRenegOpen(true);
    setActiveDropdown(null);
  };

  const openPaymentModal = (debt) => {
    setSelectedItem(debt);
    setPaymentData({ amount: debt.installment, kind: 'installment' });
    setPaymentOpen(true);
    setActiveDropdown(null);
  };

  const openDetailModal = (debt) => {
    setSelectedItem(debt);
    setDetailOpen(true);
    setActiveDropdown(null);
  };

  const handleSaveDebt = async (event) => {
    event.preventDefault();

    if (!user) {
      showToast('Sessão ainda não carregou. Tente novamente.', 'error');
      return;
    }

    const balance = parseCurrency(formData.balance);
    const installment = parseCurrency(formData.installment);
    const cet = Number(formData.cet || 0);

    if (!formData.creditor.trim() || !balance || !installment) {
      showToast('Preencha credor, saldo e parcela.', 'error');
      return;
    }

    const formattedData = buildDebt({
      ...formData,
      creditor: formData.creditor.trim(),
      balance,
      originalBalance: parseCurrency(formData.originalBalance) || balance,
      installment,
      cet,
      dueDay: Number(formData.dueDay || 10),
    }, dialogMode === 'create' ? Date.now() : selectedItem.id);

    if (dialogMode === 'create') {
      const { data, error } = await supabase
        .from('debt_items')
        .insert(toDbDebt(formattedData, user.id))
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao criar dívida:', error);
        showToast(`Erro ao criar dívida: ${error.message}`, 'error');
        return;
      }

      setDebts((prev) => [...prev, normalizeDebt(data)]);
      showToast('Nova dívida adicionada com sucesso!');
    } else {
      const savedDebt = await updateDebtInDatabase(formattedData);
      if (!savedDebt) return;

      setDebts((prev) => prev.map((d) => d.id === selectedItem.id ? savedDebt : d));
      showToast('Dívida atualizada com sucesso!');
    }

    setDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (!user || !selectedItem) return;

    const { error } = await supabase
      .from('debt_items')
      .delete()
      .eq('id', selectedItem.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Erro ao excluir dívida:', error);
      showToast(`Erro ao excluir dívida: ${error.message}`, 'error');
      return;
    }

    setDebts((prev) => prev.filter((d) => d.id !== selectedItem.id));
    setSelectedDebts((prev) => prev.filter((id) => id !== selectedItem.id));
    setDeleteDialogOpen(false);
    showToast('Dívida excluída com sucesso!');
  };

  const confirmPayment = async (event) => {
    event.preventDefault();
    const amount = parseCurrency(paymentData.amount);
    if (!amount || !selectedItem) {
      showToast('Informe um valor de pagamento válido.', 'error');
      return;
    }

    const nextBalance = Math.max(0, selectedItem.balance - amount);
    const updatedDebt = buildDebt({
      ...selectedItem,
      balance: nextBalance,
      status: nextBalance <= 0 ? 'Em dia' : selectedItem.status,
      notes: `${selectedItem.notes || ''} Pagamento ${paymentData.kind === 'extra' ? 'extra' : 'de parcela'} de ${formatCurrency(amount)} registrado em ${TODAY}.`.trim(),
    }, selectedItem.id);

    const savedDebt = await updateDebtInDatabase(updatedDebt);
    if (!savedDebt) return;

    setDebts((prev) => prev.map((debt) => debt.id === selectedItem.id ? savedDebt : debt));
    setPaymentOpen(false);
    showToast(`Pagamento de ${formatCurrency(amount)} aplicado em ${selectedItem.creditor}.`);
  };

  const confirmRenegotiation = async (event) => {
    event.preventDefault();
    if (!selectedItem) return;

    const discount = Number(renegData.discount || 0) / 100;
    const newBalance = Math.max(0, selectedItem.balance * (1 - discount));
    const newCet = Number(renegData.newCet || selectedItem.cet);
    const newInstallment = parseCurrency(renegData.newInstallment) || selectedItem.installment;

    const updatedDebt = buildDebt({
      ...selectedItem,
      balance: newBalance,
      cet: newCet,
      installment: newInstallment,
      status: 'Renegociando',
      notes: `${selectedItem.notes || ''} ${renegData.note || 'Renegociação simulada aplicada.'}`.trim(),
    }, selectedItem.id);

    const savedDebt = await updateDebtInDatabase(updatedDebt);
    if (!savedDebt) return;

    setDebts((prev) => prev.map((debt) => debt.id === selectedItem.id ? savedDebt : debt));
    setRenegOpen(false);
    showToast(`Renegociação aplicada em ${selectedItem.creditor}.`);
  };

  const deleteSelected = async () => {
    if (!user || selectedDebts.length === 0) return;

    const count = selectedDebts.length;
    const { error } = await supabase
      .from('debt_items')
      .delete()
      .eq('user_id', user.id)
      .in('id', selectedDebts);

    if (error) {
      console.error('Erro ao excluir dívidas selecionadas:', error);
      showToast(`Erro ao excluir selecionadas: ${error.message}`, 'error');
      return;
    }

    setDebts((prev) => prev.filter((d) => !selectedDebts.includes(d.id)));
    setSelectedDebts([]);
    showToast(`${count} dívida(s) eliminada(s) com sucesso!`);
  };

  const markSelectedUpToDate = async () => {
    if (!user || selectedDebts.length === 0) return;

    const count = selectedDebts.length;
    const { error } = await supabase
      .from('debt_items')
      .update({ status: 'Em dia' })
      .eq('user_id', user.id)
      .in('id', selectedDebts);

    if (error) {
      console.error('Erro ao atualizar dívidas selecionadas:', error);
      showToast(`Erro ao atualizar selecionadas: ${error.message}`, 'error');
      return;
    }

    setDebts((prev) => prev.map((debt) => selectedDebts.includes(debt.id) ? buildDebt({ ...debt, status: 'Em dia' }, debt.id) : debt));
    setSelectedDebts([]);
    showToast(`${count} dívida(s) marcada(s) como em dia.`);
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="antialiased text-slate-900 font-sans min-h-screen flex flex-col"
      style={{ background: 'radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 50%, #f1f5f9 100%)' }}>

      <Toast message={toastNotif.message} type={toastNotif.type} onClose={() => setToastNotif({ message: '', type: 'success' })} />

      {/* MODAL: NOVA/EDITAR DÍVIDA */}
      {dialogOpen && (
        <Modal
          title={dialogMode === 'create' ? 'Nova Dívida' : 'Editar Dívida'}
          subtitle="Cadastre dados coerentes para atualizar cards, ranking e simulação."
          onClose={() => setDialogOpen(false)}
          width="max-w-2xl"
        >
          <form className="p-6 flex flex-col gap-4" onSubmit={handleSaveDebt}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Credor / Instituição">
                <input required type="text" value={formData.creditor} onChange={(e) => setFormData({ ...formData, creditor: e.target.value })} placeholder="Ex: Nubank, Banco do Brasil" className={inputClass} />
              </Field>
              <Field label="Conta usada para pagar">
                <select value={formData.account} onChange={(e) => setFormData({ ...formData, account: e.target.value })} className={inputClass}>
                  {accountOptions.map((account) => <option key={account}>{account}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Tipo">
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={inputClass}>
                  {debtTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
                  {statusOptions.map((status) => <option key={status}>{status}</option>)}
                </select>
              </Field>
              <Field label="Vencimento mensal">
                <select value={formData.dueDay} onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })} className={inputClass}>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => <option key={day} value={day}>Dia {day}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Saldo Atual (R$)">
                <input required value={formData.balance} onChange={(e) => setFormData({ ...formData, balance: e.target.value })} placeholder="0,00" className={inputClass} />
              </Field>
              <Field label="Saldo Original (R$)">
                <input value={formData.originalBalance} onChange={(e) => setFormData({ ...formData, originalBalance: e.target.value })} placeholder="Opcional" className={inputClass} />
              </Field>
              <Field label="Parcela Mensal (R$)">
                <input required value={formData.installment} onChange={(e) => setFormData({ ...formData, installment: e.target.value })} placeholder="0,00" className={inputClass} />
              </Field>
            </div>

            <Field label="Taxa de Juros (CET % ao mês)">
              <input required type="number" step="0.01" value={formData.cet} onChange={(e) => setFormData({ ...formData, cet: e.target.value })} placeholder="Ex: 5.5" className={inputClass} />
            </Field>

            <Field label="Observações">
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Ex: atraso, acordo, contato do banco..." className={`${inputClass} min-h-[82px] resize-none`} />
            </Field>

            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-700 flex gap-2">
              <Info size={16} className="text-blue-600 flex-shrink-0" />
              A taxa CET altera a prioridade do método avalanche e muda a projeção de quitação automaticamente.
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => setDialogOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors">
                Cancelar
              </button>
              <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors">
                {dialogMode === 'create' ? 'Salvar Dívida' : 'Atualizar Dívida'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteOpen && (
        <Modal title="Excluir Dívida?" onClose={() => setDeleteDialogOpen(false)} width="max-w-sm">
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Tem certeza que deseja excluir o registro de <strong>{selectedItem?.creditor}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteDialogOpen(false)} className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-colors">
                Sim, Excluir
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: PAGAMENTO */}
      {paymentOpen && selectedItem && (
        <Modal title={`Registrar pagamento - ${selectedItem.creditor}`} subtitle="Abate o saldo e recalcula tudo na tela." onClose={() => setPaymentOpen(false)}>
          <form onSubmit={confirmPayment} className="p-6 space-y-4">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">Saldo atual</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(selectedItem.balance)}</p>
            </div>
            <Field label="Tipo de pagamento">
              <select value={paymentData.kind} onChange={(e) => setPaymentData({ ...paymentData, kind: e.target.value })} className={inputClass}>
                <option value="installment">Parcela normal</option>
                <option value="extra">Pagamento extra</option>
              </select>
            </Field>
            <Field label="Valor pago">
              <input value={paymentData.amount} onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })} className={inputClass} placeholder="R$ 0,00" />
            </Field>
            <div className="flex gap-3">
              <button type="button" onClick={() => setPaymentOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg">Cancelar</button>
              <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">Aplicar pagamento</button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: RENEGOCIAÇÃO */}
      {renegOpen && selectedItem && (
        <Modal title={`Renegociar ${selectedItem.creditor}`} subtitle="Simule uma proposta e aplique no inventário." onClose={() => setRenegOpen(false)}>
          <form onSubmit={confirmRenegotiation} className="p-6 space-y-4">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">Cenário atual</p>
              <div className="flex justify-between font-medium text-slate-800">
                <span>{formatCurrency(selectedItem.balance)}</span>
                <span>{formatPercent(selectedItem.cet)} a.m.</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Novo CET % a.m.">
                <input type="number" step="0.01" value={renegData.newCet} onChange={(e) => setRenegData({ ...renegData, newCet: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Nova parcela">
                <input value={renegData.newInstallment} onChange={(e) => setRenegData({ ...renegData, newInstallment: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Desconto %">
                <input type="number" step="0.1" value={renegData.discount} onChange={(e) => setRenegData({ ...renegData, discount: e.target.value })} className={inputClass} />
              </Field>
            </div>
            <Field label="Nota da negociação">
              <textarea value={renegData.note} onChange={(e) => setRenegData({ ...renegData, note: e.target.value })} className={`${inputClass} min-h-[76px] resize-none`} />
            </Field>
            <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-xs text-green-700 flex gap-2">
              <TrendingDown size={16} className="text-green-600 flex-shrink-0" />
              A renegociação reduz saldo/taxa/parcela e marca a dívida como “Renegociando”.
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setRenegOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg">Cancelar</button>
              <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">Aplicar proposta</button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: DETALHES */}
      {detailOpen && selectedItem && (
        <Modal title="Detalhes da Dívida" subtitle="Resumo completo conectado à simulação." onClose={() => setDetailOpen(false)}>
          <div className="p-6 space-y-4">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-xs text-slate-500">{selectedItem.type}</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{selectedItem.creditor}</p>
              <p className="text-sm text-slate-500 mt-1">Vence todo dia {selectedItem.dueDay} · Pago via {selectedItem.account}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 p-3"><span className="text-xs text-slate-500">Saldo</span><p className="font-bold mt-1">{formatCurrency(selectedItem.balance)}</p></div>
              <div className="rounded-xl border border-slate-100 p-3"><span className="text-xs text-slate-500">Parcela</span><p className="font-bold mt-1">{formatCurrency(selectedItem.installment)}</p></div>
              <div className="rounded-xl border border-slate-100 p-3"><span className="text-xs text-slate-500">CET</span><p className="font-bold mt-1">{formatPercent(selectedItem.cet)} a.m.</p></div>
              <div className="rounded-xl border border-slate-100 p-3"><span className="text-xs text-slate-500">Status</span><p className="font-bold mt-1">{selectedItem.status}</p></div>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
              Progresso de quitação: <strong>{Math.min(100, Math.max(0, (((selectedItem.originalBalance || selectedItem.balance) - selectedItem.balance) / (selectedItem.originalBalance || selectedItem.balance)) * 100)).toFixed(1)}%</strong>
            </div>
            {selectedItem.notes && <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600">{selectedItem.notes}</div>}
          </div>
        </Modal>
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
              <span className="text-xs text-slate-500 truncate">{user?.email || 'Plano Premium'}</span>
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
              <h1 className="text-2xl font-bold text-slate-900">Gestão de Dívidas</h1>
              <p className="text-sm text-slate-500 mt-1">Controle estratégico para quitação e otimização de juros.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={resetData} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
                <RotateCw size={16} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Atualizando...' : 'Resetar'}
              </button>
              <button onClick={() => showToast('Use os controles Avalanche/Bola de Neve e Pagamento extra para simular cenários.')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
                <Calculator size={16} /> Simulador
              </button>
              <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                <Plus size={16} /> Nova Dívida
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Esquerda: Métricas e Gráfico */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
                <MetricCard title="Saldo Devedor Total" value={formatCurrency(stats.totalBalance)} linkText={`${debts.length} dívidas ativas`} linkColor="text-blue-600" icon={Wallet} onClick={() => setStatusFilter('Todos')} />
                <MetricCard title="Comprometimento Mensal" value={formatCurrency(stats.totalInstallment)} linkText="Total das parcelas" linkColor="text-slate-600" icon={CalendarDays} onClick={() => setStatusFilter('Todos')} />
                <MetricCard title="Juros Estimados (Ano)" value={formatCurrency(stats.estimatedInterest)} linkText={`${formatPercent(stats.avgCet)} CET médio`} linkColor="text-red-600" icon={TrendingUp} onClick={() => setStatusFilter('Atrasado')} />
                <MetricCard title="Economia Projetada" value={formatCurrency(strategySavings)} linkText="vs. pagamento mínimo" linkColor="text-green-600" icon={PiggyBank} onClick={() => setExtraPayment((prev) => prev + 100)} />
              </div>

              {/* Gráfico de Projeção Interativo */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Projeção de Quitação</h3>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={strategy === 'avalanche'} onChange={() => setStrategy('avalanche')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                        <span className="text-sm text-slate-600 font-medium">Efeito Avalanche</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={strategy === 'snowball'} onChange={() => setStrategy('snowball')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                        <span className="text-sm text-slate-600 font-medium">Bola de Neve</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600">
                      <Banknote size={15} /> Extra
                      <input value={extraPayment} onChange={(e) => setExtraPayment(parseCurrency(e.target.value))} className="w-20 bg-transparent outline-none font-semibold text-slate-900" />
                    </div>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                      <button onClick={() => setChartPeriod('mensal')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${chartPeriod === 'mensal' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Mensal</button>
                      <button onClick={() => setChartPeriod('anual')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${chartPeriod === 'anual' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Anual</button>
                    </div>
                  </div>
                </div>

                <div className="w-full h-[300px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAvalanche" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `R$ ${Math.round(val / 1000)}k`} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                        formatter={(value, name) => [formatCurrency(value), name === 'estrategia' ? (strategy === 'avalanche' ? 'Avalanche' : 'Bola de Neve') : 'Pgto Mínimo']}
                      />
                      <Area type="monotone" dataKey="estrategia" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorAvalanche)" isAnimationActive />
                      <Line type="monotone" dataKey="minimo" stroke="#9CA3AF" strokeDasharray="5 5" strokeWidth={2} dot={false} isAnimationActive />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Direita: Dívidas Ativas */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Foco Atual <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-md ml-2">{strategy === 'avalanche' ? 'Juros' : 'Saldo'}</span>
                  </h3>
                </div>

                <div className="flex flex-col gap-4 overflow-y-auto max-h-[550px] pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {priorityDebts.length > 0 ? (
                    priorityDebts.slice(0, 4).map((debt, index) => {
                      const DynamicIcon = ICONS[debt.icon] || ICONS.CreditCard;
                      const isHighPriority = index === 0;
                      const progress = Math.min(100, Math.max(0, (((debt.originalBalance || debt.balance) - debt.balance) / (debt.originalBalance || debt.balance)) * 100));

                      return (
                        <button key={debt.id} className="text-left p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors" onClick={() => openDetailModal(debt)}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${debt.iconColor}`}>
                                <DynamicIcon size={14} />
                              </div>
                              <span className="font-semibold text-slate-900">{debt.creditor}</span>
                            </div>
                          </div>
                          <div className="mb-2"><span className="text-2xl font-bold text-slate-900">{formatCurrency(debt.balance)}</span></div>
                          <div className="flex justify-between items-center text-xs text-slate-500 mb-3">
                            <span>CET: {formatPercent(debt.cet)} a.m.</span>
                            <span className={`font-medium ${isHighPriority ? 'text-red-600' : 'text-blue-600'}`}>{isHighPriority ? 'Prioridade Máxima' : `${index + 1}ª Prioridade`}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div className={`${isHighPriority ? 'bg-red-500' : 'bg-blue-500'} h-1.5 rounded-full`} style={{ width: `${progress}%` }} />
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500 text-center mt-4">Não possui dívidas registradas.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Inventário */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible mb-8">
            <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-900">Inventário de Dívidas</h3>
                {selectedDebts.length > 0 && <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">{selectedDebts.length} selecionada(s)</span>}
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="flex bg-slate-100 rounded-lg p-1">
                  {['Todos', 'Em dia', 'Atrasado', 'Renegociando'].map((status) => (
                    <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${statusFilter === status ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>{status}</button>
                  ))}
                </div>
                <div className="relative flex-1 min-w-[220px] lg:flex-none">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Procurar credor ou tipo..."
                    className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full lg:w-60 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {selectedDebts.length > 0 && (
                  <>
                    <button onClick={markSelectedUpToDate} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 border border-green-100 text-sm font-medium hover:bg-green-100 transition-colors">
                      <CheckCircle2 size={14} /> Em dia
                    </button>
                    <button onClick={deleteSelected} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm font-medium hover:bg-red-100 transition-colors">
                      <Trash2 size={14} /> Excluir
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="overflow-x-auto min-h-[250px]">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-medium flex items-center gap-2">
                      <input type="checkbox" checked={selectedDebts.length === filteredDebts.length && filteredDebts.length > 0} onChange={handleSelectAll} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
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
                  {filteredDebts.map((debt) => {
                    const DynamicIcon = ICONS[debt.icon] || ICONS.CreditCard;
                    const isSelected = selectedDebts.includes(debt.id);

                    return (
                      <tr key={debt.id} className={`hover:bg-slate-50 transition-colors group ${isSelected ? 'bg-blue-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" checked={isSelected} onChange={() => handleSelectOne(debt.id)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${debt.iconColor}`}><DynamicIcon size={16} /></div>
                            <div>
                              <span className="font-medium text-slate-900">{debt.creditor}</span>
                              <p className="text-[10px] text-slate-500">Vence dia {debt.dueDay} · {debt.account}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">{debt.type}</td>
                        <td className="px-6 py-4 font-medium text-slate-900 text-sm">{formatCurrency(debt.balance)}</td>
                        <td className="px-6 py-4 text-slate-600 text-sm">{formatCurrency(debt.installment)}</td>
                        <td className="px-6 py-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${debt.cetColor}`}>{formatPercent(debt.cet)} a.m.</span></td>
                        <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${debt.statusColor}`}><span className={`w-1.5 h-1.5 rounded-full ${debt.statusDot}`} /> {debt.status}</span></td>
                        <td className="px-6 py-4 text-right relative">
                          <div className="flex items-center justify-end gap-2 relative">
                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === debt.id ? null : debt.id); }} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                              <Ellipsis size={18} />
                            </button>

                            {activeDropdown === debt.id && (
                              <div className="absolute right-0 top-8 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <button onClick={() => openDetailModal(debt)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Eye size={14} /> Detalhes</button>
                                <button onClick={() => openPaymentModal(debt)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><DollarSign size={14} /> Registrar pagamento</button>
                                <button onClick={() => openRenegotiateModal(debt)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Calculator size={14} /> Renegociar</button>
                                <button onClick={() => openEditModal(debt)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Edit size={14} /> Editar</button>
                                <div className="h-px bg-slate-100 my-1 w-full" />
                                <button onClick={() => openDeleteModal(debt)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"><Trash2 size={14} /> Excluir</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredDebts.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <Search size={32} className="mb-2 opacity-50" />
                          <p>Nenhuma dívida encontrada.</p>
                        </div>
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

export default Dividas;

import React, { useEffect, useMemo, memo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layers, Globe, ChevronDown, LayoutGrid, Wallet,
  FileText, RotateCcw, HandCoins, TrendingUp,
  Search, Plus, Lightbulb, Calendar,
  ArrowUpCircle, Clock, Play, Music, Activity, Cloud,
  Ellipsis, ShieldCheck, X, CheckCircle2, Bell, Trash2,
  Eye, PauseCircle, PlayCircle, Edit3, Copy, AlertCircle,
  BatteryMedium, Zap, Smartphone, CreditCard, Monitor, Bot,
  RotateCw, Filter, Info, ArchiveRestore, DollarSign
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

const TODAY = '2026-04-15';

const shortMonthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const formatDateLabel = (isoDate) => {
  const date = new Date(`${isoDate}T12:00:00`);
  return dateFormatter.format(date).replace('.', '');
};

const diffInDays = (fromISO, toISO) => {
  const from = new Date(`${fromISO}T12:00:00`);
  const to = new Date(`${toISO}T12:00:00`);
  return Math.round((to - from) / 86400000);
};

const getDaysLeftLabel = (isoDate) => {
  const days = diffInDays(TODAY, isoDate);
  if (days < 0) return `Atrasou ${Math.abs(days)} dia${Math.abs(days) > 1 ? 's' : ''}`;
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanhã';
  if (days < 31) return `Em ${days} dias`;
  const months = Math.round(days / 30);
  return `Em ${months} ${months === 1 ? 'mês' : 'meses'}`;
};

const getMonthlyCost = (sub) => {
  if (sub.status !== 'Ativa') return 0;
  if (sub.billingCycle === 'Anual') return Number(sub.price || 0) / 12;
  if (sub.billingCycle === 'Trimestral') return Number(sub.price || 0) / 3;
  return Number(sub.price || 0);
};

const getIconByService = (serviceName, category) => {
  const name = String(serviceName || '').toLowerCase();
  if (name.includes('netflix')) return Play;
  if (name.includes('spotify')) return Music;
  if (name.includes('gym') || category === 'Saúde') return Activity;
  if (name.includes('dropbox') || category === 'Software') return Cloud;
  if (name.includes('prime') || name.includes('amazon')) return Play;
  if (name.includes('icloud') || name.includes('google')) return Cloud;
  if (category === 'Telefonia') return Smartphone;
  if (category === 'Produtividade') return Monitor;
  return CreditCard;
};

const getColorByService = (serviceName, category) => {
  const name = String(serviceName || '').toLowerCase();
  if (name.includes('netflix')) return 'red';
  if (name.includes('spotify')) return 'green';
  if (name.includes('dropbox')) return 'blue';
  if (name.includes('gym')) return 'slate';
  if (name.includes('prime') || name.includes('amazon')) return 'blue';
  if (category === 'Saúde') return 'slate';
  if (category === 'Software') return 'blue';
  if (category === 'Telefonia') return 'purple';
  return 'orange';
};

const colorClassMap = {
  red: 'bg-red-50 text-red-600 border-red-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
};

const accountOptions = ['Nubank', 'Itaú', 'Banco do Brasil'];
const categoryOptions = ['Entretenimento', 'Software', 'Saúde', 'Produtividade', 'Telefonia', 'Educação', 'Outros'];
const usageOptions = ['Alto', 'Médio', 'Baixo'];
const cycleOptions = ['Mensal', 'Trimestral', 'Anual'];

const MENU_ITEMS = Object.freeze([
  { name: 'Painel Unificado', path: '/dashboard', icon: LayoutGrid, section: 1 },
  { name: 'Dinheiro', path: '/dinheiro', icon: Wallet, section: 1 },
  { name: 'Contas & Boletos', path: '/contas', icon: FileText, section: 1 },
  { name: 'Assinaturas', path: '/assinaturas', icon: RotateCcw, section: 1 },
  { name: 'Dívidas', path: '/dividas', icon: HandCoins, section: 1 },
  { name: 'Investimentos', path: '/investimentos', icon: TrendingUp, section: 1 },
]);

const INITIAL_SUBSCRIPTIONS = Object.freeze([
  {
    id: 1,
    name: 'Netflix',
    plan: 'Plano Standard',
    category: 'Entretenimento',
    nextBillingDate: '2026-04-18',
    price: 39.9,
    nextPrice: 44.9,
    billingCycle: 'Mensal',
    usage: 'Alto',
    status: 'Ativa',
    account: 'Nubank',
    reminder: true,
    notes: 'Reajuste comunicado para o próximo ciclo.',
  },
  {
    id: 2,
    name: 'Spotify',
    plan: 'Plano Duo',
    category: 'Entretenimento',
    nextBillingDate: '2026-04-22',
    price: 27.9,
    billingCycle: 'Mensal',
    usage: 'Alto',
    status: 'Ativa',
    account: 'Nubank',
    reminder: true,
    notes: 'Uso alto, manter ativo.',
  },
  {
    id: 3,
    name: 'Gympass',
    plan: 'Plano Silver',
    category: 'Saúde',
    nextBillingDate: '2026-05-05',
    price: 119.9,
    billingCycle: 'Mensal',
    usage: 'Baixo',
    status: 'Ativa',
    account: 'Itaú',
    reminder: true,
    notes: 'Sem uso há 45 dias. Bom candidato para pausa ou cancelamento.',
  },
  {
    id: 4,
    name: 'Dropbox',
    plan: 'Plus 2TB',
    category: 'Software',
    nextBillingDate: '2026-11-12',
    price: 599,
    billingCycle: 'Anual',
    usage: 'Médio',
    status: 'Ativa',
    account: 'Banco do Brasil',
    reminder: true,
    notes: 'Cobrança anual equivalente a R$ 49,92/mês.',
  },
  {
    id: 5,
    name: 'Amazon Prime',
    plan: 'Plano Anual',
    category: 'Entretenimento',
    nextBillingDate: '2026-04-20',
    price: 119,
    billingCycle: 'Anual',
    usage: 'Médio',
    status: 'Ativa',
    account: 'Nubank',
    reminder: true,
    notes: 'Renovação anual próxima.',
  },
  {
    id: 6,
    name: 'iCloud+',
    plan: '200GB',
    category: 'Software',
    nextBillingDate: '2026-04-28',
    price: 14.9,
    billingCycle: 'Mensal',
    usage: 'Alto',
    status: 'Ativa',
    account: 'Itaú',
    reminder: false,
    notes: 'Backup familiar.',
  },
]);

const INITIAL_HISTORY = Object.freeze([
  { name: 'Nov', base: 650 },
  { name: 'Dez', base: 680 },
  { name: 'Jan', base: 720 },
  { name: 'Fev', base: 710 },
  { name: 'Mar', base: 750 },
]);

const toDbSubscription = (sub, userId) => ({
  user_id: userId,
  name: sub.name,
  plan: sub.plan,
  category: sub.category,
  next_billing_date: sub.nextBillingDate,
  price: Number(sub.price || 0),
  next_price: sub.nextPrice == null ? null : Number(sub.nextPrice),
  billing_cycle: sub.billingCycle,
  usage: sub.usage,
  status: sub.status || 'Ativa',
  account: sub.account,
  reminder: Boolean(sub.reminder),
  notes: sub.notes || '',
});

const normalizeSubscription = (item) => ({
  id: item.id,
  name: item.name,
  plan: item.plan,
  category: item.category,
  nextBillingDate: item.next_billing_date,
  price: Number(item.price || 0),
  nextPrice: item.next_price == null ? undefined : Number(item.next_price),
  billingCycle: item.billing_cycle,
  usage: item.usage,
  status: item.status,
  account: item.account,
  reminder: Boolean(item.reminder),
  notes: item.notes || '',
});

const getDemoSubscriptions = (userId) => INITIAL_SUBSCRIPTIONS.map((sub) => toDbSubscription(sub, userId));

// --- COMPONENTES BASE ---
const Modal = ({ title, subtitle, children, onClose, width = 'max-w-xl' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
    <button
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

const UsageBadge = memo(({ usage }) => {
  let colorStyles = '';
  let dotClass = '';

  if (usage === 'Alto') {
    colorStyles = 'bg-green-50 text-green-700 border-green-200';
    dotClass = 'bg-green-500';
  } else if (usage === 'Médio') {
    colorStyles = 'bg-yellow-50 text-yellow-700 border-yellow-200';
    dotClass = 'bg-yellow-500';
  } else {
    colorStyles = 'bg-red-50 text-red-700 border-red-200';
    dotClass = 'bg-red-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorStyles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} /> {usage}
    </span>
  );
});

const SubscriptionRow = memo(({ sub, onAction }) => {
  const Icon = getIconByService(sub.name, sub.category);
  const color = getColorByService(sub.name, sub.category);
  const daysLeft = getDaysLeftLabel(sub.nextBillingDate);
  const isPaused = sub.status === 'Pausada';
  const isCanceled = sub.status === 'Cancelada';
  const monthlyEquiv = sub.billingCycle !== 'Mensal' ? `Equiv. ${formatCurrency(getMonthlyCost({ ...sub, status: 'Ativa' }))}/mês` : null;

  return (
    <tr className={`hover:bg-slate-50 transition-colors group border-b border-slate-100 ${sub.usage === 'Baixo' && sub.status === 'Ativa' ? 'bg-red-50/40' : ''} ${isPaused || isCanceled ? 'opacity-70' : ''}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClassMap[color]}`}>
            <Icon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900">{sub.name}</p>
              {sub.status !== 'Ativa' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">{sub.status}</span>
              )}
            </div>
            <p className="text-xs text-slate-500">{sub.plan} ({sub.billingCycle})</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-slate-600 text-sm">{sub.category}</td>
      <td className="px-6 py-4">
        <p className="text-slate-900 text-sm">{formatDateLabel(sub.nextBillingDate)}</p>
        <p className={`text-xs font-medium ${daysLeft.includes('Hoje') || daysLeft.includes('Amanhã') || daysLeft.includes('Em 3') || daysLeft.includes('Em 4') || daysLeft.includes('Em 5') ? 'text-blue-600' : 'text-slate-500'}`}>
          {daysLeft}
        </p>
      </td>
      <td className="px-6 py-4">
        <p className="font-semibold text-slate-900 text-sm">{formatCurrency(sub.price)}</p>
        {monthlyEquiv && <p className="text-xs text-slate-500">{monthlyEquiv}</p>}
      </td>
      <td className="px-6 py-4 text-center">
        <UsageBadge usage={sub.usage} />
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={() => onAction('menu', sub)}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Ellipsis size={18} />
        </button>
      </td>
    </tr>
  );
});

const AttentionCard = ({ type, title, text, children, icon: Icon, color }) => (
  <div className={`p-4 rounded-xl border flex gap-3 ${color}`}>
    <div className="mt-0.5"><Icon size={18} /></div>
    <div className="flex-1">
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <p className="text-xs text-slate-600 mt-1">{text}</p>
      {children && <div className="mt-3 flex flex-wrap gap-2">{children}</div>}
    </div>
  </div>
);

const Assinaturas = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, sessionLoading } = useAuth();

  const [subscriptions, setSubscriptions] = useState(INITIAL_SUBSCRIPTIONS);
  const [filter, setFilter] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [activeSub, setActiveSub] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [attentionModal, setAttentionModal] = useState(null);
  const [toast, setToast] = useState('');
  const [chartRange, setChartRange] = useState('6m');
  const [syncing, setSyncing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newSub, setNewSub] = useState({
    name: '',
    plan: '',
    category: 'Entretenimento',
    nextBillingDate: '2026-04-30',
    price: '',
    billingCycle: 'Mensal',
    usage: 'Médio',
    account: 'Nubank',
    reminder: true,
    notes: '',
  });

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  const fetchSubscriptions = async (currentUser = user) => {
    if (!currentUser) return;

    setSyncing(true);

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('next_billing_date', { ascending: true });

    if (error) {
      console.error('Erro ao carregar assinaturas:', error);
      showToast(`Erro ao carregar assinaturas: ${error.message}`);
      setSyncing(false);
      return;
    }

    let finalData = data || [];

    if (finalData.length === 0) {
      const { data: insertedDemo, error: demoError } = await supabase
        .from('subscriptions')
        .insert(getDemoSubscriptions(currentUser.id))
        .select();

      if (demoError) {
        console.error('Erro ao criar assinaturas demo:', demoError);
        showToast(`Erro ao criar dados demo: ${demoError.message}`);
        setSyncing(false);
        return;
      }

      finalData = insertedDemo || [];
    }

    setSubscriptions(finalData.map(normalizeSubscription));
    setSyncing(false);
  };

  useEffect(() => {
    if (sessionLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    fetchSubscriptions(user);
  }, [sessionLoading, user, navigate]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const activeSubscriptions = useMemo(() => subscriptions.filter((sub) => sub.status === 'Ativa'), [subscriptions]);

  const monthlySpend = useMemo(() => activeSubscriptions.reduce((sum, sub) => sum + getMonthlyCost(sub), 0), [activeSubscriptions]);

  const previousMonthSpend = 750;
  const variation = previousMonthSpend ? ((monthlySpend - previousMonthSpend) / previousMonthSpend) * 100 : 0;

  const savingPotential = useMemo(() => {
    return activeSubscriptions
      .filter((sub) => sub.usage === 'Baixo')
      .reduce((sum, sub) => sum + getMonthlyCost(sub), 0);
  }, [activeSubscriptions]);

  const categoriesCount = useMemo(() => new Set(activeSubscriptions.map((sub) => sub.category)).size, [activeSubscriptions]);

  const recommendations = useMemo(() => {
    const items = [];

    subscriptions.forEach((sub) => {
      if (sub.status !== 'Ativa') return;
      if (sub.nextPrice && sub.nextPrice > sub.price) {
        items.push({ type: 'price', sub, saving: sub.nextPrice - sub.price });
      }
      if (sub.usage === 'Baixo') {
        items.push({ type: 'lowUsage', sub, saving: getMonthlyCost(sub) });
      }
      const days = diffInDays(TODAY, sub.nextBillingDate);
      if (sub.billingCycle === 'Anual' && days >= 0 && days <= 10) {
        items.push({ type: 'annualRenewal', sub, saving: sub.price });
      }
    });

    return items;
  }, [subscriptions]);

  const chartData = useMemo(() => {
    const current = { name: 'Abr', value: Number(monthlySpend.toFixed(2)) };
    const base = chartRange === '12m'
      ? [
        { name: 'Mai', base: 590 }, { name: 'Jun', base: 610 }, { name: 'Jul', base: 640 },
        { name: 'Ago', base: 630 }, { name: 'Set', base: 660 }, { name: 'Out', base: 670 },
        ...INITIAL_HISTORY,
      ]
      : INITIAL_HISTORY;

    return [...base.map((item) => ({ name: item.name, value: item.base })), current];
  }, [monthlySpend, chartRange]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesFilter = filter === 'Todas' || sub.category === filter || sub.status === filter || sub.usage === filter;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch = !q || [sub.name, sub.plan, sub.category, sub.account, sub.notes]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm, subscriptions]);

  const resetData = async () => {
    if (!user || resetting) return;

    const confirmReset = window.confirm(
      'Tem certeza que deseja resetar suas assinaturas? Isso vai apagar os dados atuais desta tela e recriar os dados de apresentação.'
    );

    if (!confirmReset) return;

    setResetting(true);

    const { error: deleteError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Erro ao resetar assinaturas:', deleteError);
      showToast(`Erro ao resetar dados: ${deleteError.message}`);
      setResetting(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from('subscriptions')
      .insert(getDemoSubscriptions(user.id))
      .select();

    if (insertError) {
      console.error('Erro ao recriar assinaturas demo:', insertError);
      showToast(`Erro ao recriar dados demo: ${insertError.message}`);
      setResetting(false);
      return;
    }

    setSubscriptions((data || []).map(normalizeSubscription));
    setFilter('Todas');
    setSearchTerm('');
    setChartRange('6m');
    setResetting(false);
    showToast('Assinaturas restauradas para os dados da apresentação.');
  };

  const handleCreateSubscription = async (event) => {
    event.preventDefault();
    const price = parseCurrency(newSub.price);

    if (!newSub.name.trim() || !newSub.plan.trim() || !price || !newSub.nextBillingDate) {
      showToast('Preencha nome, plano, valor e próximo débito.');
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    setSaving(true);

    const payload = {
      name: newSub.name.trim(),
      plan: newSub.plan.trim(),
      category: newSub.category,
      nextBillingDate: newSub.nextBillingDate,
      price,
      billingCycle: newSub.billingCycle,
      usage: newSub.usage,
      status: 'Ativa',
      account: newSub.account,
      reminder: Boolean(newSub.reminder),
      notes: newSub.notes.trim(),
    };

    const { data, error } = await supabase
      .from('subscriptions')
      .insert(toDbSubscription(payload, user.id))
      .select()
      .single();

    setSaving(false);

    if (error) {
      console.error('Erro ao criar assinatura:', error);
      showToast(`Erro ao criar assinatura: ${error.message}`);
      return;
    }

    const subscription = normalizeSubscription(data);

    setSubscriptions((prev) => [subscription, ...prev]);
    setNewModalOpen(false);
    setNewSub({
      name: '',
      plan: '',
      category: 'Entretenimento',
      nextBillingDate: '2026-04-30',
      price: '',
      billingCycle: 'Mensal',
      usage: 'Médio',
      account: 'Nubank',
      reminder: true,
      notes: '',
    });
    showToast(`${subscription.name} adicionada às assinaturas.`);
  };

  const toDbPatch = (patch) => {
    const dbPatch = {};

    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.plan !== undefined) dbPatch.plan = patch.plan;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.nextBillingDate !== undefined) dbPatch.next_billing_date = patch.nextBillingDate;
    if (patch.price !== undefined) dbPatch.price = Number(patch.price || 0);
    if (patch.nextPrice !== undefined) dbPatch.next_price = patch.nextPrice == null ? null : Number(patch.nextPrice);
    if (patch.billingCycle !== undefined) dbPatch.billing_cycle = patch.billingCycle;
    if (patch.usage !== undefined) dbPatch.usage = patch.usage;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.account !== undefined) dbPatch.account = patch.account;
    if (patch.reminder !== undefined) dbPatch.reminder = Boolean(patch.reminder);
    if (patch.notes !== undefined) dbPatch.notes = patch.notes || '';

    return dbPatch;
  };

  const updateSub = async (id, patch) => {
    setSubscriptions((prev) => prev.map((sub) => sub.id === id ? { ...sub, ...patch } : sub));

    if (!user) return;

    const { error } = await supabase
      .from('subscriptions')
      .update(toDbPatch(patch))
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Erro ao atualizar assinatura:', error);
      showToast(`Erro ao atualizar assinatura: ${error.message}`);
      fetchSubscriptions(user);
    }
  };

  const handleAction = async (action, sub) => {
    if (action === 'menu') {
      setActiveSub(sub);
      return;
    }

    if (action === 'details') {
      setDetailModal({ kind: 'details', sub });
      setActiveSub(null);
      return;
    }

    if (action === 'pause') {
      await updateSub(sub.id, { status: 'Pausada' });
      setActiveSub(null);
      showToast(`${sub.name} foi pausada.`);
      return;
    }

    if (action === 'resume') {
      await updateSub(sub.id, { status: 'Ativa' });
      setActiveSub(null);
      showToast(`${sub.name} voltou a ficar ativa.`);
      return;
    }

    if (action === 'cancel') {
      await updateSub(sub.id, { status: 'Cancelada' });
      setActiveSub(null);
      showToast(`${sub.name} foi marcada como cancelada.`);
      return;
    }

    if (action === 'duplicate') {
      if (!user) return;

      const copyPayload = { ...sub, name: `${sub.name} Backup`, status: 'Ativa' };
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(toDbSubscription(copyPayload, user.id))
        .select()
        .single();

      if (error) {
        console.error('Erro ao duplicar assinatura:', error);
        showToast(`Erro ao duplicar assinatura: ${error.message}`);
        return;
      }

      setSubscriptions((prev) => [normalizeSubscription(data), ...prev]);
      setActiveSub(null);
      showToast('Assinatura duplicada para simulação.');
      return;
    }

    if (action === 'reminder') {
      await updateSub(sub.id, { reminder: !sub.reminder });
      setActiveSub(null);
      showToast(!sub.reminder ? 'Lembrete ativado.' : 'Lembrete desativado.');
      return;
    }

    if (action === 'delete') {
      setSubscriptions((prev) => prev.filter((item) => item.id !== sub.id));
      setActiveSub(null);

      if (user) {
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .eq('id', sub.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Erro ao remover assinatura:', error);
          showToast(`Erro ao remover assinatura: ${error.message}`);
          fetchSubscriptions(user);
          return;
        }
      }

      showToast(`${sub.name} removida da lista.`);
    }
  };

  const handleRecommendation = async (type, sub) => {
    if (type === 'renegotiate') {
      setDetailModal({ kind: 'renegotiate', sub });
      setAttentionModal(null);
      showToast(`Plano de renegociação criado para ${sub.name}.`);
      return;
    }
    if (type === 'pause') {
      await updateSub(sub.id, { status: 'Pausada', notes: `${sub.notes || ''} Pausada por recomendação de baixo uso.`.trim() });
      setAttentionModal(null);
      showToast(`${sub.name} pausada por 30 dias na simulação.`);
      return;
    }
    if (type === 'cancel') {
      await updateSub(sub.id, { status: 'Cancelada', notes: `${sub.notes || ''} Cancelamento recomendado na apresentação.`.trim() });
      setAttentionModal(null);
      showToast(`${sub.name} marcada para cancelamento.`);
    }
  };

  const serviceTemplates = [
    { name: 'YouTube Premium', plan: 'Individual', category: 'Entretenimento', price: '24,90' },
    { name: 'Google One', plan: '2TB', category: 'Software', price: '34,90' },
    { name: 'Vivo Controle', plan: 'Mensal', category: 'Telefonia', price: '59,90' },
  ];

  const filterOptions = ['Todas', 'Entretenimento', 'Software', 'Saúde', 'Produtividade', 'Alto', 'Médio', 'Baixo', 'Pausada'];

  return (
    <div className="antialiased text-slate-900 font-sans min-h-screen flex flex-col"
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
              <SidebarItem
                key={item.name}
                item={item}
                currentPath={location.pathname}
                onClick={navigate}
                showDivider={index > 0 && MENU_ITEMS[index - 1].section !== item.section}
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
              {syncing && <p className="text-xs text-slate-400 mt-1">Atualizando assinaturas...</p>}
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
              <button
                onClick={resetData}
                disabled={resetting}
                className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <RotateCw size={16} className={resetting ? 'animate-spin' : ''} /> {resetting ? 'Resetando...' : 'Resetar'}
              </button>
              <button
                onClick={() => setNewModalOpen(true)}
                className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors whitespace-nowrap"
              >
                <Plus size={16} /> Nova Assinatura
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Esquerda: Métricas e Gráfico */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <button onClick={() => setFilter('Todas')} className="text-left bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Gasto Mensal</h3>
                    <DollarSign size={16} className="text-slate-300" />
                  </div>
                  <span className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(monthlySpend)}</span>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${variation >= 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                      <TrendingUp size={10} /> {variation >= 0 ? '+' : ''}{variation.toFixed(1)}% vs mês anterior
                    </span>
                  </div>
                </button>

                <button onClick={() => setFilter('Todas')} className="text-left bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Assinaturas Ativas</h3>
                    <RotateCcw size={16} className="text-slate-300" />
                  </div>
                  <span className="text-3xl font-bold text-slate-900 mt-1">{activeSubscriptions.length}</span>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-500">{categoriesCount} categorias principais</span>
                  </div>
                </button>

                <button onClick={() => setFilter('Baixo')} className="text-left bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Potencial de Economia</h3>
                    <Lightbulb size={16} className="text-green-500" />
                  </div>
                  <span className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(savingPotential)}</span>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-green-50 text-green-600 border border-green-100">
                      <Lightbulb size={10} /> {recommendations.filter((item) => item.type === 'lowUsage').length} recomendações
                    </span>
                  </div>
                </button>
              </div>

              {/* GRÁFICO */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Evolução de Gastos</h3>
                    <p className="text-xs text-slate-500 mt-1">Acompanhe a variação do seu custo fixo com assinaturas.</p>
                  </div>
                  <button
                    onClick={() => setChartRange((prev) => prev === '6m' ? '12m' : '6m')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                  >
                    <Calendar size={14} />
                    <span>{chartRange === '6m' ? 'Últimos 6 Meses' : 'Últimos 12 Meses'}</span>
                    <ChevronDown size={14} />
                  </button>
                </div>

                <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `R$ ${val}`} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                        formatter={(value) => [formatCurrency(value), 'Gasto Mensal']}
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
                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center">{recommendations.length}</span>
                </div>

                <div className="flex flex-col gap-4">
                  {recommendations.filter((item) => item.type === 'price').slice(0, 1).map(({ sub }) => (
                    <AttentionCard
                      key={`price-${sub.id}`}
                      icon={ArrowUpCircle}
                      color="border-red-100 bg-red-50 text-red-500"
                      title="Aumento de Preço"
                      text={`A assinatura do ${sub.name} subirá de ${formatCurrency(sub.price)} para ${formatCurrency(sub.nextPrice)} no próximo mês.`}
                    >
                      <button onClick={() => handleRecommendation('renegotiate', sub)} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Renegociar</button>
                      <button onClick={() => handleRecommendation('cancel', sub)} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200">Avaliar Cancelamento</button>
                    </AttentionCard>
                  ))}

                  {recommendations.filter((item) => item.type === 'lowUsage').slice(0, 1).map(({ sub }) => (
                    <AttentionCard
                      key={`usage-${sub.id}`}
                      icon={BatteryMedium}
                      color="border-yellow-100 bg-yellow-50 text-yellow-500"
                      title="Baixo Uso Percebido"
                      text={`Você quase não usa o ${sub.name}. Economia estimada: ${formatCurrency(getMonthlyCost(sub))}/mês.`}
                    >
                      <button onClick={() => handleRecommendation('pause', sub)} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Pausar (30 dias)</button>
                    </AttentionCard>
                  ))}

                  {recommendations.filter((item) => item.type === 'annualRenewal').slice(0, 1).map(({ sub }) => (
                    <AttentionCard
                      key={`annual-${sub.id}`}
                      icon={Clock}
                      color="border-blue-100 bg-blue-50 text-blue-500"
                      title="Renovação Anual Próxima"
                      text={`O ${sub.name} será renovado automaticamente ${getDaysLeftLabel(sub.nextBillingDate).toLowerCase()} (${formatCurrency(sub.price)}).`}
                    >
                      <button onClick={() => handleAction('details', sub)} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Ver detalhes</button>
                    </AttentionCard>
                  ))}

                  {recommendations.length === 0 && (
                    <div className="p-5 rounded-xl border border-green-100 bg-green-50 text-center">
                      <CheckCircle2 size={24} className="mx-auto text-green-600 mb-2" />
                      <p className="text-sm font-semibold text-slate-900">Tudo otimizado</p>
                      <p className="text-xs text-slate-600 mt-1">Nenhuma assinatura precisa de atenção agora.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Assinaturas */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-lg font-semibold text-slate-900">Suas Assinaturas</h3>
              <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
                {filterOptions.map((f) => (
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
                  {filteredSubscriptions.map((sub) => (
                    <SubscriptionRow key={sub.id} sub={sub} onAction={handleAction} />
                  ))}
                  {filteredSubscriptions.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                        <Filter size={24} className="mx-auto text-slate-300 mb-2" />
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

      {/* Menu por linha */}
      {activeSub && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveSub(null)}>
          <div
            onClick={(event) => event.stopPropagation()}
            className="absolute right-8 top-1/2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl p-2"
          >
            <button onClick={() => handleAction('details', activeSub)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50">
              <Eye size={15} /> Ver detalhes
            </button>
            {activeSub.status === 'Pausada' || activeSub.status === 'Cancelada' ? (
              <button onClick={() => handleAction('resume', activeSub)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-green-700 hover:bg-green-50">
                <PlayCircle size={15} /> Reativar assinatura
              </button>
            ) : (
              <button onClick={() => handleAction('pause', activeSub)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50">
                <PauseCircle size={15} /> Pausar assinatura
              </button>
            )}
            <button onClick={() => handleAction('reminder', activeSub)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50">
              <Bell size={15} /> {activeSub.reminder ? 'Desativar lembrete' : 'Ativar lembrete'}
            </button>
            <button onClick={() => handleAction('duplicate', activeSub)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50">
              <Copy size={15} /> Duplicar
            </button>
            {activeSub.status !== 'Cancelada' && (
              <button onClick={() => handleAction('cancel', activeSub)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-orange-700 hover:bg-orange-50">
                <ArchiveRestore size={15} /> Marcar como cancelada
              </button>
            )}
            <button onClick={() => handleAction('delete', activeSub)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50">
              <Trash2 size={15} /> Remover
            </button>
          </div>
        </div>
      )}

      {/* Modal Nova Assinatura */}
      {newModalOpen && (
        <Modal
          title="Nova Assinatura"
          subtitle="Cadastre um serviço recorrente e mantenha o dashboard coerente."
          onClose={() => setNewModalOpen(false)}
          width="max-w-2xl"
        >
          <form onSubmit={handleCreateSubscription} className="p-6 space-y-5">
            <div>
              <span className="text-xs font-semibold text-slate-600">Modelos rápidos</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                {serviceTemplates.map((template) => (
                  <button
                    type="button"
                    key={template.name}
                    onClick={() => setNewSub((prev) => ({ ...prev, ...template }))}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 text-left"
                  >
                    {template.name} · R$ {template.price}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Serviço">
                <input className={inputClass} value={newSub.name} onChange={(event) => setNewSub((prev) => ({ ...prev, name: event.target.value }))} placeholder="Ex: Netflix, Spotify, iCloud..." />
              </Field>
              <Field label="Plano">
                <input className={inputClass} value={newSub.plan} onChange={(event) => setNewSub((prev) => ({ ...prev, plan: event.target.value }))} placeholder="Ex: Standard, Duo, 2TB..." />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Categoria">
                <select className={inputClass} value={newSub.category} onChange={(event) => setNewSub((prev) => ({ ...prev, category: event.target.value }))}>
                  {categoryOptions.map((category) => <option key={category}>{category}</option>)}
                </select>
              </Field>
              <Field label="Ciclo">
                <select className={inputClass} value={newSub.billingCycle} onChange={(event) => setNewSub((prev) => ({ ...prev, billingCycle: event.target.value }))}>
                  {cycleOptions.map((cycle) => <option key={cycle}>{cycle}</option>)}
                </select>
              </Field>
              <Field label="Uso percebido">
                <select className={inputClass} value={newSub.usage} onChange={(event) => setNewSub((prev) => ({ ...prev, usage: event.target.value }))}>
                  {usageOptions.map((usage) => <option key={usage}>{usage}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Valor">
                <input className={inputClass} value={newSub.price} onChange={(event) => setNewSub((prev) => ({ ...prev, price: event.target.value }))} placeholder="R$ 0,00" />
              </Field>
              <Field label="Próximo débito">
                <input type="date" className={inputClass} value={newSub.nextBillingDate} onChange={(event) => setNewSub((prev) => ({ ...prev, nextBillingDate: event.target.value }))} />
              </Field>
              <Field label="Conta de cobrança">
                <select className={inputClass} value={newSub.account} onChange={(event) => setNewSub((prev) => ({ ...prev, account: event.target.value }))}>
                  {accountOptions.map((account) => <option key={account}>{account}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Observações">
              <textarea className={`${inputClass} min-h-[88px] resize-none`} value={newSub.notes} onChange={(event) => setNewSub((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Ex: motivo, uso, regra de renovação..." />
            </Field>

            <button
              type="button"
              onClick={() => setNewSub((prev) => ({ ...prev, reminder: !prev.reminder }))}
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium ${newSub.reminder ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              <Bell size={16} /> Lembrete antes da cobrança
            </button>

            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-700 flex gap-2">
              <Info size={16} className="text-blue-600 flex-shrink-0" />
              Assinaturas mensais entram pelo valor cheio. Assinaturas anuais e trimestrais entram no gasto mensal pelo valor equivalente.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setNewModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed">{saving ? 'Salvando...' : 'Adicionar assinatura'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Detalhes */}
      {detailModal && (
        <Modal
          title={detailModal.kind === 'renegotiate' ? 'Plano de Renegociação' : 'Detalhes da Assinatura'}
          subtitle="Informações conectadas ao serviço selecionado."
          onClose={() => setDetailModal(null)}
          width="max-w-lg"
        >
          <div className="p-6 space-y-4">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-xs text-slate-500">{detailModal.sub.category}</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{detailModal.sub.name}</p>
              <p className="text-sm text-slate-500 mt-1">{detailModal.sub.plan} · {detailModal.sub.billingCycle}</p>
            </div>

            {detailModal.kind === 'renegotiate' ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                  Preço atual: <strong>{formatCurrency(detailModal.sub.price)}</strong>. Próximo preço: <strong>{formatCurrency(detailModal.sub.nextPrice)}</strong>.
                </div>
                <div className="rounded-xl border border-slate-100 p-4 text-sm text-slate-600">
                  Sugestão para apresentação: mostrar comparação com plano inferior, dividir conta familiar ou cancelar antes da próxima cobrança.
                </div>
                <button onClick={() => handleRecommendation('cancel', detailModal.sub)} className="w-full px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">Marcar para cancelamento</button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-xs text-slate-500">Valor</span>
                    <p className="font-bold text-slate-900 mt-1">{formatCurrency(detailModal.sub.price)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-xs text-slate-500">Mensal equiv.</span>
                    <p className="font-bold text-slate-900 mt-1">{formatCurrency(getMonthlyCost({ ...detailModal.sub, status: 'Ativa' }))}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-xs text-slate-500">Próximo débito</span>
                    <p className="font-bold text-slate-900 mt-1">{formatDateLabel(detailModal.sub.nextBillingDate)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-xs text-slate-500">Cobrança</span>
                    <p className="font-bold text-slate-900 mt-1">{detailModal.sub.account}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                  <span className="text-sm text-slate-500">Uso percebido</span>
                  <UsageBadge usage={detailModal.sub.usage} />
                </div>
                {detailModal.sub.notes && (
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600">
                    {detailModal.sub.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Assinaturas;

import React, { useEffect, useMemo, useState, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Layers, Globe, ChevronDown, LayoutGrid, Wallet,
    FileText, RotateCcw, HandCoins, TrendingUp,
    Plus, Search, CalendarDays, CheckCircle2, Clock, AlertCircle,
    ChevronLeft, ChevronRight, Home, Wifi, Landmark, Barcode, Bot,
    MoreHorizontal, ShieldCheck, Zap, X, Copy, Trash2, Eye,
    ReceiptText, Building2, CreditCard, Bell, Banknote, CircleDollarSign,
    Edit3, Undo2, Settings2, PlayCircle, PauseCircle, Filter, Info
} from 'lucide-react';
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

const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const shortMonthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const pad = (number) => String(number).padStart(2, '0');
const toISODate = (year, monthIndex, day) => `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
const getMonthKey = (isoDate) => String(isoDate || '').slice(0, 7);
const getDayNumber = (isoDate) => Number(String(isoDate || '').slice(8, 10));

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});

const formatDateLabel = (isoDate) => {
    const date = new Date(`${isoDate}T12:00:00`);
    return dateFormatter.format(date).replace('.', '');
};

const getTodayISO = () => '2026-04-24';
const TODAY = getTodayISO();

const diffInDays = (fromISO, toISO) => {
    const from = new Date(`${fromISO}T12:00:00`);
    const to = new Date(`${toISO}T12:00:00`);
    return Math.round((to - from) / 86400000);
};

const getBillStatusLabel = (bill) => {
    if (bill.status === 'Pago') return `Pago em ${formatDateLabel(bill.paidAt || bill.dueDate)}`;
    const days = diffInDays(TODAY, bill.dueDate);
    if (days < 0) return `Atrasado há ${Math.abs(days)} dia${Math.abs(days) > 1 ? 's' : ''}`;
    if (days === 0) return 'Vence hoje';
    if (days === 1) return 'Vence amanhã';
    return `Vence em ${days} dias`;
};

const getBillComputedStatus = (bill) => {
    if (bill.status === 'Pago') return 'Pago';
    const days = diffInDays(TODAY, bill.dueDate);
    if (days < 0) return 'Atrasado';
    return 'Em Aberto';
};

const categoryOptions = [
    'Moradia', 'Energia', 'Internet', 'Água', 'Cartão', 'Telefone', 'Banco', 'Streaming', 'Outros',
];

const accountOptions = [
    { name: 'Nubank', initials: 'NU', color: 'purple', balance: 12678 },
    { name: 'Itaú', initials: 'IT', color: 'yellow', balance: 5345 },
    { name: 'Banco do Brasil', initials: 'BB', color: 'blue', balance: 8200 },
];

const categoryIconMap = {
    Moradia: Home,
    Energia: Zap,
    Internet: Wifi,
    Água: CircleDollarSign,
    Cartão: CreditCard,
    Telefone: Bell,
    Banco: Landmark,
    Streaming: PlayCircle,
    Outros: ReceiptText,
};

const categoryColorMap = {
    Moradia: 'blue',
    Energia: 'yellow',
    Internet: 'green',
    Água: 'cyan',
    Cartão: 'purple',
    Telefone: 'orange',
    Banco: 'slate',
    Streaming: 'red',
    Outros: 'slate',
};

const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
};

const accountBadgeStyles = {
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
};

// --- DADOS INICIAIS ---
const MENU_ITEMS = Object.freeze([
    { name: 'Painel Unificado', path: '/dashboard', icon: LayoutGrid, section: 1 },
    { name: 'Dinheiro', path: '/dinheiro', icon: Wallet, section: 1 },
    { name: 'Contas & Boletos', path: '/contas', icon: FileText, section: 1 },
    { name: 'Assinaturas', path: '/assinaturas', icon: RotateCcw, section: 1 },
    { name: 'Dívidas', path: '/dividas', icon: HandCoins, section: 1 },
    { name: 'Investimentos', path: '/investimentos', icon: TrendingUp, section: 1 },
]);

const INITIAL_BILLS = Object.freeze([
    {
        id: 1,
        title: 'Enel - Conta de Luz',
        category: 'Energia',
        amount: 185.4,
        dueDate: '2026-04-24',
        status: 'Em Aberto',
        recurring: true,
        account: 'Nubank',
        barcode: '34191.79001 01043.510047 91020.150008 8 97310000018540',
        autopay: false,
        reminder: true,
        notes: 'Conta cadastrada como recorrente mensal. Consumo dentro da média.',
    },
    {
        id: 2,
        title: 'Aluguel - QuintoAndar',
        category: 'Moradia',
        amount: 2100,
        dueDate: '2026-04-20',
        status: 'Em Aberto',
        recurring: true,
        account: 'Itaú',
        barcode: '23793.38128 60007.827136 95000.063305 1 97270000210000',
        autopay: true,
        reminder: true,
        notes: 'Auto-pay ativo para evitar atraso do aluguel.',
    },
    {
        id: 3,
        title: 'Claro Internet',
        category: 'Internet',
        amount: 120,
        dueDate: '2026-04-05',
        status: 'Pago',
        paidAt: '2026-04-05',
        recurring: true,
        account: 'Nubank',
        barcode: '10492.16905 10000.100045 77777.777777 1 97120000012000',
        autopay: false,
        reminder: false,
        receiptCode: 'COMP-CLARO-0504-2026',
        notes: 'Pagamento confirmado via Nubank.',
    },
    {
        id: 4,
        title: 'Sabesp - Água',
        category: 'Água',
        amount: 96.8,
        dueDate: '2026-04-10',
        status: 'Pago',
        paidAt: '2026-04-10',
        recurring: true,
        account: 'Itaú',
        barcode: '03399.63290 64000.000006 00125.401020 2 97170000009680',
        autopay: false,
        reminder: false,
        receiptCode: 'COMP-SABESP-1004-2026',
        notes: 'Pagamento registrado no dia do vencimento.',
    },
    {
        id: 5,
        title: 'Cartão Nubank',
        category: 'Cartão',
        amount: 1748.6,
        dueDate: '2026-04-28',
        status: 'Em Aberto',
        recurring: true,
        account: 'Nubank',
        barcode: '26090.00124 51234.009917 92000.000031 4 97350000174860',
        autopay: false,
        reminder: true,
        notes: 'Fatura parcial importada para a apresentação.',
    },
]);


const getDemoBills = (userId) => INITIAL_BILLS.map(({ id, dueDate, paidAt, receiptCode, ...bill }) => ({
    user_id: userId,
    title: bill.title,
    category: bill.category,
    amount: bill.amount,
    due_date: dueDate,
    status: bill.status,
    recurring: bill.recurring,
    account: bill.account,
    barcode: bill.barcode,
    autopay: bill.autopay,
    reminder: bill.reminder,
    paid_at: paidAt || null,
    receipt_code: receiptCode || null,
    notes: bill.notes || '',
}));

const normalizeBill = (row) => ({
    id: row.id,
    title: row.title,
    category: row.category || 'Outros',
    amount: Number(row.amount || 0),
    dueDate: row.due_date,
    status: row.status || 'Em Aberto',
    recurring: Boolean(row.recurring),
    account: row.account || 'Nubank',
    barcode: row.barcode || '',
    autopay: Boolean(row.autopay),
    reminder: Boolean(row.reminder),
    paidAt: row.paid_at || undefined,
    receiptCode: row.receipt_code || undefined,
    notes: row.notes || '',
});

const serializeBill = (bill, userId) => ({
    user_id: userId,
    title: bill.title,
    category: bill.category,
    amount: Number(bill.amount || 0),
    due_date: bill.dueDate,
    status: bill.status || 'Em Aberto',
    recurring: Boolean(bill.recurring),
    account: bill.account || 'Nubank',
    barcode: bill.barcode || '',
    autopay: Boolean(bill.autopay),
    reminder: Boolean(bill.reminder),
    paid_at: bill.paidAt || null,
    receipt_code: bill.receiptCode || null,
    notes: bill.notes || '',
});

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

const inputClass = 'w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all';

const SidebarItem = memo(({ item, currentPath, onClick, showDivider }) => {
    const isActive = currentPath === item.path;
    const MenuIcon = item.icon;

    return (
        <React.Fragment>
            {showDivider && <div className="my-2 border-t border-slate-200/50" />}
            <button
                onClick={() => onClick(item.path)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isActive ? 'bg-[#eff6ff] text-[#2563eb]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
            >
                <MenuIcon size={18} className={isActive ? 'text-[#2563eb]' : 'text-slate-400'} />
                {item.name}
            </button>
        </React.Fragment>
    );
});

const CalendarDay = memo(({ day, dateISO, monthType, isSelected, hasOpen, hasPaid, hasOverdue, onClick }) => {
    const isMuted = monthType !== 'current';
    const isToday = dateISO === TODAY;

    let baseClass = 'relative aspect-square flex flex-col justify-center items-center rounded-lg text-sm font-medium cursor-pointer transition-all border ';

    if (isSelected) baseClass += 'bg-blue-500 text-white shadow-md border-blue-500 ';
    else if (isToday) baseClass += 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 ';
    else if (isMuted) baseClass += 'text-slate-300 border-transparent hover:bg-slate-50 ';
    else baseClass += 'text-slate-700 border-transparent hover:bg-slate-100 ';

    return (
        <button type="button" onClick={() => onClick(dateISO)} className={baseClass}>
            {day}
            {(hasOpen || hasPaid || hasOverdue) && (
                <span className="absolute bottom-1 flex items-center gap-0.5">
                    {hasOverdue && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`} />}
                    {hasOpen && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-yellow-500'}`} />}
                    {hasPaid && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />}
                </span>
            )}
        </button>
    );
});

const SummaryTile = memo(({ title, value, icon: Icon, iconColorClass, iconBgClass, extraText, isAlert, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`text-left rounded-2xl p-5 shadow-sm border ${isAlert ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-100'} flex flex-col group hover:shadow-md transition-shadow`}
    >
        <div className="flex justify-between items-start mb-2">
            <h3 className={`text-sm font-medium ${isAlert ? 'text-red-600' : 'text-slate-500'}`}>{title}</h3>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBgClass} ${iconColorClass}`}>
                <Icon size={16} />
            </div>
        </div>
        <span className={`text-2xl font-bold ${isAlert ? 'text-red-700' : 'text-slate-900'}`}>{value}</span>
        <div className={`mt-2 text-xs font-medium flex items-center gap-1 ${isAlert ? 'text-red-600' : 'text-slate-500'}`}>
            <span className={iconColorClass}>{extraText}</span>
        </div>
    </button>
));

const BillCard = memo(({ bill, accounts, onAction, onAccountChange }) => {
    const Icon = categoryIconMap[bill.category] || ReceiptText;
    const color = categoryColorMap[bill.category] || 'slate';
    const computedStatus = getBillComputedStatus(bill);
    const isPaid = computedStatus === 'Pago';
    const isOverdue = computedStatus === 'Atrasado';
    const account = accounts.find((item) => item.name === bill.account) || accounts[0] || accountOptions[0];

    const statusClass = isPaid
        ? 'bg-green-100 text-green-700'
        : isOverdue
            ? 'bg-red-100 text-red-700'
            : diffInDays(TODAY, bill.dueDate) === 0
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-slate-100 text-slate-600';

    return (
        <div className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all ${isPaid ? 'opacity-80 hover:opacity-100' : ''}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorStyles[color]}`}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <h3 className={`text-base font-semibold ${isPaid ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{bill.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${statusClass}`}>
                                {isPaid && <CheckCircle2 size={10} />}
                                {getBillStatusLabel(bill)}
                            </span>
                            {bill.recurring && <span className="text-xs text-slate-500">Recorrente Mensal</span>}
                            {bill.autopay && (
                                <span className="text-[10px] text-[#2563eb] bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1 font-medium">
                                    <Bot size={12} /> Auto-pay ativo
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`text-xl font-bold ${isPaid ? 'text-slate-500' : 'text-slate-900'}`}>{formatCurrency(bill.amount)}</span>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Landmark size={12} /> {isPaid ? 'Pago via:' : 'Pagar com:'}
                    </span>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${accountBadgeStyles[account.color] || accountBadgeStyles.blue}`}>{account.initials}</div>
                        <select
                            value={bill.account}
                            disabled={isPaid}
                            onChange={(event) => onAccountChange(bill.id, event.target.value)}
                            className="bg-transparent outline-none disabled:appearance-none"
                        >
                            {accounts.map((item) => <option key={item.name}>{item.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    {!isPaid && (
                        <button
                            onClick={() => onAction('copy', bill)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                        >
                            <Barcode size={16} /> Copiar Código
                        </button>
                    )}

                    {isPaid ? (
                        <button
                            onClick={() => onAction('receipt', bill)}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                        >
                            Ver Comprovante
                        </button>
                    ) : (
                        <button
                            onClick={() => onAction('pay', bill)}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            Marcar Pago
                        </button>
                    )}

                    <button
                        onClick={() => onAction('menu', bill)}
                        className="flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
});

// --- COMPONENTE PRINCIPAL ---
const Contas = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const { user, sessionLoading } = useAuth();

    const [bills, setBills] = useState(INITIAL_BILLS);
    const [accounts, setAccounts] = useState(accountOptions);
    const [syncing, setSyncing] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState({ year: 2026, monthIndex: 3 });
    const [selectedDate, setSelectedDate] = useState(TODAY);
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [search, setSearch] = useState('');
    const [newBillOpen, setNewBillOpen] = useState(false);
    const [automationOpen, setAutomationOpen] = useState(false);
    const [activeBill, setActiveBill] = useState(null);
    const [detailModal, setDetailModal] = useState(null);
    const [toast, setToast] = useState('');
    const [automationsEnabled, setAutomationsEnabled] = useState(true);

    const [newBill, setNewBill] = useState({
        title: '',
        category: 'Energia',
        amount: '',
        dueDate: TODAY,
        account: 'Nubank',
        recurring: true,
        autopay: false,
        reminder: true,
        barcode: '',
        notes: '',
    });

    const loadAccounts = async () => {
        const { data, error } = await supabase
            .from('money_accounts')
            .select('name, balance, color, initials')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (!error && data?.length) {
            setAccounts(data.map((account) => ({
                name: account.name,
                initials: account.initials || String(account.name).slice(0, 2).toUpperCase(),
                color: account.color || 'blue',
                balance: Number(account.balance || 0),
            })));
        }
    };

    const loadBills = async () => {
        if (!user) return;
        setSyncing(true);

        try {
            await loadAccounts();

            const { data, error } = await supabase
                .from('contas_bills')
                .select('*')
                .eq('user_id', user.id)
                .order('due_date', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                const { data: inserted, error: insertError } = await supabase
                    .from('contas_bills')
                    .insert(getDemoBills(user.id))
                    .select();

                if (insertError) throw insertError;
                setBills((inserted || []).map(normalizeBill));
                return;
            }

            setBills(data.map(normalizeBill));
        } catch (error) {
            console.error('Erro ao carregar contas:', error);
            showToast(`Erro ao carregar contas: ${error.message}`);
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        if (sessionLoading) return;

        if (!user) {
            navigate('/login');
            return;
        }

        loadBills();
    }, [sessionLoading, user?.id, navigate]);

    const showToast = (message) => {
        setToast(message);
        window.setTimeout(() => setToast(''), 2200);
    };

    const monthKey = `${calendarMonth.year}-${pad(calendarMonth.monthIndex + 1)}`;

    const monthlyBills = useMemo(() => bills.filter((bill) => getMonthKey(bill.dueDate) === monthKey), [bills, monthKey]);

    const totals = useMemo(() => {
        const total = monthlyBills.reduce((sum, bill) => sum + Number(bill.amount), 0);
        const paid = monthlyBills.filter((bill) => bill.status === 'Pago').reduce((sum, bill) => sum + Number(bill.amount), 0);
        const open = monthlyBills.filter((bill) => getBillComputedStatus(bill) === 'Em Aberto').reduce((sum, bill) => sum + Number(bill.amount), 0);
        const overdue = monthlyBills.filter((bill) => getBillComputedStatus(bill) === 'Atrasado').reduce((sum, bill) => sum + Number(bill.amount), 0);
        const nextOpen = monthlyBills
            .filter((bill) => bill.status !== 'Pago')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

        return { total, paid, open, overdue, nextOpen, count: monthlyBills.length };
    }, [monthlyBills]);

    const calendarDays = useMemo(() => {
        const { year, monthIndex } = calendarMonth;
        const firstDay = new Date(year, monthIndex, 1);
        const startWeekday = firstDay.getDay();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();
        const days = [];

        for (let i = startWeekday - 1; i >= 0; i -= 1) {
            const day = daysInPrevMonth - i;
            const date = new Date(year, monthIndex - 1, day);
            days.push({ day, dateISO: toISODate(date.getFullYear(), date.getMonth(), day), monthType: 'prev' });
        }

        for (let day = 1; day <= daysInMonth; day += 1) {
            days.push({ day, dateISO: toISODate(year, monthIndex, day), monthType: 'current' });
        }

        let nextDay = 1;
        while (days.length % 7 !== 0 || days.length < 35) {
            const date = new Date(year, monthIndex + 1, nextDay);
            days.push({ day: nextDay, dateISO: toISODate(date.getFullYear(), date.getMonth(), nextDay), monthType: 'next' });
            nextDay += 1;
        }

        return days.map((day) => {
            const dayBills = bills.filter((bill) => bill.dueDate === day.dateISO);
            return {
                ...day,
                hasOpen: dayBills.some((bill) => getBillComputedStatus(bill) === 'Em Aberto'),
                hasPaid: dayBills.some((bill) => bill.status === 'Pago'),
                hasOverdue: dayBills.some((bill) => getBillComputedStatus(bill) === 'Atrasado'),
            };
        });
    }, [calendarMonth, bills]);

    const selectedDayBills = useMemo(() => {
        return bills
            .filter((bill) => bill.dueDate === selectedDate)
            .sort((a, b) => Number(b.amount) - Number(a.amount));
    }, [bills, selectedDate]);

    const filteredBills = useMemo(() => {
        const q = search.trim().toLowerCase();

        return monthlyBills
            .filter((bill) => {
                if (statusFilter === 'Todos') return true;
                return getBillComputedStatus(bill) === statusFilter;
            })
            .filter((bill) => {
                if (!q) return true;
                return [bill.title, bill.category, bill.account, bill.barcode, bill.notes]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(q));
            })
            .sort((a, b) => {
                const aPaid = a.status === 'Pago';
                const bPaid = b.status === 'Pago';
                if (aPaid !== bPaid) return aPaid ? 1 : -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
    }, [monthlyBills, statusFilter, search]);

    const resetData = async () => {
        if (!user || resetting) return;

        const confirmReset = window.confirm('Resetar os dados de Contas & Boletos deste usuário?');
        if (!confirmReset) return;

        setResetting(true);

        try {
            const { error: deleteError } = await supabase
                .from('contas_bills')
                .delete()
                .eq('user_id', user.id);

            if (deleteError) throw deleteError;

            const { data, error: insertError } = await supabase
                .from('contas_bills')
                .insert(getDemoBills(user.id))
                .select();

            if (insertError) throw insertError;

            setBills((data || []).map(normalizeBill));
            setCalendarMonth({ year: 2026, monthIndex: 3 });
            setSelectedDate(TODAY);
            setStatusFilter('Todos');
            setSearch('');
            setAutomationsEnabled(true);
            showToast('Dados de contas restaurados.');
        } catch (error) {
            console.error('Erro ao resetar contas:', error);
            showToast(`Erro ao resetar contas: ${error.message}`);
        } finally {
            setResetting(false);
        }
    };

    const goToMonth = (direction) => {
        setCalendarMonth((prev) => {
            const date = new Date(prev.year, prev.monthIndex + direction, 1);
            const next = { year: date.getFullYear(), monthIndex: date.getMonth() };
            setSelectedDate(toISODate(next.year, next.monthIndex, 1));
            return next;
        });
    };

    const handleCreateBill = async (event) => {
        event.preventDefault();
        const amount = parseCurrency(newBill.amount);

        if (!user) {
            navigate('/login');
            return;
        }

        if (!newBill.title.trim() || !amount || !newBill.dueDate) {
            showToast('Preencha nome, valor e vencimento da conta.');
            return;
        }

        const bill = {
            title: newBill.title.trim(),
            category: newBill.category,
            amount,
            dueDate: newBill.dueDate,
            status: 'Em Aberto',
            recurring: Boolean(newBill.recurring),
            account: newBill.account,
            barcode: newBill.barcode.trim() || `00000.00000 00000.000000 00000.000000 0 ${String(Math.round(amount * 100)).padStart(14, '0')}`,
            autopay: Boolean(newBill.autopay),
            reminder: Boolean(newBill.reminder),
            notes: newBill.notes.trim(),
        };

        const tempId = `temp-${Date.now()}`;
        const optimisticBill = { ...bill, id: tempId };
        setBills((prev) => [optimisticBill, ...prev]);
        setSelectedDate(bill.dueDate);
        setCalendarMonth({ year: Number(bill.dueDate.slice(0, 4)), monthIndex: Number(bill.dueDate.slice(5, 7)) - 1 });
        setNewBillOpen(false);

        try {
            const { data, error } = await supabase
                .from('contas_bills')
                .insert(serializeBill(bill, user.id))
                .select()
                .single();

            if (error) throw error;
            setBills((prev) => prev.map((item) => item.id === tempId ? normalizeBill(data) : item));
            showToast('Nova conta adicionada à agenda.');
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            setBills((prev) => prev.filter((item) => item.id !== tempId));
            showToast(`Erro ao criar conta: ${error.message}`);
        }

        setNewBill({
            title: '',
            category: 'Energia',
            amount: '',
            dueDate: TODAY,
            account: accounts[0]?.name || 'Nubank',
            recurring: true,
            autopay: false,
            reminder: true,
            barcode: '',
            notes: '',
        });
    };

    const updateBillAccount = async (billId, accountName) => {
        setBills((prev) => prev.map((bill) => bill.id === billId ? { ...bill, account: accountName } : bill));

        const { error } = await supabase
            .from('contas_bills')
            .update({ account: accountName })
            .eq('id', billId)
            .eq('user_id', user.id);

        if (error) {
            showToast(`Erro ao atualizar conta: ${error.message}`);
            loadBills();
            return;
        }

        showToast(`Conta de pagamento alterada para ${accountName}.`);
    };

    const handleBillAction = async (action, bill) => {
        if (action === 'menu') {
            setActiveBill(bill);
            return;
        }

        if (action === 'copy') {
            setDetailModal({ kind: 'barcode', bill });
            showToast('Código do boleto pronto para copiar.');
            return;
        }

        if (action === 'receipt') {
            setDetailModal({ kind: 'receipt', bill });
            setActiveBill(null);
            return;
        }

        if (action === 'details') {
            setDetailModal({ kind: 'details', bill });
            setActiveBill(null);
            return;
        }

        if (!user) {
            navigate('/login');
            return;
        }

        if (action === 'pay') {
            const receiptCode = `COMP-${String(bill.title).slice(0, 5).toUpperCase().replace(/\s/g, '')}-${Date.now().toString().slice(-5)}`;
            const updatedBill = { ...bill, status: 'Pago', paidAt: TODAY, receiptCode };
            setBills((prev) => prev.map((item) => item.id === bill.id ? updatedBill : item));
            setActiveBill(null);

            const { error } = await supabase
                .from('contas_bills')
                .update({ status: 'Pago', paid_at: TODAY, receipt_code: receiptCode })
                .eq('id', bill.id)
                .eq('user_id', user.id);

            if (error) {
                showToast(`Erro ao marcar como pago: ${error.message}`);
                loadBills();
                return;
            }

            showToast(`${bill.title} marcado como pago.`);
            return;
        }

        if (action === 'autopay') {
            setBills((prev) => prev.map((item) => item.id === bill.id ? { ...item, autopay: !item.autopay } : item));
            setActiveBill(null);

            const { error } = await supabase
                .from('contas_bills')
                .update({ autopay: !bill.autopay })
                .eq('id', bill.id)
                .eq('user_id', user.id);

            if (error) {
                showToast(`Erro ao atualizar auto-pay: ${error.message}`);
                loadBills();
                return;
            }

            showToast(!bill.autopay ? 'Auto-pay ativado.' : 'Auto-pay pausado.');
            return;
        }

        if (action === 'reminder') {
            setBills((prev) => prev.map((item) => item.id === bill.id ? { ...item, reminder: !item.reminder } : item));
            setActiveBill(null);

            const { error } = await supabase
                .from('contas_bills')
                .update({ reminder: !bill.reminder })
                .eq('id', bill.id)
                .eq('user_id', user.id);

            if (error) {
                showToast(`Erro ao atualizar lembrete: ${error.message}`);
                loadBills();
                return;
            }

            showToast(!bill.reminder ? 'Lembrete ativado.' : 'Lembrete desativado.');
            return;
        }

        if (action === 'reopen') {
            setBills((prev) => prev.map((item) => item.id === bill.id ? { ...item, status: 'Em Aberto', paidAt: undefined, receiptCode: undefined } : item));
            setActiveBill(null);

            const { error } = await supabase
                .from('contas_bills')
                .update({ status: 'Em Aberto', paid_at: null, receipt_code: null })
                .eq('id', bill.id)
                .eq('user_id', user.id);

            if (error) {
                showToast(`Erro ao reabrir conta: ${error.message}`);
                loadBills();
                return;
            }

            showToast('Conta reaberta como em aberto.');
            return;
        }

        if (action === 'delete') {
            setBills((prev) => prev.filter((item) => item.id !== bill.id));
            setActiveBill(null);

            const { error } = await supabase
                .from('contas_bills')
                .delete()
                .eq('id', bill.id)
                .eq('user_id', user.id);

            if (error) {
                showToast(`Erro ao remover conta: ${error.message}`);
                loadBills();
                return;
            }

            showToast('Conta removida da agenda.');
        }
    };

    const applyAutomation = async () => {
        if (!user) return;

        const eligibleBills = bills.filter((bill) => {
            if (bill.status === 'Pago') return false;
            const days = diffInDays(TODAY, bill.dueDate);
            return automationsEnabled && bill.autopay && days <= 2 && days >= 0;
        });

        const updatedBills = eligibleBills.map((bill) => ({
            ...bill,
            status: 'Pago',
            paidAt: TODAY,
            receiptCode: `AUTO-${bill.id}-${Date.now().toString().slice(-4)}`,
            notes: `${bill.notes || ''} Pagamento automático simulado em ${formatDateLabel(TODAY)}.`.trim(),
        }));

        setBills((prev) => prev.map((bill) => updatedBills.find((item) => item.id === bill.id) || bill));
        setAutomationOpen(false);

        try {
            await Promise.all(updatedBills.map((bill) => supabase
                .from('contas_bills')
                .update({
                    status: bill.status,
                    paid_at: bill.paidAt,
                    receipt_code: bill.receiptCode,
                    notes: bill.notes,
                })
                .eq('id', bill.id)
                .eq('user_id', user.id)
            ));

            showToast('Rotina de automação simulada nos boletos elegíveis.');
        } catch (error) {
            console.error('Erro ao rodar automação:', error);
            showToast(`Erro ao rodar automação: ${error.message}`);
            loadBills();
        }
    };

    const quickBills = [
        { title: 'Condomínio', category: 'Moradia', amount: '680,00', account: 'Itaú' },
        { title: 'Vivo Celular', category: 'Telefone', amount: '89,90', account: 'Nubank' },
        { title: 'Netflix', category: 'Streaming', amount: '55,90', account: 'Nubank' },
    ];

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
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <Layers size={18} />
                    </div>
                    <span className="font-bold text-xl tracking-tight">LifeOS</span>
                </div>

                <div className="flex items-center gap-4">

                </div>
            </header>

            <div className="flex flex-1 w-full max-w-[1440px] mx-auto px-4 lg:px-8 pb-8 gap-6 relative z-10">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-6">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/50 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                            {(user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-slate-800 truncate">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'}</span>
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

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0">
                    {/* Top Action Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Contas & Boletos</h1>
                            <p className="text-sm text-slate-500 mt-1">Agenda de vencimentos, status e automações de pagamento.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={resetData}
                                disabled={resetting}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <RotateCcw size={16} className={resetting ? 'animate-spin' : ''} /> {resetting ? 'Resetando...' : 'Resetar dados'}
                            </button>
                            <button
                                onClick={() => setAutomationOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                <Bot size={16} /> Automações
                            </button>
                            <button
                                onClick={() => setNewBillOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <Plus size={16} /> Nova Conta
                            </button>
                        </div>
                    </div>

                    {/* Financial Health Summary Tiles */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <SummaryTile
                            title="Total a Pagar (Mês)"
                            value={formatCurrency(totals.total)}
                            icon={CalendarDays}
                            iconColorClass="text-slate-400"
                            iconBgClass="bg-slate-50"
                            extraText={`${totals.count} contas registradas`}
                            onClick={() => setStatusFilter('Todos')}
                        />
                        <SummaryTile
                            title="Já Pago"
                            value={formatCurrency(totals.paid)}
                            icon={CheckCircle2}
                            iconColorClass="text-green-600"
                            iconBgClass="bg-green-50"
                            extraText={`${totals.total ? Math.round((totals.paid / totals.total) * 100) : 0}% concluído`}
                            onClick={() => setStatusFilter('Pago')}
                        />
                        <SummaryTile
                            title="Em Aberto"
                            value={formatCurrency(totals.open)}
                            icon={Clock}
                            iconColorClass="text-yellow-600"
                            iconBgClass="bg-yellow-50"
                            extraText={totals.nextOpen ? getBillStatusLabel(totals.nextOpen) : 'Nenhuma pendência'}
                            onClick={() => setStatusFilter('Em Aberto')}
                        />
                        <SummaryTile
                            title="Atrasados"
                            value={formatCurrency(totals.overdue)}
                            icon={AlertCircle}
                            iconColorClass="text-red-600"
                            iconBgClass="bg-red-100"
                            extraText={totals.overdue > 0 ? 'Ação recomendada' : 'Tudo em dia! 🎉'}
                            isAlert
                            onClick={() => setStatusFilter('Atrasado')}
                        />
                    </div>

                    {/* Main Layout: Split View */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                        {/* Left Column: Interactive Calendar */}
                        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-slate-900">{monthNames[calendarMonth.monthIndex]} {calendarMonth.year}</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => goToMonth(-1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button onClick={() => goToMonth(1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-slate-400 font-medium text-center">
                                <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((d) => (
                                    <CalendarDay
                                        key={d.dateISO}
                                        {...d}
                                        isSelected={selectedDate === d.dateISO}
                                        onClick={(dateISO) => {
                                            setSelectedDate(dateISO);
                                            if (getMonthKey(dateISO) !== monthKey) {
                                                setCalendarMonth({ year: Number(dateISO.slice(0, 4)), monthIndex: Number(dateISO.slice(5, 7)) - 1 });
                                            }
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-slate-800">Resumo do Dia ({formatDateLabel(selectedDate)})</h4>
                                    <span className="text-[10px] text-slate-400">{selectedDayBills.length} item(ns)</span>
                                </div>

                                {selectedDayBills.length === 0 ? (
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                                        <CalendarDays size={20} className="text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-slate-700">Nenhuma conta nesse dia</p>
                                        <p className="text-xs text-slate-500 mt-1">Clique em Nova Conta para cadastrar um vencimento.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedDayBills.map((bill) => {
                                            const Icon = categoryIconMap[bill.category] || ReceiptText;
                                            const color = categoryColorMap[bill.category] || 'slate';
                                            return (
                                                <button
                                                    key={bill.id}
                                                    onClick={() => setDetailModal({ kind: 'details', bill })}
                                                    className="w-full bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorStyles[color]}`}>
                                                            <Icon size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-800">{bill.title}</p>
                                                            <p className="text-xs text-slate-500">{getBillStatusLabel(bill)}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900">{formatCurrency(bill.amount)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Detailed Agenda & Bill Management */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            {/* Filters & Search */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex flex-wrap gap-2">
                                    {['Todos', 'Em Aberto', 'Pago', 'Atrasado'].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setStatusFilter(filter)}
                                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${statusFilter === filter ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'}`}
                                        >
                                            {filter === 'Pago' ? 'Pagos' : filter}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Buscar boleto..."
                                        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Bill Cards List */}
                            <div className="flex flex-col gap-4">
                                {filteredBills.map((bill) => (
                                    <BillCard
                                        key={bill.id}
                                        bill={bill}
                                        accounts={accounts}
                                        onAction={handleBillAction}
                                        onAccountChange={updateBillAccount}
                                    />
                                ))}

                                {filteredBills.length === 0 && (
                                    <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 text-center">
                                        <Filter size={28} className="mx-auto text-slate-300 mb-3" />
                                        <p className="text-sm font-semibold text-slate-700">Nenhuma conta encontrada</p>
                                        <p className="text-xs text-slate-500 mt-1">Altere o filtro, busque outro termo ou cadastre uma nova conta.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="w-full py-6 px-6 border-t border-slate-200 bg-white mt-auto z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>
                        Ao continuar, você concorda com nossos <a href="#" className="text-[#2563eb] hover:underline">Termos de Serviço</a> e <a href="#" className="text-[#2563eb] hover:underline">Política de Privacidade</a>.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 font-medium"><ShieldCheck size={14} className="text-emerald-500" /> Privacidade Garantida</span>
                        <a href="#" className="hover:text-slate-800 transition-colors">Suporte</a>
                    </div>
                </div>
            </footer>

            {/* Menu da conta */}
            {activeBill && (
                <div className="fixed inset-0 z-40" onClick={() => setActiveBill(null)}>
                    <div
                        onClick={(event) => event.stopPropagation()}
                        className="absolute right-8 top-1/2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl p-2"
                    >
                        <button onClick={() => handleBillAction('details', activeBill)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50">
                            <Eye size={15} /> Ver detalhes
                        </button>
                        <button onClick={() => handleBillAction('autopay', activeBill)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50">
                            {activeBill.autopay ? <PauseCircle size={15} /> : <PlayCircle size={15} />} {activeBill.autopay ? 'Pausar auto-pay' : 'Ativar auto-pay'}
                        </button>
                        <button onClick={() => handleBillAction('reminder', activeBill)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50">
                            <Bell size={15} /> {activeBill.reminder ? 'Desativar lembrete' : 'Ativar lembrete'}
                        </button>
                        {activeBill.status === 'Pago' ? (
                            <button onClick={() => handleBillAction('reopen', activeBill)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50">
                                <Undo2 size={15} /> Reabrir conta
                            </button>
                        ) : (
                            <button onClick={() => handleBillAction('pay', activeBill)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-green-700 hover:bg-green-50">
                                <CheckCircle2 size={15} /> Marcar como paga
                            </button>
                        )}
                        <button onClick={() => handleBillAction('delete', activeBill)} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50">
                            <Trash2 size={15} /> Remover conta
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Nova Conta */}
            {newBillOpen && (
                <Modal
                    title="Nova Conta"
                    subtitle="Cadastre um boleto, assinatura ou vencimento recorrente."
                    onClose={() => setNewBillOpen(false)}
                    width="max-w-2xl"
                >
                    <form onSubmit={handleCreateBill} className="p-6 space-y-5">
                        <div>
                            <span className="text-xs font-semibold text-slate-600">Modelos rápidos</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                                {quickBills.map((bill) => (
                                    <button
                                        type="button"
                                        key={bill.title}
                                        onClick={() => setNewBill((prev) => ({ ...prev, ...bill }))}
                                        className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 text-left"
                                    >
                                        {bill.title} · R$ {bill.amount}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Nome da conta">
                                <input className={inputClass} value={newBill.title} onChange={(event) => setNewBill((prev) => ({ ...prev, title: event.target.value }))} placeholder="Ex: Enel, Aluguel, Internet..." />
                            </Field>
                            <Field label="Categoria">
                                <select className={inputClass} value={newBill.category} onChange={(event) => setNewBill((prev) => ({ ...prev, category: event.target.value }))}>
                                    {categoryOptions.map((category) => <option key={category}>{category}</option>)}
                                </select>
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field label="Valor">
                                <input className={inputClass} value={newBill.amount} onChange={(event) => setNewBill((prev) => ({ ...prev, amount: event.target.value }))} placeholder="R$ 0,00" />
                            </Field>
                            <Field label="Vencimento">
                                <input type="date" className={inputClass} value={newBill.dueDate} onChange={(event) => setNewBill((prev) => ({ ...prev, dueDate: event.target.value }))} />
                            </Field>
                            <Field label="Pagar com">
                                <select className={inputClass} value={newBill.account} onChange={(event) => setNewBill((prev) => ({ ...prev, account: event.target.value }))}>
                                    {accounts.map((account) => <option key={account.name}>{account.name} · {formatCurrency(account.balance)}</option>)}
                                </select>
                            </Field>
                        </div>

                        <Field label="Código de barras / linha digitável">
                            <input className={inputClass} value={newBill.barcode} onChange={(event) => setNewBill((prev) => ({ ...prev, barcode: event.target.value }))} placeholder="Opcional — será gerado um código fictício se vazio" />
                        </Field>

                        <Field label="Observações">
                            <textarea className={`${inputClass} min-h-[88px] resize-none`} value={newBill.notes} onChange={(event) => setNewBill((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Ex: recorrência, alerta, referência do contrato..." />
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setNewBill((prev) => ({ ...prev, recurring: !prev.recurring }))}
                                className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium ${newBill.recurring ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}
                            >
                                <RotateCcw size={16} /> Recorrente
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewBill((prev) => ({ ...prev, autopay: !prev.autopay }))}
                                className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium ${newBill.autopay ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}
                            >
                                <Bot size={16} /> Auto-pay
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewBill((prev) => ({ ...prev, reminder: !prev.reminder }))}
                                className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium ${newBill.reminder ? 'bg-yellow-50 border-yellow-100 text-yellow-700' : 'bg-white border-slate-200 text-slate-600'}`}
                            >
                                <Bell size={16} /> Lembrete
                            </button>
                        </div>

                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-700 flex gap-2">
                            <Info size={16} className="text-blue-600 flex-shrink-0" />
                            A nova conta entra no calendário, atualiza os cards do mês selecionado e aparece na lista com o status calculado pelo vencimento.
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setNewBillOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
                            <button type="submit" className="px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700">Adicionar conta</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Modal Automações */}
            {automationOpen && (
                <Modal
                    title="Automações de Pagamento"
                    subtitle="Simulação coerente para apresentação: regras não enviam dinheiro real."
                    onClose={() => setAutomationOpen(false)}
                >
                    <div className="p-6 space-y-5">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Auto-pay inteligente</p>
                                <p className="text-xs text-slate-500 mt-1">Paga contas com auto-pay ativo quando faltam até 2 dias para o vencimento.</p>
                            </div>
                            <button
                                onClick={() => setAutomationsEnabled((prev) => !prev)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium ${automationsEnabled ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}
                            >
                                {automationsEnabled ? 'Ativo' : 'Pausado'}
                            </button>
                        </div>

                        <div className="space-y-2">
                            {bills.filter((bill) => bill.autopay).map((bill) => (
                                <div key={bill.id} className="flex items-center justify-between text-sm border border-slate-100 rounded-xl p-3">
                                    <div>
                                        <p className="font-medium text-slate-800">{bill.title}</p>
                                        <p className="text-xs text-slate-500">{formatDateLabel(bill.dueDate)} · {bill.account}</p>
                                    </div>
                                    <span className="font-bold text-slate-900">{formatCurrency(bill.amount)}</span>
                                </div>
                            ))}
                            {bills.filter((bill) => bill.autopay).length === 0 && (
                                <p className="text-sm text-slate-500">Nenhuma conta com auto-pay ativo.</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setAutomationOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Fechar</button>
                            <button onClick={applyAutomation} className="px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700">Rodar simulação</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal Detalhes / Código / Comprovante */}
            {detailModal && (
                <Modal
                    title={detailModal.kind === 'barcode' ? 'Código do Boleto' : detailModal.kind === 'receipt' ? 'Comprovante' : 'Detalhes da Conta'}
                    subtitle="Informações conectadas ao item selecionado."
                    onClose={() => setDetailModal(null)}
                    width="max-w-lg"
                >
                    <div className="p-6 space-y-4">
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                            <p className="text-xs text-slate-500">{detailModal.bill.category}</p>
                            <p className="text-xl font-bold text-slate-900 mt-1">{detailModal.bill.title}</p>
                            <p className="text-sm text-slate-500 mt-1">{formatDateLabel(detailModal.bill.dueDate)} · {detailModal.bill.account}</p>
                        </div>

                        {detailModal.kind === 'barcode' && (
                            <>
                                <div className="rounded-xl border border-slate-100 p-4">
                                    <p className="text-xs text-slate-500 mb-2">Linha digitável</p>
                                    <p className="text-sm font-mono text-slate-800 break-all">{detailModal.bill.barcode}</p>
                                </div>
                                <button onClick={() => showToast('Código copiado na simulação.')} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700">
                                    <Copy size={16} /> Copiar código
                                </button>
                            </>
                        )}

                        {detailModal.kind === 'receipt' && (
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                                    <span className="text-slate-500">Valor pago</span>
                                    <strong>{formatCurrency(detailModal.bill.amount)}</strong>
                                </div>
                                <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                                    <span className="text-slate-500">Data</span>
                                    <strong>{formatDateLabel(detailModal.bill.paidAt || detailModal.bill.dueDate)}</strong>
                                </div>
                                <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                                    <span className="text-slate-500">Conta usada</span>
                                    <strong>{detailModal.bill.account}</strong>
                                </div>
                                <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-700 flex gap-2">
                                    <CheckCircle2 size={17} className="flex-shrink-0" />
                                    Comprovante fictício: {detailModal.bill.receiptCode || 'COMP-DEMO-2026'}
                                </div>
                            </div>
                        )}

                        {detailModal.kind === 'details' && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-slate-100 p-3">
                                        <span className="text-xs text-slate-500">Valor</span>
                                        <p className="font-bold text-slate-900 mt-1">{formatCurrency(detailModal.bill.amount)}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 p-3">
                                        <span className="text-xs text-slate-500">Status</span>
                                        <p className="font-bold text-slate-900 mt-1">{getBillComputedStatus(detailModal.bill)}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 p-3">
                                        <span className="text-xs text-slate-500">Auto-pay</span>
                                        <p className="font-bold text-slate-900 mt-1">{detailModal.bill.autopay ? 'Ativo' : 'Pausado'}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 p-3">
                                        <span className="text-xs text-slate-500">Lembrete</span>
                                        <p className="font-bold text-slate-900 mt-1">{detailModal.bill.reminder ? 'Ativo' : 'Desativado'}</p>
                                    </div>
                                </div>
                                {detailModal.bill.notes && (
                                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600">
                                        {detailModal.bill.notes}
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

export default Contas;

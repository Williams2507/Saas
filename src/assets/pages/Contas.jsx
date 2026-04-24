import React, { useState, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Layers, Globe, ChevronDown, Moon, LayoutGrid, Wallet,
    FileText, RotateCcw, HandCoins, TrendingUp, Target,
    BatteryMedium, Zap, Brain, Bell, History, User,
    Plus, Search, CalendarDays, CheckCircle2, Clock, AlertCircle,
    ChevronLeft, ChevronRight, Home, Wifi, Landmark, Barcode, Bot,
    MoreHorizontal, ShieldCheck // <-- ShieldCheck adicionado aqui!
} from 'lucide-react';

// --- DADOS CONGELADOS (Performance Máxima) ---
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

const CALENDAR_DAYS = Object.freeze([
    // previous month
    { day: 29, prev: true }, { day: 30, prev: true }, { day: 31, prev: true },
    // current month
    { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 },
    { day: 5, event: true, paid: true }, { day: 6 }, { day: 7 }, { day: 8 },
    { day: 9 }, { day: 10, event: true }, { day: 11 }, { day: 12 },
    { day: 13 }, { day: 14 }, { day: 15, active: true, event: true }, { day: 16 },
    { day: 17 }, { day: 18 }, { day: 19 }, { day: 20, event: true },
    { day: 21 }, { day: 22 }, { day: 23 }, { day: 24 },
    { day: 25 }, { day: 26 }, { day: 27 }, { day: 28 },
    { day: 29 }, { day: 30 },
    // next month
    { day: 1, next: true }, { day: 2, next: true }
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
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isActive ? 'bg-[#eff6ff] text-[#2563eb]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
            >
                <MenuIcon size={18} className={isActive ? 'text-[#2563eb]' : 'text-slate-400'} />
                {item.name}
            </button>
        </React.Fragment>
    );
});

const CalendarDay = memo(({ day, prev, next, active, event, paid }) => {
    const isMuted = prev || next;

    let baseClass = "relative aspect-square flex flex-col justify-center items-center rounded-lg text-sm font-medium cursor-pointer transition-all ";
    if (active) baseClass += "bg-blue-500 text-white shadow-md ";
    else if (isMuted) baseClass += "text-slate-300 hover:bg-slate-50 ";
    else baseClass += "text-slate-700 hover:bg-slate-100 ";

    return (
        <div className={baseClass}>
            {day}
            {event && (
                <span className={`absolute bottom-1 w-1 h-1 rounded-full ${paid ? 'bg-emerald-500' : (active ? 'bg-white' : 'bg-red-500')}`}></span>
            )}
        </div>
    );
});

const SummaryTile = memo(({ title, value, icon: Icon, colorClass, iconColorClass, iconBgClass, extraText, extraIcon: ExtraIcon, isAlert }) => {
    return (
        <div className={`rounded-2xl p-5 shadow-sm border ${isAlert ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-100'} flex flex-col group hover:shadow-md transition-shadow`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className={`text-sm font-medium ${isAlert ? 'text-red-600' : 'text-slate-500'}`}>{title}</h3>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBgClass} ${iconColorClass}`}>
                    <Icon size={16} />
                </div>
            </div>
            <span className={`text-2xl font-bold ${isAlert ? 'text-red-700' : 'text-slate-900'}`}>{value}</span>
            <div className={`mt-2 text-xs font-medium flex items-center gap-1 ${isAlert ? 'text-green-600' : 'text-slate-500'}`}>
                {ExtraIcon && <ExtraIcon size={12} className={iconColorClass} />}
                <span className={iconColorClass}>{extraText}</span>
            </div>
        </div>
    );
});

// --- COMPONENTE PRINCIPAL ---

const Contas = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

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

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                                <Bot size={16} /> Automações
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                                <Plus size={16} /> Nova Conta
                            </button>
                        </div>
                    </div>

                    {/* Financial Health Summary Tiles */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <SummaryTile title="Total a Pagar (Mês)" value="R$ 4.250,00" icon={CalendarDays} iconColorClass="text-slate-400" iconBgClass="bg-slate-50" extraText="12 contas registradas" />
                        <SummaryTile title="Já Pago" value="R$ 1.800,00" icon={CheckCircle2} iconColorClass="text-green-600" iconBgClass="bg-green-50" extraText="42% concluído" />
                        <SummaryTile title="Em Aberto" value="R$ 2.450,00" icon={Clock} iconColorClass="text-yellow-600" iconBgClass="bg-yellow-50" extraText="Próximo venc. em 3 dias" />
                        <SummaryTile title="Atrasados" value="R$ 0,00" icon={AlertCircle} iconColorClass="text-red-600" iconBgClass="bg-red-100" extraText="Tudo em dia! 🎉" isAlert={true} />
                    </div>

                    {/* Main Layout: Split View */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

                        {/* Left Column: Interactive Calendar */}
                        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-slate-900">Abril 2026</h3>
                                <div className="flex gap-2">
                                    <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-slate-400 font-medium text-center">
                                <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {CALENDAR_DAYS.map((d, i) => (
                                    <CalendarDay key={i} {...d} />
                                ))}
                            </div>

                            <div className="mt-8">
                                <h4 className="text-sm font-semibold text-slate-800 mb-3">Resumo do Dia (15 Abr)</h4>
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                            <Zap size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">Conta de Luz</p>
                                            <p className="text-xs text-slate-500">Vence hoje</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">R$ 185,40</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Detailed Agenda & Bill Management */}
                        <div className="lg:col-span-8 flex flex-col gap-6">

                            {/* Filters & Search */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex gap-2">
                                    <button className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-sm font-medium">Todos</button>
                                    <button className="px-4 py-1.5 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 text-sm font-medium border border-slate-200 transition-colors">Em Aberto</button>
                                    <button className="px-4 py-1.5 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 text-sm font-medium border border-slate-200 transition-colors">Pagos</button>
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" placeholder="Buscar boleto..." className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all" />
                                </div>
                            </div>

                            {/* Bill Cards List */}
                            <div className="flex flex-col gap-4">

                                {/* Card 1: Em Aberto (Hoje) */}
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100">
                                                <Zap size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-slate-900">Enel - Conta de Luz</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-yellow-100 text-yellow-700">
                                                        Vence Hoje
                                                    </span>
                                                    <span className="text-xs text-slate-500">Recorrente Mensal</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-bold text-slate-900">R$ 185,40</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Landmark size={12} /> Pagar com:
                                            </span>
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-100">
                                                <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-[8px]">NU</div>
                                                Nubank
                                                <ChevronDown size={12} className="text-slate-400 ml-1" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                                                <Barcode size={16} /> Copiar Código
                                            </button>
                                            <button className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                                                Marcar Pago
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2: Em Aberto (Futuro) */}
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                                <Home size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-slate-900">Aluguel - QuintoAndar</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                                                        Vence em 20 Abr
                                                    </span>
                                                    <span className="text-xs text-slate-500">Recorrente Mensal</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-bold text-slate-900">R$ 2.100,00</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Landmark size={12} /> Pagar com:
                                            </span>
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-100">
                                                <div className="w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-[8px]">IT</div>
                                                Itaú
                                                <ChevronDown size={12} className="text-slate-400 ml-1" />
                                            </div>
                                            <div className="text-[10px] text-[#2563eb] bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1 font-medium">
                                                <Bot size={12} /> Auto-pay ativo
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3: Pago */}
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 opacity-80 hover:opacity-100 transition-all hover:shadow-md">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                                                <Wifi size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-slate-500 line-through">Claro Internet</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-green-100 text-green-700">
                                                        <CheckCircle2 size={10} /> Pago em 05 Abr
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-bold text-slate-500">R$ 120,00</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500 font-medium">Pago via Nubank</span>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                                                Ver Comprovante
                                            </button>
                                        </div>
                                    </div>
                                </div>

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
        </div>
    );
};

export default Contas;
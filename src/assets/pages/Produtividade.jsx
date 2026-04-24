import React, { useMemo, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Layers, Globe, ChevronDown, Moon, LayoutGrid, Wallet,
    FileText, RotateCcw, HandCoins, TrendingUp, Target,
    BatteryMedium, Zap, Brain, Bell, History, User,
    Plus, Clock, Ellipsis, Calendar, Scale, CalendarCheck, ShieldCheck
} from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, LabelList } from 'recharts';
// --- DADOS CONGELADOS (Performance Máxima) ---
const MATRIX_DATA = Object.freeze([
    { name: 'Orçamento', x: 2, y: 8, fill: '#10b981' },
    { name: 'Novo Carro', x: 8, y: 9, fill: '#f43f5e' },
    { name: 'Boletos', x: 5, y: 4, fill: '#3b82f6' },
    { name: 'Organizar Docs', x: 9, y: 2, fill: '#f59e0b' },
    { name: 'Cancelar Assin.', x: 3, y: 3, fill: '#64748b' }
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
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
            >
                <MenuIcon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                {item.name}
            </button>
        </React.Fragment>
    );
});

const TaskCard = memo(({ badgeText, badgeClass, title, description, timeText, hasUser, dateText, opacityClass = "" }) => (
    <div className={`p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer ${opacityClass}`}>
        {badgeText && (
            <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${badgeClass}`}>
                    {badgeText}
                </span>
                <button className="text-slate-400 hover:text-slate-600"><Ellipsis size={16} /></button>
            </div>
        )}
        {!badgeText && (
            <h4 className="text-sm font-semibold text-slate-900 mb-1 mt-1">{title}</h4>
        )}
        {badgeText && (
            <h4 className="text-sm font-semibold text-slate-900 mb-1">{title}</h4>
        )}
        {description && <p className="text-xs text-slate-500 mb-3">{description}</p>}

        {(timeText || dateText) && (
            <div className={`flex justify-between items-center text-xs text-slate-500 ${!description && 'mt-3'}`}>
                {timeText && <span className="flex items-center gap-1"><Clock size={12} /> {timeText}</span>}
                {dateText && <span className="flex items-center gap-1"><Calendar size={12} /> {dateText}</span>}
                {hasUser && <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" alt="User" className="w-6 h-6 rounded-full" />}
            </div>
        )}
    </div>
));

// Tooltip Personalizada para o Gráfico de Dispersão
const MatrixTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-xl">
                <p className="font-semibold text-slate-900 mb-1">{data.name}</p>
                <p className="text-xs text-slate-600">Esforço: <span className="font-medium">{data.x}</span></p>
                <p className="text-xs text-slate-600">Impacto: <span className="font-medium">{data.y}</span></p>
            </div>
        );
    }
    return null;
};

// --- COMPONENTE PRINCIPAL ---

const Produtividade = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Gráfico da Matriz Memoizado (Sem Lag)
    // Gráfico da Matriz Memoizado (Sem Lag)
    // Gráfico da Matriz Memoizado com Títulos nas Bolinhas
    const MatrixChart = useMemo(() => (
        <div className="relative w-full h-[300px]">
            {/* Legendas dos Quadrantes (Centralizadas) */}
            <div className="absolute top-[25%] left-[30%] -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold text-emerald-500/50 pointer-events-none">Vitórias Rápidas</div>
            <div className="absolute top-[25%] left-[80%] -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold text-blue-500/50 pointer-events-none">Projetos Maiores</div>
            <div className="absolute top-[75%] left-[30%] -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400/50 pointer-events-none">Preenchimento</div>
            <div className="absolute top-[75%] left-[80%] -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold text-rose-500/50 pointer-events-none">Tarefas Ingratas</div>

            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f1f5f9" />

                    <XAxis type="number" dataKey="x" name="Esforço" domain={[0, 10]} tickCount={6} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                    <YAxis type="number" dataKey="y" name="Impacto" domain={[0, 10]} tickCount={6} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />

                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<MatrixTooltip />} />

                    <ReferenceLine x={5} stroke="#cbd5e1" strokeDasharray="3 3" />
                    <ReferenceLine y={5} stroke="#cbd5e1" strokeDasharray="3 3" />

                    <Scatter name="Tarefas" data={MATRIX_DATA} isAnimationActive={false}>
                        {MATRIX_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        {/* O "Titulozinho" em cada bolinha */}
                        <LabelList
                            dataKey="name"
                            position="top"
                            offset={8}
                            style={{ fill: '#475569', fontSize: '10px', fontWeight: '600', pointerEvents: 'none' }}
                        />
                    </Scatter>
                </ScatterChart>
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
                    <span className="font-bold text-xl tracking-tight text-slate-900">LifeOS</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-600 cursor-pointer shadow-sm">
                        <Globe size={14} className="text-slate-400" />
                        <span>PT-BR</span>
                        <ChevronDown size={12} className="text-slate-400 ml-1" />
                    </div>
                    <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                        <Moon size={18} />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 w-full max-w-[1440px] mx-auto px-4 lg:px-8 pb-8 gap-6">

                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-6">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/50 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
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
                            <h1 className="text-2xl font-bold text-slate-900">Produtividade & Decisões</h1>
                            <p className="text-sm text-slate-500 mt-1">Matriz de prioridades, registro de decisões e modos de foco.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
                                <Clock size={16} /> Foco Mode
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                                <Plus size={16} /> Nova Tarefa
                            </button>
                        </div>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">

                        {/* Esquerda (Matriz & Kanban) */}
                        <div className="xl:col-span-8 flex flex-col gap-6">

                            {/* Matriz Impacto x Esforço */}
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-slate-900">Matriz Impacto x Esforço</h3>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100">Projetos</span>
                                        <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200">Tarefas</span>
                                    </div>
                                </div>

                                {MatrixChart}

                            </div>

                            {/* Fila de Tarefas (Kanban) */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-slate-900">Fila de Tarefas</h3>
                                    <button className="text-sm text-blue-600 font-medium hover:text-blue-700">Ver todas</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Coluna 1: Fazer Hoje */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-slate-700 px-3 py-1 bg-slate-100 rounded-full">Fazer Hoje</span>
                                            <span className="text-xs text-slate-500">2</span>
                                        </div>
                                        <TaskCard
                                            badgeText="Alto Impacto" badgeClass="bg-red-50 text-red-600 border-red-100"
                                            title="Revisar Orçamento Mensal" description="Ajustar categorias baseado nos gastos de Jan."
                                            timeText="45 min" hasUser={true}
                                        />
                                        <TaskCard
                                            badgeText="Rotina" badgeClass="bg-blue-50 text-blue-600 border-blue-100"
                                            title="Pagar Boletos Pendentes"
                                            timeText="15 min"
                                        />
                                    </div>

                                    {/* Coluna 2: Esta Semana */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-slate-700 px-3 py-1 bg-slate-100 rounded-full">Esta Semana</span>
                                            <span className="text-xs text-slate-500">1</span>
                                        </div>
                                        <TaskCard
                                            badgeText="Decisão" badgeClass="bg-orange-50 text-orange-600 border-orange-100"
                                            title="Escolher novo plano de saúde" description="Comparar opções A, B e C."
                                            dateText="Até Sex"
                                        />
                                    </div>

                                    {/* Coluna 3: Em Espera */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-slate-700 px-3 py-1 bg-slate-100 rounded-full">Em Espera</span>
                                            <span className="text-xs text-slate-500">1</span>
                                        </div>
                                        <TaskCard
                                            title="Renovação Seguro Carro" description="Aguardando cotação da corretora."
                                            opacityClass="opacity-75 bg-slate-50"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Direita (Decisões & Analytics) */}
                        <div className="xl:col-span-4 flex flex-col gap-6">

                            {/* Registro de Decisões */}
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900">Registro de Decisões</h3>
                                    <button className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100">
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm font-bold text-slate-900">Trocar de Carro vs. Investir</h4>
                                            <span className="px-2 py-0.5 rounded bg-yellow-50 text-yellow-700 text-[10px] font-bold border border-yellow-200">Alto Risco</span>
                                        </div>

                                        <div className="flex gap-2 mb-3">
                                            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-100">Prós: Conforto</span>
                                            <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-100">Contras: Custo Op.</span>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>Custo/Benefício</span>
                                                <span className="font-medium">65%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                <div className="bg-gradient-to-r from-yellow-400 to-green-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Alinhamento de Energia */}
                            <div className="bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-800 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

                                <h3 className="text-lg font-semibold text-white mb-4">Alinhamento de Energia</h3>

                                <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700 mb-4 relative z-10">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl">
                                        <BatteryMedium size={24} />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-slate-300 block">Sua energia agora:</span>
                                        <span className="text-lg font-bold text-white">Média-Alta</span>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-400 mb-4 relative z-10">Ideal para tarefas de:</p>
                                <div className="flex flex-wrap gap-2 relative z-10">
                                    <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">Planejamento</span>
                                    <span className="px-3 py-1.5 rounded-lg bg-blue-600 border border-blue-500 text-xs text-white shadow-lg shadow-blue-500/30">Foco Profundo</span>
                                </div>
                            </div>

                            {/* Revisão Semanal CTA */}
                            <div className="bg-blue-50 rounded-[24px] p-6 shadow-sm border border-blue-100 flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center text-xl mb-3 shadow-sm border border-blue-50">
                                    <CalendarCheck size={20} />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900 mb-1">Revisão Semanal</h3>
                                <p className="text-xs text-slate-600 mb-4">Avalie suas decisões e planeje a próxima semana.</p>
                                <button className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                                    Iniciar Revisão
                                </button>
                            </div>

                        </div>
                    </div>

                </main>
            </div>

            {/* Footer */}
            <footer className="w-full py-6 px-6 border-t border-slate-200 bg-white mt-auto z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>
                        Ao continuar, você concorda com nossos <a href="#" className="text-blue-600 hover:underline">Termos de Serviço</a> e <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 font-medium"><ShieldCheck size={14} className="text-emerald-600" /> Privacidade Garantida</span>
                        <a href="#" className="hover:text-slate-800 transition-colors">Suporte</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Produtividade;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  Mail,
  Lock,
  User,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const AuthPage = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  // modos: login | register | forgot | updatePassword

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot';
  const isUpdatePassword = mode === 'updatePassword';

  const getAuthRedirectUrl = () => {
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${appUrl}/login?mode=update-password`;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.replace(/^#/, '')
    );

    const urlMode = params.get('mode');

    const hashError = hashParams.get('error');
    const hashErrorCode = hashParams.get('error_code');
    const hashErrorDescription = hashParams.get('error_description');

    if (hashError || hashErrorCode || hashErrorDescription) {
      if (
        hashErrorCode === 'otp_expired' ||
        String(hashErrorDescription || '').toLowerCase().includes('expired') ||
        String(hashErrorDescription || '').toLowerCase().includes('invalid')
      ) {
        setMode('forgot');
        setError(
          'Esse link de recuperação expirou ou já foi usado. Solicite um novo link para redefinir sua senha.'
        );
      } else {
        setError('Não foi possível validar o link. Solicite um novo link.');
      }

      window.history.replaceState({}, document.title, '/login');
      return;
    }

    if (urlMode === 'update-password') {
      setMode('updatePassword');
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('updatePassword');
        setError('');
        setSuccess('');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (resetCooldown <= 0) return;

    const timer = setInterval(() => {
      setResetCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resetCooldown]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const normalizeEmail = (email) => {
    return email.trim().toLowerCase();
  };

  const isValidEmail = (email) => {
    const cleanEmail = normalizeEmail(email);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
  };

  const getPasswordStrengthMessage = (password) => {
    if (!password) return 'Digite uma senha.';

    if (password.length < 6) {
      return 'A senha precisa ter pelo menos 6 caracteres.';
    }

    return '';
  };

  const getFriendlyError = (err) => {
    const message = err?.message || '';
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('rate limit') ||
      lowerMessage.includes('email rate limit exceeded')
    ) {
      return 'Limite de envio de e-mail atingido. Aguarde alguns minutos e tente novamente.';
    }

    if (
      message === 'Invalid login credentials' ||
      lowerMessage.includes('invalid login credentials')
    ) {
      return 'E-mail ou senha incorretos.';
    }

    if (
      lowerMessage.includes('user already registered') ||
      lowerMessage.includes('already registered') ||
      lowerMessage.includes('already exists') ||
      lowerMessage.includes('duplicate')
    ) {
      return 'Este e-mail já está cadastrado. Tente fazer login ou recuperar a senha.';
    }

    if (
      lowerMessage.includes('otp') ||
      lowerMessage.includes('expired') ||
      lowerMessage.includes('invalid token') ||
      lowerMessage.includes('email link is invalid')
    ) {
      return 'Esse link de recuperação expirou ou já foi usado. Solicite um novo link.';
    }

    if (
      lowerMessage.includes('password should be at least') ||
      lowerMessage.includes('password')
    ) {
      return 'A senha precisa ter pelo menos 6 caracteres.';
    }

    if (lowerMessage.includes('email')) {
      return 'Verifique se o e-mail está correto.';
    }

    return message || 'Ocorreu um erro. Tente novamente.';
  };

  const changeMode = (newMode) => {
    clearMessages();
    setMode(newMode);

    setFormData((prev) => ({
      ...prev,
      password: '',
      confirmPassword: ''
    }));
  };

  const validateLoginForm = () => {
    const email = normalizeEmail(formData.email);

    if (!email) {
      return 'Digite seu e-mail.';
    }

    if (!isValidEmail(email)) {
      return 'Digite um e-mail válido.';
    }

    if (!formData.password) {
      return 'Digite sua senha.';
    }

    return '';
  };

  const validateRegisterForm = () => {
    const name = formData.name.trim();
    const email = normalizeEmail(formData.email);

    if (!name) {
      return 'Digite seu nome.';
    }

    if (name.length < 2) {
      return 'Digite um nome válido.';
    }

    if (!email) {
      return 'Digite seu e-mail.';
    }

    if (!isValidEmail(email)) {
      return 'Digite um e-mail válido.';
    }

    const passwordError = getPasswordStrengthMessage(formData.password);

    if (passwordError) {
      return passwordError;
    }

    if (!formData.confirmPassword) {
      return 'Confirme sua senha.';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'As senhas não coincidem.';
    }

    return '';
  };

  const validateForgotForm = () => {
    const email = normalizeEmail(formData.email);

    if (!email) {
      return 'Digite seu e-mail para recuperar a senha.';
    }

    if (!isValidEmail(email)) {
      return 'Digite um e-mail válido.';
    }

    if (resetCooldown > 0) {
      return `Aguarde ${resetCooldown}s antes de tentar novamente.`;
    }

    return '';
  };

  const validateUpdatePasswordForm = () => {
    const passwordError = getPasswordStrengthMessage(formData.password);

    if (passwordError) {
      return passwordError;
    }

    if (!formData.confirmPassword) {
      return 'Confirme sua nova senha.';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'As senhas não coincidem.';
    }

    return '';
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    clearMessages();

    if (loading) return;

    const email = normalizeEmail(formData.email);

    const validationError = isLogin
      ? validateLoginForm()
      : validateRegisterForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password: formData.password
        });

        if (loginError) throw loginError;

        navigate('/dashboard');
        return;
      }

      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name.trim()
            }
          }
        });

        if (signUpError) throw signUpError;

        const identities = data?.user?.identities;

        if (Array.isArray(identities) && identities.length === 0) {
          throw new Error(
            'Este e-mail já está cadastrado. Tente fazer login ou recuperar a senha.'
          );
        }

        setSuccess('Conta criada com sucesso! Agora você já pode entrar.');
        setMode('login');

        setFormData({
          name: '',
          email,
          password: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (loading) return;

    const validationError = validateForgotForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const email = normalizeEmail(formData.email);

    setLoading(true);

    try {
      const redirectUrl = getAuthRedirectUrl();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: redirectUrl
        }
      );

      if (resetError) throw resetError;

      setSuccess(
        'Se esse e-mail estiver cadastrado, você receberá um link de recuperação.'
      );
      setResetCooldown(60);
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (loading) return;

    const validationError = validateUpdatePasswordForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (updateError) throw updateError;

      setSuccess('Senha alterada com sucesso! Agora você já pode entrar.');

      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        setMode('login');
        navigate('/login');
      }, 1200);
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    bgGradient:
      'radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 50%, #f1f5f9 100%)',
    card: 'bg-white border-slate-100',
    textMain: 'text-slate-900',
    textMuted: 'text-slate-500',
    input:
      'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400',
    smallCard: 'bg-slate-50 border-slate-100'
  };

  const getTitle = () => {
    if (isLogin) return 'Bem-vindo';
    if (isRegister) return 'Criar conta';
    if (isForgot) return 'Recuperar senha';
    if (isUpdatePassword) return 'Nova senha';
    return 'LifeOS';
  };

  const getSubtitle = () => {
    if (isLogin) return 'Acesse o seu ecossistema LifeOS';
    if (isRegister) return 'Junte-se a nós e organize sua vida';
    if (isForgot) return 'Informe seu e-mail para receber o link de recuperação';
    if (isUpdatePassword) return 'Digite uma nova senha para sua conta';
    return '';
  };

  const getSubmitLabel = () => {
    if (isLogin) return 'Entrar';
    if (isRegister) return 'Confirmar cadastro';
    return 'Continuar';
  };

  return (
    <div
      className={`antialiased min-h-screen flex flex-col transition-colors duration-300 ${theme.textMain}`}
      style={{ background: theme.bgGradient }}
    >
      <header className="w-full flex items-center px-6 py-4 lg:px-12 z-10 relative">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Layers size={18} />
          </div>

          <span className="font-bold text-xl tracking-tight text-slate-900">
            LifeOS
          </span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-8 relative z-10">
        <div
          className={`w-full max-w-[430px] rounded-[32px] shadow-2xl border p-8 lg:p-10 transition-all ${theme.card}`}
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
              {isForgot || isUpdatePassword ? (
                <KeyRound size={28} />
              ) : (
                <Layers size={28} />
              )}
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {getTitle()}
            </h1>

            <p className={`text-sm leading-relaxed ${theme.textMuted}`}>
              {getSubtitle()}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 text-center">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 text-center">
              <CheckCircle2 size={16} />
              {success}
            </div>
          )}

          {(isLogin || isRegister) && (
            <form onSubmit={handleAuth} className="space-y-4">
              {isRegister && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold ml-1 opacity-70">
                    Nome
                  </label>

                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />

                    <input
                      type="text"
                      required
                      minLength={2}
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm ${theme.input}`}
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold ml-1 opacity-70">
                  E-mail
                </label>

                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    onBlur={(e) =>
                      setFormData({
                        ...formData,
                        email: normalizeEmail(e.target.value)
                      })
                    }
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm ${theme.input}`}
                    placeholder="exemplo@email.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-semibold opacity-70">
                    Senha
                  </label>

                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => changeMode('forgot')}
                      disabled={loading}
                      className="text-[10px] text-blue-500 font-bold hover:underline disabled:opacity-50"
                    >
                      Esqueceu?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm ${theme.input}`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {isRegister && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold ml-1 opacity-70">
                    Confirmar senha
                  </label>

                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />

                    <input
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value
                        })
                      }
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm ${theme.input}`}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {isRegister && (
                <div className={`p-4 rounded-2xl border ${theme.smallCard}`}>
                  <p className={`text-xs leading-relaxed ${theme.textMuted}`}>
                    Ao cadastrar, usaremos seu e-mail como identificador único da conta.
                    Se ele já existir, você deverá fazer login ou recuperar a senha.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {getSubmitLabel()}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {isForgot && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className={`p-4 rounded-2xl border ${theme.smallCard}`}>
                <p className={`text-xs leading-relaxed ${theme.textMuted}`}>
                  Digite o e-mail da sua conta. Se ele estiver cadastrado, você receberá
                  um link para criar uma nova senha.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold ml-1 opacity-70">
                  E-mail
                </label>

                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    onBlur={(e) =>
                      setFormData({
                        ...formData,
                        email: normalizeEmail(e.target.value)
                      })
                    }
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm ${theme.input}`}
                    placeholder="exemplo@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || resetCooldown > 0}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {resetCooldown > 0
                      ? `Aguarde ${resetCooldown}s`
                      : 'Enviar link'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => changeMode('login')}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${theme.textMuted} hover:text-blue-500 disabled:opacity-50`}
              >
                <ArrowLeft size={17} />
                Voltar para login
              </button>
            </form>
          )}

          {isUpdatePassword && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className={`p-4 rounded-2xl border ${theme.smallCard}`}>
                <p className={`text-xs leading-relaxed ${theme.textMuted}`}>
                  Crie uma nova senha segura para continuar acessando sua conta.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold ml-1 opacity-70">
                  Nova senha
                </label>

                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm ${theme.input}`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold ml-1 opacity-70">
                  Confirmar nova senha
                </label>

                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value
                      })
                    }
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm ${theme.input}`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Alterar senha
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => changeMode('login')}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${theme.textMuted} hover:text-blue-500 disabled:opacity-50`}
              >
                <ArrowLeft size={17} />
                Voltar para login
              </button>
            </form>
          )}

          {(isLogin || isRegister) && (
            <p className="text-center mt-8 text-sm">
              <span className={theme.textMuted}>
                {isLogin ? 'Novo por aqui?' : 'Já tem conta?'}
              </span>{' '}

              <button
                type="button"
                onClick={() => changeMode(isLogin ? 'register' : 'login')}
                disabled={loading}
                className="text-blue-600 font-bold hover:underline disabled:opacity-50"
              >
                {isLogin ? 'Cadastre-se' : 'Faça login'}
              </button>
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
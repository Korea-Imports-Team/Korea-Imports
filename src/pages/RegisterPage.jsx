import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPage.module.css';

function validatePassword(password) {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

export default function RegisterPage() {
  const { loginWithGoogle, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validatePassword(form.password);
    const isValid = Object.values(validation).every(Boolean);
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      await registerWithEmail(form.email, form.password);
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Erro ao entrar com Google. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const validation = validatePassword(form.password);
  const isPasswordValid = Object.values(validation).every(Boolean);
  const showValidation = form.password.length > 0;

  const rules = [
    { key: 'minLength', label: 'Mínimo 8 caracteres' },
    { key: 'hasUpper', label: 'Uma letra maiúscula' },
    { key: 'hasLower', label: 'Uma letra minúscula' },
    { key: 'hasSpecial', label: 'Um caractere especial (!@#$...)' },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.card}>

        <Link to="/" className={styles.logo}>
          <img src="/src/assets/logo.png" alt="Korea Imports" className={styles.logoImg} />
          <span className={styles.logoName}>Korea Imports</span>
        </Link>

        <h1 className={styles.title}>Crie sua conta</h1>
        <p className={styles.subtitle}>Cadastre-se e ganhe 10% de desconto na primeira compra</p>

        <button className={styles.googleBtn} onClick={handleGoogle} disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar com Google
        </button>

        <div className={styles.divider}>
          <span>ou cadastre-se com e-mail</span>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Nome completo</label>
            <div className={styles.inputWrapper}>
              <User size={16} className={styles.inputIcon} />
              <input
                type="text"
                name="name"
                placeholder="Seu nome"
                value={form.name}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>E-mail</label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={handleChange}
                className={`${styles.input} ${showValidation ? isPasswordValid ? styles.inputValid : styles.inputInvalid : ''}`}
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {showValidation && (
              <div className={styles.passwordRules}>
                {isPasswordValid ? (
                  <p className={styles.passwordValid}>
                    <Check size={14} /> Senha válida!
                  </p>
                ) : (
                  <ul className={styles.rulesList}>
                    {rules.map((rule) => (
                      <li key={rule.key} className={`${styles.rule} ${validation[rule.key] ? styles.rulePassed : styles.ruleFailed}`}>
                        {validation[rule.key] ? <Check size={12} /> : <X size={12} />}
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <p className={styles.terms}>
            Ao se cadastrar, você concorda com nossos{' '}
            <Link to="/termos" className={styles.switchLink}>Termos de Uso</Link>{' '}
            e{' '}
            <Link to="/privacidade" className={styles.switchLink}>Política de Privacidade</Link>.
          </p>

          <button type="submit" className={styles.submitBtn} disabled={loading || (showValidation && !isPasswordValid)}>
            {loading ? 'Criando conta...' : 'Criar conta grátis'}
          </button>
        </form>

        <p className={styles.switchText}>
          Já tem uma conta?{' '}
          <Link to="/entrar" className={styles.switchLink}>Entrar</Link>
        </p>

      </div>
    </main>
  );
}
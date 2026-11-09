import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isEmail, isPhone, normPhone } from '../utils/format';
import usePageTitle from '../hooks/usePageTitle';

export default function Login() {
  usePageTitle('Login / Register');
  const { user, ready, login, register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || '/account';

  const [mode, setMode] = useState(loc.state?.mode === 'register' ? 'register' : 'login');
  const [f, setF] = useState({ name: '', email: '', phone: '', identifier: '', password: '' });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (ready && user) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (mode === 'register') {
      if (f.name.trim().length < 2) return setErr('Please enter your full name.');
      if (!isEmail(f.email)) return setErr('Please enter a valid email address.');
      if (!isPhone(f.phone)) return setErr('Enter a valid mobile number like 03XX XXXXXXX.');
      if (f.password.length < 8) return setErr('Password must be at least 8 characters.');
    }
    setBusy(true);
    try {
      const u = mode === 'login'
        ? await login(f.identifier, f.password)
        : await register({ name: f.name, email: f.email, phone: normPhone(f.phone), password: f.password });
      toast.success(mode === 'login' ? `Welcome back, ${u.name.split(' ')[0]}!` : 'Account created — welcome to T-Safe!');
      nav(from, { replace: true });
    } catch (e2) {
      setErr(e2.message);
    } finally { setBusy(false); }
  };

  return (
    <section className="page wrap auth-page">
      <div className="auth-card card">
        <div className="auth-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setErr(''); }}>Login</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'on' : ''} onClick={() => { setMode('register'); setErr(''); }}>Create account</button>
        </div>

        <h1 className="h-md">{mode === 'login' ? <>Welcome <mark>back</mark></> : <>Join <mark>T-Safe</mark></>}</h1>
        <p className="muted">{mode === 'login' ? 'Log in to see your orders and check out faster.' : 'Save your details, track every order and write reviews.'}</p>

        <form onSubmit={submit} noValidate>
          {mode === 'register' && (
            <>
              <label className="field"><span>Full name</span><input value={f.name} onChange={set('name')} autoComplete="name" required /></label>
              <label className="field"><span>Email</span><input type="email" value={f.email} onChange={set('email')} autoComplete="email" required /></label>
              <label className="field"><span>Mobile number</span><input type="tel" placeholder="03XX XXXXXXX" value={f.phone} onChange={set('phone')} autoComplete="tel" required /></label>
            </>
          )}
          {mode === 'login' && (
            <label className="field"><span>Email or mobile number</span><input value={f.identifier} onChange={set('identifier')} autoComplete="username" required /></label>
          )}
          <label className="field">
            <span>Password {mode === 'register' && <small>(min. 8 characters)</small>}</span>
            <div className="pw">
              <input type={show ? 'text' : 'password'} value={f.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
              <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}><Icon name="eye" /></button>
            </div>
          </label>

          {err && <p className="form-err" role="alert"><Icon name="x" /> {err}</p>}

          <button className="btn btn-blue btn-block" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? <>Log in <Icon name="lock" /></> : <>Create account <Icon name="check" /></>}
          </button>
        </form>
      </div>
    </section>
  );
}

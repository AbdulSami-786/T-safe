import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

const Ctx = createContext(null);
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const id = useRef(0);

  const dismiss = useCallback((i) => setToasts((t) => t.filter((x) => x.id !== i)), []);
  const push = useCallback((msg, opts = {}) => {
    const i = ++id.current;
    setToasts((t) => [...t.slice(-2), { id: i, msg, kind: opts.kind || 'ok', action: opts.action }]);
    setTimeout(() => dismiss(i), opts.ms || 4200);
  }, [dismiss]);

  const api = {
    success: (m, o) => push(m, { ...o, kind: 'ok' }),
    error: (m, o) => push(m, { ...o, kind: 'err', ms: 6000 }),
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={'toast ' + t.kind}>
            <Icon name={t.kind === 'err' ? 'x' : 'check'} />
            <span>{t.msg}</span>
            {t.action && <Link to={t.action.to} onClick={() => dismiss(t.id)}>{t.action.label}</Link>}
            <button type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)}><Icon name="x" /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

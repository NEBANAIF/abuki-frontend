import { useState, useEffect } from 'react';
import Login        from './pages/Login';
import Layout       from './components/Layout';
import Dashboard    from './pages/Dashboard';
import Products     from './pages/Products';
import Sales        from './pages/Sales';
import Finance      from './pages/Finance';
import Analytics    from './pages/Analytics';
import StockHistory from './pages/StockHistory';
import UserAccess   from './pages/UserAccess';
import { getMe }   from './services/api';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('abuki_user');
      const token  = localStorage.getItem('abuki_token');
      return stored && token ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const [current, setCurrent] = useState('dashboard');

  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('abuki_theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('abuki_theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  useEffect(() => {
    const token = localStorage.getItem('abuki_token');
    if (!token) return;
    getMe()
      .then(u => {
        const next = { id: u.id, name: u.name, email: u.email, role: u.role };
        setUser(next);
        localStorage.setItem('abuki_user', JSON.stringify(next));
      })
      .catch(() => {
        localStorage.removeItem('abuki_token');
        localStorage.removeItem('abuki_user');
        setUser(null);
      });
  }, []);

  function handleLogin(data) {
    setUser({ id: data.id, name: data.name, email: data.email, role: data.role });
  }

  function handleLogout() {
    localStorage.removeItem('abuki_token');
    localStorage.removeItem('abuki_user');
    setUser(null);
    setCurrent('dashboard');
    window.location.href = '/';
  }

  if (!user) return <Login onLogin={handleLogin} />;

  const pages = {
    dashboard: <Dashboard dark={dark} />,
    products:  <Products  dark={dark} />,
    sales:     <Sales     dark={dark} />,
    finance:   <Finance   dark={dark} />,
    analytics: <Analytics dark={dark} />,
    stock:     <StockHistory dark={dark} />,
    users:     <UserAccess dark={dark} />,
  };

  return (
    <Layout
      current={current}
      setCurrent={setCurrent}
      user={user}
      onLogout={handleLogout}
      dark={dark}
      onDarkToggle={() => setDark(d => !d)}
    >
      {pages[current] || <Dashboard dark={dark} />}
    </Layout>
  );
}

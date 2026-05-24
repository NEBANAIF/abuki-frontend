import { useEffect } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, DollarSign,
  TrendingUp, Clock, Users, LogOut, ChevronRight, Moon, Sun, Languages,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NAV = [
  { key: 'dashboard', i18n: 'nav.dashboard', icon: LayoutDashboard },
  { key: 'products',  i18n: 'nav.products',  icon: Package },
  { key: 'sales',     i18n: 'nav.sales',     icon: ShoppingCart },
  { key: 'finance',   i18n: 'nav.finance',   icon: DollarSign },
  { key: 'analytics', i18n: 'nav.analytics', icon: TrendingUp },
  { key: 'stock',     i18n: 'nav.stock',     icon: Clock },
  { key: 'users',     i18n: 'nav.users',     icon: Users },
];

export default function Sidebar({ current, setCurrent, user, onLogout, dark, onDarkToggle, open }) {
  const { t, i18n } = useTranslation();

  function toggleLang() {
    const next = i18n.language === 'am' ? 'en' : 'am';
    void i18n.changeLanguage(next);
    try { localStorage.setItem('abuki_lang', next); } catch {}
  }

  const roleKey  = user?.role?.toUpperCase() || 'VIEWER';
  const headerBg = dark ? '#090D14' : '#0F1F04';

  return (
    <aside className={`abk-sidebar${dark ? ' abk-dark' : ''}${open ? ' open' : ''}`}>

      {/* ── Brand header ── */}
      <div style={{
        padding: '18px 16px 14px',
        borderBottom: '1px solid var(--abk-border)',
        position: 'relative', zIndex: 1,
        background: headerBg,
        transition: 'background .3s',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: dark ? 'rgba(88,166,255,.12)' : 'rgba(255,255,255,.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: dark ? '1px solid rgba(61,214,140,.25)' : '1px solid rgba(255,255,255,.12)',
          }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              color: dark ? '#58A6FF' : '#F0F7E2',
              fontWeight: 600, fontSize: 16, fontStyle: 'italic',
            }}>S</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 15, fontWeight: 500,
              color: dark ? '#E6EDF3' : '#F0F7E2',
              letterSpacing: -0.3, lineHeight: 1.2,
            }}>My stock</div>
            <div style={{
              fontSize: 10, fontWeight: 300, marginTop: 1,
              color: dark ? '#5A7A96' : '#A8C080',
            }}>
              {i18n.language === 'am' ? 'የችርቻሮ ሥርዓት' : 'Retail operations'}
            </div>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={onDarkToggle}
            style={{
              width: 28, height: 28, borderRadius: 7, border: 'none',
              background: dark ? 'rgba(88,166,255,.12)' : 'rgba(255,255,255,.08)',
              color: dark ? '#58A6FF' : '#A8C080',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
              transition: 'background .2s',
            }}
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>

        {/* Live status */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 10.5, fontWeight: 500, padding: '4px 10px', borderRadius: 20,
          background: dark ? 'rgba(61,214,140,.08)' : 'rgba(255,255,255,.07)',
          color: dark ? '#3DD68C' : '#A8C080',
          border: dark ? '1px solid rgba(61,214,140,.2)' : '1px solid rgba(255,255,255,.1)',
        }}>
          <span className="abk-pulse" style={{
            width: 6, height: 6, borderRadius: '50%',
            background: dark ? '#3DD68C' : '#2EC68F',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 10, letterSpacing: '0.06em' }}>
            {t('dashboard.live')}
          </span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{
        flex: 1, padding: '10px', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 2,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--abk-ink-faint)',
          padding: '6px 12px 4px', marginBottom: 2,
        }}>
          {i18n.language === 'am' ? 'ዋና ምናሌ' : 'Main Menu'}
        </div>

        {NAV.map(({ key, i18n: ns, icon: Icon }, idx) => {
          const active = current === key;
          return (
            <button
              key={key}
              className={`abk-nav-btn abk-anim-slide-in${active ? ' active' : ''}`}
              style={{ animationDelay: `${0.06 + idx * 0.05}s` }}
              onClick={() => setCurrent(key)}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active
                  ? (dark ? 'rgba(61,214,140,.12)' : 'rgba(29,158,117,.12)')
                  : 'transparent',
                transition: 'background .2s',
              }}>
                <Icon size={15} color={active ? (dark ? '#3DD68C' : '#1D9E75') : 'var(--abk-nav-idle-fg)'} />
              </div>
              <span style={{ flex: 1 }}>{t(ns)}</span>
              {active && <ChevronRight size={13} style={{ opacity: .5, color: 'var(--abk-nav-active-fg)' }} />}
            </button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div style={{
        padding: '10px 10px 14px',
        borderTop: '1px solid var(--abk-border)',
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', gap: 4,
        flexShrink: 0,
      }}>
        <button className="abk-util-btn" onClick={toggleLang}>
          <Languages size={14} color="var(--abk-ink-faint)" />
          <span>{i18n.language === 'am' ? t('ui.english') : t('ui.amharic')}</span>
        </button>

        {/* User card */}
        <div style={{
          background: 'var(--abk-cream-deep)',
          border: '1px solid var(--abk-border)',
          borderRadius: 10, padding: '9px 11px',
          display: 'flex', alignItems: 'center', gap: 9,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--abk-ticker-bg)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: dark ? '1px solid rgba(61,214,140,.2)' : 'none',
          }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              color: 'var(--abk-ticker-fg)',
              fontWeight: 600, fontSize: 13, fontStyle: 'italic',
            }}>
              {(user?.name || 'A')[0].toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12.5, fontWeight: 500, color: 'var(--abk-ink)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{user?.name || 'Admin'}</div>
            <div style={{
              fontSize: 10, color: 'var(--abk-ink-faint)', fontWeight: 300,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{user?.email}</div>
            <span className={`abk-role-${roleKey}`} style={{
              display: 'inline-block', fontSize: 9.5, fontWeight: 600,
              letterSpacing: '0.06em', padding: '1px 7px', borderRadius: 20,
              textTransform: 'uppercase', marginTop: 2,
            }}>{user?.role}</span>
          </div>
        </div>

        <div className="abk-divider" />

        <button className="abk-util-btn danger" onClick={() => onLogout?.()}>
          <LogOut size={14} />
          <span>{t('ui.signOut')}</span>
        </button>

        <div style={{
          fontSize: 9.5, color: 'var(--abk-ink-faint)', fontWeight: 300,
          textAlign: 'center', paddingTop: 4, letterSpacing: '0.04em',
        }}>
          {t('settings.version')}
        </div>
      </div>
    </aside>
  );
}

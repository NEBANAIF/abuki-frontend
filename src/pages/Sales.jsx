import { useState, useEffect, useRef } from 'react';
import {
  Search, Plus, Trash2, DollarSign, ShoppingCart,
  TrendingUp, ChevronLeft, ChevronRight, X, RefreshCw,
  XCircle, Calendar, CheckCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getSales, getSalesToday, recordSale, deleteSale, getProducts, getAnalyticsDashboard } from '../services/api';
import { localYMD, normalizeSaleDate } from '../utils/dateUtils';

/* ─────────────────────────────────────────────────────────────────────────────
   Design-system CSS — same token set as Dashboard & Products
   ───────────────────────────────────────────────────────────────────────── */
const SALES_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  .abk-sales {
    --cream:         #F0F7E2;
    --cream-deep:    #E4F0CF;
    --ink:           #0F1F04;
    --ink-mid:       #3A5220;
    --ink-light:     #6A8A4A;
    --ink-faint:     #A8C080;
    --border:        #D0E4B0;
    --border-light:  #E2EFC8;
    --card:          #FFFFFF;
    --card-hover:    #F3FAE6;
    --green:         #1D9E75;
    --green-bg:      #E1F5EE;
    --blue:          #185FA5;
    --blue-bg:       #E6F1FB;
    --purple:        #534AB7;
    --purple-bg:     #EEEDFE;
    --amber:         #854F0B;
    --amber-bg:      #FAEEDA;
    --red-bg:        #FCEBEB;
    --red-border:    #F7C1C1;
    --red-text:      #791F1F;
    --yellow-bg:     #FAEEDA;
    --yellow-border: #FAC775;
    --yellow-text:   #633806;
    --texture-col:   #C8DCA8;
  }

  .abk-sales.abk-dark {
    --cream:         #0D1117;
    --cream-deep:    #161B22;
    --ink:           #E6EDF3;
    --ink-mid:       #B8C9DB;
    --ink-light:     #8BA4BE;
    --ink-faint:     #5A7A96;
    --border:        #21303F;
    --border-light:  #1A2535;
    --card:          #13192A;
    --card-hover:    #1C2540;
    --green:         #3DD68C;
    --green-bg:      #0D2B1F;
    --blue:          #58A6FF;
    --blue-bg:       #0D1F35;
    --purple:        #A78BFA;
    --purple-bg:     #1A1535;
    --amber:         #F0A742;
    --amber-bg:      #2A1C06;
    --red-bg:        #1F0D0D;
    --red-border:    #3D1515;
    --red-text:      #FF8080;
    --yellow-bg:     #1F1608;
    --yellow-border: #3D2A0A;
    --yellow-text:   #F5C842;
    --texture-col:   #1A2535;
  }

  .abk-sales, .abk-sales * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
  .abk-sales .abk-serif     { font-family:'Playfair Display',Georgia,serif !important; }

  .abk-sales.abk-texture::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
    background-image:
      linear-gradient(var(--texture-col) 1px, transparent 1px),
      linear-gradient(90deg, var(--texture-col) 1px, transparent 1px);
    background-size:48px 48px; opacity:.25;
  }
  .abk-sales.abk-dark.abk-texture::before { opacity:.18; }

  @keyframes abkSFadeUp  { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  @keyframes abkSFadeIn  { from { opacity:0 } to { opacity:1 } }
  @keyframes abkSScaleIn { from { opacity:0; transform:scale(.94) } to { opacity:1; transform:scale(1) } }
  @keyframes abkSBarGrow { from { transform:scaleX(0) } to { transform:scaleX(1) } }
  @keyframes abkSToast   { 0%{opacity:0;transform:translateY(-12px)} 10%{opacity:1;transform:translateY(0)} 85%{opacity:1} 100%{opacity:0} }

  .abk-sales .abk-anim-fade-up  { opacity:0; animation:abkSFadeUp  .45s ease both; }
  .abk-sales .abk-anim-fade-in  { opacity:0; animation:abkSFadeIn  .45s ease both; }
  .abk-sales .abk-anim-scale-in { opacity:0; animation:abkSScaleIn .45s ease both; }
  .abk-sales .abk-toast         { animation:abkSToast 3.2s ease forwards; }

  .abk-sales .abk-row-hover { transition:background .15s; }
  .abk-sales .abk-row-hover:hover { background:var(--card-hover) !important; }

  .abk-sales .abk-prog-fill { transform-origin:left; animation:abkSBarGrow .85s ease both; }

  .abk-sales .abk-input {
    width:100%; border:1px solid var(--border); border-radius:10px;
    padding:9px 12px; font-size:13px; color:var(--ink);
    background:var(--card); outline:none;
    transition:border-color .15s, box-shadow .15s;
    font-family:'DM Sans',sans-serif;
  }
  .abk-sales .abk-input:focus {
    border-color:var(--green);
    box-shadow:0 0 0 3px rgba(29,158,117,.12);
  }
  .abk-sales .abk-input::placeholder { color:var(--ink-faint); }
  .abk-sales.abk-dark .abk-input    { background:var(--cream-deep); }

  .abk-sales .abk-label {
    display:block; font-size:10.5px; font-weight:600;
    text-transform:uppercase; letter-spacing:.09em;
    color:var(--ink-light); margin-bottom:6px;
  }

  .abk-sales ::-webkit-scrollbar       { width:5px; }
  .abk-sales ::-webkit-scrollbar-track { background:transparent; }
  .abk-sales ::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }

  /* ── Responsive: tablet ── */
  @media (max-width:1023px) {
    .abk-sales-kpi-3  { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    .abk-sales-filter { flex-wrap: wrap !important; }
    .abk-sales-filter > * { min-width: 140px !important; }
  }

  /* ── Responsive: phone ── */
  @media (max-width:767px) {
    .abk-sales-pad    { padding: 1rem 0.75rem 3rem !important; }
    .abk-sales-kpi-3  { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    .abk-sales-filter { flex-direction: column !important; }
    .abk-sales-filter > * { width: 100% !important; }
    .abk-sales-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
    .abk-sales-header > * { width: 100% !important; }
    .abk-sales-modal-grid { grid-template-columns: 1fr !important; }

    /* ── Sales table: horizontal scroll — all columns visible, no hiding ── */
    .abk-sales-table-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
    .abk-sales-table-wrap table { min-width: 760px !important; table-layout: auto !important; }
  }

  @media (max-width:480px) {
    .abk-sales-pad { padding: 0.75rem 0.5rem 2rem !important; }
    /* Keep KPI at 2-col even on small phones */
    .abk-sales-kpi-3 { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
  }

  @media (max-width:380px) {
    .abk-sales-kpi-3 { grid-template-columns: 1fr !important; }
  }
  /* iOS: prevent zoom on input focus */
  @media (max-width:767px) {
    input, select, textarea { font-size: 16px !important; }
  }

  /* Autocomplete dropdown */
  .abk-sales-ac { position: relative; }
  .abk-sales-ac-list {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 200;
    background: var(--card); border: 1px solid var(--border); border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,.12); max-height: 200px; overflow-y: auto;
  }
  .abk-sales-ac-item {
    padding: 9px 12px; cursor: pointer; font-size: 13px; color: var(--ink);
    transition: background .12s; display: flex; align-items: center; justify-content: space-between;
  }
  .abk-sales-ac-item:hover, .abk-sales-ac-item.ac-active { background: var(--card-hover); }
  .abk-sales-ac-item:not(:last-child) { border-bottom: 1px solid var(--border-light); }

`;

/* ── helpers ──────────────────────────────────────────────────────────────── */
function fmt(n) {
  return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}
function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

/* ── shared UI atoms (same pattern as Products) ───────────────────────────── */
function Modal({ onClose, children, maxWidth = 480 }) {
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.45)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:50, padding:16, backdropFilter:'blur(4px)',
    }}>
      <div className="abk-anim-scale-in" style={{
        background:'var(--card)', borderRadius:18, width:'100%', maxWidth,
        maxHeight:'90vh', overflowY:'auto',
        boxShadow:'0 20px 60px rgba(0,0,0,.2), 0 2px 8px rgba(0,0,0,.1)',
        border:'1px solid var(--border)',
      }}>{children}</div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose, accent }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'1.1rem 1.4rem', borderBottom:'1px solid var(--border-light)',
      position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:accent }} />
      <div style={{ marginTop:4 }}>
        <div className="abk-serif" style={{ fontSize:16, fontWeight:500, color:'var(--ink)' }}>{title}</div>
        {subtitle && <div style={{ fontSize:11, color:'var(--ink-faint)', marginTop:2, fontWeight:300 }}>{subtitle}</div>}
      </div>
      <button onClick={onClose} style={{
        width:30, height:30, borderRadius:8, border:'1px solid var(--border)',
        background:'var(--cream-deep)', display:'flex', alignItems:'center',
        justifyContent:'center', cursor:'pointer', color:'var(--ink-light)',
        transition:'background .15s',
      }}><X size={14} /></button>
    </div>
  );
}

function ModalFooter({ children }) {
  return (
    <div style={{ display:'flex', gap:10, padding:'1rem 1.4rem', borderTop:'1px solid var(--border-light)' }}>
      {children}
    </div>
  );
}

function BtnPrimary({ onClick, disabled, children, color = 'var(--green)' }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      flex:1, padding:'10px 0', background:color, color:'#fff',
      border:'none', borderRadius:11, fontSize:13, fontWeight:500,
      cursor:disabled ? 'not-allowed' : 'pointer', opacity:disabled ? .5 : 1,
      display:'flex', alignItems:'center', justifyContent:'center', gap:6,
      transition:'filter .15s', fontFamily:'DM Sans,sans-serif',
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
    >{children}</button>
  );
}

function BtnSecondary({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flex:1, padding:'10px 0', background:'var(--cream-deep)', color:'var(--ink-mid)',
      border:'1px solid var(--border)', borderRadius:11, fontSize:13, fontWeight:500,
      cursor:'pointer', transition:'background .15s', fontFamily:'DM Sans,sans-serif',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--cream-deep)'}
    >{children}</button>
  );
}

function KpiCard({ label, value, sub, Icon, stripeColor, iconBg, iconColor, progPct, delay }) {
  return (
    <div className="abk-anim-fade-up" style={{
      background:'var(--card)', border:'1px solid var(--border)',
      borderRadius:14, padding:'1.1rem 1.1rem .9rem',
      position:'relative', overflow:'hidden',
      transition:'background .3s, border-color .3s', animationDelay:delay,
      boxShadow:'0 1px 4px rgba(0,0,0,.06)',
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:stripeColor }} />
      <div style={{
        width:32, height:32, borderRadius:8, background:iconBg,
        display:'flex', alignItems:'center', justifyContent:'center',
        marginBottom:9, marginTop:4,
      }}>
        <Icon size={15} color={iconColor} />
      </div>
      <div className="abk-serif" style={{
        fontSize:24, fontWeight:700, color:iconColor, letterSpacing:-0.3,
        marginBottom:4, whiteSpace:'nowrap', overflow:'hidden',
        textOverflow:'ellipsis', lineHeight:1.15,
      }}>{value}</div>
      <div style={{ fontSize:11, color:'var(--ink-light)', fontWeight:400 }}>{label}</div>
      <div style={{ fontSize:10.5, color:'var(--ink-faint)', fontWeight:300, marginTop:1 }}>{sub}</div>
      <div style={{ height:2, background:'var(--cream-deep)', borderRadius:2, overflow:'hidden', marginTop:9 }}>
        <div className="abk-prog-fill" style={{
          height:'100%', borderRadius:2, background:stripeColor,
          width:`${Math.max(2, progPct)}%`,
          animationDelay:`calc(${delay} + .5s)`,
        }} />
      </div>
    </div>
  );
}

/* ── Product Autocomplete ─────────────────────────────────────────────────── */
function ProductAutocomplete({ products, value, onChange, placeholder }) {
  const [query,  setQuery]  = useState('');
  const [open,   setOpen]   = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);
  const ref      = useRef(null);

  // When a product is selected externally (or cleared), sync the display text
  useEffect(() => {
    const p = products.find(p => String(p.id) === String(value));
    setQuery(p ? p.name : '');
  }, [value, products]);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        // If nothing selected, clear query
        if (!value) setQuery('');
        else {
          const p = products.find(p => String(p.id) === String(value));
          setQuery(p ? p.name : '');
        }
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [value, products]);

  const filtered = products.filter(p => {
    if (!query) return true;
    return p.name.toLowerCase().includes(query.toLowerCase()) ||
           (p.sku || '').toLowerCase().includes(query.toLowerCase());
  });

  function select(p) {
    onChange(p.id);
    setQuery(p.name);
    setOpen(false);
    setActive(-1);
  }

  function handleChange(e) {
    setQuery(e.target.value);
    setOpen(true);
    setActive(-1);
    // Only clear parent value if user is typing (not already matching)
    if (value) {
      const current = products.find(p => String(p.id) === String(value));
      if (!current || current.name !== e.target.value) onChange('');
    }
  }

  function handleFocus() {
    setOpen(true);
    setActive(-1);
    // Select all text so user can immediately type a new search
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function handleKey(e) {
    if (!open) { setOpen(true); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && active >= 0) { e.preventDefault(); select(filtered[active]); }
    if (e.key === 'Escape') { setOpen(false); }
  }

  return (
    <div className="abk-sales-ac" ref={ref}>
      <div style={{ position: 'relative' }}>
        <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKey}
          placeholder={placeholder || 'Search product…'}
          className="abk-input"
          style={{ paddingLeft: 32, paddingRight: query ? 32 : 12 }}
          autoComplete="off"
        />
        {query && (
          <button
            onMouseDown={e => { e.preventDefault(); onChange(''); setQuery(''); setOpen(false); }}
            style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)', display: 'flex', padding: 2 }}
          >
            <X size={13} />
          </button>
        )}
      </div>
      {open && (
        <div className="abk-sales-ac-list">
          {filtered.length === 0 ? (
            <div style={{ padding: '12px', fontSize: 12, color: 'var(--ink-faint)', textAlign: 'center' }}>No products found</div>
          ) : filtered.map((p, i) => (
            <div
              key={p.id}
              className={`abk-sales-ac-item${i === active ? ' ac-active' : ''}`}
              onMouseDown={e => { e.preventDefault(); select(p); }}
            >
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'monospace' }}>SKU: {p.sku} · Stock: {p.stock}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', flexShrink: 0, marginLeft: 8 }}>${p.price}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Sales component
   ════════════════════════════════════════════════════════════════════════════ */
export default function Sales({ dark, user }) {
  // ── Role flags ───────────────────────────────────────────────────────────
  // WORKER: can only see today's sales, can record sales, CANNOT delete
  // ADMIN:  full access — all sales, delete, analytics cards
  const isAdmin  = user?.role?.toUpperCase() === 'ADMIN';
  const isWorker = user?.role?.toUpperCase() === 'WORKER';
  const { t } = useTranslation();

  /* Inject CSS once */
  useEffect(() => {
    const id = 'abk-sales-css';
    let tag = document.getElementById(id);
    if (!tag) {
      tag = document.createElement('style');
      tag.id = id;
      document.head.appendChild(tag);
    }
    tag.innerHTML = SALES_CSS;
    return () => { const el = document.getElementById(id); if (el) el.remove(); };
  }, []);

  const [sales,          setSales]          = useState([]);
  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [search,         setSearch]         = useState('');
  const [dateFilter,     setDateFilter]     = useState('');
  const [page,           setPage]           = useState(1);
  const [rowsPerPage,    setRowsPerPage]    = useState(10);
  const [showModal,      setShowModal]      = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [deleteConfirm,  setDeleteConfirm]  = useState(null);
  const [successMsg,     setSuccessMsg]     = useState('');
  const [form,           setForm]           = useState({ productId:'', quantity:1, price:'', customerName:'', paymentStatus:'PAID_FULL', paidAmount:'' });
  const [periodSummary,  setPeriodSummary]  = useState(null);
  const [allTimeSummary, setAllTimeSummary] = useState(null);

  useEffect(() => { if (user !== undefined) loadAll(); }, [user]);

  async function loadAll() {
    try {
      setLoading(true); setError(null);
      const today = localYMD();

      if (isWorker) {
        // WORKER: only fetch today's sales + products (no analytics access)
        const [s, p] = await Promise.all([
          getSalesToday(),   // /api/sales/today — allowed for workers
          getProducts(),
        ]);
        setSales(s); setProducts(p);
        setPeriodSummary(null); setAllTimeSummary(null);
      } else {
        // ADMIN: fetch all sales + analytics
        const [s, p, agg, allAgg] = await Promise.all([
          getSales(),
          getProducts(),
          getAnalyticsDashboard({ from:today, to:today, granularity:'day', includeSeries:false }).catch(() => null),
          getAnalyticsDashboard({ from:'2000-01-01', to:today, granularity:'month', includeSeries:false }).catch(() => null),
        ]);
        setSales(s); setProducts(p); setPeriodSummary(agg); setAllTimeSummary(allAgg);
      }
    } catch { setError(t('sales.errorConnect')); }
    finally { setLoading(false); }
  }

  function showSuccess(msg) { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3200); }

  const todayStr   = localYMD();
  const todaySales = sales.filter(s => normalizeSaleDate(s.saleDate) === todayStr);
  const todayRev   = periodSummary?.totalRevenue  ?? todaySales.reduce((a, s) => a + (s.total || 0), 0);
  const totalRev   = allTimeSummary?.totalRevenue ?? sales.reduce((a, s) => a + (s.total || 0), 0);
  const totalItems = sales.reduce((a, s) => a + (s.quantity || 0), 0);

  const filtered = sales.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.product?.name?.toLowerCase().includes(q) || s.customerName?.toLowerCase().includes(q);
    return matchSearch && (!dateFilter || s.saleDate === dateFilter);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated  = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  function openModal() { setForm({ productId:'', quantity:1, price:'', customerName:'', paymentStatus:'PAID_FULL', paidAmount:'' }); setShowModal(true); }

  function handleProductChange(productId) {
    const p = products.find(p => String(p.id) === String(productId));
    setForm(f => ({ ...f, productId, price: p ? p.price : '' }));
  }

  async function handleRecord() {
    if (!form.productId || !form.quantity || !form.price) { alert(t('sales.alertFields')); return; }
    if (!form.customerName || !form.customerName.trim()) { alert('Customer name is required.'); return; }
    const sel = products.find(p => String(p.id) === String(form.productId));
    if (sel && parseInt(form.quantity) > sel.stock) { alert(`${t('sales.notEnoughStock')} ${sel.stock}`); return; }

    const total = (parseFloat(form.price) || 0) * (parseInt(form.quantity) || 0);
    let paidAmount = total;
    let remainingLoan = 0;

    if (form.paymentStatus === 'PARTIAL_LOAN') {
      paidAmount = parseFloat(form.paidAmount) || 0;
      if (paidAmount < 0)      { alert('Amount paid cannot be negative.'); return; }
      if (paidAmount > total)  { alert(`Amount paid (${paidAmount.toFixed(2)}) cannot exceed the total (${total.toFixed(2)}).`); return; }
      remainingLoan = total - paidAmount;
    }

    setSaving(true);
    try {
      await recordSale({
        product:       { id: parseInt(form.productId) },
        quantity:      parseInt(form.quantity),
        price:         parseFloat(form.price),
        customerName:  form.customerName.trim(),
        paymentStatus: form.paymentStatus,
        paidAmount,
        remainingLoan,
        recordedBy:    user?.name || 'Staff',
      });
      setShowModal(false); showSuccess(t('sales.successRecord')); await loadAll();
    } catch (e) { alert(e.message || t('sales.errorRecord')); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try { await deleteSale(id); setDeleteConfirm(null); showSuccess(t('sales.successDelete')); await loadAll(); }
    catch { alert(t('sales.errorDelete')); }
  }

  const selectedProduct = products.find(p => String(p.id) === String(form.productId));
  const saleTotal       = (parseFloat(form.price) || 0) * (parseInt(form.quantity) || 0);
  const paidAmt         = form.paymentStatus === 'PARTIAL_LOAN' ? (parseFloat(form.paidAmount) || 0) : saleTotal;
  const remainingAmt    = form.paymentStatus === 'PARTIAL_LOAN' ? Math.max(0, saleTotal - paidAmt) : 0;
  const paidAmtInvalid  = form.paymentStatus === 'PARTIAL_LOAN' && (paidAmt < 0 || paidAmt > saleTotal);

  /* ── Loading ── */
  if (loading) return (
    <div className={`abk-sales abk-texture${dark ? ' abk-dark' : ''}`}
      style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--cream)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:34, height:34, border:'3px solid var(--border)', borderTopColor:'var(--green)', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 12px' }} />
        <p style={{ color:'var(--ink-faint)', fontSize:13, fontWeight:300 }}>{t('sales.loading')}</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className={`abk-sales abk-texture${dark ? ' abk-dark' : ''}`}
      style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--cream)' }}>
      <div style={{ background:'var(--card)', border:'1px solid var(--red-border)', borderRadius:18, padding:32, textAlign:'center', maxWidth:380, boxShadow:'0 4px 24px rgba(0,0,0,.1)' }}>
        <XCircle size={38} style={{ color:'var(--red-text)', marginBottom:12 }} />
        <div className="abk-serif" style={{ fontSize:16, fontWeight:500, color:'var(--ink)', marginBottom:6 }}>{t('sales.errorTitle')}</div>
        <p style={{ color:'var(--ink-faint)', fontSize:12, marginBottom:16, fontWeight:300 }}>{error}</p>
        <button onClick={loadAll} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 18px', background:'var(--green)', color:'#fff', border:'none', borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
          <RefreshCw size={13} /> {t('sales.tryAgain')}
        </button>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className={`abk-sales abk-texture${dark ? ' abk-dark' : ''}`}
      style={{ background:'var(--cream)', minHeight:'100vh', position:'relative', transition:'background .3s' }}>

      {/* ── Toast ── */}
      {successMsg && (
        <div className="abk-toast" style={{
          position:'fixed', top:20, right:20, zIndex:100,
          display:'inline-flex', alignItems:'center', gap:8,
          background:'var(--green)', color:'#fff',
          padding:'10px 18px', borderRadius:12,
          fontSize:13, fontWeight:500,
          boxShadow:'0 4px 20px rgba(29,158,117,.35)',
        }}>
          <CheckCircle size={15} /> {successMsg}
        </div>
      )}

      <div className="abk-sales-pad" style={{ position:'relative', zIndex:1, padding:'1.5rem 1.5rem 3rem' }}>

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="abk-anim-fade-up" style={{ padding:'0.5rem 0 1.4rem', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
          <div>
            <div style={{ fontSize:10.5, fontWeight:500, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-light)', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ display:'inline-block', width:18, height:1.5, background:'var(--green)', borderRadius:1 }} />
              {t('nav.sales')}
            </div>
            <div className="abk-serif" style={{ fontSize:28, fontWeight:500, color:'var(--ink)', letterSpacing:-0.5, lineHeight:1.1 }}>
              {t('nav.sales')}
            </div>
            <div style={{ fontSize:12, color:'var(--ink-faint)', marginTop:4, fontWeight:300 }}>
              {t('sales.subtitle')}
            </div>
            {/* WORKER mode notice — shown below page title */}
            {isWorker && (
              <div style={{
                marginTop:10, display:'inline-flex', alignItems:'center', gap:7,
                padding:'6px 12px', borderRadius:10,
                background: dark ? 'rgba(251,191,36,.08)' : '#FFFBEB',
                border: dark ? '1px solid rgba(251,191,36,.2)' : '1px solid #FDE68A',
                fontSize:11, color: dark ? '#FBBf24' : '#92400E',
              }}>
                <span style={{ fontWeight:600 }}>👷 Worker mode</span>
                <span style={{ fontWeight:300 }}>· Today's sales only · No delete access</span>
              </div>
            )}
          </div>

          <div style={{ display:'flex', gap:8, alignItems:'center', paddingTop:4 }}>
            <button onClick={loadAll} style={{
              display:'inline-flex', alignItems:'center', gap:5, padding:'8px 14px',
              background:'var(--card)', border:'1px solid var(--border)', borderRadius:11,
              color:'var(--ink-mid)', fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif',
              transition:'background .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-deep)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--card)'}
            >
              <RefreshCw size={12} /> Refresh
            </button>
            <button onClick={openModal} style={{
              display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px',
              background:'var(--green)', color:'#fff', border:'none', borderRadius:11,
              fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'DM Sans,sans-serif',
              boxShadow:'0 2px 8px rgba(29,158,117,.3)', transition:'filter .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              <Plus size={14} /> {t('sales.recordSale')}
            </button>
          </div>
        </div>

        {/* ── KPI Cards ─────────────────────────────────────────────────── */}
        <div className="abk-sales-kpi-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:10, marginBottom:'1.1rem' }}>
          <KpiCard
            label={t('sales.todayRevenue')} value={`$${fmt(todayRev)}`}
            sub={`${todaySales.length} ${t('sales.transactionsToday')}`}
            Icon={DollarSign} stripeColor="var(--green)" iconBg="var(--green-bg)" iconColor="var(--green)"
            progPct={todayRev > 0 ? 68 : 2} delay=".06s"
          />
          <KpiCard
            label={t('sales.todaySales')} value={todaySales.length}
            sub={`${todaySales.reduce((a, x) => a + (x.quantity || 0), 0)} ${t('sales.itemsSoldToday')}`}
            Icon={ShoppingCart} stripeColor="var(--blue)" iconBg="var(--blue-bg)" iconColor="var(--blue)"
            progPct={todaySales.length > 0 ? 55 : 2} delay=".13s"
          />
          <KpiCard
            label={t('sales.totalRevenue')} value={`$${fmt(totalRev)}`}
            sub={`${totalItems} ${t('sales.totalItemsSold')}`}
            Icon={TrendingUp} stripeColor="var(--purple)" iconBg="var(--purple-bg)" iconColor="var(--purple)"
            progPct={82} delay=".20s"
          />
        </div>

        {/* ── Search & Filter ───────────────────────────────────────────── */}
        <div className="abk-anim-fade-in abk-sales-filter" style={{ display:'flex', gap:8, marginBottom:'1rem', animationDelay:'.28s' }}>
          <div style={{ flex:1, position:'relative' }}>
            <Search size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--ink-faint)', pointerEvents:'none' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={t('sales.searchPlaceholder')} className="abk-input" style={{ paddingLeft:34 }} />
          </div>
          <div style={{ position:'relative' }}>
            <Calendar size={13} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--ink-faint)', pointerEvents:'none' }} />
            <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1); }}
              className="abk-input" style={{ paddingLeft:32, minWidth:160, cursor:'pointer', colorScheme: dark ? 'dark' : 'light' }} />
          </div>
          {(search || dateFilter) && (
            <button onClick={() => { setSearch(''); setDateFilter(''); setPage(1); }} style={{
              display:'inline-flex', alignItems:'center', gap:5, padding:'0 13px',
              background:'var(--red-bg)', border:'1px solid var(--red-border)',
              borderRadius:10, color:'var(--red-text)', fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif',
            }}>
              <X size={12} /> {t('ui.clear')}
            </button>
          )}
        </div>

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <div className="abk-anim-scale-in" style={{
          background:'var(--card)', border:'1px solid var(--border)',
          borderRadius:16, width:'100%', overflow:'hidden',
          boxShadow:'0 2px 12px rgba(0,0,0,.06)',
          animationDelay:'.32s', transition:'background .3s, border-color .3s',
        }}>
          {/* Table sub-header */}
          <div style={{
            padding:'10px 16px', borderBottom:'1px solid var(--border-light)',
            background:'var(--cream-deep)', display:'flex', alignItems:'center', justifyContent:'space-between',
            borderRadius:'16px 16px 0 0',
          }}>
            <div className="abk-serif" style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>{t('sales.salesHistory')}</div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {(search || dateFilter) && (
                <span style={{ fontSize:11, color:'var(--green)', fontWeight:600 }}>
                  Total: ${filtered.reduce((s, r) => s + (r.total || 0), 0).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })}
                </span>
              )}
              <span style={{ fontSize:11, color:'var(--ink-faint)', fontWeight:300 }}>{filtered.length} {t('dashboard.records')}</span>
            </div>
          </div>

          <div className="abk-sales-table-wrap" style={{ overflowX:'auto', borderRadius:'0 0 16px 16px', width:'100%', display:'block' }}>
            <table style={{ width:'100%', minWidth:'max-content', borderCollapse:'collapse' }}>
              {/* colgroup — controls per-column widths on mobile via CSS col selectors */}
              <colgroup>
                <col />{/* Date & Time */}
                <col />{/* Product */}
                <col />{/* Customer */}
                <col />{/* Qty */}
                <col />{/* Unit Price */}
                <col />{/* Total */}
                <col />{/* Payment */}
                {isAdmin && <col />}{/* Actions — admin only */}
              </colgroup>
              <thead>
                <tr style={{ background:'var(--cream-deep)', borderBottom:'1px solid var(--border)' }}>
                  {[
                    `${t('sales.date')} & ${t('sales.time')}`,
                    t('sales.product'), t('sales.customer'),
                    t('sales.qty'), t('sales.unitPrice'), t('sales.total'),
                    'Payment',
                    ...(isAdmin ? [t('ui.actions')] : []),
                  ].map(h => (
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:600, letterSpacing:'0.10em', textTransform:'uppercase', color:'var(--ink-light)', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} style={{ textAlign:'center', padding:'3.5rem 0' }}>
                      <ShoppingCart size={34} style={{ color:'var(--border)', margin:'0 auto 10px', display:'block' }} />
                      <p style={{ color:'var(--ink-faint)', fontSize:13, fontWeight:300 }}>
                        {search || dateFilter ? t('sales.noSalesFilter') : t('sales.noSalesYet')}
                      </p>
                    </td>
                  </tr>
                ) : paginated.map(s => (
                  <tr key={s.id} className="abk-row-hover" style={{ borderBottom:'1px solid var(--border-light)', background:'var(--card)' }}>
                    {/* Date / time */}
                    <td data-label="Date & Time" style={{ padding:'11px 14px' }}>
                      <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)' }}>{fmtDate(s.saleDate)}</div>
                      {s.saleTime && <div style={{ fontSize:10.5, color:'var(--ink-faint)', marginTop:2, fontWeight:300 }}>{fmtTime(s.saleTime)}</div>}
                    </td>
                    {/* Product */}
                    <td data-label="Product" style={{ padding:'11px 14px' }}>
                      <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)' }}>{s.product?.name || '—'}</div>
                      {s.product?.sku && <div style={{ fontSize:10.5, color:'var(--ink-faint)', fontFamily:'monospace', marginTop:2 }}>SKU: {s.product.sku}</div>}
                    </td>
                    {/* Customer */}
                    <td data-label="Customer" style={{ padding:'11px 14px', fontSize:12, color:'var(--ink-light)', fontWeight:300 }}>
                      {s.customerName || <span style={{ color:'var(--border)' }}>—</span>}
                    </td>
                    {/* Qty */}
                    <td data-label="Qty" style={{ padding:'11px 14px' }}>
                      <span style={{
                        display:'inline-block', fontSize:12, fontWeight:600, color:'var(--blue)',
                        background:'var(--blue-bg)', border:'1px solid rgba(24,95,165,.18)',
                        padding:'2px 10px', borderRadius:20,
                      }}>{s.quantity}</span>
                    </td>
                    {/* Unit price */}
                    <td data-label="Unit Price" style={{ padding:'11px 14px', fontSize:12, color:'var(--ink-faint)', fontWeight:300 }}>
                      ${fmt(s.price)}
                    </td>
                    {/* Total */}
                    <td data-label="Total" style={{ padding:'11px 14px' }}>
                      <span className="abk-serif" style={{ fontSize:14, fontWeight:600, color:'var(--green)' }}>
                        ${fmt(s.total)}
                      </span>
                    </td>
                    {/* Payment status */}
                    <td data-label="Payment" style={{ padding:'11px 14px' }}>
                      {s.paymentStatus === 'PARTIAL_LOAN' ? (
                        <div>
                          <span style={{
                            display:'inline-block', fontSize:11, fontWeight:600, padding:'2px 9px',
                            borderRadius:20, background:'var(--amber-bg)',
                            color:'var(--amber)', border:'1px solid var(--yellow-border)',
                          }}>Loan</span>
                          {(s.remainingLoan ?? 0) > 0 && (
                            <div style={{ fontSize:10.5, color:'var(--amber)', marginTop:3, fontWeight:400 }}>
                              Owed: ${fmt(s.remainingLoan)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{
                          display:'inline-block', fontSize:11, fontWeight:600, padding:'2px 9px',
                          borderRadius:20, background:'var(--green-bg)',
                          color:'var(--green)', border:'1px solid rgba(29,158,117,.25)',
                        }}>Paid</span>
                      )}
                    </td>
                    {/* Actions — delete button only shown to ADMIN; column hidden for workers */}
                    {isAdmin && (
                      <td className="abk-td-actions" style={{ padding:'11px 14px' }}>
                        <button onClick={() => setDeleteConfirm(s)} style={{
                          width:28, height:28, borderRadius:8, border:'1px solid var(--red-border)',
                          background:'var(--red-bg)', color:'var(--red-text)',
                          display:'inline-flex', alignItems:'center', justifyContent:'center',
                          cursor:'pointer', transition:'background .15s, transform .1s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-border)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--red-bg)'; e.currentTarget.style.transform = 'none'; }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'10px 14px', borderTop:'1px solid var(--border-light)',
            background:'var(--cream-deep)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--ink-faint)', fontWeight:300 }}>
              <span>Rows:</span>
              {[10, 20, 50, 100].map(n => (
                <button key={n} onClick={() => { setRowsPerPage(n); setPage(1); }} style={{
                  padding:'2px 9px', borderRadius:7, fontSize:11, fontWeight:500, cursor:'pointer',
                  background: rowsPerPage === n ? 'var(--green)' : 'var(--card)',
                  color: rowsPerPage === n ? '#fff' : 'var(--ink-faint)',
                  border:`1px solid ${rowsPerPage === n ? 'var(--green)' : 'var(--border)'}`,
                  fontFamily:'DM Sans,sans-serif', transition:'background .15s',
                }}>{n}</button>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:'var(--ink-faint)', fontWeight:300 }}>
              <span>{filtered.length === 0 ? 0 : (page-1)*rowsPerPage+1}–{Math.min(page*rowsPerPage, filtered.length)} / {filtered.length}</span>
              {[
                { Icon:ChevronLeft,  action:() => setPage(p => Math.max(1,p-1)),         disabled:page===1 },
                { Icon:ChevronRight, action:() => setPage(p => Math.min(totalPages,p+1)), disabled:page===totalPages },
              ].map(({ Icon, action, disabled }, i) => (
                <button key={i} onClick={action} disabled={disabled} style={{
                  width:26, height:26, borderRadius:7, border:'1px solid var(--border)',
                  background:'var(--card)', color:'var(--ink-light)', cursor:disabled ? 'not-allowed' : 'pointer',
                  opacity:disabled ? .35 : 1, display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'background .15s',
                }}><Icon size={13} /></button>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            MODAL: Record Sale
        ══════════════════════════════════════════════════════════════════ */}
        {showModal && (
          <Modal onClose={() => setShowModal(false)} maxWidth={460}>
            <ModalHeader title={t('sales.recordSale')} subtitle={t('sales.saleDetails')} onClose={() => setShowModal(false)} accent="var(--green)" />

            <div style={{ padding:'1.2rem 1.4rem', display:'flex', flexDirection:'column', gap:14 }}>

              {/* Product autocomplete */}
              <div>
                <label className="abk-label">{t('sales.product')} *</label>
                <ProductAutocomplete
                  products={products.filter(p => p.stock > 0)}
                  value={form.productId}
                  onChange={handleProductChange}
                  placeholder={t('sales.selectProduct')}
                />
                {products.filter(p => p.stock > 0).length === 0 && (
                  <div style={{ fontSize:11, color:'var(--red-text)', marginTop:5, display:'flex', alignItems:'center', gap:4 }}>
                    <XCircle size={11} /> {t('sales.noProductsAvailable')}
                  </div>
                )}
              </div>

              {/* Stock preview */}
              {selectedProduct && (
                <div style={{
                  background: selectedProduct.stock < 10 ? 'var(--amber-bg)' : 'var(--green-bg)',
                  border:`1px solid ${selectedProduct.stock < 10 ? 'var(--yellow-border)' : 'rgba(29,158,117,.25)'}`,
                  borderRadius:10, padding:'10px 14px', display:'flex', justifyContent:'space-between',
                }}>
                  <span style={{ fontSize:12, fontWeight:500, color: selectedProduct.stock < 10 ? 'var(--amber)' : 'var(--green)' }}>{t('sales.availableStock')}</span>
                  <span className="abk-serif" style={{ fontSize:14, fontWeight:600, color: selectedProduct.stock < 10 ? 'var(--amber)' : 'var(--green)' }}>
                    {selectedProduct.stock} {t('sales.availableUnit')}
                  </span>
                </div>
              )}

              {/* Qty + Price */}
              <div className="abk-sales-modal-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="abk-label">{t('sales.qty')} *</label>
                  <input type="number" min="1" max={selectedProduct?.stock || 9999}
                    value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity:e.target.value }))}
                    className="abk-input" />
                </div>
                <div>
                  <label className="abk-label">{t('sales.unitPrice')} *</label>
                  <input type="number" min="0" step="0.01" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price:e.target.value }))}
                    placeholder="0.00" className="abk-input" />
                </div>
              </div>

              {/* Customer — REQUIRED */}
              <div>
                <label className="abk-label">Customer Name *</label>
                <input
                  value={form.customerName}
                  onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                  placeholder="Enter customer name"
                  className="abk-input"
                  style={{ borderColor: form.customerName.trim() === '' && saving ? 'var(--red-text)' : undefined }}
                />
                {form.customerName.trim() === '' && (
                  <div style={{ fontSize:11, color:'var(--red-text)', marginTop:4, display:'flex', alignItems:'center', gap:3 }}>
                    <XCircle size={11} /> Customer name is required
                  </div>
                )}
              </div>

              {/* Payment option */}
              <div>
                <label className="abk-label">Payment</label>
                <div style={{ display:'flex', gap:8 }}>
                  {[
                    { value:'PAID_FULL',    label:'Paid Full',     color:'var(--green)',  bg:'var(--green-bg)'  },
                    { value:'PARTIAL_LOAN', label:'Partial / Loan', color:'var(--amber)',  bg:'var(--amber-bg)'  },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setForm(f => ({ ...f, paymentStatus: opt.value, paidAmount: '' }))}
                      style={{
                        flex:1, padding:'9px 0', borderRadius:10, fontSize:12, fontWeight:600,
                        cursor:'pointer', fontFamily:'DM Sans,sans-serif',
                        transition:'all .15s',
                        background: form.paymentStatus === opt.value ? opt.bg   : 'var(--card)',
                        color:      form.paymentStatus === opt.value ? opt.color : 'var(--ink-light)',
                        border:     form.paymentStatus === opt.value
                          ? `2px solid ${opt.color}`
                          : '1px solid var(--border)',
                      }}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Amount Paid — shown only for PARTIAL_LOAN */}
              {form.paymentStatus === 'PARTIAL_LOAN' && (
                <div>
                  <label className="abk-label">Amount Paid</label>
                  <input
                    type="number" min="0" max={saleTotal} step="0.01"
                    value={form.paidAmount}
                    onChange={e => setForm(f => ({ ...f, paidAmount: e.target.value }))}
                    placeholder={`0.00 – ${saleTotal.toFixed(2)}`}
                    className="abk-input"
                    style={{ borderColor: paidAmtInvalid ? 'var(--red-text)' : undefined }}
                  />
                  {paidAmtInvalid && (
                    <div style={{ fontSize:11, color:'var(--red-text)', marginTop:4, display:'flex', alignItems:'center', gap:3 }}>
                      <XCircle size={11} />
                      {paidAmt < 0 ? 'Cannot be negative.' : `Cannot exceed total of $${saleTotal.toFixed(2)}.`}
                    </div>
                  )}
                  {/* Remaining loan preview */}
                  {!paidAmtInvalid && saleTotal > 0 && (
                    <div style={{
                      marginTop:8, background:'var(--amber-bg)',
                      border:'1px solid var(--yellow-border)',
                      borderRadius:9, padding:'8px 12px',
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                    }}>
                      <span style={{ fontSize:11, color:'var(--amber)', fontWeight:500 }}>Remaining Loan</span>
                      <span className="abk-serif" style={{ fontSize:15, fontWeight:700, color:'var(--amber)' }}>
                        ${remainingAmt.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Total preview */}
              <div style={{
                background:'var(--green-bg)', border:'1px solid rgba(29,158,117,.25)',
                borderRadius:11, padding:'12px 16px',
              }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:11, color:'var(--green)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.08em' }}>{t('sales.totalAmount')}</div>
                    <div style={{ fontSize:11, color:'var(--ink-faint)', marginTop:2, fontWeight:300 }}>{form.quantity || 0} × ${form.price || 0}</div>
                  </div>
                  <div className="abk-serif" style={{ fontSize:26, fontWeight:700, color:'var(--green)' }}>
                    ${saleTotal.toFixed(2)}
                  </div>
                </div>
                {form.paymentStatus === 'PARTIAL_LOAN' && saleTotal > 0 && !paidAmtInvalid && (
                  <div style={{
                    marginTop:10, paddingTop:10,
                    borderTop:'1px dashed rgba(29,158,117,.3)',
                    display:'flex', justifyContent:'space-between', fontSize:11,
                  }}>
                    <span style={{ color:'var(--green)', fontWeight:400 }}>Paid now</span>
                    <span style={{ color:'var(--green)', fontWeight:600 }}>${paidAmt.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <ModalFooter>
              <BtnSecondary onClick={() => setShowModal(false)}>{t('ui.cancel')}</BtnSecondary>
              <BtnPrimary onClick={handleRecord} disabled={saving}>
                {saving
                  ? <><RefreshCw size={13} style={{ animation:'spin 1s linear infinite' }} /> {t('sales.recording')}</>
                  : <><CheckCircle size={13} /> {t('sales.recordSale')}</>}
              </BtnPrimary>
            </ModalFooter>
          </Modal>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            MODAL: Delete Confirm
        ══════════════════════════════════════════════════════════════════ */}
        {deleteConfirm && (
          <Modal onClose={() => setDeleteConfirm(null)} maxWidth={360}>
            <div style={{ padding:'2rem 1.6rem 1.4rem', textAlign:'center' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--red-bg)', border:'2px solid var(--red-border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                <Trash2 size={22} style={{ color:'var(--red-text)' }} />
              </div>
              <div className="abk-serif" style={{ fontSize:17, fontWeight:500, color:'var(--ink)', marginBottom:6 }}>{t('sales.deleteSale')}</div>
              <p style={{ fontSize:13, color:'var(--ink-light)', marginBottom:4, fontWeight:300 }}>
                {t('sales.saleOf')} <strong style={{ color:'var(--ink)', fontWeight:500 }}>{deleteConfirm.product?.name}</strong> {t('sales.on')} {fmtDate(deleteConfirm.saleDate)}
              </p>
              <p style={{ fontSize:12, color:'var(--ink-faint)', marginBottom:4, fontWeight:300 }}>
                {t('sales.total')}: <span className="abk-serif" style={{ fontWeight:600, color:'var(--green)', fontSize:14 }}>${fmt(deleteConfirm.total)}</span>
              </p>
              <p style={{ fontSize:11, color:'var(--blue)', marginBottom:20, fontWeight:300 }}>{t('sales.stockRestored')}</p>
              <div style={{ display:'flex', gap:10 }}>
                <BtnSecondary onClick={() => setDeleteConfirm(null)}>{t('ui.cancel')}</BtnSecondary>
                <BtnPrimary onClick={() => handleDelete(deleteConfirm.id)} color="#c53030">{t('ui.delete')}</BtnPrimary>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
}
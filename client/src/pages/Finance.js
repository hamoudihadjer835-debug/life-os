import { useState, useEffect } from 'react';
import { getTransactions, addTransaction, deleteTransaction } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { DoughnutChart, BarChart } from '../components/FinanceChart';
import Navbar from '../components/Navbar';
import { Icons } from '../components/Icons';

const CATEGORIES = {
  income:  ['Salary', 'Freelance', 'Investment', 'Other'],
  expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Other']
};
const ALL_CATEGORIES = ['All', 'Salary', 'Freelance', 'Investment', 'Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Other'];
const MONTHS = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENCIES = {
  USD: { symbol: '$',  name: 'US Dollar',     rate: 1     },
  EUR: { symbol: '€',  name: 'Euro',           rate: 0.92  },
  GBP: { symbol: '£',  name: 'British Pound',  rate: 0.79  },
  DZD: { symbol: 'دج', name: 'Algerian Dinar', rate: 134.5 },
  SAR: { symbol: '﷼',  name: 'Saudi Riyal',    rate: 3.75  },
};
const CATEGORY_COLORS = {
  Salary: '#4caf50', Freelance: '#7c6fcd', Investment: '#00bcd4', Food: '#ff6b6b',
  Transport: '#f0a500', Shopping: '#a855f7', Bills: '#ff8a80', Health: '#26c6da', Other: '#78909c',
};
const DEFAULT_BUDGETS = { Food: 300, Transport: 150, Shopping: 200, Bills: 200, Health: 100, Other: 100 };

export default function Finance() {
  const [transactions, setTransactions]     = useState([]);
  const [form, setForm]                     = useState({ type: 'income', amount: '', category: 'Salary', description: '' });
  const [loading, setLoading]               = useState(true);
  const [showForm, setShowForm]             = useState(false);
  const [showBudget, setShowBudget]         = useState(false);
  const [currency, setCurrency]             = useState(localStorage.getItem('currency') || 'USD');
  const [budgets, setBudgets]               = useState(() => JSON.parse(localStorage.getItem('budgets') || JSON.stringify(DEFAULT_BUDGETS)));
  const [budgetForm, setBudgetForm]         = useState({ ...DEFAULT_BUDGETS });
  const [filterType, setFilterType]         = useState('all');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterMonth, setFilterMonth]       = useState('All');
  const [searchText, setSearchText]         = useState('');
  const [activeTab, setActiveTab]           = useState('transactions');
  const [isMobile, setIsMobile]             = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet]             = useState(window.innerWidth < 1024);
  const { theme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    try { const res = await getTransactions(); setTransactions(res.data); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTransaction(form);
      setForm({ type: 'income', amount: '', category: 'Salary', description: '' });
      setShowForm(false);
      fetchTransactions();
    } catch (err) { console.error(err); }
  };

  const handleDelete   = async (id) => { await deleteTransaction(id); fetchTransactions(); };
  const changeCurrency = (c) => { setCurrency(c); localStorage.setItem('currency', c); };
  const fmt = (amount) => `${CURRENCIES[currency].symbol}${(amount * CURRENCIES[currency].rate).toFixed(2)}`;

  const saveBudgets = () => {
    setBudgets(budgetForm);
    localStorage.setItem('budgets', JSON.stringify(budgetForm));
    setShowBudget(false);
  };

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', `Amount (${currency})`];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(), t.type, t.category, t.description || '',
      (t.amount * CURRENCIES[currency].rate).toFixed(2)
    ]);
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `lifeos-finance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchType     = filterType === 'all' || t.type === filterType;
    const matchCategory = filterCategory === 'All' || t.category === filterCategory;
    const matchMonth    = filterMonth === 'All' || new Date(t.date).getMonth() === MONTHS.indexOf(filterMonth) - 1;
    const matchSearch   = !searchText || t.description?.toLowerCase().includes(searchText.toLowerCase()) || t.category.toLowerCase().includes(searchText.toLowerCase());
    return matchType && matchCategory && matchMonth && matchSearch;
  });

  const groupedTransactions = filteredTransactions.reduce((groups, t) => {
    const date = new Date(t.date).toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(t);
    return groups;
  }, {});

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance      = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const thisMonth = new Date().getMonth();
  const thisYear  = new Date().getFullYear();
  const monthExpenses = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const budgetUsage = Object.keys(budgets).map(cat => {
    const spent  = monthExpenses.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0);
    const limit  = budgets[cat];
    const pct    = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
    const status = pct >= 100 ? 'over' : pct >= 80 ? 'warning' : 'ok';
    return { cat, spent, limit, pct, status };
  });

  const cardClass = theme.isDark ? 'glass-card' : 'glass-card-light';
  const inp = { width: '100%', padding: '11px 14px', marginBottom: 12, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.input, color: theme.text, boxSizing: 'border-box', fontSize: '0.9rem' };
  const filterInp = { padding: '8px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.input, color: theme.text, fontSize: '0.82rem', cursor: 'pointer' };

  const tabBtn = (id, label, icon) => (
    <button onClick={() => setActiveTab(id)}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '8px 12px' : '8px 18px', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: isMobile ? '0.8rem' : '0.88rem', fontWeight: '600', transition: 'all 0.2s',
        background: activeTab === id ? 'linear-gradient(135deg,#7c6fcd,#a855f7)' : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        color: activeTab === id ? '#fff' : theme.subtext,
        boxShadow: activeTab === id ? '0 4px 12px rgba(124,111,205,0.35)' : 'none' }}>
      {icon} {isMobile ? '' : label}
    </button>
  );

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: theme.bg }}>
      <Navbar />
      <div style={{ padding: isMobile ? '16px' : '28px', position: 'relative' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: 'rgba(76,175,80,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4caf50' }}>
              {Icons.finance(22)}
            </div>
            <div>
              <h1 className="gradient-text" style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: '800', lineHeight: 1 }}>Finance</h1>
              <p style={{ color: theme.subtext, margin: 0, fontSize: '0.78rem' }}>{transactions.length} transactions total</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {!isMobile && (
              <button className="btn-press" onClick={exportCSV}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'rgba(76,175,80,0.12)', color: '#4caf50', border: '1px solid rgba(76,175,80,0.25)', borderRadius: 10, cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                {Icons.download(15)} Export CSV
              </button>
            )}
            {!isMobile && (
              <button className="btn-press" onClick={() => setShowBudget(!showBudget)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'rgba(240,165,0,0.12)', color: '#f0a500', border: '1px solid rgba(240,165,0,0.25)', borderRadius: 10, cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                {Icons.star(15)} Budget Goals
              </button>
            )}
            <button className="btn-press gradient-btn" onClick={() => setShowForm(!showForm)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
              {showForm ? <>{Icons.x(14)} Cancel</> : <>{Icons.add(15)} {isMobile ? 'Add' : 'Add Transaction'}</>}
            </button>
          </div>
        </div>

        {/* Mobile action buttons */}
        {isMobile && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button className="btn-press" onClick={exportCSV}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', background: 'rgba(76,175,80,0.12)', color: '#4caf50', border: '1px solid rgba(76,175,80,0.25)', borderRadius: 10, cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>
              {Icons.download(14)} Export
            </button>
            <button className="btn-press" onClick={() => setShowBudget(!showBudget)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', background: 'rgba(240,165,0,0.12)', color: '#f0a500', border: '1px solid rgba(240,165,0,0.25)', borderRadius: 10, cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}>
              {Icons.star(14)} Budget
            </button>
          </div>
        )}

        {/* ── Currency Selector ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ color: theme.subtext, fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 4 }}>
            {Icons.wallet(14)} Currency:
          </span>
          {Object.keys(CURRENCIES).map(c => (
            <button key={c} onClick={() => changeCurrency(c)}
              style={{ padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', transition: 'all 0.2s',
                background: currency === c ? 'linear-gradient(135deg,#7c6fcd,#a855f7)' : theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                color: currency === c ? '#fff' : theme.text,
                boxShadow: currency === c ? '0 2px 8px rgba(124,111,205,0.35)' : 'none' }}>
              {c}
            </button>
          ))}
          {!isMobile && <span style={{ color: theme.subtext, fontSize: '0.75rem' }}>1 USD = {CURRENCIES[currency].rate} {currency}</span>}
        </div>

        {/* ── Summary Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 12 : 16, marginBottom: 20 }}>
          {[
            { label: 'Balance',       value: fmt(balance),      color: balance >= 0 ? '#4caf50' : '#ff6b6b', icon: Icons.wallet(18),  border: '#7c6fcd', sub: balance >= 0 ? 'Positive' : 'Deficit' },
            { label: 'Income',        value: fmt(totalIncome),  color: '#4caf50', icon: Icons.income(18),  border: '#4caf50', sub: `${transactions.filter(t=>t.type==='income').length} entries` },
            { label: 'Expenses',      value: fmt(totalExpense), color: '#ff6b6b', icon: Icons.expense(18), border: '#ff6b6b', sub: `${transactions.filter(t=>t.type==='expense').length} entries` },
            { label: 'Savings Rate',  value: `${savingsRate}%`, color: savingsRate >= 0 ? '#00bcd4' : '#ff6b6b', icon: Icons.chart(18), border: '#00bcd4', sub: savingsRate >= 20 ? 'Great!' : 'Save more' },
          ].map(card => (
            <div key={card.label} className={`${cardClass} card-hover`}
              style={{ padding: isMobile ? '14px' : '20px 22px', borderRadius: 16, borderTop: `3px solid ${card.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: theme.subtext, margin: '0 0 4px', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</p>
                  <p style={{ color: card.color, margin: '0 0 2px', fontSize: isMobile ? '1.2rem' : '1.6rem', fontWeight: '800' }}>{card.value}</p>
                  <p style={{ color: theme.subtext, margin: 0, fontSize: '0.7rem' }}>{card.sub}</p>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: card.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0 }}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Budget Goals Panel ── */}
        {showBudget && (
          <div className={`scale-in ${cardClass}`} style={{ padding: isMobile ? 16 : 24, borderRadius: 16, marginBottom: 20, border: '1px solid rgba(240,165,0,0.25)' }}>
            <h2 style={{ color: theme.text, marginTop: 0, marginBottom: 16, fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#f0a500' }}>{Icons.star(18)}</span> Monthly Budget Goals
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
              {Object.keys(DEFAULT_BUDGETS).map(cat => (
                <div key={cat}>
                  <label style={{ color: theme.subtext, fontSize: '0.78rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[cat] || '#888', display: 'inline-block' }} />
                    {cat}
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: 10, color: '#4caf50', fontSize: '0.85rem', fontWeight: '700' }}>$</span>
                    <input type="number" min="0" style={{ ...inp, marginBottom: 0, paddingLeft: 24 }}
                      value={budgetForm[cat]} onChange={e => setBudgetForm({ ...budgetForm, [cat]: Number(e.target.value) })} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="gradient-btn btn-press" onClick={saveBudgets}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: '600' }}>
                {Icons.check(15)} Save Goals
              </button>
              <button onClick={() => setShowBudget(false)}
                style={{ padding: '10px 20px', background: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: theme.text, border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: '600' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Add Form ── */}
        {showForm && (
          <div className={`scale-in ${cardClass}`} style={{ padding: isMobile ? 16 : 24, borderRadius: 16, marginBottom: 20 }}>
            <h2 style={{ color: theme.text, marginTop: 0, marginBottom: 16, fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#7c6fcd' }}>{Icons.add(18)}</span> New Transaction
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 14 }}>
                <div>
                  <label style={{ color: theme.subtext, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: 8 }}>Type</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['income','expense'].map(type => (
                      <button key={type} type="button" onClick={() => setForm({ ...form, type, category: type === 'income' ? 'Salary' : 'Food' })}
                        style={{ flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s',
                          background: form.type === type ? (type === 'income' ? 'rgba(76,175,80,0.2)' : 'rgba(255,107,107,0.2)') : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                          color: form.type === type ? (type === 'income' ? '#4caf50' : '#ff6b6b') : theme.subtext,
                          border: form.type === type ? `1.5px solid ${type === 'income' ? '#4caf50' : '#ff6b6b'}` : `1.5px solid ${theme.border}` }}>
                        {type === 'income' ? Icons.income(16) : Icons.expense(16)}
                        {type === 'income' ? 'Income' : 'Expense'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ color: theme.subtext, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: 8 }}>Amount ({currency})</label>
                  <input style={inp} type="number" placeholder="0.00" min="0" value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })} required />
                </div>
                <div>
                  <label style={{ color: theme.subtext, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: 8 }}>Category</label>
                  <select style={inp} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES[form.type].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: theme.subtext, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: 8 }}>Description</label>
                  <input style={inp} type="text" placeholder="Optional..." value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="gradient-btn btn-press"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 28px', borderRadius: 10, cursor: 'pointer', fontWeight: '700', marginTop: 4 }}>
                {Icons.add(16)} Add Transaction
              </button>
            </form>
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {tabBtn('transactions', 'Transactions', Icons.finance(15))}
          {tabBtn('charts',       'Charts',       Icons.chart(15))}
          {tabBtn('budget',       'Budget',       Icons.star(15))}
        </div>

        {/* ══ TAB: Transactions ══ */}
        {activeTab === 'transactions' && (
          <>
            <div className={cardClass} style={{ padding: '12px 14px', borderRadius: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: isMobile ? '1 1 100%' : 'unset' }}>
                  <span style={{ position: 'absolute', left: 10, color: theme.subtext }}>{Icons.search(13)}</span>
                  <input style={{ ...filterInp, paddingLeft: 30, width: isMobile ? '100%' : 160 }} placeholder="Search..."
                    value={searchText} onChange={e => setSearchText(e.target.value)} />
                </div>
                <select style={filterInp} value={filterType} onChange={e => setFilterType(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <select style={filterInp} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                  {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select style={filterInp} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                  {MONTHS.map(m => <option key={m}>{m}</option>)}
                </select>
                {(filterType !== 'all' || filterCategory !== 'All' || filterMonth !== 'All' || searchText) && (
                  <button onClick={() => { setFilterType('all'); setFilterCategory('All'); setFilterMonth('All'); setSearchText(''); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}>
                    {Icons.x(12)} Reset
                  </button>
                )}
              </div>
              {(filterType !== 'all' || filterCategory !== 'All' || filterMonth !== 'All' || searchText) && (
                <p style={{ color: theme.subtext, fontSize: '0.78rem', margin: '8px 0 0' }}>
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </p>
              )}
            </div>

            <div className={cardClass} style={{ padding: isMobile ? 14 : 24, borderRadius: 16 }}>
              {loading
                ? <p style={{ color: theme.subtext }}>Loading...</p>
                : filteredTransactions.length === 0
                ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ color: theme.subtext, marginBottom: 12 }}>{Icons.search(36)}</div>
                    <p style={{ color: theme.subtext, fontSize: '1rem', margin: '0 0 4px' }}>No transactions found</p>
                    <p style={{ color: theme.subtext, fontSize: '0.82rem', margin: 0 }}>Try adjusting your filters</p>
                  </div>
                )
                : Object.entries(groupedTransactions).map(([date, txns]) => (
                  <div key={date} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ color: theme.subtext, display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                        {Icons.calendar(12)} {isMobile ? new Date(txns[0].date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : date}
                      </span>
                      <div style={{ flex: 1, height: 1, background: theme.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', whiteSpace: 'nowrap',
                        color: txns.reduce((s,t) => t.type==='income' ? s+t.amount : s-t.amount, 0) >= 0 ? '#4caf50' : '#ff6b6b' }}>
                        {fmt(txns.reduce((s,t) => t.type==='income' ? s+t.amount : s-t.amount, 0))}
                      </span>
                    </div>
                    {txns.map(t => (
                      <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '10px' : '12px 14px', marginBottom: 6, borderRadius: 12,
                        background: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)',
                        border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            background: (CATEGORY_COLORS[t.category] || '#888') + '22', color: CATEGORY_COLORS[t.category] || '#888' }}>
                            {t.type === 'income' ? Icons.income(16) : Icons.expense(16)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <p style={{ color: theme.text, margin: 0, fontWeight: '600', fontSize: '0.88rem' }}>{t.category}</p>
                              {!isMobile && <span style={{ padding: '1px 7px', borderRadius: 8, fontSize: '0.68rem', fontWeight: '700',
                                background: (CATEGORY_COLORS[t.category] || '#888') + '22', color: CATEGORY_COLORS[t.category] || '#888' }}>{t.type}</span>}
                            </div>
                            {t.description && <p style={{ color: theme.subtext, margin: '2px 0 0', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? 120 : 300 }}>{t.description}</p>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{ color: t.type === 'income' ? '#4caf50' : '#ff6b6b', fontWeight: '800', fontSize: '0.95rem' }}>
                            {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                          </span>
                          <button onClick={() => handleDelete(t._id)}
                            style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', border: 'none', borderRadius: 8, padding: '6px', cursor: 'pointer' }}>
                            {Icons.trash(13)}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </>
        )}

        {/* ══ TAB: Charts ══ */}
        {activeTab === 'charts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1fr 2fr', gap: 20 }}>
              <div className={cardClass} style={{ padding: isMobile ? 16 : 24, borderRadius: 16 }}>
                <h3 style={{ color: theme.text, marginTop: 0, marginBottom: 4, fontSize: '1rem', fontWeight: '700' }}>Income vs Expenses</h3>
                <p style={{ color: theme.subtext, fontSize: '0.78rem', margin: '0 0 16px' }}>Overall breakdown</p>
                <div style={{ maxWidth: 220, margin: '0 auto' }}>
                  <DoughnutChart income={totalIncome} expense={totalExpense} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                  {[
                    { label: 'Income',  value: fmt(totalIncome),  color: '#4caf50' },
                    { label: 'Expense', value: fmt(totalExpense), color: '#ff6b6b' },
                    { label: 'Balance', value: fmt(balance),      color: balance >= 0 ? '#7c6fcd' : '#ff6b6b' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: item.color + '12', borderRadius: 10 }}>
                      <span style={{ color: theme.subtext, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                        {item.label}
                      </span>
                      <span style={{ color: item.color, fontWeight: '700', fontSize: '0.9rem' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={cardClass} style={{ padding: isMobile ? 16 : 24, borderRadius: 16 }}>
                <h3 style={{ color: theme.text, marginTop: 0, marginBottom: 4, fontSize: '1rem', fontWeight: '700' }}>Monthly Overview</h3>
                <p style={{ color: theme.subtext, fontSize: '0.78rem', margin: '0 0 16px' }}>Income & expenses by month</p>
                <BarChart transactions={transactions} />
              </div>
            </div>
            <div className={cardClass} style={{ padding: isMobile ? 16 : 24, borderRadius: 16 }}>
              <h3 style={{ color: theme.text, marginTop: 0, marginBottom: 4, fontSize: '1rem', fontWeight: '700' }}>Spending by Category</h3>
              <p style={{ color: theme.subtext, fontSize: '0.78rem', margin: '0 0 16px' }}>Where your money goes</p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: 10 }}>
                {CATEGORIES.expense.map(cat => {
                  const spent = transactions.filter(t => t.type === 'expense' && t.category === cat).reduce((s,t) => s+t.amount, 0);
                  const pct   = totalExpense > 0 ? Math.round((spent / totalExpense) * 100) : 0;
                  const color = CATEGORY_COLORS[cat] || '#888';
                  return (
                    <div key={cat} style={{ padding: '12px 14px', borderRadius: 12, background: color + '10', border: `1px solid ${color}22` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: theme.text, fontWeight: '600', fontSize: '0.85rem' }}>{cat}</span>
                        <span style={{ color, fontWeight: '700', fontSize: '0.85rem' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 4, background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: 6 }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.8s ease' }} />
                      </div>
                      <span style={{ color: theme.subtext, fontSize: '0.72rem' }}>{fmt(spent)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB: Budget ══ */}
        {activeTab === 'budget' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className={cardClass} style={{ padding: 18, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ color: theme.text, margin: '0 0 4px', fontWeight: '700' }}>
                  {new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })} Budget
                </h3>
                <p style={{ color: theme.subtext, margin: 0, fontSize: '0.82rem' }}>Track your spending against goals</p>
              </div>
              <button className="btn-press" onClick={() => setShowBudget(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(240,165,0,0.12)', color: '#f0a500', border: '1px solid rgba(240,165,0,0.25)', borderRadius: 10, cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                {Icons.edit(14)} Edit Goals
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 14 }}>
              {budgetUsage.map(({ cat, spent, limit, pct, status }) => {
                const color    = status === 'over' ? '#ff6b6b' : status === 'warning' ? '#f0a500' : '#4caf50';
                const catColor = CATEGORY_COLORS[cat] || '#888';
                return (
                  <div key={cat} className={cardClass} style={{ padding: isMobile ? 14 : 20, borderRadius: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: catColor + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: catColor, display: 'block' }} />
                        </div>
                        <div>
                          <p style={{ color: theme.text, margin: 0, fontWeight: '700', fontSize: '0.88rem' }}>{cat}</p>
                          <p style={{ color: theme.subtext, margin: 0, fontSize: '0.72rem' }}>Budget: {fmt(limit)}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color, margin: 0, fontWeight: '800', fontSize: '0.95rem' }}>{fmt(spent)}</p>
                        <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 8, fontWeight: '700', background: color + '18', color }}>
                          {status === 'over' ? 'Over budget!' : status === 'warning' ? 'Almost full' : 'On track'}
                        </span>
                      </div>
                    </div>
                    <div style={{ height: 7, borderRadius: 6, background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: 6 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${catColor},${color})`, borderRadius: 6, transition: 'width 0.8s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.subtext, fontSize: '0.72rem' }}>{Math.round(pct)}% used</span>
                      <span style={{ color: theme.subtext, fontSize: '0.72rem' }}>{fmt(Math.max(0, limit - spent))} left</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
import { createContext, useState, useContext, useEffect } from 'react';
import { getTransactions } from '../services/api';
import { getProjects } from '../services/api';
import { getHabits } from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  const generateNotifications = async () => {
    try {
      const [t, p, h] = await Promise.all([getTransactions(), getProjects(), getHabits()]);
      const notifs = [];

      // Finance: مصاريف تجاوزت الدخل
      const income = t.data.filter(x => x.type === 'income').reduce((s, x) => s + x.amount, 0);
      const expense = t.data.filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0);
      if (expense > income && t.data.length > 0) {
        notifs.push({ id: 'fin-1', type: 'warning', icon: '💸', title: 'Expenses exceed income!', message: `You've spent $${expense} but earned $${income}`, time: 'Finance', link: '/finance' });
      }
      if (expense > 0 && income > 0 && (expense / income) > 0.8) {
        notifs.push({ id: 'fin-2', type: 'warning', icon: '⚠️', title: 'High spending alert', message: `Expenses are ${Math.round((expense / income) * 100)}% of your income`, time: 'Finance', link: '/finance' });
      }

      // Projects: مهام في In Progress
      const inProgress = p.data.flatMap(proj => proj.tasks.filter(t => t.status === 'inprogress').map(t => ({ ...t, projectTitle: proj.title })));
      if (inProgress.length > 0) {
        notifs.push({ id: 'proj-1', type: 'info', icon: '⚡', title: `${inProgress.length} task(s) in progress`, message: inProgress.slice(0, 2).map(t => t.title).join(', '), time: 'Projects', link: '/projects' });
      }

      // Projects: لا مشاريع
      if (p.data.length === 0) {
        notifs.push({ id: 'proj-2', type: 'tip', icon: '💡', title: 'Start your first project!', message: 'Create a project and organize your tasks with Kanban board', time: 'Projects', link: '/projects' });
      }

      // Habits: عادات لم تُكتمل اليوم
      const pendingHabits = h.data.filter(habit => !habit.completedDates.includes(today));
      if (pendingHabits.length > 0 && h.data.length > 0) {
        notifs.push({ id: 'hab-1', type: 'reminder', icon: '🎯', title: `${pendingHabits.length} habit(s) pending today`, message: pendingHabits.slice(0, 2).map(h => `${h.icon} ${h.name}`).join(', '), time: 'Habits', link: '/habits' });
      }

      // Habits: كل العادات مكتملة
      if (h.data.length > 0 && pendingHabits.length === 0) {
        notifs.push({ id: 'hab-2', type: 'success', icon: '🏆', title: "All habits completed today!", message: "Amazing! You've completed all your habits for today!", time: 'Habits', link: '/habits' });
      }

      // Welcome if no data
      if (t.data.length === 0 && p.data.length === 0 && h.data.length === 0) {
        notifs.push({ id: 'welcome', type: 'tip', icon: '👋', title: 'Welcome to LifeOS!', message: 'Start by adding transactions, projects, or habits', time: 'Now', link: '/dashboard' });
      }

      const readIds = JSON.parse(localStorage.getItem('readNotifs') || '[]');
      const withRead = notifs.map(n => ({ ...n, read: readIds.includes(n.id) }));
      setNotifications(withRead);
      setUnreadCount(withRead.filter(n => !n.read).length);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = () => {
    const ids = notifications.map(n => n.id);
    localStorage.setItem('readNotifs', JSON.stringify(ids));
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markRead = (id) => {
    const readIds = JSON.parse(localStorage.getItem('readNotifs') || '[]');
    if (!readIds.includes(id)) {
      localStorage.setItem('readNotifs', JSON.stringify([...readIds, id]));
    }
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, generateNotifications, markAllRead, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
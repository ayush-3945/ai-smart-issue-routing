import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onClose(), 400);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', color: '#34d399', icon: '✅' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#f87171', icon: '❌' },
    info: { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)', color: '#818cf8', icon: '💡' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24', icon: '⚠️' },
  };

  const c = config[type] || config.success;

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px 24px',
      borderRadius: '14px',
      backgroundColor: c.bg,
      border: `1px solid ${c.border}`,
      backdropFilter: 'blur(20px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      color: c.color,
      fontSize: '14px',
      fontWeight: '600',
      fontFamily: "'Inter', system-ui, sans-serif",
      transform: visible && !exiting ? 'translateX(0)' : 'translateX(120%)',
      opacity: visible && !exiting ? 1 : 0,
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      maxWidth: '420px',
      cursor: 'pointer',
    }}
      onClick={() => { setExiting(true); setTimeout(() => onClose(), 400); }}
    >
      <span style={{ fontSize: '20px' }}>{c.icon}</span>
      <span>{message}</span>
      <span style={{ marginLeft: 'auto', opacity: 0.5, fontSize: '18px', lineHeight: 1 }}>×</span>
    </div>
  );
};

// Toast Container - multiple toasts stack
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <>
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ position: 'fixed', top: `${24 + index * 76}px`, right: '24px', zIndex: 9999 }}>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration || 4000}
          />
        </div>
      ))}
    </>
  );
};

// Custom hook for toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
};

export default Toast;
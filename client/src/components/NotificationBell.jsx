import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';

const NotificationBell = ({ onSelectComplaint }) => {
  const { theme } = useTheme();
  const socket = useSocket();
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('smartissue_notifications');
      return saved ? JSON.parse(saved) : [
        {
          id: 'welcome-1',
          type: 'system',
          title: 'System Ready',
          message: 'SmartIssue AI real-time event pipeline connected.',
          time: new Date().toISOString(),
          read: false
        }
      ];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('smartissue_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Socket.io Real-time event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewIssue = (complaint) => {
      const newNotif = {
        id: 'issue-' + Date.now(),
        type: 'issue',
        title: `🚨 New ${complaint.priority || 'Medium'} Issue`,
        message: `${complaint.title} (${complaint.category || 'General'})`,
        time: new Date().toISOString(),
        complaint,
        read: false
      };
      setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
    };

    const handleStatusUpdate = (data) => {
      const newNotif = {
        id: 'status-' + Date.now(),
        type: 'status',
        title: `🔄 Status Updated: ${data.status}`,
        message: `Issue #${data.complaintId?.slice(-4) || ''} is now ${data.status}`,
        time: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
    };

    const handleNewComment = (data) => {
      const newNotif = {
        id: 'comment-' + Date.now(),
        type: 'comment',
        title: `💬 New Reply: ${data.comment?.senderName || 'Member'}`,
        message: data.comment?.message?.slice(0, 60) + '...',
        time: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
    };

    socket.on('complaintCreated', handleNewIssue);
    socket.on('statusUpdated', handleStatusUpdate);
    socket.on('newComment', handleNewComment);

    return () => {
      socket.off('complaintCreated', handleNewIssue);
      socket.off('statusUpdated', handleStatusUpdate);
      socket.off('newComment', handleNewComment);
    };
  }, [socket]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          backgroundColor: isOpen ? 'rgba(99, 102, 241, 0.25)' : (theme.isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(241, 245, 249, 0.9)'),
          border: `1px solid ${isOpen ? '#6366f1' : theme.cardBorder}`,
          color: theme.textPrimary,
          fontSize: '17px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s',
          boxShadow: theme.isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: '800',
            minWidth: '18px',
            height: '18px',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: `2px solid ${theme.bg}`,
            animation: 'pulseBadge 2s infinite'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Drawer */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '48px',
          right: 0,
          width: '340px',
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: '20px',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(16px)',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'slideDown 0.2s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${theme.cardBorder}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(248, 250, 252, 0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '800', fontSize: '15px', color: theme.textPrimary }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: '700' }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                Mark read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: theme.textMuted, fontSize: '13px' }}>
                🎉 No new notifications. All caught up!
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                    if (n.complaint && onSelectComplaint) {
                      onSelectComplaint(n.complaint);
                      setIsOpen(false);
                    }
                  }}
                  style={{
                    padding: '14px 18px',
                    borderBottom: `1px solid ${theme.tableRowBorder || 'rgba(255,255,255,0.04)'}`,
                    backgroundColor: n.read ? 'transparent' : (theme.isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)'),
                    cursor: 'pointer',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.read ? 'transparent' : (theme.isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: n.read ? theme.textPrimary : '#818cf8' }}>
                      {n.title}
                    </span>
                    {!n.read && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6366f1', marginTop: '4px' }}></span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: '12px', color: theme.textSecondary, lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '10px', color: theme.textMuted }}>
                    {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '10px 18px',
              borderTop: `1px solid ${theme.cardBorder}`,
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.3)' : 'rgba(248, 250, 252, 0.6)'
            }}>
              <button
                onClick={clearAll}
                style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '11px', cursor: 'pointer' }}
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseBadge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;

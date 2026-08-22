import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { ToastContainer, useToast } from '../components/Toast';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import IssueDetailModal from '../components/IssueDetailModal';
import NotificationBell from '../components/NotificationBell';
import InstallPwaButton from '../components/InstallPwaButton';

// Convert file to Base64 object for offline localStorage storage
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
    reader.onerror = (err) => reject(err);
  });

// Convert Base64 data URL back to a File object for FormData upload
const base64ToFile = async (base64Data, filename, mimeType) => {
  const res = await fetch(base64Data);
  const blob = await res.blob();
  return new File([blob], filename, { type: mimeType || 'image/jpeg' });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mineSite, setMineSite] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [dismissDuplicateWarning, setDismissDuplicateWarning] = useState(false);
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [customLocationText, setCustomLocationText] = useState('');
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const { t } = useLanguage();

  // Offline-First Sync State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('coalguard_offline_queue');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);

  let user = {};
  try {
    const raw = localStorage.getItem('user');
    if (raw && raw !== 'undefined') user = JSON.parse(raw);
  } catch (e) {
    user = {};
  }

  const fetchMyComplaints = async () => {
    try {
      const res = await api.get('/complaints/my');
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  // Background Sync Engine
  const syncOfflineQueue = async () => {
    if (!navigator.onLine) return;
    let currentQueue = [];
    try {
      const saved = localStorage.getItem('coalguard_offline_queue');
      currentQueue = saved ? JSON.parse(saved) : [];
    } catch (e) {
      currentQueue = [];
    }

    if (!currentQueue.length) return;

    setIsSyncing(true);
    let syncedCount = 0;
    const remainingQueue = [...currentQueue];

    for (let i = 0; i < currentQueue.length; i++) {
      const item = currentQueue[i];
      try {
        const formData = new FormData();
        formData.append('title', item.title);
        formData.append('description', item.description);
        formData.append('mineSite', item.mineSite);

        if (item.location) {
          formData.append('location', JSON.stringify(item.location));
        }

        if (item.files && item.files.length > 0) {
          for (const f of item.files) {
            try {
              const fileObj = await base64ToFile(f.data, f.name, f.type);
              formData.append('files', fileObj);
            } catch (err) {
              console.warn('Failed to rebuild file from base64:', err);
            }
          }
        }

        await api.post('/complaints', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        syncedCount++;
        remainingQueue.shift();
        localStorage.setItem('coalguard_offline_queue', JSON.stringify(remainingQueue));
        setOfflineQueue([...remainingQueue]);
      } catch (err) {
        console.error('Failed to sync offline item:', err);
        break; // Stop syncing if connection drops again or server error
      }
    }

    setIsSyncing(false);
    if (syncedCount > 0) {
      addToast(`⚡ Auto-synced ${syncedCount} offline incident reports to DGMS Command!`, 'success', 5000);
      fetchMyComplaints();
    }
  };

  useEffect(() => {
    fetchMyComplaints();

    const handleOnline = () => {
      setIsOnline(true);
      addToast('🟢 Surface connectivity restored! Syncing queued reports...', 'info', 4000);
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      addToast('🔴 Underground Offline Mode Active — Reports will be saved locally.', 'warning', 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine && offlineQueue.length > 0) {
      syncOfflineQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Debounced AI Duplicate Detection
  useEffect(() => {
    if (!title || title.trim().length < 5 || dismissDuplicateWarning) {
      setDuplicates([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.post('/complaints/check-duplicate', { title });
        if (res.data?.hasDuplicates) {
          setDuplicates(res.data.duplicates);
        } else {
          setDuplicates([]);
        }
      } catch (err) {
        console.error('Duplicate check error:', err);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [title, dismissDuplicateWarning]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'error', 4000);
      setShowCustomLocation(true);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocoding via OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || data.address?.county || '';
          const state = data.address?.state || '';
          const country = data.address?.country || '';
          const pincode = data.address?.postcode || '';

          const locObj = {
            latitude,
            longitude,
            address,
            city,
            state,
            country,
            pincode
          };

          setLocation(locObj);
          addToast(`📍 Location detected: ${city ? `${city}, ` : ''}${state || country || 'GPS Lock'}`, 'success', 4000);
        } catch (err) {
          console.warn('Reverse geocode fallback to coords:', err);
          const locObj = {
            latitude,
            longitude,
            address: `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            city: '',
            state: '',
            country: '',
            pincode: ''
          };
          setLocation(locObj);
          addToast('📍 GPS coordinates captured!', 'success', 3000);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error.message);
        addToast(`Could not access GPS (${error.message}). You can enter location manually.`, 'info', 5000);
        setShowCustomLocation(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleClearLocation = () => {
    setLocation(null);
    setCustomLocationText('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    // If Offline: Save to Local Queue
    if (!navigator.onLine) {
      try {
        let serializedFiles = [];
        if (selectedFiles.length > 0) {
          serializedFiles = await Promise.all(
            selectedFiles.map((file) => fileToBase64(file))
          );
        }

        const offlineItem = {
          id: 'offline_' + Date.now(),
          title: title.trim(),
          description: description.trim(),
          mineSite: mineSite.trim() || 'Jharia Colliery - Pit 4 (Underground)',
          location: location || (customLocationText.trim() ? { address: customLocationText.trim() } : null),
          savedAt: new Date().toISOString(),
          files: serializedFiles
        };

        const updatedQueue = [...offlineQueue, offlineItem];
        localStorage.setItem('coalguard_offline_queue', JSON.stringify(updatedQueue));
        setOfflineQueue(updatedQueue);

        setTitle('');
        setDescription('');
        setMineSite('');
        setSelectedFiles([]);
        setLocation(null);
        setCustomLocationText('');
        setShowCustomLocation(false);

        addToast(`💾 "${offlineItem.title}" saved to Offline Queue! Will auto-dispatch upon surface reconnect.`, 'warning', 6000);
      } catch (err) {
        console.error('Offline save error:', err);
        addToast('Failed to save offline report locally', 'error', 4000);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('mineSite', mineSite);
      
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append('files', file);
        });
      }

      if (location) {
        formData.append('location', JSON.stringify(location));
      } else if (customLocationText.trim()) {
        formData.append('location', JSON.stringify({
          address: customLocationText.trim()
        }));
      }

      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTitle('');
      setDescription('');
      setMineSite('');
      setSelectedFiles([]);
      setLocation(null);
      setCustomLocationText('');
      setShowCustomLocation(false);
      addToast(`🤖 "${res.data.complaint?.title || title}" — AI analyzed & submitted!`, 'success', 5000);
      fetchMyComplaints();
    } catch (err) {
      const serverMsg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message || 'Failed to create complaint';
      addToast(`❌ ${serverMsg}`, 'error', 6000);
    } finally {
      setLoading(false);
    }
  };

  const { theme } = useTheme();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.bg, color: theme.textPrimary, fontFamily: "'Inter', system-ui, sans-serif", padding: '32px 20px', transition: 'all 0.3s ease' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
        {/* Top Navbar Header - FULL WIDTH */}
        <div className="dashboard-header" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 20px 20px', borderBottom: `1px solid ${theme.cardBorder}`, flexWrap: 'wrap', gap: '16px' }}>
          <div
            onClick={() => navigate('/')}
            title={t('backToHome')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', padding: '7px 10px', borderRadius: '10px', fontSize: '16px', color: '#fff', boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)' }}>⛏️</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: theme.textPrimary }}>{t('appTitle')}</h1>
              <p style={{ margin: '1px 0 0', color: theme.textSecondary, fontSize: '12px' }}>{t('appSubtitle')}</p>
            </div>
          </div>
          
          {/* Controls Toolbar (Opposite Side) */}
          <div className="dashboard-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginLeft: 'auto' }}>
            <InstallPwaButton />
            <LanguageToggle />
            <ThemeToggle />
            <NotificationBell onSelectComplaint={(complaint) => setSelectedComplaint(complaint)} />

            <button
              title={t('adminView')}
              onClick={() => window.location.href = '/admin'}
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: '#fff', padding: '0 12px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)', transition: 'transform 0.2s' }}
            >
              <span>👑</span>
              <span>Command Center</span>
            </button>

            {/* User Avatar & Sign Out */}
            <div title={`${user.name || 'User'} (${user.role || 'Member'})`} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#fff', cursor: 'default', boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)', marginLeft: '4px' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : '⛏️'}
            </div>
            <button
              title={t('signOut')}
              onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
            >
              🚪
            </button>
          </div>
        </div>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Top Live Surveillance Radar Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderRadius: '12px',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          marginBottom: '16px',
          fontSize: '12px',
          fontWeight: '700',
          color: '#10b981',
          letterSpacing: '0.5px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 10px #10b981' }}></span>
            <span>{t('liveRadar')}</span>
          </div>
          <span style={{ fontSize: '11px', color: theme.textMuted }}>DGMS REG-124 ACTIVE</span>
        </div>

        {/* Sticky Underground Offline Mode Active Banner */}
        {!isOnline && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderRadius: '14px',
            backgroundColor: 'rgba(239, 68, 68, 0.14)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            marginBottom: '16px',
            color: '#f87171',
            fontSize: '13px',
            fontWeight: '700',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block', boxShadow: '0 0 8px #ef4444' }}></span>
              <span>🔴 <strong>{t('offlineModeActive')}</strong></span>
            </div>
            {offlineQueue.length > 0 && (
              <span style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.25)', color: '#fff', fontSize: '11px', fontWeight: '800' }}>
                📁 {offlineQueue.length} {t('offlineQueuedBadge')}
              </span>
            )}
          </div>
        )}

        {/* Pending Sync Alert Banner (When Online and Queue > 0) */}
        {isOnline && offlineQueue.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderRadius: '14px',
            backgroundColor: 'rgba(245, 158, 11, 0.14)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            marginBottom: '16px',
            color: '#fbbf24',
            fontSize: '13px',
            fontWeight: '700',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>⚡</span>
              <span>{isSyncing ? t('syncingReports') : `🟢 ${offlineQueue.length} offline report(s) ready to auto-sync to DGMS Command.`}</span>
            </div>
            {!isSyncing && (
              <button
                type="button"
                onClick={syncOfflineQueue}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#f59e0b',
                  color: '#000',
                  fontWeight: '800',
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.4)'
                }}
              >
                {t('syncNowButton')}
              </button>
            )}
          </div>
        )}

        {/* Back to Home Link */}
        <div style={{ marginBottom: '20px' }}>
          <div
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#94a3b8',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <span>←</span> {t('backToHome')}
          </div>
        </div>

        {/* Report Mine Violation / Safety Observation Form Card */}
        <div className={theme.isDark ? 'glass-panel' : ''} style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.isDark ? 'rgba(245, 158, 11, 0.25)' : theme.cardBorder}`, borderRadius: '24px', padding: '32px', marginBottom: '40px', boxShadow: theme.isDark ? '0 20px 40px -15px rgba(245, 158, 11, 0.1)' : '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '22px' }}>⛏️</span>
            <h2 className="gradient-text" style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{t('raiseIssueTitle')}</h2>
          </div>
          <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 24px' }}>{t('raiseIssueSubtitle')}</p>

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Mine Site Selection with Quick Chips */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px' }}>
                🏭 {t('mineSiteLabel')}
              </label>
              
              {/* Quick Select Chips */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {[
                  'Jharia Colliery - Pit 4 (Underground)',
                  'Bokaro Colliery - Open-Cast Pit B',
                  'Korba West - Block A',
                  'Raniganj - Shaft 3'
                ].map((site) => (
                  <button
                    key={site}
                    type="button"
                    onClick={() => setMineSite(site)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: mineSite === site ? '1px solid #f59e0b' : `1px solid ${theme.cardBorder}`,
                      backgroundColor: mineSite === site ? 'rgba(245, 158, 11, 0.2)' : theme.badgeBg,
                      color: mineSite === site ? '#fbbf24' : theme.textSecondary,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {site.split(' - ')[0]}
                  </button>
                ))}
              </div>

              <select
                value={mineSite}
                onChange={(e) => setMineSite(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  backgroundColor: theme.inputBg,
                  border: `1px solid ${theme.cardBorder}`,
                  color: theme.textPrimary,
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="" disabled>Select Coalfield / Mine Site Location...</option>
                <option value="Jharia Colliery - Pit 4 (Underground)">Jharia Colliery - Pit 4 (Underground Shaft)</option>
                <option value="Bokaro Colliery - Open-Cast Pit B">Bokaro Colliery - Open-Cast Pit B</option>
                <option value="Korba West - Block A (HEMM Zone)">Korba West - Block A (HEMM Zone)</option>
                <option value="Raniganj - Shaft 3 (Deep Seam)">Raniganj - Shaft 3 (Deep Seam)</option>
                <option value="Dhanbad Central Coalfield">Dhanbad Central Coalfield</option>
                <option value="Singrauli Northern Coalfield">Singrauli Northern Coalfield</option>
                <option value="Talcher Coalfield - Pit 2">Talcher Coalfield - Pit 2</option>
                <option value="Other Mine Site">Other Mine Site (Specify in Description)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px' }}>{t('issueTitleLabel')}</label>
              <input
                type="text"
                placeholder={t('issueTitlePlaceholder')}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDismissDuplicateWarning(false);
                }}
                required
                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />

              {/* AI Duplicate Detection Warning Banner */}
              {duplicates.length > 0 && !dismissDuplicateWarning && (
                <div style={{
                  marginTop: '12px',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  backgroundColor: theme.isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {t('duplicateAlertTitle')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDismissDuplicateWarning(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.textMuted,
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {t('dismissContinue')}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary, lineHeight: 1.4 }}>
                    {t('duplicateAlertDesc')}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {duplicates.map((dup) => (
                      <div key={dup._id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: theme.isDark ? 'rgba(18, 21, 33, 0.8)' : '#ffffff',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${theme.cardBorder}`
                      }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: theme.textPrimary }}>{dup.title}</div>
                          <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '2px' }}>
                            📁 {dup.category} • ⚡ {dup.priority} • Status: <span style={{ color: '#f59e0b', fontWeight: '600' }}>{dup.status}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedComplaint(dup)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#0ea5e9',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          {t('viewMatch')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px' }}>{t('problemDescriptionLabel')}</label>
              <textarea
                placeholder={t('problemDescriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary, fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            {/* Multi-File Upload Component */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px' }}>
                📎 {t('attachmentsLabel')}
              </label>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: theme.inputBg,
                  border: `1px dashed ${theme.cardBorder}`,
                  color: theme.textSecondary,
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Live Location Detection Component */}
            <div style={{
              padding: '16px 18px',
              borderRadius: '14px',
              backgroundColor: theme.inputBg,
              border: `1px solid ${location ? 'rgba(245, 158, 11, 0.45)' : theme.cardBorder}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <span>📍</span>
                  <span>{t('incidentLocation')}</span>
                  <span style={{ fontSize: '11px', color: theme.textMuted, fontWeight: 'normal' }}>({t('customAddress')})</span>
                </label>

                {!location && (
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    style={{
                      background: isLocating ? 'rgba(245, 158, 11, 0.2)' : 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(234, 88, 12, 0.18))',
                      border: '1px solid rgba(245, 158, 11, 0.45)',
                      color: '#fbbf24',
                      padding: '6px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: isLocating ? 'wait' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 0 10px rgba(245, 158, 11, 0.15)'
                    }}
                  >
                    <span>{isLocating ? '⏳' : '📡'}</span>
                    <span>{isLocating ? t('detectingLocation') : t('detectLocation')}</span>
                  </button>
                )}
              </div>

              {location ? (
                <div style={{
                  marginTop: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: theme.isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', overflow: 'hidden' }}>
                    <span style={{ fontSize: '16px' }}>🎯</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: theme.textPrimary }}>
                        {location.city ? `${location.city}, ` : ''}{location.state || location.country || 'Live GPS Position'}
                      </div>
                      <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px', wordBreak: 'break-word' }}>
                        {location.address}
                      </div>
                      {location.latitude && location.longitude && (
                        <div style={{ fontSize: '11px', color: '#fbbf24', marginTop: '4px', fontWeight: '600' }}>
                          🌐 Coords: {location.latitude.toFixed(5)}° N, {location.longitude.toFixed(5)}° E
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearLocation}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {t('removeLocation')} ✕
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    placeholder={`e.g. Underground Shaft B, Seam 4, Haul Road #2`}
                    value={customLocationText}
                    onChange={(e) => setCustomLocationText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.4)' : '#ffffff',
                      border: `1px solid ${theme.cardBorder}`,
                      color: theme.textPrimary,
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                background: !isOnline
                  ? 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #f59e0b, #ea580c)',
                color: '#fff',
                fontSize: '15px',
                fontWeight: '800',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: !isOnline
                  ? '0 8px 20px -6px rgba(239, 68, 68, 0.6)'
                  : '0 8px 20px -6px rgba(245, 158, 11, 0.6)',
                transition: 'all 0.3s ease',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? t('submittingButton') : (!isOnline ? t('offlineSubmitButton') : t('submitButton'))}
            </button>
          </form>
        </div>

        {/* My Submitted Issues Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span style={{ fontSize: '20px' }}>📜</span>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: theme.textPrimary }}>{t('mySubmittedIssues')} ({complaints.length})</h2>
        </div>
        
        {fetching ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ backgroundColor: theme.cardBg, borderRadius: '16px', padding: '24px', animation: 'pulse 1.5s ease-in-out infinite' }}>
                <div style={{ height: '18px', width: '60%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '8px', marginBottom: '12px' }}></div>
                <div style={{ height: '14px', width: '90%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '8px', marginBottom: '8px' }}></div>
              </div>
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <p style={{ color: theme.textMuted }}>No issues filed yet. Submit your first issue above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {complaints.map((c) => (
              <div key={c._id} style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '16px', padding: '20px', transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                onClick={() => setSelectedComplaint(c)}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.cardBorder; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: theme.textPrimary, fontWeight: '600' }}>
                    {c.title}
                    {c.comments && c.comments.length > 0 && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                        💬 {c.comments.length}
                      </span>
                    )}
                    {c.attachments && c.attachments.length > 0 && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                        📎 {c.attachments.length} files
                      </span>
                    )}
                    {c.location && (c.location.address || c.location.city || c.location.latitude) && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                        📍 {c.location.city || 'Pit Loc'}
                      </span>
                    )}
                  </h3>
                  <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', backgroundColor: c.status === 'Resolved' ? '#10b981' : c.status === 'In Progress' ? '#3b82f6' : '#f59e0b', color: '#fff' }}>
                    {c.status}
                  </span>
                </div>
                
                <p style={{ margin: '0 0 14px', color: theme.textSecondary, fontSize: '13px', lineHeight: '1.5' }}>{c.description}</p>
                
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: theme.textSecondary, borderTop: `1px solid ${theme.cardBorder}`, paddingTop: '12px' }}>
                  {c.mineSite && (
                    <span>🏭 Mine: <strong style={{ color: '#f59e0b' }}>{c.mineSite}</strong></span>
                  )}
                  <span>🏷️ Category: <strong style={{ color: '#fbbf24' }}>{c.category}</strong></span>
                  <span>⚡ Severity: <strong style={{ color: c.priority === 'Critical' ? '#f87171' : c.priority === 'High' ? '#fb923c' : '#60a5fa' }}>{c.priority}</strong></span>
                  <span>🎯 AI Confidence: <strong style={{ color: '#34d399' }}>{c.aiConfidence}%</strong></span>
                  {c.assignedTo && (
                    <span>👷 Lead: <strong style={{ color: theme.textPrimary }}>{c.assignedTo}</strong></span>
                  )}
                  {c.location?.address && (
                    <span style={{ color: theme.textMuted }}>📍 <strong>{c.location.address.length > 30 ? `${c.location.address.slice(0, 30)}...` : c.location.address}</strong></span>
                  )}
                  <span style={{ marginLeft: 'auto', color: '#fbbf24', fontWeight: '600', fontSize: '12px' }}>Inspection Details & SOP ➔</span>
                </div>
                
                {c.aiSummary && (
                  <div style={{ marginTop: '12px', fontSize: '12px', color: theme.isDark ? '#fbbf24' : '#d97706', backgroundColor: theme.isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '8px 14px', borderRadius: '10px' }}>
                    ✨ <strong>AI Summary:</strong> {c.aiSummary}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Issue Detail & Chat Modal */}
        {selectedComplaint && (
          <IssueDetailModal
            complaint={selectedComplaint}
            currentUser={user}
            onClose={() => setSelectedComplaint(null)}
            onComplaintUpdated={(updatedComplaint) => {
              setComplaints((prev) =>
                prev.map((item) => (item._id === updatedComplaint._id ? updatedComplaint : item))
              );
              setSelectedComplaint(updatedComplaint);
            }}
          />
        )}

      </div>
    </div>
  );
};

export default Dashboard;
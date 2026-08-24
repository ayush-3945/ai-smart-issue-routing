import React, { useState, useEffect, useRef } from 'react';
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
import MinesGISMap from '../components/MinesGISMap';

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

const CIL_SUBSIDIARIES = {
  'Eastern Coalfields Limited (ECL)': ['West Bengal', 'Jharkhand'],
  'Bharat Coking Coal Limited (BCCL)': ['Jharkhand', 'West Bengal'],
  'Central Coalfields Limited (CCL)': ['Jharkhand'],
  'Western Coalfields Limited (WCL)': ['Maharashtra', 'Madhya Pradesh'],
  'South Eastern Coalfields Limited (SECL)': ['Chhattisgarh', 'Madhya Pradesh'],
  'Northern Coalfields Limited (NCL)': ['Madhya Pradesh', 'Uttar Pradesh'],
  'Mahanadi Coalfields Limited (MCL)': ['Odisha'],
  'Central Mine Planning & Design Inst. (CMPDIL)': ['Jharkhand', 'All India (HQ)']
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [reportType, setReportType] = useState('hazard'); // 'hazard' | 'maintenance'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSubsidiary, setSelectedSubsidiary] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [contractor, setContractor] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
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
  const { t, lang } = useLanguage();

  // Voice-to-Text Dictation State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // OCR Scan State
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  const ocrInputRef = useRef(null);

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

  // Mobile Dashboard & Attendance State
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  const [mobileView, setMobileView] = useState('menu'); // 'menu' | 'form' | 'attendance' | 'gis'
  const [attendanceStatus, setAttendanceStatus] = useState(() => localStorage.getItem('attendance_status') || 'out');
  const [punchTime, setPunchTime] = useState(() => localStorage.getItem('punch_time') || null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  let user = {};
  try {
    const raw = localStorage.getItem('user');
    if (raw && raw !== 'undefined') user = JSON.parse(raw);
  } catch (e) {
    user = {};
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

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

  const handleOcrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsExtractingOcr(true);
    addToast('Scanning document using AI...', 'info');

    try {
      const base64Data = await fileToBase64(file);
      const res = await api.post('/complaints/ocr', { imageBase64: base64Data.data });
      
      if (res.data) {
        if (res.data.title) setTitle(res.data.title);
        if (res.data.description) setDescription(res.data.description);
        addToast('Document scanned and fields auto-filled successfully!', 'success', 5000);
      }
    } catch (err) {
      console.error('OCR failed:', err);
      addToast('Failed to scan document. Please try again or enter details manually.', 'error');
    } finally {
      setIsExtractingOcr(false);
      if (ocrInputRef.current) ocrInputRef.current.value = '';
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

  // Multilingual Voice-to-Text Dictation (Web Speech API)
  const handleToggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Speech Recognition is not supported in this browser. Please use Chrome or Edge.', 'error', 5000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        addToast('🎙️ Listening... Speak your hazard report in Hindi or English.', 'info', 3000);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }

        if (finalTranscript) {
          setDescription((prev) => (prev ? `${prev.trim()} ${finalTranscript.trim()}` : finalTranscript.trim()));
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          addToast(`Microphone notice: ${event.error}`, 'error', 4000);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition start failed:', err);
      setIsListening(false);
      addToast('Could not start microphone', 'error', 4000);
    }
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

        const finalTitle = reportType === 'maintenance' && !title.startsWith('[MAINTENANCE]') 
          ? `[MAINTENANCE] ${equipmentId ? equipmentId + ' — ' : ''}${title.trim()}`
          : title.trim();

        const offlineItem = {
          id: 'offline_' + Date.now(),
          title: finalTitle,
          description: description.trim(),
          mineSite: mineSite.trim() || 'Jharia Colliery - Pit 4 (Underground)',
          contractor: contractor.trim() || 'Direct CIL / DGMS Departmental Team',
          equipmentId: equipmentId.trim(),
          reportType: reportType,
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
        setContractor('');
        setEquipmentId('');
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
      const finalTitle = reportType === 'maintenance' && !title.startsWith('[MAINTENANCE]') 
        ? `[MAINTENANCE] ${equipmentId ? equipmentId + ' — ' : ''}${title.trim()}`
        : title.trim();

      const formData = new FormData();
      formData.append('title', finalTitle);
      formData.append('description', description);
      formData.append('mineSite', mineSite);
      if (contractor) formData.append('contractor', contractor);
      if (equipmentId) formData.append('equipmentId', equipmentId);
      if (reportType === 'maintenance') formData.append('category', 'Equipment');
      
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
      setSelectedSubsidiary('');
      setSelectedState('');
      setContractor('');
      setEquipmentId('');
      setSelectedFiles([]);
      setLocation(null);
      setCustomLocationText('');
      setShowCustomLocation(false);
      addToast(`🤖 "${res.data.complaint?.title || finalTitle}" — AI analyzed & logged!`, 'success', 5000);
      fetchMyComplaints();
    } catch (err) {
      const serverMsg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message || 'Failed to create complaint';
      addToast(`❌ ${serverMsg}`, 'error', 6000);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };

  const handlePunch = async () => {
    const action = attendanceStatus === 'in' ? 'PUNCH_OUT' : 'PUNCH_IN';

    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'error', 3000);
      return;
    }

    addToast('Verifying your location...', 'info', 2000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        try {
          const res = await api.post('/attendance', {
            lat: userLat,
            lng: userLng,
            action
          });

          if (res.data.success) {
            const isVerified = res.data.data.status === 'Verified';
            if (isVerified) {
              setAttendanceStatus(action === 'PUNCH_IN' ? 'in' : 'out');
              const time = new Date().toLocaleTimeString();
              if (action === 'PUNCH_IN') {
                setPunchTime(time);
                localStorage.setItem('punch_time', time);
              }
              localStorage.setItem('attendance_status', action === 'PUNCH_IN' ? 'in' : 'out');
              addToast(res.data.message, 'success', 4000);
            } else {
              addToast(res.data.message, 'error', 6000); // Flagged message from backend
            }
          }
        } catch (error) {
          console.error('Attendance Error:', error);
          addToast(error.response?.data?.message || 'Failed to record attendance', 'error', 4000);
        }
      },
      (error) => {
        let msg = 'Failed to get location';
        if (error.code === 1) msg = 'Please allow Location Access to Punch In.';
        addToast(msg, 'error', 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const renderMobileMenu = () => (
    <div style={{ padding: '0' }}>
      {/* Profile Card */}
      <div style={{ backgroundColor: theme.cardBg, borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', boxShadow: theme.isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.05)', border: `1px solid ${theme.cardBorder}` }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', fontSize: '32px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: theme.textPrimary }}>Welcome, {user.name || 'User'}!</h2>
          <p style={{ margin: '4px 0 0', color: '#1d4ed8', fontSize: '15px', fontWeight: '500' }}>{user.phone || '+91 7834949144'}</p>
        </div>
      </div>

      {/* Grid of Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* File a Complaint */}
        <div 
          onClick={() => setMobileView('form')}
          style={{ gridColumn: '1 / -1', backgroundColor: theme.cardBg, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)', border: `1px solid ${theme.cardBorder}` }}
        >
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🛡️</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: theme.textPrimary }}>File a Complaint</h3>
            <p style={{ margin: '4px 0 0', color: theme.textSecondary, fontSize: '13px' }}>Report issues quickly</p>
          </div>
        </div>

        {/* Mines GIS */}
        <div 
          onClick={() => setMobileView('gis')}
          style={{ backgroundColor: theme.cardBg, borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)', border: `1px solid ${theme.cardBorder}` }}
        >
          <div style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📍</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: theme.textPrimary }}>Mines GIS</h3>
            <p style={{ margin: '4px 0 0', color: theme.textSecondary, fontSize: '12px' }}>Interactive map data</p>
          </div>
        </div>

        {/* Explore Area */}
        <div 
          onClick={() => setMobileView('explore')}
          style={{ backgroundColor: theme.cardBg, borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)', border: `1px solid ${theme.cardBorder}` }}
        >
          <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🧭</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: theme.textPrimary }}>Explore Area</h3>
            <p style={{ margin: '4px 0 0', color: theme.textSecondary, fontSize: '12px' }}>View on Maps</p>
          </div>
        </div>

        {/* Attendance Tracker */}
        <div 
          onClick={() => setMobileView('attendance')}
          style={{ gridColumn: '1 / -1', backgroundColor: theme.cardBg, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)', border: `1px solid ${theme.cardBorder}` }}
        >
          <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🕒</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: theme.textPrimary }}>Attendance Tracker</h3>
              <p style={{ margin: '4px 0 0', color: theme.textSecondary, fontSize: '13px' }}>Punch in / Punch out</p>
            </div>
            <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px', backgroundColor: attendanceStatus === 'in' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: attendanceStatus === 'in' ? '#22c55e' : '#ef4444', fontWeight: '700' }}>
              {attendanceStatus === 'in' ? 'PUNCHED IN' : 'PUNCHED OUT'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAttendanceTracker = () => (
    <div style={{ padding: '10px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => setMobileView('menu')} style={{ background: 'none', border: 'none', color: theme.textPrimary, fontSize: '24px', cursor: 'pointer' }}>←</button>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: theme.textPrimary }}>Attendance</h2>
      </div>

      <div style={{ backgroundColor: theme.cardBg, borderRadius: '20px', padding: '32px 24px', textAlign: 'center', border: `1px solid ${theme.cardBorder}`, boxShadow: theme.isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🕒</div>
        <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.textPrimary, margin: '0 0 8px' }}>
          {attendanceStatus === 'in' ? 'You are ON SHIFT' : 'You are OFF SHIFT'}
        </h3>
        <p style={{ color: theme.textSecondary, fontSize: '15px', margin: '0 0 32px' }}>
          {attendanceStatus === 'in' && punchTime ? `Punched in at ${punchTime}` : 'Punch in to start your shift'}
        </p>

        <button 
          onClick={handlePunch}
          style={{ width: '100%', padding: '20px', borderRadius: '16px', fontSize: '18px', fontWeight: '800', cursor: 'pointer', border: 'none', color: '#fff', transition: 'transform 0.2s',
            background: attendanceStatus === 'in' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: attendanceStatus === 'in' ? '0 10px 25px -5px rgba(239, 68, 68, 0.4)' : '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {attendanceStatus === 'in' ? 'PUNCH OUT' : 'PUNCH IN'}
        </button>
      </div>
    </div>
  );

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
            <LanguageToggle />
            <ThemeToggle />
            {!isMobile && <NotificationBell onSelectComplaint={(complaint) => setSelectedComplaint(complaint)} />}

            {user?.role === 'admin' && (
              <button
                title={t('adminView')}
                onClick={() => window.location.href = '/admin'}
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: '#fff', padding: '0 12px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)', transition: 'transform 0.2s' }}
              >
                <span>👑</span>
                <span>Command Center</span>
              </button>
            )}
            {user?.role === 'contractor' && (
              <button
                onClick={() => window.location.href = '/contractor'}
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: '#fff', padding: '0 12px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)', transition: 'transform 0.2s' }}
              >
                <span>👷</span>
                <span>Contractor Hub</span>
              </button>
            )}
            {user?.role === 'regulatoryAuthority' && (
              <button
                onClick={() => window.location.href = '/regulatory-dashboard'}
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: '#fff', padding: '0 12px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)', transition: 'transform 0.2s' }}
              >
                <span>⚖️</span>
                <span>Regulatory Hub</span>
              </button>
            )}
            {/* User Avatar & Sign Out */}
            <div title={`${user.name || 'User'} (${user.role || 'Member'})`} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#fff', cursor: 'default', boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)', marginLeft: '4px' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : '⛏️'}
            </div>
          </div>
        </div>

      {isMobile && mobileView === 'menu' ? (
        renderMobileMenu()
      ) : isMobile && mobileView === 'attendance' ? (
        renderAttendanceTracker()
      ) : isMobile && (mobileView === 'gis' || mobileView === 'explore') ? (
        <MinesGISMap mode={mobileView} onBack={() => setMobileView('menu')} />
      ) : (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {isMobile && mobileView === 'form' && (
          <button onClick={() => setMobileView('menu')} style={{ marginBottom: '16px', background: 'none', border: 'none', color: theme.textPrimary, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>← Back to Menu</button>
        )}



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
          {/* Issue Type Switcher Pills */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setReportType('hazard')}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: reportType === 'hazard' ? '1px solid #f59e0b' : `1px solid ${theme.cardBorder}`,
                background: reportType === 'hazard' ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'transparent',
                color: reportType === 'hazard' ? '#ffffff' : theme.textSecondary,
                boxShadow: reportType === 'hazard' ? '0 0 15px rgba(245, 158, 11, 0.4)' : 'none'
              }}
            >
              {t('reportHazardTab')}
            </button>
            <button
              type="button"
              onClick={() => setReportType('maintenance')}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: reportType === 'maintenance' ? '1px solid #f59e0b' : `1px solid ${theme.cardBorder}`,
                background: reportType === 'maintenance' ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'transparent',
                color: reportType === 'maintenance' ? '#ffffff' : theme.textSecondary,
                boxShadow: reportType === 'maintenance' ? '0 0 15px rgba(245, 158, 11, 0.4)' : 'none'
              }}
            >
              {t('logMaintenanceTab')}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '22px' }}>{reportType === 'maintenance' ? '🔧' : '⛏️'}</span>
            <h2 className="gradient-text" style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>
              {reportType === 'maintenance' ? 'Log Heavy Machinery Servicing & Calibration' : t('raiseIssueTitle')}
            </h2>
          </div>
          <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 24px' }}>
            {reportType === 'maintenance' 
              ? 'Record scheduled engine overhaul, hydraulic line replacement, or statutory DGMS calibration certificate.'
              : t('raiseIssueSubtitle')}
          </p>

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Mine Site Selection with Cascading Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px' }}>
                🏭 {t('mineSiteLabel')}
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <select
                  value={selectedSubsidiary}
                  onChange={(e) => {
                    setSelectedSubsidiary(e.target.value);
                    setSelectedState(''); // Reset state when subsidiary changes
                  }}
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
                  <option value="" disabled>Select Subsidiary...</option>
                  {Object.keys(CIL_SUBSIDIARIES).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>

                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  required
                  disabled={!selectedSubsidiary}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    backgroundColor: !selectedSubsidiary ? 'rgba(0,0,0,0.05)' : theme.inputBg,
                    border: `1px solid ${theme.cardBorder}`,
                    color: theme.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    cursor: !selectedSubsidiary ? 'not-allowed' : 'pointer',
                    appearance: 'none',
                    boxSizing: 'border-box',
                    opacity: !selectedSubsidiary ? 0.6 : 1
                  }}
                >
                  <option value="" disabled>Select State...</option>
                  {selectedSubsidiary && CIL_SUBSIDIARIES[selectedSubsidiary].map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Operating Contractor / Mining Agency */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px' }}>
                👷 {t('contractorLabel')}
              </label>
              <select
                value={contractor}
                onChange={(e) => setContractor(e.target.value)}
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
                <option value="">{t('contractorPlaceholder')}</option>
                <option value="BGR Mining & Infra Ltd">BGR Mining & Infra Ltd (Tier-A Core Contractor)</option>
                <option value="VPR Mining Infra Projects">VPR Mining Infra Projects (Under Statutory Review)</option>
                <option value="Thriveni Earthmovers Pvt Ltd">Thriveni Earthmovers Pvt Ltd (HEMM Fleet Operator)</option>
                <option value="Gainwell Engineering">Gainwell Engineering (Ventilation & Equipment Vendor)</option>
                <option value="Direct CIL / DGMS Departmental Team">Direct CIL / DGMS Departmental Team</option>
                <option value="Other Agency">Other Sub-Contractor / Vendor</option>
              </select>
            </div>

            {/* Heavy Machinery / Equipment Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px' }}>
                🚜 {t('equipmentLabel')} {reportType === 'maintenance' && <span style={{ color: '#f59e0b' }}>* (Required for Servicing Log)</span>}
              </label>
              <select
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                required={reportType === 'maintenance'}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  backgroundColor: theme.inputBg,
                  border: reportType === 'maintenance' ? '1px solid rgba(245, 158, 11, 0.6)' : `1px solid ${theme.cardBorder}`,
                  color: theme.textPrimary,
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">{t('equipmentPlaceholder')}</option>
                <option value="Dumper D-402 (CAT 777E 100-Ton)">Dumper D-402 (CAT 777E 100-Ton - Pit 4)</option>
                <option value="Shovel S-18 (Komatsu PC2000)">Shovel S-18 (Komatsu PC2000 Hydraulic Excavator)</option>
                <option value="Ventilation Fan V-02 (Howden 500kW)">Ventilation Fan V-02 (Howden 500kW Deep Seam)</option>
                <option value="Continuous Miner CM-05 (Joy Underground)">Continuous Miner CM-05 (Joy Underground 12CM12)</option>
                <option value="Dragline DL-01 (Marion 35-Yard)">Dragline DL-01 (Marion 35-Yard)</option>
                <option value="Water Drainage High-Pressure Pump P-12">Water Drainage High-Pressure Pump P-12</option>
                <option value="Other Equipment">Other Machinery / Sensor Unit</option>
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary }}>{t('issueTitleLabel')}</label>
                
                <button
                  type="button"
                  onClick={() => ocrInputRef.current?.click()}
                  disabled={isExtractingOcr}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    color: '#3b82f6',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: isExtractingOcr ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isExtractingOcr ? 0.7 : 1
                  }}
                >
                  {isExtractingOcr ? '⏳ Scanning...' : '📷 Scan Logbook (AI OCR)'}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={ocrInputRef}
                  style={{ display: 'none' }}
                  onChange={handleOcrUpload}
                />
              </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary, margin: 0 }}>
                  {t('problemDescriptionLabel')}
                </label>

                <button
                  type="button"
                  onClick={handleToggleVoice}
                  title="Speak in Hindi or English using Web Speech API"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isListening ? '1px solid #ef4444' : '1px solid rgba(245, 158, 11, 0.4)',
                    background: isListening 
                      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.25))' 
                      : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 88, 12, 0.15))',
                    color: isListening ? '#f87171' : '#fbbf24',
                    boxShadow: isListening ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none',
                    animation: isListening ? 'pulse 1.2s infinite' : 'none'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{isListening ? '🔴' : '🎤'}</span>
                  <span>{isListening ? t('listeningState') : t('voiceInputButton')}</span>
                </button>
              </div>

              <textarea
                placeholder={t('problemDescriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', backgroundColor: theme.inputBg, border: `1px solid ${isListening ? '#f59e0b' : theme.cardBorder}`, color: theme.textPrimary, fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: theme.textMuted }}>
                  🎙️ {t('voiceHintText')}
                </span>
                {description && (
                  <span style={{ fontSize: '11px', color: theme.textMuted }}>
                    {description.length} chars
                  </span>
                )}
              </div>
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
        <div className="hide-on-mobile">
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
        </div>

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
      )}
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';

export default function InstallPwaButton({ style = {} }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install CoalGuard on your device, tap Share / Settings (⋮) in your browser and choose "Add to Home Screen" or "Install App".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) return null;

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      title="Install CoalGuard as a Native Mobile/Desktop App"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '7px 14px',
        borderRadius: '10px',
        border: '1px solid rgba(14, 165, 233, 0.3)',
        background: 'rgba(14, 165, 233, 0.1)',
        color: '#38bdf8',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(14, 165, 233, 0.2)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(14, 165, 233, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <span>📲</span>
      <span>Install App</span>
    </button>
  );
}

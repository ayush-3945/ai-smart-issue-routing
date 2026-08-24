import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ThemeToggle from '../components/ThemeToggle';
import InstallPwaButton from '../components/InstallPwaButton';
import IndiaMapDashboard from '../components/IndiaMapDashboard';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { theme } = useTheme();
  const [activeIndicator, setActiveIndicator] = useState('dmf');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 992);
    window.addEventListener('resize', handleResize);
    setIsLoggedIn(!!localStorage.getItem('accessToken'));
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  const indicatorData = {
    dmf: [
      { name: 'Till May 2018', collection: 20000, allocated: 15000, spent: 5000 },
      { name: 'Till Mar 2021', collection: 50000, allocated: 45000, spent: 20000 },
      { name: 'Till Jun 2023', collection: 80000, allocated: 70000, spent: 40000 },
      { name: 'Till Jun 2026', collection: 131067, allocated: 110000, spent: 65000 },
    ],
    production: [
      { name: '2023', target: 700, achieved: 690 },
      { name: '2024', target: 750, achieved: 780 },
      { name: '2025', target: 800, achieved: 830 },
      { name: '2026', target: 900, achieved: 880 },
    ],
    auction: [
      { name: '2023', blocks: 15, value: 5000 },
      { name: '2024', blocks: 25, value: 8500 },
      { name: '2025', blocks: 42, value: 14000 },
      { name: '2026', blocks: 68, value: 22000 },
    ]
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: theme.bg, 
      backgroundImage: theme.isDark 
        ? `linear-gradient(rgba(7, 9, 14, 0.80), rgba(7, 9, 14, 0.86)), url('/real_coal_mine_bg.jpg')` 
        : `linear-gradient(rgba(248, 250, 252, 0.76), rgba(248, 250, 252, 0.82)), url('/real_coal_mine_bg.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      color: theme.textPrimary, 
      fontFamily: "'Inter', system-ui, sans-serif", 
      overflow: 'hidden', 
      transition: 'all 0.3s ease' 
    }}>

      {/* Navbar */}
      <nav className="landing-nav" style={{ borderBottom: `1px solid ${theme.cardBorder}`, backgroundColor: theme.navBg, position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="landing-nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '7px 10px', borderRadius: '10px', fontSize: '16px', color: '#fff', boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)' }}>⛏️</div>
          <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', color: theme.textPrimary }}>CoalDarpan</span>
        </div>
        
        {/* Navigation Links - Centered like Government Portal */}
        <div className="hide-on-mobile" style={{ display: 'flex', gap: '28px', alignItems: 'center', margin: '0 auto' }}>
          <a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about').scrollIntoView({ behavior: 'smooth' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: theme.textPrimary, textDecoration: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2563eb' }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </a>
          <a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about').scrollIntoView({ behavior: 'smooth' }); }} style={{ color: theme.textPrimary, textDecoration: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            About Us <span style={{ fontSize: '10px', color: theme.textMuted }}>▼</span>
          </a>
          <a href="#gallery" onClick={(e) => { e.preventDefault(); document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' }); }} style={{ color: theme.textPrimary, textDecoration: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Surveillance <span style={{ fontSize: '10px', color: theme.textMuted }}>▼</span>
          </a>
          <a href="#key-indicators" onClick={(e) => { e.preventDefault(); document.getElementById('key-indicators').scrollIntoView({ behavior: 'smooth' }); }} style={{ color: theme.textPrimary, textDecoration: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Key Indicators <span style={{ fontSize: '10px', color: theme.textMuted }}>▼</span>
          </a>
          <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features').scrollIntoView({ behavior: 'smooth' }); }} style={{ color: theme.textPrimary, textDecoration: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Features <span style={{ fontSize: '10px', color: theme.textMuted }}>▼</span>
          </a>
          <a href="#map" onClick={(e) => { e.preventDefault(); document.getElementById('map').scrollIntoView({ behavior: 'smooth' }); }} style={{ color: theme.textPrimary, textDecoration: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Geospatial Map <span style={{ fontSize: '10px', color: theme.textMuted }}>▼</span>
          </a>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <InstallPwaButton />
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <button onClick={handleLogout} className="nav-btn-compact" style={{ padding: '10px 24px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', transition: 'all 0.2s' }}>
                Sign Off
              </button>
              <Link to="/login" className="nav-btn-compact" style={{ padding: '10px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', textDecoration: 'none', fontWeight: '700', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)', display: 'inline-flex', alignItems: 'center' }}>
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="nav-btn-compact" style={{ padding: '10px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', textDecoration: 'none', fontWeight: '700', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)', display: 'inline-flex', alignItems: 'center' }}>
                Field Portal
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="about" style={{ 
        position: 'relative', 
        padding: '120px 20px 80px', 
        width: '100%',
        backgroundImage: `linear-gradient(to bottom, ${theme.isDark ? 'rgba(11, 14, 22, 0.4)' : 'rgba(255, 255, 255, 0.5)'}, ${theme.isDark ? 'rgba(11, 14, 22, 0.85)' : 'rgba(255, 255, 255, 0.9)'}), url('https://upload.wikimedia.org/wikipedia/commons/8/89/Coal_mine_in_West_bengal.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        <div className="mobile-full-width" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Ambient Glow */}
          <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(245, 158, 11, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

        <h1 style={{ fontSize: 'clamp(28px, 4.2vw, 50px)', fontWeight: '900', lineHeight: 1.2, letterSpacing: '-0.03em', margin: '0 0 20px', color: theme.textPrimary }}>
          AI-Powered Smart Governance <br />
          <span style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: theme.isDark ? 'drop-shadow(0 0 35px rgba(245, 158, 11, 0.35))' : 'none' }}>
            & Compliance for Coal Mines
          </span>
        </h1>

        <p style={{ fontSize: '18px', color: theme.textSecondary, lineHeight: 1.7, maxWidth: '720px', margin: '0 auto 44px', fontWeight: '400', letterSpacing: '-0.01em' }}>
          Centralized AI-enabled operations hub digitizing statutory compliance, real-time pit inspection tracking, geo-tagged hazard reporting, and predictive surge forecasting across Indian coalfields.
        </p>

        <div className="mobile-col" style={{ display: 'flex', gap: '18px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard" style={{ padding: '16px 38px', borderRadius: '16px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: '800', letterSpacing: '-0.02em', boxShadow: '0 15px 35px -5px rgba(245, 158, 11, 0.4), 0 0 20px rgba(217, 119, 6, 0.2)', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Report Field Observation ➔
          </Link>
          <Link to="/admin" style={{ padding: '16px 38px', borderRadius: '16px', border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary, textDecoration: 'none', fontSize: '16px', fontWeight: '700', letterSpacing: '-0.02em', backgroundColor: theme.isDark ? 'rgba(15, 17, 26, 0.8)' : '#ffffff', backdropFilter: 'blur(12px)', transition: 'all 0.2s ease', boxShadow: theme.isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.06)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.isDark ? 'rgba(25, 29, 45, 0.9)' : '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.isDark ? 'rgba(15, 17, 26, 0.8)' : '#ffffff'}
          >
            Operations Command Center
          </Link>
        </div>

        {/* Trust badges */}
        <div style={{ marginTop: '48px', display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', opacity: 0.85 }}>
          <span style={{ fontSize: '13px', color: theme.textSecondary, fontWeight: '700' }}>🛡️ Role-Based Secure Access</span>
          <span style={{ fontSize: '13px', color: theme.textSecondary, fontWeight: '700' }}>📍 Geo-Tagged Field Reporting</span>
          <span style={{ fontSize: '13px', color: theme.textSecondary, fontWeight: '700' }}>⚡ Real-Time Risk Alerts</span>
        </div>

        {/* Indian Mines Photo Gallery Section */}
        <div id="gallery" className="mobile-full-width" style={{ marginTop: '56px', width: '100%', maxWidth: '1000px', margin: '56px auto 0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: theme.textPrimary, marginBottom: '24px', textAlign: 'center' }}>
            Active Surveillance Zones
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            
            {/* Image Card 1 */}
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: `1px solid ${theme.cardBorder}` }}
                 onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(245, 158, 11, 0.2)'; }}
                 onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)'; }}
                 style={{ transition: 'all 0.3s ease', position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: `1px solid ${theme.cardBorder}` }}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Coal_mine_in_West_bengal.jpg" alt="Jharia Open-Cast Mine" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 20px 16px', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)', textAlign: 'left', pointerEvents: 'none' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '4px 10px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                  📍 OPEN-CAST
                </span>
                <h3 style={{ margin: '8px 0 0', color: '#fff', fontSize: '16px', fontWeight: '700' }}>Jharia Colliery</h3>
              </div>
            </div>

            {/* Image Card 2 */}
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: `1px solid ${theme.cardBorder}` }}
                 onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.2)'; }}
                 onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)'; }}
                 style={{ transition: 'all 0.3s ease', position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: `1px solid ${theme.cardBorder}` }}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/ee/Coal_mines_in_singrauli.jpg" alt="Underground Coal Seam" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 20px 16px', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)', textAlign: 'left', pointerEvents: 'none' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '4px 10px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                  📍 UNDERGROUND
                </span>
                <h3 style={{ margin: '8px 0 0', color: '#fff', fontSize: '16px', fontWeight: '700' }}>Raniganj Deep Seam</h3>
              </div>
            </div>

            {/* Image Card 3 */}
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: `1px solid ${theme.cardBorder}` }}
                 onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(56, 189, 248, 0.2)'; }}
                 onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)'; }}
                 style={{ transition: 'all 0.3s ease', position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: `1px solid ${theme.cardBorder}` }}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fb/GEVRA_DUMPERS.jpg" alt="Coal Processing Plant" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 20px 16px', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)', textAlign: 'left', pointerEvents: 'none' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.2)', padding: '4px 10px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                  📍 INFRASTRUCTURE
                </span>
                <h3 style={{ margin: '8px 0 0', color: '#fff', fontSize: '16px', fontWeight: '700' }}>Korba West Washery</h3>
              </div>
            </div>

            {/* Image Card 4 */}
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: `1px solid ${theme.cardBorder}` }}
                 onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(168, 85, 247, 0.2)'; }}
                 onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)'; }}
                 style={{ transition: 'all 0.3s ease', position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: `1px solid ${theme.cardBorder}` }}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/92/Open_%28visible%29_Coal_Mines.jpg" alt="Night Shift Mine Operations" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 20px 16px', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)', textAlign: 'left', pointerEvents: 'none' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#c084fc', backgroundColor: 'rgba(168, 85, 247, 0.2)', padding: '4px 10px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                  📍 NIGHT OPS
                </span>
                <h3 style={{ margin: '8px 0 0', color: '#fff', fontSize: '16px', fontWeight: '700' }}>Bokaro Pit-B (Night)</h3>
              </div>
            </div>

            {/* Image Card 5 */}
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: `1px solid ${theme.cardBorder}` }}
                 onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(245, 158, 11, 0.2)'; }}
                 onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)'; }}
                 style={{ transition: 'all 0.3s ease', position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: `1px solid ${theme.cardBorder}` }}
            >
              <img src="/images/coal-transport.jpg" alt="Coal Transport" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 20px 16px', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)', textAlign: 'left', pointerEvents: 'none' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '4px 10px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                  📍 TRANSPORT
                </span>
                <h3 style={{ margin: '8px 0 0', color: '#fff', fontSize: '16px', fontWeight: '700' }}>Talcher Coalfields</h3>
              </div>
            </div>

            {/* Image Card 6 */}
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: `1px solid ${theme.cardBorder}` }}
                 onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(239, 68, 68, 0.2)'; }}
                 onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)'; }}
                 style={{ transition: 'all 0.3s ease', position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: `1px solid ${theme.cardBorder}` }}
            >
              <img src="/images/heavy-excavation.jpg" alt="Heavy Excavation" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 20px 16px', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)', textAlign: 'left', pointerEvents: 'none' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: '4px 10px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                  📍 EXCAVATION
                </span>
                <h3 style={{ margin: '8px 0 0', color: '#fff', fontSize: '16px', fontWeight: '700' }}>Singrauli Northern</h3>
              </div>
            </div>

          </div>
        </div>

        {/* Linear/Reflect Style 3D Holographic App Window Showcase */}
        <div style={{
          marginTop: '64px',
          position: 'relative',
          borderRadius: '24px',
          padding: '12px',
          background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.1) 50%, rgba(0, 0, 0, 0.85) 100%)',
          boxShadow: '0 30px 100px -20px rgba(245, 158, 11, 0.35), 0 0 50px rgba(217, 119, 6, 0.15)'
        }}>
          {/* Cyan/Gold Event Horizon Halo Glow */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '140px',
            background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.4) 0%, rgba(217, 119, 6, 0.2) 40%, transparent 80%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
            zIndex: 0
          }}></div>

          <div style={{
            position: 'relative',
            borderRadius: '18px',
            overflow: 'hidden',
            backgroundColor: '#07090e',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 1
          }}>
            {/* Window Top Header Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              backgroundColor: 'rgba(11, 14, 22, 0.95)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>
                coaldarpan.dgms.gov.in • Live Surveillance Command
              </span>
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: '800' }}>
                ● 4 COALFIELDS ONLINE
              </span>
            </div>

            {/* Mock Dashboard Preview Content */}
            <div style={{ padding: '24px', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'rgba(18, 23, 36, 0.8)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>INSPECTIONS LOGGED</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', marginTop: '4px' }}>1,842</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'rgba(18, 23, 36, 0.8)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <span style={{ fontSize: '11px', color: '#10b981', textTransform: 'uppercase', fontWeight: '700' }}>DGMS COMPLIANCE</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>98.7%</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'rgba(18, 23, 36, 0.8)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <span style={{ fontSize: '11px', color: '#f87171', textTransform: 'uppercase', fontWeight: '700' }}>AVG HAZARD TRIAGE</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#f87171', marginTop: '4px' }}>1.4 Secs</div>
                </div>
              </div>

              {/* Sample High-Priority AI Incident Pill */}
              <div style={{ padding: '14px 18px', borderRadius: '14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#f8fafc' }}>
                    🚨 Methane Gas Spike (&gt;1.4%) Detected at Jharia Pit-4 • Auto-routed to DGMS Safety Controller (Rajesh Kumar)
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Gemini AI generated 3-step evacuation & auxiliary ventilation SOP in 1.4s
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#ffffff' }}>
                  CRITICAL HAZARD ⚡
                </span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ display: 'flex', justifyContent: 'center', gap: '48px', padding: '40px 48px', borderTop: `1px solid ${theme.cardBorder}`, borderBottom: `1px solid ${theme.cardBorder}`, flexWrap: 'wrap', backgroundColor: theme.cardBg }}>
        {[
          { value: '98%+', label: 'DGMS Statutory Precision' },
          { value: '<2s', label: 'Hazard Triage & SOP Generation' },
          { value: '100%', label: 'Geo-Tagged Satellite Pit Logging' },
          { value: '24/7', label: 'Real-Time Telemetry & WebSockets' },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 4px', background: 'linear-gradient(135deg, #fbbf24, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</p>
            <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0, fontWeight: '600' }}>{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Key Indicators Interactive Dashboard */}
      <section id="key-indicators" style={{ position: 'relative', padding: '80px 20px', margin: '0 auto', borderBottom: `1px solid ${theme.cardBorder}`, overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 12px', color: theme.textPrimary, letterSpacing: '-0.5px' }}>
              Key Analytics <span style={{ color: '#f59e0b' }}>&amp; Indicators</span>
            </h2>
            <p style={{ color: theme.textSecondary, fontSize: '16px', margin: 0 }}>Real-time statistics for DMF funds and mineral production.</p>
          </div>

          <div style={{ display: 'flex', gap: '40px', flexDirection: isMobile ? 'column' : 'row' }}>
          {/* Sidebar Tabs */}
          <div style={{ flex: '1', width: isMobile ? '100%' : '300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'dmf', label: 'DMF Fund Status' },
              { id: 'production', label: 'Mineral Production' },
              { id: 'auction', label: 'Auction' },
              { id: 'exploration', label: 'Exploration' },
              { id: 'nmedt', label: 'NMEDT' },
            ].map((tab, idx) => {
              const isActive = activeIndicator === tab.id;
              return (
                <div 
                  key={tab.id}
                  onClick={() => setActiveIndicator(tab.id)}
                  style={{ 
                    padding: '14px 16px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderRadius: '16px',
                    border: isActive 
                      ? (theme.isDark ? '1.5px solid #38bdf8' : '1.5px solid #2563eb') 
                      : `1px solid ${theme.cardBorder}`,
                    backgroundColor: isActive 
                      ? (theme.isDark ? 'rgba(30, 41, 59, 0.95)' : '#ffffff') 
                      : (theme.isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.85)'),
                    boxShadow: isActive 
                      ? (theme.isDark ? '0 8px 24px -4px rgba(56, 189, 248, 0.2)' : '0 10px 25px -5px rgba(37, 99, 235, 0.15)') 
                      : (theme.isDark ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)'),
                    color: isActive ? theme.textPrimary : theme.textSecondary,
                    fontWeight: isActive ? '700' : '600',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '38px', height: '38px', borderRadius: '10px', 
                      backgroundColor: isActive 
                        ? (theme.isDark ? '#0284c7' : '#1e3a8a') 
                        : (theme.isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isActive ? '#fff' : theme.textMuted,
                      fontSize: '18px'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <span style={{ fontSize: '15px' }}>{tab.label}</span>
                  </div>
                  {isActive && <span style={{ color: theme.isDark ? '#38bdf8' : '#2563eb', fontWeight: '800' }}>➔</span>}
                </div>
              );
            })}
          </div>

          {/* Chart Container */}
          <div style={{ 
            flex: '3', width: isMobile ? '100%' : 'calc(100% - 340px)', height: '460px', 
            background: theme.isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px', 
            padding: '32px',
            position: 'relative',
            boxShadow: theme.isDark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 20px 40px -10px rgba(0,0,0,0.1)',
            border: `1px solid ${theme.cardBorder}`,
          }}>
            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: `1px solid ${theme.cardBorder}`, paddingBottom: '16px' }}>
                <h3 style={{ margin: '0', fontSize: '20px', color: theme.textPrimary, fontWeight: '700' }}>
                  {activeIndicator === 'dmf' ? 'DMF Fund Status' : activeIndicator === 'production' ? 'Mineral Production' : activeIndicator === 'auction' ? 'Auction' : activeIndicator === 'exploration' ? 'Exploration' : 'NMEDT'}
                </h3>
                <span style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: '500', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', padding: '6px 12px', borderRadius: '20px' }}>
                  {activeIndicator === 'dmf' ? 'Till Jun 2026' : activeIndicator === 'production' ? '2026 Target' : activeIndicator === 'auction' ? 'Blocks' : activeIndicator === 'exploration' ? 'Analytics' : 'Trust Fund'}
                </span>
              </div>
              
              <div style={{ flex: 1, position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontSize: '12px', fontWeight: '700', color: theme.textSecondary, whiteSpace: 'nowrap' }}>
                  Amount (in Cr.)
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={
                    activeIndicator === 'dmf' ? [
                      { name: 'Till May 18', collection: 18000, allocated: 12000, spent: 5000 },
                      { name: 'Till Mar 19', collection: 25000, allocated: 22000, spent: 8000 },
                      { name: 'Till Mar 20', collection: 35000, allocated: 30000, spent: 12000 },
                      { name: 'Till Mar 21', collection: 48000, allocated: 45000, spent: 22000 },
                      { name: 'Till Mar 22', collection: 62000, allocated: 55000, spent: 30000 },
                      { name: 'Till Jun 23', collection: 80000, allocated: 72000, spent: 42000 },
                      { name: 'Till Aug 24', collection: 85000, allocated: 78000, spent: 45000 },
                      { name: 'Till Nov 25', collection: 125000, allocated: 105000, spent: 65000 },
                      { name: 'Till Jun 26', collection: 135000, allocated: 110000, spent: 70000 },
                    ] : activeIndicator === 'production' ? [
                      { name: '2023', target: 700, achieved: 690 },
                      { name: '2024', target: 750, achieved: 780 },
                      { name: '2025', target: 800, achieved: 830 },
                      { name: '2026', target: 900, achieved: 880 },
                    ] : activeIndicator === 'auction' ? [
                      { name: '2023', blocks: 15, value: 5000 },
                      { name: '2024', blocks: 25, value: 8500 },
                      { name: '2025', blocks: 42, value: 14000 },
                      { name: '2026', blocks: 68, value: 22000 },
                    ] : activeIndicator === 'exploration' ? [
                      { name: '2023', surveyed: 120, drilled: 45 },
                      { name: '2024', surveyed: 150, drilled: 60 },
                      { name: '2025', surveyed: 190, drilled: 85 },
                      { name: '2026', surveyed: 240, drilled: 110 },
                    ] : [
                      { name: '2023', allocated: 250, disbursed: 180 },
                      { name: '2024', allocated: 320, disbursed: 240 },
                      { name: '2025', allocated: 410, disbursed: 310 },
                      { name: '2026', allocated: 500, disbursed: 420 },
                    ]
                  } margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <defs>
                      <linearGradient id="color1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0.9}/>
                      </linearGradient>
                      <linearGradient id="color2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.9}/>
                      </linearGradient>
                      <linearGradient id="color3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.9}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.isDark ? '#334155' : '#f1f5f9'} vertical={false} />
                    <XAxis dataKey="name" stroke={theme.textSecondary} fontSize={12} tickMargin={10} axisLine={false} tickLine={false} fontWeight="600" />
                    <YAxis stroke={theme.textSecondary} fontSize={12} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} axisLine={false} tickLine={false} fontWeight="600" />
                    <Tooltip 
                      cursor={{fill: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}}
                      contentStyle={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '12px', color: theme.textPrimary, padding: '12px 16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} 
                      itemStyle={{ fontSize: '13px', fontWeight: '700' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px', color: theme.textPrimary, fontWeight: '600' }} iconType="circle" iconSize={12} />
                    {activeIndicator === 'dmf' && (
                      <>
                        <Bar dataKey="collection" name="DMF Collection" fill="url(#color1)" radius={[6, 6, 0, 0]} barSize={20} />
                        <Bar dataKey="allocated" name="Amount Allocated" fill="url(#color2)" radius={[6, 6, 0, 0]} barSize={20} />
                        <Bar dataKey="spent" name="Amount Spent" fill="url(#color3)" radius={[6, 6, 0, 0]} barSize={20} />
                      </>
                    )}
                    {activeIndicator === 'production' && (
                      <>
                        <Bar dataKey="target" name="Target (MT)" fill="url(#color1)" radius={[8, 8, 0, 0]} barSize={32} />
                        <Bar dataKey="achieved" name="Achieved (MT)" fill="url(#color3)" radius={[8, 8, 0, 0]} barSize={32} />
                      </>
                    )}
                    {activeIndicator === 'auction' && (
                      <>
                        <Bar dataKey="blocks" name="Blocks Auctioned" fill="url(#color1)" radius={[8, 8, 0, 0]} barSize={32} />
                        <Bar dataKey="value" name="Value (Cr.)" fill="url(#color2)" radius={[8, 8, 0, 0]} barSize={32} />
                      </>
                    )}
                    {activeIndicator === 'exploration' && (
                      <>
                        <Bar dataKey="surveyed" name="Surveyed Area" fill="url(#color1)" radius={[8, 8, 0, 0]} barSize={32} />
                        <Bar dataKey="drilled" name="Boreholes Drilled" fill="url(#color2)" radius={[8, 8, 0, 0]} barSize={32} />
                      </>
                    )}
                    {activeIndicator === 'nmedt' && (
                      <>
                        <Bar dataKey="allocated" name="Funds Allocated" fill="url(#color1)" radius={[8, 8, 0, 0]} barSize={32} />
                        <Bar dataKey="disbursed" name="Funds Disbursed" fill="url(#color3)" radius={[8, 8, 0, 0]} barSize={32} />
                      </>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Interactive India Map Dashboard */}
      <div id="map">
        <IndiaMapDashboard />
      </div>

      {/* Features Grid */}
      <section id="features" style={{ padding: '80px 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 12px', letterSpacing: '-0.5px', color: theme.textPrimary }}>
            Engineered for <span style={{ color: '#f59e0b' }}>Indian Coal Mining Operations</span>
          </h2>
          <p style={{ color: theme.textSecondary, fontSize: '16px', margin: 0 }}>End-to-end statutory compliance, ground surveillance, and AI hazard prediction.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {[
            { icon: '🦺', title: 'Autonomous DGMS Hazard Triage', desc: 'Gemini 1.5 Flash auto-classifies violations into Safety, Environment, Machinery, and Labour with immediate 3-step containment SOPs.' },
            { icon: '📍', title: 'Geo-Tagged Pit Precision', desc: 'Time-stamped GPS coordinate logging and satellite map pinning for underground shafts, haul roads, and overburden dumps.' },
            { icon: '🔮', title: '7-Day Predictive Risk Surge', desc: 'In-memory cached AI forecaster projecting upcoming hazard spikes and compliance bottlenecks in mining blocks.' },
            { icon: '⚡', title: 'Real-Time Incident WebSockets', desc: 'Bi-directional Socket.io communication enabling instant live chat between field safety inspectors and Mine General Managers.' },
            { icon: '📱', title: 'Bilingual Field Mobile PWA', desc: 'Offline-capable, 1-click installable mobile PWA supporting native Hindi and English for ground mine workers.' },
            { icon: '📜', title: 'Paperless Statutory CSV Audit', desc: 'One-click automated export of complete time-stamped inspection records, GPS tags, and resolution logs for DGMS compliance audits.' },
          ].map((feature, i) => (
            <div key={i} style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', padding: '32px', transition: 'transform 0.2s, border-color 0.2s', cursor: 'default', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = theme.cardBorder; }}
            >
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 10px', color: theme.textPrimary }}>{feature.title}</h3>
              <p style={{ fontSize: '14px', color: theme.textSecondary, margin: 0, lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ padding: '60px 20px', borderTop: `1px solid ${theme.cardBorder}`, textAlign: 'center' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '24px' }}>Enterprise Industrial Tech Architecture</h3>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['React 19', 'Node.js', 'Express.js', 'MongoDB Atlas', 'Google Gemini AI', 'Socket.io', 'Recharts', 'Geolocation API', 'Cloudinary CDN', 'Mobile PWA', 'Vercel / Cloud'].map((tech, i) => (
            <span key={i} style={{ 
              padding: '8px 18px', 
              borderRadius: '12px', 
              backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.85)' : '#ffffff', 
              border: '1.5px solid rgba(245, 158, 11, 0.4)', 
              color: '#d97706', 
              fontSize: '13px', 
              fontWeight: '700',
              boxShadow: theme.isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
              backdropFilter: 'blur(10px)'
            }}>
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '300px', background: 'radial-gradient(ellipse, rgba(245, 158, 11, 0.12) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        
        <h2 style={{ fontSize: '40px', fontWeight: '900', margin: '0 0 16px', letterSpacing: '-1px', color: theme.textPrimary }}>
          Modernize Coal Mining Governance <br />
          <span style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>with Autonomous AI</span>
        </h2>
        <p style={{ color: theme.textSecondary, fontSize: '16px', marginBottom: '32px' }}>Zero manual paperwork. Instant DGMS compliance enforcement.</p>
        <Link to="/dashboard" style={{ padding: '18px 48px', borderRadius: '14px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', textDecoration: 'none', fontSize: '17px', fontWeight: '700', boxShadow: '0 16px 40px rgba(245, 158, 11, 0.4)', display: 'inline-block' }}>
          Open Field Portal ➔
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 20px', borderTop: `1px solid ${theme.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>⛏️</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textMuted }}>CoalDarpan</span>
        </div>
        <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0 }}>
          Autonomous AI Smart Governance & Compliance Monitoring System • © 2026
        </p>
      </footer>

    </div>
  );
};

export default LandingPage;
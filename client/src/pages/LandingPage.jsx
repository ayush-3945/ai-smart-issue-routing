import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { theme } = useTheme();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.bg, color: theme.textPrimary, fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden', transition: 'all 0.3s ease' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: `1px solid ${theme.cardBorder}`, position: 'sticky', top: 0, backgroundColor: theme.navBg, backdropFilter: 'blur(16px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '8px 12px', borderRadius: '12px', fontSize: '18px', color: '#fff' }}>⚡</div>
          <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', color: theme.textPrimary }}>SmartIssue</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ThemeToggle />
          <Link to="/login" style={{ padding: '10px 24px', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary, textDecoration: 'none', fontSize: '14px', fontWeight: '600', backgroundColor: theme.badgeBg }}>
            Sign In
          </Link>
          <Link to="/register" style={{ padding: '10px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: '700', boxShadow: '0 8px 20px rgba(99,102,241,0.35)' }}>
            Get Started Free ➔
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '100px 48px 80px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        {/* Ambient Glow */}
        <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '30px', backgroundColor: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '13px', fontWeight: '700', color: '#818cf8', marginBottom: '28px', boxShadow: '0 0 20px -5px rgba(99, 102, 241, 0.3)' }}>
          <span>⚡</span> Autonomous Incident Intelligence & Triage Engine
        </div>

        <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: '900', lineHeight: 1.05, letterSpacing: '-0.04em', margin: '0 0 24px', color: theme.textPrimary }}>
          Resolve Issues <br />
          <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 40%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: theme.isDark ? 'drop-shadow(0 0 35px rgba(139, 92, 246, 0.4))' : 'none' }}>
            Before They Escalate
          </span>
        </h1>

        <p style={{ fontSize: '19px', color: theme.textSecondary, lineHeight: 1.7, maxWidth: '640px', margin: '0 auto 44px', fontWeight: '400', letterSpacing: '-0.01em' }}>
          AI-powered autonomous incident routing that automatically classifies, prioritizes, and assigns complaints to the right lead — in seconds, not days.
        </p>

        <div style={{ display: 'flex', gap: '18px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ padding: '16px 38px', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: '800', letterSpacing: '-0.02em', boxShadow: '0 15px 35px -5px rgba(139, 92, 246, 0.5), 0 0 20px rgba(99, 102, 241, 0.3)', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Start Routing Issues ➔
          </Link>
          <Link to="/login" style={{ padding: '16px 38px', borderRadius: '16px', border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary, textDecoration: 'none', fontSize: '16px', fontWeight: '700', letterSpacing: '-0.02em', backgroundColor: theme.isDark ? 'rgba(15, 17, 26, 0.8)' : '#ffffff', backdropFilter: 'blur(12px)', transition: 'all 0.2s ease', boxShadow: theme.isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.06)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.isDark ? 'rgba(25, 29, 45, 0.9)' : '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.isDark ? 'rgba(15, 17, 26, 0.8)' : '#ffffff'}
          >
            View Live Demo
          </Link>
        </div>

        {/* Trust badges */}
        <div style={{ marginTop: '48px', display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', opacity: 0.85 }}>
          <span style={{ fontSize: '13px', color: theme.textSecondary, fontWeight: '700' }}>🔒 Enterprise-Grade Security</span>
          <span style={{ fontSize: '13px', color: theme.textSecondary, fontWeight: '700' }}>⚡ Real-Time WebSockets</span>
          <span style={{ fontSize: '13px', color: theme.textSecondary, fontWeight: '700' }}>🧠 98% AI Diagnostic Precision</span>
        </div>

        {/* Linear/Reflect Style 3D Holographic App Window Showcase */}
        <div style={{
          marginTop: '64px',
          position: 'relative',
          borderRadius: '24px',
          padding: '12px',
          background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.4) 0%, rgba(6, 182, 212, 0.1) 50%, rgba(0, 0, 0, 0.8) 100%)',
          boxShadow: '0 30px 100px -20px rgba(139, 92, 246, 0.5), 0 0 50px rgba(6, 182, 212, 0.2)'
        }}>
          {/* Black Hole Event Horizon Halo Glow */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '140px',
            background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.6) 0%, rgba(6, 182, 212, 0.3) 40%, transparent 80%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
            zIndex: 0
          }}></div>

          <div style={{
            position: 'relative',
            borderRadius: '18px',
            overflow: 'hidden',
            backgroundColor: '#07090e',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            zIndex: 1
          }}>
            {/* Window Top Header Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              backgroundColor: 'rgba(15, 17, 26, 0.9)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>
                app.smartissue.ai • Live Command Hub
              </span>
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: '800' }}>
                ● SYSTEM OPERATIONAL
              </span>
            </div>

            {/* Mock Dashboard Preview Content */}
            <div style={{ padding: '24px', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'rgba(18, 21, 33, 0.8)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>TOTAL TICKETS</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', marginTop: '4px' }}>1,482</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'rgba(18, 21, 33, 0.8)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <span style={{ fontSize: '11px', color: '#10b981', textTransform: 'uppercase', fontWeight: '700' }}>AI ACCURACY</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>98.4%</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'rgba(18, 21, 33, 0.8)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                  <span style={{ fontSize: '11px', color: '#38bdf8', textTransform: 'uppercase', fontWeight: '700' }}>AVG RESOLUTION</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#38bdf8', marginTop: '4px' }}>12 Mins</div>
                </div>
              </div>

              {/* Sample High-Priority AI Incident Pill */}
              <div style={{ padding: '14px 18px', borderRadius: '14px', backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#f8fafc' }}>
                    🚨 Payment Webhook Spike Detected • Routing to Vikram Sharma (IT Lead)
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Autonomous AI Engine generated 3-step action plan in 1.4s
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', backgroundColor: '#8b5cf6', color: '#ffffff' }}>
                  AUTO-RESOLVING ⚡
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ display: 'flex', justifyContent: 'center', gap: '48px', padding: '40px 48px', borderTop: `1px solid ${theme.cardBorder}`, borderBottom: `1px solid ${theme.cardBorder}`, flexWrap: 'wrap', backgroundColor: theme.cardBg }}>
        {[
          { value: '95%+', label: 'AI Classification Accuracy' },
          { value: '<2s', label: 'Avg. Routing Time' },
          { value: '5x', label: 'Faster Resolution' },
          { value: '24/7', label: 'Autonomous Processing' },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 4px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</p>
            <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0, fontWeight: '600' }}>{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Features Grid */}
      <section style={{ padding: '80px 48px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 12px', letterSpacing: '-0.5px', color: theme.textPrimary }}>
            Everything You Need to <span style={{ color: '#6366f1' }}>Automate Support</span>
          </h2>
          <p style={{ color: theme.textSecondary, fontSize: '16px', margin: 0 }}>From issue intake to resolution — powered by AI at every step.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {[
            { icon: '🧠', title: 'Gemini AI Classification', desc: 'Automatically categorizes issues into IT, HR, Finance, Operations with 95%+ accuracy and confidence scores.' },
            { icon: '⚡', title: 'Instant Priority Detection', desc: 'AI assigns Critical, High, Medium, or Low priority based on urgency keywords and context analysis.' },
            { icon: '📊', title: 'Real-Time Analytics', desc: 'Interactive Recharts dashboard with category distribution, priority breakdown, and 7-day velocity trends.' },
            { icon: '🔔', title: 'Email Notifications', desc: 'Automatic Nodemailer alerts when issues are created, status changes, or require urgent attention.' },
            { icon: '🔄', title: 'AI Feedback Loop', desc: 'Admins can reclassify AI decisions, improving accuracy over time with human-in-the-loop correction.' },
            { icon: '🔒', title: 'Enterprise Security', desc: 'Helmet CSP, rate limiting, NoSQL injection protection, JWT auth with refresh token rotation.' },
          ].map((feature, i) => (
            <div key={i} style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', padding: '32px', transition: 'transform 0.2s, border-color 0.2s', cursor: 'default', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = theme.cardBorder; }}
            >
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 10px', color: theme.textPrimary }}>{feature.title}</h3>
              <p style={{ fontSize: '14px', color: theme.textSecondary, margin: 0, lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 48px', borderTop: `1px solid ${theme.cardBorder}`, maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 12px', letterSpacing: '-0.5px', color: theme.textPrimary }}>
            How It <span style={{ color: '#a855f7' }}>Works</span>
          </h2>
          <p style={{ color: theme.textSecondary, fontSize: '16px', margin: 0 }}>Three steps. Zero manual sorting.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {[
            { step: '01', title: 'User Submits Issue', desc: 'Employee describes the problem in natural language. Optional screenshot attachment via Cloudinary.' },
            { step: '02', title: 'AI Analyzes & Routes', desc: 'Google Gemini AI instantly classifies category, assigns priority, generates executive summary with confidence score.' },
            { step: '03', title: 'Admin Resolves & Tracks', desc: 'Admin dashboard shows live analytics, manages lifecycle (Pending → In Progress → Resolved), triggers email alerts.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '28px 32px', backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ minWidth: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', fontSize: '20px', fontWeight: '900', color: '#fff' }}>
                {item.step}
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: theme.textPrimary }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: theme.textSecondary, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ padding: '60px 48px', borderTop: `1px solid ${theme.cardBorder}`, textAlign: 'center' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '24px' }}>Built With Modern Tech Stack</h3>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Socket.io', 'Recharts', 'Cloudinary', 'JWT Auth', 'Railway', 'Vercel'].map((tech, i) => (
            <span key={i} style={{ padding: '8px 18px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#6366f1', fontSize: '13px', fontWeight: '600' }}>
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 48px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '300px', background: 'radial-gradient(ellipse, rgba(168,85,247,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        
        <h2 style={{ fontSize: '40px', fontWeight: '900', margin: '0 0 16px', letterSpacing: '-1px', color: theme.textPrimary }}>
          Ready to <span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Automate</span> Your Workflow?
        </h2>
        <p style={{ color: theme.textSecondary, fontSize: '16px', marginBottom: '32px' }}>Start routing issues with AI in under 60 seconds.</p>
        <Link to="/register" style={{ padding: '18px 48px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', textDecoration: 'none', fontSize: '17px', fontWeight: '700', boxShadow: '0 16px 40px rgba(99,102,241,0.4)', display: 'inline-block' }}>
          Get Started Free ➔
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 48px', borderTop: `1px solid ${theme.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>⚡</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textMuted }}>SmartIssue AI</span>
        </div>
        <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0 }}>
          Built with ❤️ by Ayush Pandey • © 2026
        </p>
      </footer>

    </div>
  );
};

export default LandingPage;
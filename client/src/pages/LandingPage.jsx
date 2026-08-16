import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, backgroundColor: 'rgba(9,13,22,0.85)', backdropFilter: 'blur(16px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '8px 12px', borderRadius: '12px', fontSize: '18px' }}>⚡</div>
          <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>SmartIssue</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login" style={{ padding: '10px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
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

        <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '20px', backgroundColor: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', fontSize: '13px', fontWeight: '600', color: '#818cf8', marginBottom: '24px' }}>
          🤖 Powered by Google Gemini AI
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '900', lineHeight: 1.1, letterSpacing: '-1.5px', margin: '0 0 20px', color: '#ffffff' }}>
          Resolve Issues <br />
          <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Before They Escalate
          </span>
        </h1>

        <p style={{ fontSize: '18px', color: '#94a3b8', lineHeight: 1.7, maxWidth: '620px', margin: '0 auto 40px' }}>
          AI-powered issue routing that automatically classifies, prioritizes, and assigns complaints to the right team — in seconds, not days.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ padding: '16px 36px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: '700', boxShadow: '0 12px 32px rgba(99,102,241,0.4)', transition: 'transform 0.2s' }}>
            Start Routing Issues ➔
          </Link>
          <Link to="/login" style={{ padding: '16px 36px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', textDecoration: 'none', fontSize: '16px', fontWeight: '600', backgroundColor: 'rgba(255,255,255,0.03)' }}>
            View Live Demo
          </Link>
        </div>

        {/* Trust badges */}
        <div style={{ marginTop: '48px', display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', opacity: 0.5 }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>🔒 Enterprise-Grade Security</span>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>⚡ Real-Time Processing</span>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>🧠 95%+ AI Accuracy</span>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ display: 'flex', justifyContent: 'center', gap: '48px', padding: '40px 48px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
        {[
          { value: '95%+', label: 'AI Classification Accuracy' },
          { value: '<2s', label: 'Avg. Routing Time' },
          { value: '5x', label: 'Faster Resolution' },
          { value: '24/7', label: 'Autonomous Processing' },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 4px', background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: '600' }}>{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Features Grid */}
      <section style={{ padding: '80px 48px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            Everything You Need to <span style={{ color: '#818cf8' }}>Automate Support</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>From issue intake to resolution — powered by AI at every step.</p>
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
            <div key={i} style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '32px', transition: 'transform 0.2s, border-color 0.2s', cursor: 'default' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 10px', color: '#ffffff' }}>{feature.title}</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 48px', borderTop: '1px solid rgba(255,255,255,0.06)', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            How It <span style={{ color: '#a855f7' }}>Works</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>Three steps. Zero manual sorting.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {[
            { step: '01', title: 'User Submits Issue', desc: 'Employee describes the problem in natural language. Optional screenshot attachment via Cloudinary.' },
            { step: '02', title: 'AI Analyzes & Routes', desc: 'Google Gemini AI instantly classifies category, assigns priority, generates executive summary with confidence score.' },
            { step: '03', title: 'Admin Resolves & Tracks', desc: 'Admin dashboard shows live analytics, manages lifecycle (Pending → In Progress → Resolved), triggers email alerts.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '28px 32px', backgroundColor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
              <div style={{ minWidth: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', fontSize: '20px', fontWeight: '900', color: '#fff' }}>
                {item.step}
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ padding: '60px 48px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '24px' }}>Built With Modern Tech Stack</h3>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Socket.io', 'Recharts', 'Cloudinary', 'JWT Auth', 'Railway', 'Vercel'].map((tech, i) => (
            <span key={i} style={{ padding: '8px 18px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8', fontSize: '13px', fontWeight: '600' }}>
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 48px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '300px', background: 'radial-gradient(ellipse, rgba(168,85,247,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        
        <h2 style={{ fontSize: '40px', fontWeight: '900', margin: '0 0 16px', letterSpacing: '-1px' }}>
          Ready to <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Automate</span> Your Workflow?
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '32px' }}>Start routing issues with AI in under 60 seconds.</p>
        <Link to="/register" style={{ padding: '18px 48px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', textDecoration: 'none', fontSize: '17px', fontWeight: '700', boxShadow: '0 16px 40px rgba(99,102,241,0.4)', display: 'inline-block' }}>
          Get Started Free ➔
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 48px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>⚡</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>SmartIssue AI</span>
        </div>
        <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
          Built with ❤️ by Ayush Pandey • © 2026
        </p>
      </footer>

    </div>
  );
};

export default LandingPage;
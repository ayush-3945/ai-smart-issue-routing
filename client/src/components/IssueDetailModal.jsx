import React, { useState, useEffect, useRef } from 'react';
import API from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';

const IssueDetailModal = ({ complaint, onClose, onComplaintUpdated, currentUser }) => {
  const { theme } = useTheme();
  const socket = useSocket();
  const [comments, setComments] = useState(complaint?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  const [lang, setLang] = useState('en');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setComments(complaint?.comments || []);
  }, [complaint]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  // Real-time socket listener for incoming comments
  useEffect(() => {
    if (!socket) return;

    const handleNewComment = (data) => {
      if (data.complaintId === complaint._id) {
        setComments((prev) => {
          const exists = prev.some(c => c._id === data.comment._id || (c.createdAt === data.comment.createdAt && c.sender === data.comment.sender));
          if (exists) return prev;
          return [...prev, data.comment];
        });
      }
    };

    socket.on('newComment', handleNewComment);

    return () => {
      socket.off('newComment', handleNewComment);
    };
  }, [socket, complaint._id]);

  const handleSendComment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await API.post(`/complaints/${complaint._id}/comments`, {
        message: newComment.trim()
      });

      if (response.data?.comments) {
        setComments(response.data.comments);
        if (onComplaintUpdated) {
          onComplaintUpdated({ ...complaint, comments: response.data.comments });
        }
      }
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert(error.response?.data?.message || 'Failed to post comment. Please try logging in again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!complaint) return null;

  const attachments = complaint.attachments && complaint.attachments.length > 0 
    ? complaint.attachments 
    : (complaint.image ? [{ url: complaint.image, fileType: 'image', fileName: 'Screenshot' }] : []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: '24px',
        width: '100%',
        maxWidth: '840px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        animation: 'fadeInModal 0.25s ease-out'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: `1px solid ${theme.cardBorder}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(248, 250, 252, 0.8)'
        }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                backgroundColor: 'rgba(14, 165, 233, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(14, 165, 233, 0.3)'
              }}>
                📂 {complaint.category || 'General'}
              </span>
              <span style={{
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                backgroundColor: complaint.priority === 'Critical' ? 'rgba(239, 68, 68, 0.15)' : complaint.priority === 'High' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                color: complaint.priority === 'Critical' ? '#ef4444' : complaint.priority === 'High' ? '#f59e0b' : '#3b82f6',
                border: `1px solid ${complaint.priority === 'Critical' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
              }}>
                ⚡ {complaint.priority || 'Medium'}
              </span>
              <span style={{
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                backgroundColor: complaint.status === 'Resolved' ? 'rgba(16, 185, 129, 0.15)' : complaint.status === 'In Progress' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: complaint.status === 'Resolved' ? '#10b981' : complaint.status === 'In Progress' ? '#3b82f6' : '#f59e0b'
              }}>
                ● {complaint.status}
              </span>
              {complaint.assignedTo && complaint.assignedTo !== 'Unassigned' && (
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  backgroundColor: 'rgba(14, 165, 233, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(14, 165, 233, 0.3)'
                }}>
                  👤 {complaint.assignedTo} ({complaint.assignedLeadRole || 'Lead'})
                </span>
              )}
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: theme.textPrimary }}>
              {complaint.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: theme.textMuted,
              fontSize: '22px',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          
          {/* Problem Description */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textMuted }}>
              Problem Description
            </h4>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: theme.textSecondary, backgroundColor: theme.inputBg, padding: '14px 18px', borderRadius: '14px', border: `1px solid ${theme.cardBorder}` }}>
              {complaint.description}
            </p>
          </div>

          {/* AI Executive Summary Badge with Multilingual Translation Toggle */}
          {(complaint.aiSummary || complaint.aiSummaryHindi) && (
            <div style={{
              marginBottom: '20px',
              padding: '16px 20px',
              borderRadius: '16px',
              background: theme.isDark ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(37, 99, 235, 0.12))' : 'linear-gradient(135deg, rgba(14, 165, 233, 0.06), rgba(37, 99, 235, 0.06))',
              border: '1px solid rgba(14, 165, 233, 0.28)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                  <span>🧠 AI Diagnostic Brief</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8' }}>
                    {complaint.aiConfidence || 95}% Precision
                  </span>
                  {complaint.detectedLanguage && (
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
                      🌐 {complaint.detectedLanguage}
                    </span>
                  )}
                </div>

                {/* English / Hindi Toggle Buttons */}
                {complaint.aiSummaryHindi && (
                  <div style={{ display: 'flex', gap: '4px', backgroundColor: theme.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)', padding: '3px', borderRadius: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setLang('en')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        backgroundColor: lang === 'en' ? '#0ea5e9' : 'transparent',
                        color: lang === 'en' ? '#ffffff' : theme.textMuted
                      }}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang('hi')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        backgroundColor: lang === 'hi' ? '#0ea5e9' : 'transparent',
                        color: lang === 'hi' ? '#ffffff' : theme.textMuted
                      }}
                    >
                      हिन्दी
                    </button>
                  </div>
                )}
              </div>

              <p style={{ margin: 0, fontSize: '14px', color: theme.textPrimary, lineHeight: 1.6 }}>
                {lang === 'hi' && complaint.aiSummaryHindi ? complaint.aiSummaryHindi : complaint.aiSummary}
              </p>
            </div>
          )}

          {/* AI Instant Troubleshooting Recommendations */}
          {((complaint.troubleshootingSteps && complaint.troubleshootingSteps.length > 0) || complaint.suggestedResolution) && (
            <div style={{
              marginBottom: '24px',
              padding: '16px 20px',
              borderRadius: '16px',
              backgroundColor: theme.isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '800', color: '#10b981' }}>
                  <span>⚡ Automated Resolution Protocol</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const stepsText = complaint.troubleshootingSteps?.length > 0
                      ? complaint.troubleshootingSteps.join(' | ')
                      : complaint.suggestedResolution;
                    setNewComment(`💡 Suggested Action Plan: ${stepsText}`);
                  }}
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10b981',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Insert to Reply
                </button>
              </div>

              {complaint.suggestedResolution && (
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: theme.textSecondary, fontStyle: 'italic' }}>
                  🎯 <strong>Guidance:</strong> {complaint.suggestedResolution}
                </p>
              )}

              {complaint.troubleshootingSteps && complaint.troubleshootingSteps.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {complaint.troubleshootingSteps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: theme.textPrimary }}>
                      <span style={{ color: '#10b981', fontWeight: '800' }}>✓</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attachments Section */}
          {attachments.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textMuted }}>
                📎 Attached Files ({attachments.length})
              </h4>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {attachments.map((att, i) => (
                  att.fileType === 'document' ? (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.cardBorder}`, color: '#38bdf8', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}
                    >
                      📄 {att.fileName || `Document #${i + 1}`} ➔
                    </a>
                  ) : (
                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={att.url}
                        alt="attachment"
                        style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: `1px solid ${theme.cardBorder}`, cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    </a>
                  )
                ))}
              </div>
            </div>
          )}

          <hr style={{ border: 'none', borderTop: `1px solid ${theme.cardBorder}`, margin: '24px 0' }} />

          {/* Discussion / Comments Section */}
          <div>
            <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800', color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💬 Live Resolution Thread</span>
              <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
                {comments.length}
              </span>
            </h4>

            {/* Chat Box */}
            <div style={{
              backgroundColor: theme.inputBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '16px',
              padding: '16px',
              minHeight: '160px',
              maxHeight: '260px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', color: theme.textMuted, fontSize: '13px', margin: 'auto' }}>
                  No messages yet. Start the conversation below.
                </div>
              ) : (
                comments.map((cm, idx) => {
                  const isMe = cm.sender === currentUser?.name || cm.sender === currentUser?.email || cm.sender === 'Admin';
                  return (
                    <div key={idx} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px',
                        fontSize: '11px',
                        color: theme.textMuted
                      }}>
                        <span style={{ fontWeight: '700', color: isMe ? '#38bdf8' : theme.textPrimary }}>{cm.sender}</span>
                        {cm.role && (
                          <span style={{
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: theme.cardBorder,
                            fontSize: '9px'
                          }}>
                            {cm.role}
                          </span>
                        )}
                      </div>
                      <div style={{
                        maxWidth: '75%',
                        padding: '10px 14px',
                        borderRadius: '14px',
                        borderBottomRightRadius: isMe ? '2px' : '14px',
                        borderBottomLeftRadius: isMe ? '14px' : '2px',
                        backgroundColor: isMe ? '#0284c7' : (theme.isDark ? '#1e293b' : '#f1f5f9'),
                        color: isMe ? '#ffffff' : theme.textPrimary,
                        fontSize: '13px',
                        lineHeight: 1.5,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        {cm.message}
                      </div>
                      <span style={{ fontSize: '10px', color: theme.textMuted, marginTop: '4px', padding: '0 4px' }}>
                        {new Date(cm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Comment Input Footer */}
        <form onSubmit={handleSendComment} style={{
          padding: '16px 28px',
          borderTop: `1px solid ${theme.cardBorder}`,
          display: 'flex',
          gap: '12px',
          backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.9)'
        }}>
          <input
            type="text"
            placeholder="Type your reply, updates or troubleshooting steps..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 18px',
              borderRadius: '12px',
              backgroundColor: theme.inputBg,
              border: `1px solid ${theme.cardBorder}`,
              color: theme.textPrimary,
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: '800',
              fontSize: '14px',
              cursor: (!newComment.trim() || submitting) ? 'not-allowed' : 'pointer',
              opacity: (!newComment.trim() || submitting) ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)'
            }}
          >
            {submitting ? 'Sending...' : 'Send 💬'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default IssueDetailModal;
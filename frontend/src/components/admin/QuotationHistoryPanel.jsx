import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Send, Clock, User, ChevronRight, MessageSquare, History } from 'lucide-react';
import './QuotationHistoryPanel.css';

const QuotationHistoryPanel = ({ cotId, isOpen, onClose }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && cotId) {
            fetchHistory();
        }
    }, [isOpen, cotId]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/cotizaciones/${cotId}/historial`);
            setHistory(res.data);
        } catch (err) {
            console.error("Error fetching history:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setSubmitting(true);
        try {
            await api.post(`/cotizaciones/${cotId}/historial`, {
                u_id: user.id,
                comentario: comment,
                estado_nuevo: null, // Just a comment
                estado_anterior: null
            });
            setComment('');
            fetchHistory();
        } catch (err) {
            console.error("Error posting history:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="history-panel-overlay" onClick={onClose}>
            <div className="history-panel-content" onClick={e => e.stopPropagation()}>
                <div className="history-header">
                    <div className="header-title">
                        <History size={20} color="var(--color-primary)" />
                        <h3>Historial de Seguimiento</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="history-timeline">
                    {loading ? (
                        <div className="history-loading">Cargando historial...</div>
                    ) : history.length === 0 ? (
                        <div className="history-empty">No hay registros aún.</div>
                    ) : (
                        history.map((item, idx) => (
                            <div key={item.id} className="timeline-item">
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <span className="timeline-user">
                                            <User size={12} /> {item.usuario_nombre || 'Sistema'}
                                        </span>
                                        <span className="timeline-date">
                                            <Clock size={12} /> {new Date(item.fecha).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="timeline-comment" style={{ whiteSpace: 'pre-wrap' }}>{item.comentario}</p>
                                    {item.estado_nuevo && (
                                        <div className="timeline-status-badge">
                                            {item.estado_anterior && (
                                                <>
                                                    <span className="status-old">{item.estado_anterior}</span>
                                                    <ChevronRight size={12} />
                                                </>
                                            )}
                                            <span className="status-new">{item.estado_nuevo}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="history-footer">
                    <div className="comment-input-wrapper">
                        <textarea
                            placeholder="Agregar un comentario..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            disabled={submitting}
                            rows="1"
                            className="history-textarea"
                        />
                        <button 
                            type="button" 
                            onClick={handleSubmit} 
                            disabled={submitting || !comment.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuotationHistoryPanel;

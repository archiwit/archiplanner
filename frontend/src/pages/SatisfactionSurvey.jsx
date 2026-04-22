import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Star, Mic, Camera, Check, Shield, ArrowRight, ArrowLeft, 
    CheckCircle, Heart, Award, Users, Trash2, StopCircle, PlayCircle,
    Music, Clock, Zap, Coffee, Sparkles, Utensils, Palette
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import Button from '../components/ui/Button';
import confetti from 'canvas-confetti';

const SatisfactionSurvey = () => {
    const { id: quoteId } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(0); // 0 is Intro
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [quoteData, setQuoteData] = useState(null);
    const [success, setSuccess] = useState(false);

    // Form State
    const [form, setForm] = useState({
        rating_general: 5,
        rating_profesionalismo: 5,
        rating_calidad: 5,
        rating_puntualidad: 5,
        rating_proceso: 5,
        rating_comida: 0,
        rating_decoracion: 0,
        rating_personal: 0,
        testimonio: '',
        foto: null,
        audio: null,
        acepta_politicas: false
    });

    const [previewFoto, setPreviewFoto] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        fetchQuoteInfo();
    }, [quoteId]);

    const fetchQuoteInfo = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/cotizaciones/${quoteId}`);
            if (res.ok) {
                const data = await res.json();
                setQuoteData(data);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching quote info:', err);
            setLoading(false);
        }
    };

    // --- Media Handlers ---
    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({ ...form, foto: file });
            setPreviewFoto(URL.createObjectURL(file));
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setForm({ ...form, audio: audioBlob });
                setAudioURL(URL.createObjectURL(audioBlob));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            alert('No se pudo acceder al micrófono. Por favor, concede permisos locales.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // --- Submission ---
    const handleSubmit = async () => {
        if (!form.acepta_politicas) {
            alert('Debes aceptar las políticas de privacidad para continuar.');
            return;
        }

        setSending(true);
        const data = new FormData();
        data.append('cli_id', quoteData?.cli_id || '');
        data.append('cot_id', quoteId);
        data.append('nombre_cliente', quoteData?.cliente_nombre || 'Cliente ArchiPlanner');
        data.append('rating_general', form.rating_general);
        data.append('rating_profesionalismo', form.rating_profesionalismo);
        data.append('rating_calidad', form.rating_calidad);
        data.append('rating_comida', form.rating_comida > 0 ? form.rating_comida : '');
        data.append('rating_decoracion', form.rating_decoracion > 0 ? form.rating_decoracion : '');
        data.append('rating_personal', form.rating_personal > 0 ? form.rating_personal : '');
        data.append('testimonio', form.testimonio);
        data.append('acepta_politicas', form.acepta_politicas);
        if (form.foto) data.append('foto', form.foto);
        if (form.audio) data.append('audio', form.audio, 'testimonio.webm');

        try {
            const res = await fetch(`${API_BASE_URL}/encuestas`, {
                method: 'POST',
                body: data
            });

            if (res.ok) {
                setSuccess(true);
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#B76E79', '#D4AF37', '#FFFFFF']
                });
            } else {
                alert('Hubo un error al enviar tu evaluación. Por favor intenta de nuevo.');
            }
        } catch (err) {
            console.error('Submit error:', err);
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="survey-loading"><div className="loader-luxe"></div><span>Cargando Experiencia...</span></div>;

    if (success) return (
        <div className="survey-container success-view">
             <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="success-card"
            >
                <div className="success-icon"><CheckCircle size={80} /></div>
                <h1>¡Experiencia Completada!</h1>
                <p>Tu feedback ha sido enviado con éxito. Fue un honor ser parte de tu historia especial.</p>
                <Button onClick={() => window.location.href = '/'} className="btn-primary mt-8 shine">Volver al Inicio</Button>
            </motion.div>
        </div>
    );

    return (
        <div className="survey-container">
            <div className="survey-glass-card">
                <div className="survey-progress">
                    <div className="progress-bar" style={{ width: `${(step / 4) * 100}%` }}></div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div 
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="survey-intro"
                        >
                            <div className="brand-logo-mini">ArchiPlanner</div>
                            <h1>Queremos escucharte</h1>
                            <p>Tu evento del día <strong>{quoteData?.fevent ? new Date(quoteData.fevent).toLocaleDateString() : 'especial'}</strong> fue único. Tómate 1 minuto para revivir la experiencia y ayudarnos a mejorar.</p>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setStep(1)}
                                className="start-survey-btn"
                            >
                                ¡Comenzar Evaluación! <Sparkles size={20} />
                            </motion.button>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <PageWrapper 
                            key="step1"
                            step={step}
                            icon={Heart}
                            title="¿Cómo estuvo todo?"
                            subtitle="Danos una calificación general de tu experiencia con nosotros."
                        >
                            <SmileyRating 
                                value={form.rating_general} 
                                onChange={(val) => {
                                    setForm({...form, rating_general: val});
                                    setTimeout(() => setStep(2), 600);
                                }} 
                            />
                        </PageWrapper>
                    )}

                    {step === 2 && (
                        <PageWrapper 
                            key="step2"
                            step={step}
                            icon={Award}
                            title="Detalles del Servicio"
                            subtitle="Evaluemos el desempeño de nuestro equipo en el gran día."
                        >
                            <div className="ratings-stack">
                                <StarRating label="Profesionalismo" icon={Users} value={form.rating_profesionalismo} onChange={(v) => setForm({...form, rating_profesionalismo: v})} />
                                <StarRating label="Calidad de Materiales" icon={Star} value={form.rating_calidad} onChange={(v) => setForm({...form, rating_calidad: v})} />
                                <StarRating label="Puntualidad" icon={Clock} value={form.rating_puntualidad} onChange={(v) => setForm({...form, rating_puntualidad: v})} />
                                
                                <div className="rating-divider"><span>Opcionales (si aplica)</span></div>
                                
                                <StarRating label="Comida / Catering" icon={Utensils} value={form.rating_comida} onChange={(v) => setForm({...form, rating_comida: v})} />
                                <StarRating label="Decoración / Ambientación" icon={Palette} value={form.rating_decoracion} onChange={(v) => setForm({...form, rating_decoracion: v})} />
                                <StarRating label="Atención del Personal" icon={Users} value={form.rating_personal} onChange={(v) => setForm({...form, rating_personal: v})} />
                            </div>
                            
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <textarea 
                                    className="survey-textarea"
                                    placeholder="Cuéntanos más... ¿Qué fue lo que más te gustó? (Este mensaje será visible en nuestros testimonios)"
                                    value={form.testimonio}
                                    onChange={(e) => setForm({...form, testimonio: e.target.value})}
                                />
                            </motion.div>

                            <div className="navigation-buttons mt-8">
                                <Button onClick={() => setStep(1)} className="btn-secondary"><ArrowLeft size={18}/> Atrás</Button>
                                <Button onClick={() => setStep(3)} className="btn-primary">Siguiente <ArrowRight size={18}/></Button>
                            </div>
                        </PageWrapper>
                    )}

                    {step === 3 && (
                        <PageWrapper 
                            key="step3"
                            step={step}
                            icon={Camera}
                            title="Voces y Recuerdos"
                            subtitle="Captura el momento. Puedes grabar un audio o subir una foto para tu testimonio."
                        >
                            <div className="multimedia-grid-premium">
                                <motion.div className="multimedia-card" whileHover={{ y: -5 }}>
                                    <div className="card-icon"><Mic size={24} /></div>
                                    <h3>Testimonio de Voz</h3>
                                    <div className="media-action">
                                        {!isRecording && !audioURL && (
                                            <button onClick={startRecording} className="media-btn record">Grabar ahora</button>
                                        )}
                                        {isRecording && (
                                            <button onClick={stopRecording} className="media-btn stop pulsing">Finalizar</button>
                                        )}
                                        {audioURL && (
                                            <div className="audio-control">
                                                <audio src={audioURL} controls />
                                                <button onClick={() => { setAudioURL(null); setForm({...form, audio: null}); }} className="icon-del"><Trash2 size={16} /></button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                <motion.div className="multimedia-card" whileHover={{ y: -5 }}>
                                    <div className="card-icon"><Camera size={24} /></div>
                                    <h3>Foto del Día</h3>
                                    <div className="media-action">
                                        {previewFoto ? (
                                            <div className="foto-preview-full">
                                                <img src={previewFoto} alt="Recuerdo" />
                                                <button onClick={() => { setPreviewFoto(null); setForm({...form, foto: null}); }} className="icon-del"><Trash2 size={16} /></button>
                                            </div>
                                        ) : (
                                            <label className="media-btn upload">
                                                Subir Foto
                                                <input type="file" hidden accept="image/*" onChange={handleFotoChange} />
                                            </label>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                            <div className="navigation-buttons mt-8">
                                <Button onClick={() => setStep(2)} className="btn-secondary"><ArrowLeft size={18}/> Atrás</Button>
                                <Button onClick={() => setStep(4)} className="btn-primary">Siguiente <ArrowRight size={18}/></Button>
                            </div>
                        </PageWrapper>
                    )}

                    {step === 4 && (
                        <PageWrapper 
                            key="step4"
                            step={step}
                            icon={Shield}
                            title="Autorización Final"
                            subtitle="Ayúdanos a inspirar a otros compartiendo tu experiencia."
                        >
                            <div className="summary-luxe-final">
                                <div className="stars-review-big">
                                    {[1,2,3,4,5].map(s => <Star key={s} size={40} fill={s <= form.rating_general ? '#D4AF37' : 'transparent'} stroke={s <= form.rating_general ? '#D4AF37' : '#333'} />)}
                                </div>
                                <p className="review-text">"{form.testimonio || 'Excelente servicio, muy recomendado.'}"</p>
                                
                                <div className="legal-checkbox-premium">
                                    <input 
                                        type="checkbox" 
                                        id="policyConfirm" 
                                        checked={form.acepta_politicas}
                                        onChange={(e) => setForm({...form, acepta_politicas: e.target.checked})}
                                    />
                                    <label htmlFor="policyConfirm">
                                        Autorizo a <strong>ArchiPlanner</strong> a utilizar mi nombre, testimonio, foto y/o audio para fines testimoniales y publicitarios en su sitio web y redes sociales.
                                    </label>
                                </div>
                            </div>
                            <div className="navigation-buttons mt-8">
                                <Button onClick={() => setStep(3)} className="btn-secondary"><ArrowLeft size={18}/> Atrás</Button>
                                <Button 
                                    onClick={handleSubmit} 
                                    className={`btn-primary btn-lg shine ${!form.acepta_politicas ? 'disabled' : ''}`}
                                    disabled={sending || !form.acepta_politicas}
                                >
                                    {sending ? 'Procesando...' : '¡Enviar Evaluación!'} <Check size={18}/>
                                </Button>
                            </div>
                        </PageWrapper>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .survey-container {
                    min-height: 100vh;
                    background: #09090b;
                    background-image: radial-gradient(at 0% 0%, hsla(351,46%,15%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(351,20%,10%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(351,46%,15%,1) 0, transparent 50%);
                    display: flex;
                    align-items: center; justify-content: center;
                    padding: 20px; color: #fff; font-family: 'Outfit', 'Inter', sans-serif;
                }
                .survey-glass-card {
                    width: 100%; max-width: 560px;
                    background: rgba(20, 20, 22, 0.75);
                    backdrop-filter: blur(40px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 32px;
                    padding: 35px; position: relative; overflow: hidden;
                    box-shadow: 0 40px 80px -20px rgba(0,0,0,0.8);
                }
                .survey-progress { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: rgba(255,255,255,0.03); }
                .progress-bar { height: 100%; background: linear-gradient(90deg, #B76E79, #D4AF37, #B76E79); background-size: 200% auto; animation: gradient-move 3s linear infinite; transition: width 0.8s cubic-bezier(0.65, 0, 0.35, 1); }
                @keyframes gradient-move { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }

                .survey-intro { text-align: center; padding: 10px 0; }
                .brand-logo-mini { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 4px; color: #B76E79; margin-bottom: 15px; }
                .survey-intro h1 { font-size: 32px; font-weight: 800; margin-bottom: 15px; line-height: 1.1; letter-spacing: -1px; }
                .survey-intro p { color: #888; font-size: 16px; line-height: 1.5; margin-bottom: 30px; }
                .start-survey-btn { background: #B76E79; color: #fff; border: none; padding: 16px 32px; border-radius: 16px; font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; margin: 0 auto; box-shadow: 0 15px 30px rgba(183, 110, 121, 0.2); }

                .step-badge { display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #B76E79; margin-bottom: 15px; background: rgba(183, 110, 121, 0.1); width: fit-content; padding: 5px 14px; border-radius: 100px; }
                .step-header h2 { font-size: 26px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }
                .step-header p { color: #888; font-size: 14px; margin-bottom: 25px; line-height: 1.4; }

                .smiley-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 30px 0; }
                .smiley-btn { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 20px 8px; border-radius: 20px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 10px; transition: all 0.4s ease; }
                .smiley-btn .emoji { font-size: 32px; filter: grayscale(1); transition: all 0.4s ease; }
                .smiley-btn .label { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #555; }
                .smiley-btn.active { background: rgba(183, 110, 121, 0.15); border-color: #B76E79; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
                .smiley-btn.active .emoji { filter: grayscale(0); transform: scale(1.15); }
                .smiley-btn.active .label { color: #B76E79; }

                .ratings-stack { display: flex; flex-direction: column; gap: 0px; margin-bottom: 20px; max-height: 350px; overflow-y: auto; padding-right: 8px; }
                .ratings-stack::-webkit-scrollbar { width: 3px; }
                .ratings-stack::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                
                .rating-divider { display: flex; align-items: center; gap: 12px; margin: 15px 0 5px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #555; }
                .rating-divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.04); }

                .star-rating-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
                .rating-info { display: flex; align-items: center; gap: 12px; font-weight: 500; font-size: 14px; }
                .icon-circle { width: 28px; height: 28px; background: rgba(212, 175, 55, 0.1); color: #D4AF37; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .stars { display: flex; gap: 4px; }

                .survey-textarea { width: 100%; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 16px; color: #fff; font-size: 14px; min-height: 100px; margin-top: 5px; }
                .navigation-buttons { display: flex; gap: 12px; }
                .navigation-buttons button { flex: 1; height: 52px; border-radius: 14px; font-weight: 700; font-size: 15px; }

                .multimedia-grid-premium { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
                .multimedia-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 20px; text-align: center; }
                .card-icon { color: #B76E79; margin-bottom: 10px; }
                .multimedia-card h3 { font-size: 12px; color: #888; margin-bottom: 15px; font-weight: 800; text-transform: uppercase; }
                .media-btn { width: 100%; padding: 12px; border-radius: 12px; border: 1px dashed rgba(255,255,255,0.15); background: transparent; color: #fff; cursor: pointer; font-weight: 600; font-size: 12px; transition: all 0.3s ease; }
                .media-btn:hover { border-color: #B76E79; background: rgba(183,110,121,0.03); }
                
                .pulsing { animation: pulse-red 1.5s infinite; }
                @keyframes pulse-red { 0% { transform: scale(1); } 50% { transform: scale(0.98); opacity: 0.7; } 100% { transform: scale(1); } }
                
                .audio-control { display: flex; align-items: center; gap: 6px; }
                .audio-control audio { width: 120px; height: 32px; }
                .icon-del { width: 32px; height: 32px; border-radius: 10px; background: rgba(255,0,0,0.1); color: #ff4444; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }

                .foto-preview-full { width: 100%; height: 70px; border-radius: 12px; overflow: hidden; position: relative; }
                .foto-preview-full img { width: 100%; height: 100%; object-fit: cover; }

                .summary-luxe-final { text-align: center; background: rgba(255,255,255,0.02); padding: 30px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); }
                .stars-review-big { display: flex; justify-content: center; gap: 8px; margin-bottom: 20px; }
                .review-text { font-style: italic; color: #aaa; font-size: 16px; margin-bottom: 30px; font-weight: 300; line-height: 1.4; }
                
                .legal-checkbox-premium { display: flex; gap: 12px; align-items: flex-start; text-align: left; }
                .legal-checkbox-premium input { width: 18px; height: 18px; margin-top: 2px; cursor: pointer; }
                .legal-checkbox-premium label { font-size: 11px; line-height: 1.4; color: #888; cursor: pointer; }

                .success-card { text-align: center; max-width: 450px; padding: 40px; }
                .success-card h1 { font-size: 28px; margin: 20px 0 10px; }
                .success-card p { font-size: 15px; color: #888; line-height: 1.5; }

                @media (max-width: 600px) {
                    .survey-glass-card { padding: 25px; border-radius: 24px; }
                    .survey-intro h1 { font-size: 26px; }
                    .smiley-grid { gap: 8px; }
                    .smiley-btn .emoji { font-size: 26px; }
                    .multimedia-grid-premium { grid-template-columns: 1fr; }
                    .survey-intro p { font-size: 14px; }
                }
            `}</style>
        </div>
    );
};

// --- Sub-components (Steps) Defined OUTSIDE to prevent re-render focus issues ---
const PageWrapper = ({ children, title, subtitle, icon: Icon, step }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="survey-step"
    >
        <div className="step-badge">
            {Icon && <Icon size={20} />}
            <span>Paso {step} de 4</span>
        </div>
        <div className="step-header">
            <h2>{title}</h2>
            <p>{subtitle}</p>
        </div>
        <div className="step-content">
            {children}
        </div>
    </motion.div>
);

const SmileyRating = ({ value, onChange }) => {
    const smilies = [
        { icon: '😢', label: 'Básico', val: 1 },
        { icon: '😐', label: 'Regular', val: 2 },
        { icon: '🙂', label: 'Bueno', val: 3 },
        { icon: '😊', label: 'Increíble', val: 4 },
        { icon: '😍', label: 'Mágico', val: 5 },
    ];

    return (
        <div className="smiley-grid">
            {smilies.map((s, idx) => (
                <motion.button
                    key={s.val}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onChange(s.val)}
                    className={`smiley-btn ${value === s.val ? 'active' : ''}`}
                >
                    <span className="emoji">{s.icon}</span>
                    <span className="label">{s.label}</span>
                </motion.button>
            ))}
        </div>
    );
};

const StarRating = ({ label, value, onChange, icon: Icon }) => (
    <motion.div 
        className="star-rating-row"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
    >
        <div className="rating-info">
            <div className="icon-circle"><Icon size={16} /></div>
            <span>{label}</span>
        </div>
        <div className="stars">
            {[1, 2, 3, 4, 5].map((s) => (
                <motion.div
                    key={s}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.8 }}
                >
                    <Star 
                        key={s}
                        size={28} 
                        fill={s <= value ? '#D4AF37' : 'transparent'} 
                        stroke={s <= value ? '#D4AF37' : '#555'}
                        onClick={() => onChange(s)}
                        className="cursor-pointer"
                    />
                </motion.div>
            ))}
        </div>
    </motion.div>
);

export default SatisfactionSurvey;

import React from 'react';
import { useAuth } from '../context/AuthContext';
import useScrollReveal from '../hooks/useScrollReveal';
import useWebContent from '../hooks/useWebContent';
import { Phone, Mail, MapPin, MessageSquare, Smartphone } from 'lucide-react';
import api from '../services/api';
import DynamicForm from '../components/ui/DynamicForm/DynamicForm';
import Swal from 'sweetalert2';
import './style/ContactV4.css';

const Contact = () => {
    const { companyConfig } = useAuth();
    const { content, loading } = useWebContent('contacto');
    
    // Pass loading as dependency to re-trigger observer when content is ready
    useScrollReveal([loading]);

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121212', color: '#ff8484', flexDirection: 'column', gap: '20px' }}>
            <div className="logo" style={{ fontSize: '32px' }}>Archi<span>Planner</span></div>
            <p style={{ letterSpacing: '3px', fontSize: '12px' }}>PREPARANDO EXPERIENCIA...</p>
        </div>
    );

    const infoTitle = content.info_titulo || "Hablemos de tu <br/><span>Próximo Hito</span>";

    const handleSubmit = async (data) => {
        try {
            const fullName = data.name || '';
            const names = fullName.trim().split(' ');
            const firstName = names[0] || 'Cliente';
            const lastName = names.length > 1 ? names.slice(1).join(' ') : '---';

            const leadData = {
                nombre: firstName,
                apellido: lastName,
                correo: data.email,
                telefono: data.telefono || '',
                estado: 'prospecto',
                notas: `Evento: ${data.event}\nVisión: ${data.message}`,
                conf_id: companyConfig?.id
            };

            await api.post('/clientes', leadData);

            Swal.fire({
                title: '¡Mensaje Recibido!',
                text: 'Gracias por confiar en nosotros. Un asesor exclusivo se pondrá en contacto contigo pronto.',
                icon: 'success',
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#ff8484'
            });
        } catch (err) {
            console.error('Error submitting lead:', err);
            Swal.fire({
                title: 'Ops...',
                text: 'No pudimos procesar tu solicitud en este momento. Por favor, intenta de nuevo.',
                icon: 'error',
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#ff8484'
            });
        }
    };

    const whatsappUrl = `https://wa.me/${companyConfig?.telefono?.replace(/\s/g, '')}?text=${encodeURIComponent('Hola! Me gustaría solicitar información para un evento.')}`;
    const smsUrl = `sms:${companyConfig?.telefono?.replace(/\s/g, '')}`;

    return (
        <div className="contact-v4-page">
            {/* HERO SECTION */}
            <section className="contact-v4-hero">
                <div className="hero-v4-content scroll-reveal">
                    <p>Experiencias de Lujo</p>
                    <h1 dangerouslySetInnerHTML={{ __html: infoTitle }} />
                </div>
            </section>

            {/* OVERLAP CARD CONTAINER */}
            <div className="contact-v4-container">
                <div className="contact-v4-card scroll-reveal">
                    
                    {/* LEFT COLUMN: CONTACT INFO */}
                    <div className="contact-v4-info">
                        <div className="info-v4-header">
                            <span className="tag">Exclusividad</span>
                            <h2>Conversemos</h2>
                            <div className="underline" style={{ margin: '15px 0 30px', width: '60px' }}></div>
                            <p>Déjanos acompañarte en la creación de una experiencia inolvidable. Estamos listos para elevar tu visión y convertir tu próximo hito en algo legendario.</p>
                        </div>

                        <div className="info-v4-list">
                            <div className="info-v4-item">
                                <div className="info-v4-icon"><Phone size={24} /></div>
                                <div className="info-v4-text">
                                    <h4>Llámanos</h4>
                                    <p>{companyConfig?.telefono || '300 000 0000'}</p>
                                </div>
                            </div>
                            <div className="info-v4-item">
                                <div className="info-v4-icon"><Mail size={24} /></div>
                                <div className="info-v4-text">
                                    <h4>Escríbenos</h4>
                                    <p>{companyConfig?.email_contacto || 'hola@archiplanner.com'}</p>
                                </div>
                            </div>
                            <div className="info-v4-item">
                                <div className="info-v4-icon"><MapPin size={24} /></div>
                                <div className="info-v4-text">
                                    <h4>Nuestra Sede</h4>
                                    <p>{companyConfig?.city || 'Bucaramanga, Colombia'}</p>
                                </div>
                            </div>
                        </div>

                        {/* PREMIUM ACTION BUTTONS */}
                        <div className="info-v4-actions">
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-contact-action primary">
                                <MessageSquare size={18} /> WhatsApp
                            </a>
                            <a href={smsUrl} className="btn-contact-action">
                                <Smartphone size={18} /> SMS
                            </a>
                            <a href={`tel:${companyConfig?.telefono}`} className="btn-contact-action">
                                <Phone size={18} /> Llamar
                            </a>
                            <a href={`mailto:${companyConfig?.email_contacto}`} className="btn-contact-action">
                                <Mail size={18} /> Email
                            </a>
                        </div>

                        {/* SOCIAL MEDIA LINKS */}
                        <div className="info-v4-social">
                            <div className="social-v4-links">
                                <a href={companyConfig?.ig_url || "#"} target="_blank" rel="noopener noreferrer" className="social-v4-item">IG</a>
                                <a href={companyConfig?.fb_url || "#"} target="_blank" rel="noopener noreferrer" className="social-v4-item">FB</a>
                                <a href={companyConfig?.pn_url || "#"} target="_blank" rel="noopener noreferrer" className="social-v4-item">PN</a>
                                <a href={companyConfig?.tt_url || "#"} target="_blank" rel="noopener noreferrer" className="social-v4-item">TT</a>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: FORM */}
                    <div className="contact-v4-form-col">
                        <div className="form-v4-header">
                            <h3>Envíanos un mensaje</h3>
                        </div>
                        <DynamicForm
                            fields={[
                                { name: 'name', label: 'Nombre Completo', type: 'text', placeholder: ' ', required: true },
                                { name: 'email', label: 'Correo Electrónico', type: 'email', placeholder: ' ', required: true },
                                { name: 'telefono', label: 'Teléfono Móvil', type: 'text', placeholder: ' ', required: false },
                                { 
                                    name: 'event', 
                                    label: 'Tipo de Evento', 
                                    type: 'select', 
                                    required: true,
                                    options: [
                                        { value: 'Boda', label: 'Boda' },
                                        { value: 'XV Años', label: 'XV Años' },
                                        { value: 'Corporativo', label: 'Corporativo' },
                                        { value: 'Social', label: 'Social' },
                                        { value: 'Otro', label: 'Otro Hito Especial' }
                                    ]
                                },
                                { name: 'message', label: 'Cuéntanos tu visión', type: 'textarea', placeholder: ' ', required: true, fullWidth: true }
                            ]}
                            onSubmit={handleSubmit}
                            submitText="Solicitar Asesoría Exclusiva"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;

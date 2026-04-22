import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Phone, Mail, MapPin, MessageSquare, Smartphone, Camera, Globe, Share2, Users, Briefcase } from 'lucide-react';
import api from '../../services/api';
import DynamicForm from '../ui/DynamicForm/DynamicForm';
import Swal from 'sweetalert2';
import '../../pages/style/ContactV4.css';

const ContactSectionV4 = ({ config }) => {
    const { companyConfig } = useAuth();
    
    // Extract configuration with defaults
    const heroTagline = config.heroTagline || "Experiencias de Lujo";
    const heroTitle = config.heroTitle || "Hablemos de tu <br/><span>Próximo Hito</span>";
    const infoTagline = config.infoTagline || "Exclusividad";
    const infoTitle = config.infoTitle || "Conversemos";
    const infoDescription = config.infoDescription || "Déjanos acompañarte en la creación de una experiencia inolvidable. Estamos listos para elevar tu visión y convertir tu próximo hito en algo legendario.";
    const formTitle = config.formTitle || "Envíanos un mensaje";
    const submitText = config.submitText || "Solicitar Asesoría Exclusiva";

    const handleSubmit = async (data) => {
        try {
            const fullName = data.name || '';
            const names = fullName.trim().split(' ');
            const firstName = names[0] || 'Cliente';
            const lastName = names.length > 1 ? names.slice(1).join(' ') : '---';

            // Consolidate detailed event info in notes
            const detailNotes = [
                `Evento: ${data.event}`,
                `Fecha: ${data.event_date || 'No definida'}`,
                `Invitados: ${data.guest_count || 'No especificado'}`,
                `Estilo: ${data.event_style || 'Por definir'}`,
                `Visión: ${data.message}`
            ].join('\n');

            const leadData = {
                nombre: firstName,
                apellido: lastName,
                correo: data.email,
                telefono: data.telefono || '',
                estado: 'prospecto',
                notas: detailNotes,
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

    // Helper to render social icons based on availability using icons that exist in this lucide version
    const renderSocialLinks = () => {
        const socialItems = [
            { key: 'ig_url', icon: <Camera size={18} />, label: 'Instagram' },
            { key: 'fb_url', icon: <Users size={18} />, label: 'Facebook' },
            { key: 'tt_url', icon: <Share2 size={18} />, label: 'Twitter' },
            { key: 'lk_url', icon: <Briefcase size={18} />, label: 'LinkedIn' },
            { key: 'web_url', icon: <Globe size={18} />, label: 'Website' }
        ];

        return socialItems
            .filter(item => companyConfig && companyConfig[item.key])
            .map(item => (
                <a 
                    key={item.key} 
                    href={companyConfig[item.key]} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-v4-item"
                    title={item.label}
                >
                    {item.icon}
                </a>
            ));
    };

    return (
        <div className="contact-v4-page" style={{ paddingBottom: '0' }}>
            {/* HERO SECTION */}
            <section className="contact-v4-hero">
                <div className="hero-v4-content">
                    <p>{heroTagline}</p>
                    <h1 dangerouslySetInnerHTML={{ __html: heroTitle }} />
                </div>
            </section>

            {/* OVERLAP CARD CONTAINER */}
            <div className="contact-v4-container">
                <div className="contact-v4-card" style={{ background: 'rgba(18, 18, 18, 0.85)' }}>
                    
                    {/* LEFT COLUMN: CONTACT INFO */}
                    <div className="contact-v4-info">
                        <div className="info-v4-header">
                            {companyConfig?.icon_contact_svg ? (
                                <div className="custom-v4-icon-main" dangerouslySetInnerHTML={{ __html: companyConfig.icon_contact_svg }} style={{ marginBottom: '20px', width: '64px', height: '64px' }} />
                            ) : (
                                <span className="tag">{infoTagline}</span>
                            )}
                            <h2>{infoTitle}</h2>
                            <div className="underline" style={{ margin: '15px 0 30px', width: '60px' }}></div>
                            <p>{infoDescription}</p>
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
                                {renderSocialLinks()}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: FORM */}
                    <div className="contact-v4-form-col">
                        <div className="form-v4-header">
                            <h3>{formTitle}</h3>
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
                                { name: 'event_date', label: 'Fecha Estimada', type: 'date', placeholder: ' ', required: false },
                                { name: 'guest_count', label: 'Nro. de Invitados', type: 'number', placeholder: ' ', required: false },
                                { name: 'event_style', label: 'Temática o Estilo', type: 'text', placeholder: ' ', required: false, fullWidth: true },
                                { name: 'message', label: 'Cuéntanos tu visión', type: 'textarea', placeholder: ' ', required: true, fullWidth: true }
                            ]}
                            onSubmit={handleSubmit}
                            submitText={submitText}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactSectionV4;

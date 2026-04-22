import React, { useState, useEffect } from 'react';
import { 
    Users, UserPlus, Download, Upload, Search, 
    Filter, CheckCircle, XCircle, Clock, Trash2, 
    MessageSquare, Hash, Save, Settings, FileEdit
} from 'lucide-react';
import * as XLSX from 'xlsx';
import invitadoService from '../../../services/invitadoService';
import Swal from 'sweetalert2';

const GuestListManager = ({ cotId, eventType = 'Otro' }) => {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Todos');
    const [search, setSearch] = useState('');
    const [invitationUrl, setInvitationUrl] = useState(localStorage.getItem(`invitation_url_${cotId}`) || '');
    const [waTemplate, setWaTemplate] = useState(localStorage.getItem(`wa_template_${cotId}`) || `Hola _{{NOMBRE}}_\nQueremos hacerte una invitación muy especial. ✨\n\nHemos reservado: *{{CANTIDAD}}* lugares en tu honor\n\n*Por favor haz click y descúbrela*\n{{URL}}?invitado={{NOMBRE_URL}}&cant={{CANTIDAD}}`);

    useEffect(() => {
        localStorage.setItem(`invitation_url_${cotId}`, invitationUrl);
        localStorage.setItem(`wa_template_${cotId}`, waTemplate);
    }, [invitationUrl, waTemplate, cotId]);

    const isBoda = (eventType || '').toLowerCase().includes('boda');
    const isQuince = (eventType || '').toLowerCase().includes('quince') || (eventType || '').toLowerCase().includes('15');

    // Define roles based on event type
    const roles = ['Todos'];
    if (isBoda) {
        roles.push('Novio', 'Novia');
    } else if (isQuince) {
        roles.push('Quinceañera');
    }
    roles.push('Padre', 'Madre', 'Otro');

    useEffect(() => {
        fetchGuests();
    }, [cotId]);

    const fetchGuests = async () => {
        try {
            const data = await invitadoService.getByEvent(cotId);
            setGuests(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const template = [
            { 'Nombre Completo': 'Ej: Luis Archila', 'Celular': '3000000000', 'Grupo': 'Novio', 'Categoría': 'Familiar', 'Adultos': 2, 'Niños': 1, 'Mesa': 1, 'Observaciones': 'Alergia al maní' },
            { 'Nombre Completo': 'Ej: Ana Pérez', 'Celular': '3110000000', 'Grupo': 'Novia', 'Categoría': 'Amigo', 'Adultos': 1, 'Niños': 0, 'Mesa': 2, 'Observaciones': '' }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Plantilla_Invitados");
        XLSX.writeFile(wb, "Plantilla_Invitados_ArchiPlanner.xlsx");
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            const mapped = data.map(i => ({
                nombre: i['Nombre Completo'] || i['Nombre'],
                celular: i['Celular'],
                grupo: i['Grupo'] || 'Otro',
                categoria: i['Categoría'] || 'Familiar',
                adultos: parseInt(i['Adultos']) || 1,
                niños: parseInt(i['Niños']) || 0,
                mesa_id: i['Mesa'] || null,
                observaciones: i['Observaciones'] || ''
            }));

            try {
                await invitadoService.saveBulk(cotId, mapped);
                fetchGuests();
                Swal.fire({ icon: 'success', title: 'Importación Exitosa', background: '#1a1a1a', color: '#fff' });
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error al importar', text: err.message });
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleDelete = async (id) => {
        const res = await Swal.fire({
            title: '¿Eliminar invitado?',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            background: '#1a1a1a',
            color: '#fff',
            confirmButtonColor: '#e74c3c'
        });

        if (res.isConfirmed) {
            await invitadoService.delete(id);
            fetchGuests();
        }
    };

    const updateStatus = async (guest, newStatus) => {
        await invitadoService.update(guest.id, { ...guest, estado: newStatus });
        fetchGuests();
    };

    const handleOpenSettings = async () => {
        const { value: settings } = await Swal.fire({
            title: 'Configuración de Invitación',
            html: `
                <div class="swal-form-v4">
                    <label style="display:block; text-align:left; font-size:11px; opacity:0.5; margin-bottom:5px;">URL Base de la Invitación</label>
                    <input id="swal-url" class="swal2-input" placeholder="https://..." value="${invitationUrl}">
                    
                    <label style="display:block; text-align:left; font-size:11px; opacity:0.5; margin-top:15px; margin-bottom:5px;">Plantilla de Mensaje WhatsApp</label>
                    <textarea id="swal-template" class="swal2-textarea" style="height: 180px; font-size: 13px; background: #222; color: #fff; border: 1px solid #333; width: 90%; padding: 10px; border-radius: 8px;">${waTemplate}</textarea>
                    
                    <div class="swal-var-box">
                        <span>Haz clic para insertar:</span>
                        <div class="var-list">
                            <button type="button" class="swal-btn-var" onclick="insertVar('{{NOMBRE}}')">{{NOMBRE}}</button>
                            <button type="button" class="swal-btn-var" onclick="insertVar('{{NOMBRE_URL}}')">{{NOMBRE_URL}}</button>
                            <button type="button" class="swal-btn-var" onclick="insertVar('{{CANTIDAD}}')">{{CANTIDAD}}</button>
                            <button type="button" class="swal-btn-var" onclick="insertVar('{{URL}}')">{{URL}}</button>
                        </div>
                    </div>
                </div>
            `,
            didOpen: () => {
                // Add helper function to global scope temporarily for the modal
                window.insertVar = (val) => {
                    const textarea = document.getElementById('swal-template');
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const text = textarea.value;
                    const before = text.substring(0, start);
                    const after  = text.substring(end, text.length);
                    textarea.value = (before + val + after);
                    textarea.focus();
                    textarea.selectionStart = textarea.selectionEnd = start + val.length;
                };
            },
            willClose: () => {
                delete window.insertVar;
            },
            background: '#1a1a1a',
            color: '#fff',
            showCancelButton: true,
            confirmButtonText: 'Guardar Ajustes',
            preConfirm: () => {
                return {
                    url: document.getElementById('swal-url').value,
                    template: document.getElementById('swal-template').value
                }
            }
        });

        if (settings) {
            setInvitationUrl(settings.url);
            setWaTemplate(settings.template);
            Swal.fire({ icon: 'success', title: 'Ajustes Guardados', background: '#1a1a1a', color: '#fff', timer: 1500, showConfirmButton: false });
        }
    };

    const guestsArray = Array.isArray(guests) ? guests : [];
    const stats = {
        total: guestsArray.reduce((acc, g) => acc + (Number(g.adultos) + Number(g.niños)), 0),
        adultos: guestsArray.reduce((acc, g) => acc + Number(g.adultos), 0),
        niños: guestsArray.reduce((acc, g) => acc + Number(g.niños), 0),
        confirmados: guestsArray.filter(g => g.estado === 'Confirmado').length,
        pendientes: guestsArray.filter(g => g.estado === 'Pendiente').length,
        mesasCount: new Set(guestsArray.filter(g => g.mesa_id).map(g => g.mesa_id)).size,
        mesasDistribution: guestsArray.reduce((acc, g) => {
            if (g.mesa_id) acc[g.mesa_id] = (acc[g.mesa_id] || 0) + (Number(g.adultos) + Number(g.niños));
            return acc;
        }, {})
    };

    const filteredGuests = guestsArray.filter(g => {
        const matchesTab = filter === 'Todos' || g.grupo === filter;
        const matchesSearch = (g.nombre || '').toLowerCase().includes((search || '').toLowerCase());
        return matchesTab && matchesSearch;
    });

    if (loading) return <div className="loader"></div>;

    return (
        <div className="guest-manager-v5">
            {/* Stats Bar */}
            <div className="guest-stats-grid">
                <div className="stat-pill">
                    <Users size={16} /> <span>{stats.total} Total</span>
                </div>
                <div className="stat-pill">
                    <strong>{stats.adultos}</strong> Adultos
                </div>
                <div className="stat-pill">
                    <strong>{stats.niños}</strong> Niños
                </div>
                <div className="stat-pill confirmed">
                    <CheckCircle size={14} /> <strong>{stats.confirmados}</strong> Confirmados
                </div>
                <div className="stat-pill pending">
                    <Clock size={14} /> <strong>{stats.pendientes}</strong> Pendientes
                </div>
                <div className="stat-pill tables" title={Object.entries(stats.mesasDistribution).map(([m, c]) => `Mesa ${m}: ${c} pax`).join('\n')}>
                    <Hash size={14} /> <strong>{stats.mesasCount}</strong> Mesas (Aprox)
                </div>
            </div>

            {/* Actions Bar */}
            <div className="guest-actions-bar">
                <div className="search-box">
                    <Search size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar invitado..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="actions-flex">
                    <button className="btn-v4-secondary btn-mini" onClick={handleOpenSettings} title="Configuración de Invitación">
                        <Settings size={14} /> Ajustes
                    </button>
                    <button className="btn-v4-primary btn-mini" onClick={async () => {
                        const { value: formValues } = await Swal.fire({
                            title: 'Nuevo Invitado',
                            html: `
                                <div class="swal-form-v4">
                                    <input id="swal-nombre" class="swal2-input" placeholder="Nombre Completo">
                                    <input id="swal-celular" class="swal2-input" placeholder="Celular">
                                    <div class="swal-row">
                                        <select id="swal-grupo" class="swal2-input">
                                            <option value="Todos">Seleccionar Bando...</option>
                                            ${isBoda ? '<option value="Novio">Bando Novio</option><option value="Novia">Bando Novia</option>' : ''}
                                            ${isQuince ? '<option value="Quinceañera">Quinceañera</option>' : ''}
                                            <option value="Padre">Padre</option>
                                            <option value="Madre">Madre</option>
                                            <option value="Otro">Otro / General</option>
                                        </select>
                                        <select id="swal-cat" class="swal2-input">
                                            <option value="Familiar">Familiar</option>
                                            <option value="Amigo">Amigo</option>
                                            <option value="VIP">VIP</option>
                                        </select>
                                    </div>
                                    <div class="swal-row">
                                        <input id="swal-adultos" type="number" class="swal2-input" placeholder="Adultos" value="1">
                                        <input id="swal-ninos" type="number" class="swal2-input" placeholder="Niños" value="0">
                                    </div>
                                    <input id="swal-mesa" type="number" class="swal2-input" placeholder="Mesa # (Opcional)">
                                </div>
                            `,
                            focusConfirm: false,
                            background: '#1a1a1a',
                            color: '#fff',
                            showCancelButton: true,
                            confirmButtonText: 'Guardar',
                            preConfirm: () => {
                                return {
                                    nombre: document.getElementById('swal-nombre').value,
                                    celular: document.getElementById('swal-celular').value,
                                    grupo: document.getElementById('swal-grupo').value,
                                    categoria: document.getElementById('swal-cat').value,
                                    adultos: parseInt(document.getElementById('swal-adultos').value),
                                    niños: parseInt(document.getElementById('swal-ninos').value),
                                    mesa_id: document.getElementById('swal-mesa').value || null
                                }
                            }
                        });

                        if (formValues) {
                            if (!formValues.nombre) return Swal.fire('Error', 'El nombre es obligatorio', 'error');
                            try {
                                await invitadoService.saveBulk(cotId, [formValues]);
                                fetchGuests();
                                Swal.fire('Guardado', 'Invitado agregado con éxito', 'success');
                            } catch(err) {
                                Swal.fire('Error', err.message, 'error');
                            }
                        }
                    }}>
                        <UserPlus size={14} /> Agregar Invitado
                    </button>
                    <button className="btn-v4-secondary btn-mini" onClick={handleDownloadTemplate}>
                        <Download size={14} /> Plantilla
                    </button>
                    <label className="btn-v4-secondary btn-mini cursor-pointer">
                        <Upload size={14} /> Importar Excel
                        <input type="file" hidden onChange={handleFileUpload} accept=".xlsx, .xls, .csv" />
                    </label>
                </div>
            </div>

            {/* Filters Tabs */}
            <div className="guest-tabs">
                {roles.map(t => (
                    <button 
                        key={t} 
                        className={filter === t ? 'active' : ''} 
                        onClick={() => setFilter(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Guest Table */}
            <div className="guest-table-container">
                <table className="guest-table">
                    <thead>
                        <tr>
                            <th>Invitado</th>
                            <th>Bando / Categoría</th>
                            <th>Puestos (A/N)</th>
                            <th>Estado</th>
                            <th>Mesa</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGuests.map(g => (
                            <tr key={g.id}>
                                <td>
                                    <div className="g-info">
                                        <strong>{g.nombre}</strong>
                                        <span>{g.celular || 'No celu'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="g-tag group">{g.grupo}</span>
                                    <span className="g-tag cat">{g.categoria}</span>
                                </td>
                                <td>
                                    <div className="g-seats">
                                        <span>{g.adultos} Adultos</span>
                                        {g.niños > 0 && <span>{g.niños} Niños</span>}
                                    </div>
                                </td>
                                <td>
                                    <select 
                                        className={`status-select ${(g.estado || 'pendiente').toLowerCase()}`}
                                        value={g.estado || 'Pendiente'}
                                        onChange={(e) => updateStatus(g, e.target.value)}
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Confirmado">Confirmado</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                </td>
                                <td>
                                    <div className="table-nr-box">
                                        <input 
                                            type="text" 
                                            inputMode="numeric"
                                            value={g.mesa_id || ''} 
                                            placeholder="#"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setGuests(prev => prev.map(inv => inv.id === g.id ? { ...inv, mesa_id: val } : inv));
                                            }}
                                            onBlur={async (e) => {
                                                await invitadoService.update(g.id, { ...g, mesa_id: e.target.value || null });
                                                fetchGuests();
                                            }}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div className="g-actions">
                                        <button className="btn-icon-tiny whatsapp" title="Enviar Invitación WhatsApp" onClick={async () => {
                                            const cant = Number(g.adultos) + Number(g.niños);
                                            let msg = waTemplate
                                                .replace(/{{NOMBRE}}/g, g.nombre)
                                                .replace(/{{NOMBRE_URL}}/g, encodeURIComponent(g.nombre))
                                                .replace(/{{CANTIDAD}}/g, cant)
                                                .replace(/{{URL}}/g, invitationUrl);
                                            
                                            // Quick Send logic
                                            const cleanPhone = g.celular?.replace(/\D/g, '');
                                            const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
                                            window.open(waUrl, '_blank');
                                        }}>
                                            <MessageSquare size={14} className="text-success" />
                                        </button>
                                        <button className="btn-icon-tiny" title="Editar Invitado" onClick={async () => {
                                            const { value: formValues } = await Swal.fire({
                                                title: 'Editar Invitado',
                                                html: `
                                                    <div class="swal-form-v4">
                                                        <input id="swal-edit-nombre" class="swal2-input" placeholder="Nombre Completo" value="${g.nombre}">
                                                        <input id="swal-edit-celular" class="swal2-input" placeholder="Celular" value="${g.celular || ''}">
                                                        <div class="swal-row">
                                                            <select id="swal-edit-grupo" class="swal2-input">
                                                                <option value="Todos" ${g.grupo === 'Todos' ? 'selected' : ''}>Seleccionar Bando...</option>
                                                                ${isBoda ? `
                                                                    <option value="Novio" ${g.grupo === 'Novio' ? 'selected' : ''}>Bando Novio</option>
                                                                    <option value="Novia" ${g.grupo === 'Novia' ? 'selected' : ''}>Bando Novia</option>
                                                                ` : ''}
                                                                ${isQuince ? `<option value="Quinceañera" ${g.grupo === 'Quinceañera' ? 'selected' : ''}>Quinceañera</option>` : ''}
                                                                <option value="Padre" ${g.grupo === 'Padre' ? 'selected' : ''}>Padre</option>
                                                                <option value="Madre" ${g.grupo === 'Madre' ? 'selected' : ''}>Madre</option>
                                                                <option value="Otro" ${g.grupo === 'Otro' ? 'selected' : ''}>Otro / General</option>
                                                            </select>
                                                            <select id="swal-edit-cat" class="swal2-input">
                                                                <option value="Familiar" ${g.categoria === 'Familiar' ? 'selected' : ''}>Familiar</option>
                                                                <option value="Amigo" ${g.categoria === 'Amigo' ? 'selected' : ''}>Amigo</option>
                                                                <option value="VIP" ${g.categoria === 'VIP' ? 'selected' : ''}>VIP</option>
                                                            </select>
                                                        </div>
                                                        <div class="swal-row">
                                                            <input id="swal-edit-adultos" type="number" class="swal2-input" placeholder="Adultos" value="${g.adultos}">
                                                            <input id="swal-edit-ninos" type="number" class="swal2-input" placeholder="Niños" value="${g.niños}">
                                                        </div>
                                                        <input id="swal-edit-mesa" type="number" class="swal2-input" placeholder="Mesa # (Opcional)" value="${g.mesa_id || ''}">
                                                    </div>
                                                `,
                                                focusConfirm: false,
                                                background: '#1a1a1a',
                                                color: '#fff',
                                                showCancelButton: true,
                                                confirmButtonText: 'Actualizar',
                                                preConfirm: () => {
                                                    return {
                                                        nombre: document.getElementById('swal-edit-nombre').value,
                                                        celular: document.getElementById('swal-edit-celular').value,
                                                        grupo: document.getElementById('swal-edit-grupo').value,
                                                        categoria: document.getElementById('swal-edit-cat').value,
                                                        adultos: parseInt(document.getElementById('swal-edit-adultos').value),
                                                        niños: parseInt(document.getElementById('swal-edit-ninos').value),
                                                        mesa_id: document.getElementById('swal-edit-mesa').value || null
                                                    }
                                                }
                                            });

                                            if (formValues) {
                                                try {
                                                    await invitadoService.update(g.id, formValues);
                                                    fetchGuests();
                                                    Swal.fire({ icon: 'success', title: 'Invitado Actualizado', background: '#1a1a1a', color: '#fff', timer: 1500, showConfirmButton: false });
                                                } catch(err) {
                                                    Swal.fire('Error', err.message, 'error');
                                                }
                                            }
                                        }}>
                                            <FileEdit size={14} className="text-primary-dim" />
                                        </button>
                                        <button className="btn-icon-tiny" title={g.observaciones || 'Sin notas'} onClick={() => {
                                            Swal.fire({ title: 'Observaciones', text: g.observaciones || 'Sin notas', background: '#1a1a1a', color: '#fff' });
                                        }}>
                                            <Save size={14} opacity={g.observaciones ? 1 : 0.3} />
                                        </button>
                                        <button className="btn-icon-tiny delete" onClick={() => handleDelete(g.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .guest-manager-v5 { padding: 10px; }
                .guest-stats-grid { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
                .stat-pill { 
                    padding: 8px 15px; background: rgba(255,255,255,0.03); border-radius: 50px;
                    font-size: 13px; display: flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.05);
                }
                .stat-pill.confirmed { color: #5FDC7F; background: rgba(95, 220, 127, 0.05); }
                .stat-pill.pending { color: #f1c40f; background: rgba(241, 196, 15, 0.05); }

                .guest-actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 12px; }
                .search-box { 
                    display: flex; align-items: center; gap: 8px; padding: 0 12px; height: 36px;
                    background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
                    flex: 1;
                }
                .search-box input { background: none; border: none; color: #fff; width: 100%; font-size: 13px; height: 100%; }
                .search-box input:focus { outline: none; }
                
                .actions-flex { display: flex; gap: 8px; align-items: center; height: 36px; }
                .actions-flex button, .actions-flex label { 
                    height: 100%; display: flex; align-items: center; gap: 8px; 
                    padding: 0 15px !important; margin: 0 !important; font-size: 12px !important;
                    border-radius: 8px !important; line-height: 1 !important;
                }
                .btn-v4-primary { background: var(--color-primary); color: #000; border: none; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .btn-v4-primary:hover { background: #fff; transform: translateY(-2px); }
                .btn-v4-secondary { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .btn-v4-secondary:hover { background: rgba(255,255,255,0.1); border-color: var(--color-primary); }
                
                .stat-pill.tables { color: var(--color-primary); background: rgba(183, 110, 121, 0.1); border-color: var(--color-primary-dim); cursor: help; }

                .guest-tabs { display: flex; gap: 5px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .guest-tabs button {
                    padding: 10px 15px; background: none; border: none; color: rgba(255,255,255,0.4);
                    font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; position: relative;
                }
                .guest-tabs button:hover { color: #fff; }
                .guest-tabs button.active { color: var(--color-primary); }
                .guest-tabs button.active::after {
                    content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: var(--color-primary);
                }

                .guest-table-container { background: rgba(0,0,0,0.2); border-radius: 15px; overflow: hidden; }
                .guest-table { width: 100%; border-collapse: collapse; }
                .guest-table th { text-align: left; padding: 15px; font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .guest-table td { padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.02); font-size: 14px; }
                
                .g-info strong { display: block; color: #fff; }
                .g-info span { font-size: 11px; opacity: 0.5; }
                
                .g-tag { font-size: 10px; padding: 2px 8px; border-radius: 4px; margin-right: 5px; text-transform: uppercase; font-weight: bold; }
                .g-tag.group { background: rgba(183, 110, 121, 0.1); color: var(--color-primary); }
                .g-tag.cat { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); }
                
                .g-seats { display: flex; flex-direction: column; gap: 2px; }
                .g-seats span { font-size: 12px; }
                
                .status-select { 
                    background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 12px;
                    padding: 5px 10px; border-radius: 6px; cursor: pointer;
                }
                .status-select.confirmado { border-color: #5FDC7F; color: #5FDC7F; }
                .status-select.cancelado { border-color: #e74c3c; color: #e74c3c; }
                
                .table-nr-box {
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px; width: 45px; height: 45px; 
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .table-nr-box:focus-within { background: rgba(183, 110, 121, 0.15); border-color: var(--color-primary); }
                .table-nr-box input { 
                    background: none; border: none; color: var(--color-primary); 
                    width: 100%; font-size: 18px; font-weight: 900; 
                    text-align: center; height: 100%; outline: none;
                    padding: 0 !important; margin: 0 !important;
                    display: flex; align-items: center; justify-content: center;
                }
                .table-nr-box input::placeholder { color: rgba(255,255,255,0.1); }
                
                .g-actions { display: flex; gap: 8px; }
                .cursor-pointer { cursor: pointer; }

                .swal-form-v4 { display: flex; flex-direction: column; gap: 10px; padding: 10px; }
                .swal-row { display: flex; gap: 10px; }
                .swal2-input, .swal-form-v4 select { 
                    margin: 0 !important; width: 100% !important; 
                    background: #222 !important; color: #fff !important; 
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    font-size: 14px !important;
                    height: 44px !important;
                }
                .swal-form-v4 select option { background: #222; color: #fff; }
                .swal2-input:focus, .swal-form-v4 select:focus { border-color: var(--color-primary) !important; box-shadow: none !important; outline: none !important; }

                .swal-var-box { margin-top: 10px; text-align: left; }
                .swal-var-box span { font-size: 10px; opacity: 0.5; display: block; margin-bottom: 5px; }
                .var-list { display: flex; flex-wrap: wrap; gap: 5px; }
                .swal-btn-var { 
                    background: rgba(255,255,255,0.05); color: var(--color-primary); 
                    border: 1px solid rgba(183, 110, 121, 0.2); 
                    padding: 3px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;
                    transition: all 0.2s;
                }
                .swal-btn-var:hover { background: var(--color-primary); color: #000; }
            `}</style>
        </div>
    );
};

export default GuestListManager;

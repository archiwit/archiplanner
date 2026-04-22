import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { AdminButton, AdminIconButton } from './AdminFormFields';
import DynamicForm from './DynamicForm/DynamicForm';

const DynamicTableManager = ({
    title,
    data,
    columns,
    formFields,
    onAdd,
    onEdit,
    onDelete,
    loading,
    customActions,
    tabs
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const handleAddNew = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    // Alt + N for New Record (Common for all tables)
    React.useEffect(() => {
        const handleKeys = (e) => {
            if (e.altKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                handleAddNew();
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, []);

    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSubmit = async (formData) => {
        if (editingItem) {
            await onEdit(editingItem, formData);
        } else {
            await onAdd(formData);
        }
        closeModal();
    };

    const renderMobileCards = () => (
        <div className="dynamic-mobile-cards" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px' }}>
            {data.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>No hay registros.</div>
            ) : (
                data.map((item, idx) => {
                    // Extract key columns for the compact layout
                    const nameCol = columns[0];
                    const contactCol = columns[1];
                    const statusCol = columns.find(c => c.key === 'estado' || c.label.toLowerCase().includes('estado'));
                    
                    return (
                        <div key={item.id || idx} className="glass-panel" style={{ 
                            padding: '12px 15px', 
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: '12px',
                            alignItems: 'start'
                        }}>
                            {/* TOP ROW: Identity & Status */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {nameCol.render ? nameCol.render(item) : (
                                    <div style={{ fontWeight: '800', fontSize: '15px' }}>{item[nameCol.key]}</div>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'right', marginRight: '-12px' }}>
                                {statusCol && (statusCol.render ? statusCol.render(item) : (
                                    <span className="tag" style={{ fontSize: '10px' }}>{item[statusCol.key]}</span>
                                ))}
                            </div>

                            {/* BOTTOM ROW: Contact (LEFT) & Actions (RIGHT) */}
                            <div style={{ alignSelf: 'end' }}>
                                {contactCol && (contactCol.render ? contactCol.render(item) : (
                                    <div style={{ fontSize: '12px', opacity: 0.7 }}>{item[contactCol.key]}</div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignSelf: 'end', paddingBottom: '2px', marginRight: '-4px' }}>
                                {customActions && customActions(item)}
                                <AdminIconButton onClick={() => handleEdit(item)} icon={Edit2} variant="edit" size={18} />
                                <AdminIconButton onClick={() => onDelete(item)} icon={Trash2} variant="delete" size={18} />
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );

    return (
        <div className="dynamic-table-container">
            <div className={`dynamic-table-toolbar ${isMobile ? 'mobile-toolbar' : ''}`} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingRight: isMobile ? '120px' : '0' // Adjusted to prevent overlap with TWO floating buttons
            }}>
                <h3 style={{ margin: 0, fontSize: isMobile ? '22px' : '20px', textAlign: 'left', flex: 1, fontWeight: '800' }}>
                    {title}
                </h3>
                
                {/* On Mobile, this button becomes a floating trigger defined in index.css */}
                <button 
                    onClick={handleAddNew} 
                    className={isMobile ? 'admin-mobile-add-trigger' : ''}
                    style={{ display: isMobile ? 'flex' : 'none' }}
                >
                    <Plus size={22} />
                </button>

                {/* On Desktop, we keep the standard AdminButton */}
                {!isMobile && (
                    <button 
                        onClick={handleAddNew} 
                        className="btn-icon-tooltip primary"
                        title="Añadir Nuevo"
                        style={{ padding: '10px' }}
                    >
                        <Plus size={20} />
                    </button>
                )}
            </div>

            <div className={`admin-card mb-0 ${isMobile ? 'mobile-compact' : ''}`} style={{ padding: '0', overflow: isMobile ? 'visible' : 'hidden', background: isMobile ? 'transparent' : '', border: isMobile ? 'none' : '' }}>
                {isMobile ? renderMobileCards() : (
                    <div className="dynamic-table-wrapper">
                        <table className="dynamic-table">
                            <thead>
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th key={idx}>{col.label}</th>
                                    ))}
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-dim)' }}>
                                            No hay registros disponibles.
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((item, rowIdx) => (
                                        <tr key={item.id || rowIdx}>
                                            {columns.map((col, colIdx) => (
                                                <td key={colIdx}>
                                                    {col.render ? col.render(item) : item[col.key]}
                                                </td>
                                            ))}
                                            <td>
                                                <div className="actions-flex-end">
                                                    {customActions && customActions(item)}
                                                    <AdminIconButton onClick={() => handleEdit(item)} icon={Edit2} variant="edit" title="Editar" size={16} />
                                                    <AdminIconButton onClick={() => onDelete(item)} icon={Trash2} variant="delete" title="Eliminar" size={16} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="modal-content modal-wide">
                        <div className="modal-header">
                            <h3>{editingItem ? 'Editar Registro' : 'Nuevo Registro'}</h3>
                            <button className="btn-close" onClick={closeModal} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <DynamicForm
                                key={editingItem ? editingItem.id : 'new'}
                                fields={formFields}
                                initialValues={editingItem || {}}
                                onSubmit={handleSubmit}
                                submitText={editingItem ? 'Guardar Cambios' : 'Crear Registro'}
                                isLoading={loading}
                                tabs={tabs}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DynamicTableManager;

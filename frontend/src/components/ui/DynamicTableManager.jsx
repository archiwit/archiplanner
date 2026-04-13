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

    return (
        <div className="dynamic-table-container">
            <div className="dynamic-table-toolbar">
                <h3 style={{ margin: 0, fontSize: '20px' }}>{title}</h3>
                <AdminButton 
                    onClick={handleAddNew} 
                    icon={Plus}
                >
                    Añadir Nuevo
                </AdminButton>
            </div>

            <div className="admin-card mb-0" style={{ padding: '0', overflow: 'hidden' }}>
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
                                                {/* Render custom actions if provided */}
                                                {customActions && customActions(item)}
                                                
                                                <AdminIconButton 
                                                    onClick={() => handleEdit(item)} 
                                                    icon={Edit2} 
                                                    variant="edit" 
                                                    title="Editar Información" 
                                                    size={16}
                                                />
                                                <AdminIconButton 
                                                    onClick={() => onDelete(item)} 
                                                    icon={Trash2} 
                                                    variant="delete" 
                                                    title="Eliminar" 
                                                    size={16}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
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

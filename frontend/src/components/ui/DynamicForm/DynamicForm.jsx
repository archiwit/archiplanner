import React, { useState } from 'react';
import { AdminImageUpload, AdminColorPicker, AdminButton } from '../AdminFormFields';
import './DynamicForm.css';

/**
 * Componente de Formulario Dinámico y Reutilizable
 * 
 * @param {Array} fields - Array de objetos con la configuración de cada campo
 *        Ej: [{ name: 'email', label: 'Correo', type: 'email', placeholder: 'correo@ejemplo.com', required: true }]
 * @param {Function} onSubmit - Función que recibe los datos del formulario: (data) => void
 * @param {String} submitText - Texto del botón de enviar
 * @param {Boolean} isLoading - Estado de carga para deshabilitar y animar el botón
 * @param {String|null} error - Mensaje de error general para mostrar
 * @param {String|null} successMessage - Mensaje de éxito para mostrar
 * @param {Object} initialValues - Valores iniciales del formulario (opcional)
 */
const DynamicForm = ({
  fields = [],
  onSubmit,
  submitText = 'Enviar',
  isLoading = false,
  error = null,
  successMessage = null,
  initialValues = {},
  tabs = []
}) => {
  const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0].id : null);

  // Inicializamos el estado basado en si hay initialValues
  const [formData, setFormData] = useState(() => {
    const initialState = fields.reduce((acc, field) => {
      acc[field.name] = initialValues[field.name] !== undefined ? initialValues[field.name] : '';
      return acc;
    }, {});

    // También incluimos otras propiedades de initialValues para componentes custom
    return { ...initialState, ...initialValues };
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    // Si es un input de archivo, guardamos el primer archivo
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files.length > 0 ? files[0] : null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const renderField = (field) => {
    const { type, name, label, options, render, ...rest } = field;

    // Si pasamos una función render personalizada, la ejecutamos
    if (render) return render(formData, setFormData, field);

    const handleImageClick = () => {
      document.getElementById(`file-${name}`).click();
    };

    switch (type) {
      case 'color':
        return (
          <AdminColorPicker
            label={label}
            name={name}
            value={formData[name]}
            onChange={handleChange}
          />
        );
      case 'image':
        return (
          <AdminImageUpload
            label={label}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            required={rest.required}
          />
        );
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            className="dense-input"
            rows={rest.rows || 3}
            {...rest}
          />
        );
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            className="dense-input"
            {...rest}
          >
            <option value="" disabled>Selecciona una opción</option>
            {options && options.map((opt, i) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'file':
        return (
          <input
            type="file"
            id={name}
            name={name}
            onChange={handleChange}
            className="dynamic-form-file"
            {...rest}
          />
        );
      default:
        // text, email, password, number, etc.
        return (
          <input
            type={type || 'text'}
            id={name}
            name={name}
            value={type !== 'file' ? (formData[name] || '') : undefined}
            onChange={handleChange}
            className="dense-input"
            {...rest}
          />
        );
    }
  };

  return (
    <div className="dynamic-form-container">
      {/* Mensajes de Notificación */}
      {error && (
        <div className="dynamic-form-message error">
          {error}
        </div>
      )}

      {tabs && tabs.length > 0 && (
        <div className="dynamic-form-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`df-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="dynamic-form grid-layout">
        {fields
          .filter(field => !field.tab || field.tab === activeTab)
          .map((field) => {
            let gridSpan = 3; // Default 50% (3 of 6)
            if (field.fullWidth) gridSpan = 6;
            if (field.width === '33%') gridSpan = 2;
            if (field.width === '66%') gridSpan = 4;
            if (field.width === '16.66%') gridSpan = 1;
            if (field.width === '100%') gridSpan = 6;

            return (
              <div
                key={field.name}
                className={`form-field ${field.type === 'file' || field.type === 'image' ? 'file-group' : ''}`}
                style={{ gridColumn: `span ${gridSpan}` }}
              >
                {renderField({ placeholder: ' ', ...field })}
                {field.type !== 'image' && field.type !== 'color' && (
                  <label htmlFor={field.name}>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                )}
              </div>
            );
          })}

        <div className="dynamic-form-actions" style={{ gridColumn: 'span 6', marginTop: '12px' }}>
          <AdminButton
            type="submit"
            isLoading={isLoading}
          >
            {submitText}
          </AdminButton>
        </div>
      </form>
    </div>
  );
};

export default DynamicForm;

import React from 'react';
import { Upload, X, Trash2, Camera, Palette } from 'lucide-react';
import { getUploadUrl } from '../../config';

/**
 * Standard Admin Input with Floating Label
 */
export const AdminInput = ({ label, type = 'text', name, value, onChange, placeholder = ' ', required = false, width = '100%', rows = 3, icon: Icon, inputRef, ...rest }) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  // Determine if the label should be in the floating position
  const isFloating = isFocused || (value && value.toString().length > 0) || type === 'date' || type === 'time';

  return (
    <div className={`form-field ${isFloating ? 'is-floating' : ''}`} style={{ width }}>
      <div className="input-wrapper-relative">
        {Icon && <Icon className="field-icon" size={16} />}
        <InputComponent
          ref={inputRef}
          className="dense-input"
          type={type !== 'textarea' ? type : undefined}
          name={name}
          id={name}
          value={value || ''}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ""}
          required={required}
          rows={type === 'textarea' ? rows : undefined}
          {...rest}
        />
      </div>
      {label && <label htmlFor={name}>{label} {required && '*'}</label>}
    </div>
  );
};

/**
 * Standard Admin Select with Floating Label
 */
export const AdminSelect = ({ label, name, value, onChange, options = [], required = false, width = '100%' }) => {
  const [isFocused, setIsFocused] = React.useState(false);
  
  // Selects are usually considered floating if they have a value or focus
  const isFloating = isFocused || (value && value.toString().length > 0) || true; // Force true for select match user preference

  return (
    <div className={`form-field is-floating`} style={{ width }}>
      <select
        className="dense-input"
        name={name}
        id={name}
        value={value || ''}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
      >
        <option value="" disabled>Seleccionar...</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <label htmlFor={name}>{label} {required && '*'}</label>
    </div>
  );
};

/**
 * Standard Admin Textarea with Floating Label (Alias for AdminInput type='textarea')
 */
export const AdminTextarea = (props) => (
  <AdminInput {...props} type="textarea" />
);

/**
 * Universal Drag-and-Drop Image Uploader
 * Features: Buttonless, industrial density (100px), instant preview.
 */
export const AdminImageUpload = ({ label, name, value, onChange, width = '100%', required = false }) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onChange({ target: { name, value: file } });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange({ target: { name, value: file } });
    }
  };

  const handleClick = () => {
    const el = document.getElementById(`upload_${name}`);
    if (el) el.click();
  };

  const previewUrl = value instanceof File
    ? URL.createObjectURL(value)
    : (typeof value === 'string' && value ? getUploadUrl(value) : null);

  return (
    <div className="form-field" style={{ width }}>
      <div
        className={`premium-upload-box ${isDragging ? 'dragging' : ''}`}
        id={name}
        style={{
          height: '100px',
          border: isDragging ? '2px dashed var(--color-primary)' : '2px dashed rgba(255,132,132,0.1)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '0 16px',
          gap: '20px',
          cursor: 'pointer',
          background: isDragging ? 'rgba(255,132,132,0.05)' : 'rgba(255,255,255,0.01)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id={`upload_${name}`}
          type="file"
          hidden
          onChange={handleFileChange}
          accept="image/*"
        />

        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '10px',
          overflow: 'hidden',
          background: '#000',
          border: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Camera size={24} style={{ opacity: 0.2 }} />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '2px' }}>
            {previewUrl ? 'Cambiar Imagen' : 'Subir Archivo'}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--color-text-dim)', opacity: 0.6 }}>
            Arrastra o haz clic aquí
          </span>
        </div>
      </div>
      <label htmlFor={name}>{label} {required && '*'}</label>
    </div>
  );
};

/**
 * Universal Color Picker with Floating Label
 */
export const AdminColorPicker = ({ label, name, value, onChange, width = '100%' }) => {
  return (
    <div className="form-field" style={{ width, marginBottom: '2px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 14px',
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        height: '48px'
      }} id={name}>
        <div style={{
          position: 'relative',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: value || '#ffffff',
          border: '2px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
          cursor: 'pointer'
        }}>
          <input
            type="color"
            name={name}
            value={value || '#ffffff'}
            onChange={onChange}
            style={{
              position: 'absolute',
              top: '-5px',
              left: '-5px',
              width: '40px',
              height: '40px',
              padding: 0,
              border: 'none',
              cursor: 'pointer',
              opacity: 0
            }}
          />
        </div>
        <span style={{
          fontSize: '13px',
          color: '#fff',
          fontFamily: 'monospace',
          opacity: 0.8,
          letterSpacing: '0.5px'
        }}>
          {(value || '#FFFFFF').toUpperCase()}
        </span>
        <Palette size={14} style={{ marginLeft: 'auto', opacity: 0.3 }} />
      </div>
      <label htmlFor={name}>{label}</label>
    </div>
  );
};

/**
 * Standard Admin Button (Industrial Speed)
 */
export const AdminButton = ({ children, onClick, type = 'button', variant = 'primary', isLoading = false, icon: Icon, width = 'auto' }) => {
  const baseClass = variant === 'primary' ? 'btn-v4 btn-v4-primary' : 'btn-v4 btn-v4-secondary';

  return (
    <button
      type={type}
      className={baseClass}
      onClick={onClick}
      disabled={isLoading}
      style={{
        width,
        padding: '9px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '700',
        color: '#ffffff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        height: '52px', /* Standard height for centering impact */
        lineHeight: '1'
      }}
    >
      <div className="shimmer-effect"></div>
      {Icon && <Icon size={18} style={{ position: 'relative', zIndex: 1 }} />}
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      {isLoading && <span className="dynamic-form-submit-loading" style={{ marginLeft: '10px', position: 'relative', zIndex: 1 }}></span>}
    </button>
  );
};

/**
 * Standard Admin Icon Button for Tables (Square Actions)
 */
export const AdminIconButton = ({ onClick, icon: Icon, variant = 'edit', title, size = 18 }) => {
  return (
    <button
      type="button"
      className={`btn-icon-premium ${variant}`}
      onClick={onClick}
      title={title}
    >
      <Icon size={size} />
    </button>
  );
};

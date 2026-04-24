import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Search, ChevronDown, X } from 'lucide-react';

const SearchableDropdown = ({ 
    options, 
    value, 
    onChange, 
    placeholder = "Buscar...", 
    labelKey = "label", 
    valueKey = "id",
    renderOption,
    searchFields = ["label"]
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => String(opt[valueKey]) === String(value));

    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if clicked inside container or inside portal
            const portal = document.getElementById('dropdown-portal-root');
            if (containerRef.current && !containerRef.current.contains(event.target) && 
                portal && !portal.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => {
        const term = (searchTerm || '').toLowerCase();
        return searchFields.some(field => 
            String(opt[field] || '').toLowerCase().includes(term)
        );
    });

    const handleSelect = (opt) => {
        onChange(opt[valueKey]);
        setIsOpen(false);
        setSearchTerm('');
    };

    const dropdownContent = (
        <div 
            id="dropdown-portal-root"
            className="dropdown-panel glass-panel portal-fix" 
            style={{
                position: 'absolute',
                top: `${coords.top + 5}px`,
                left: `${coords.left}px`,
                width: `${coords.width}px`,
                zIndex: 99999,
                padding: '12px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                background: 'rgba(10, 10, 10, 0.98)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                animation: 'fadeInScale 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="dropdown-search-wrapper" style={{ position: 'relative', marginBottom: '12px' }}>
                <input 
                    type="text"
                    autoFocus
                    className="dense-input"
                    style={{ 
                        paddingLeft: '45px', 
                        height: '40px', 
                        fontSize: '14px', 
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        width: '100%'
                    }}
                    placeholder="Escribe para filtrar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={14} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, color: '#fff' }} />
            </div>

            <div className="dropdown-results" style={{ 
                color: '#fff',
                maxHeight: '280px',
                overflowY: 'auto'
            }}>
                {filteredOptions.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', opacity: 0.5 }}>No se encontraron resultados</div>
                ) : (
                    filteredOptions.map(opt => (
                        <div 
                            key={opt[valueKey]} 
                            className="dropdown-item"
                            onClick={() => handleSelect(opt)}
                            style={{
                                padding: '12px 14px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: String(opt[valueKey]) === String(value) ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                                color: String(opt[valueKey]) === String(value) ? 'var(--color-gold)' : '#fff',
                                marginBottom: '6px',
                                border: '1px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                const isSelected = String(opt[valueKey]) === String(value);
                                e.currentTarget.style.background = isSelected ? 'rgba(212, 175, 55, 0.2)' : 'transparent';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}
                        >
                            {renderOption ? renderOption(opt) : (
                                <span style={{ fontSize: '14px' }}>{opt[labelKey]}</span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="searchable-dropdown-container" ref={containerRef} style={{ width: '100%' }}>
            <div 
                className="dense-input dropdown-trigger" 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    height: '52px',
                    borderColor: isOpen ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                    background: isOpen ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)',
                    padding: '0 15px'
                }}
            >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontSize: '13px', color: selectedOption ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                    {selectedOption ? (renderOption ? renderOption(selectedOption) : selectedOption[labelKey]) : placeholder}
                </div>
                <ChevronDown size={14} style={{ opacity: 0.5, marginLeft: '8px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
            </div>

            {isOpen && ReactDOM.createPortal(dropdownContent, document.body)}
        </div>
    );
};

export default SearchableDropdown;

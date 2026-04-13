import React from 'react';

const Button = ({ children, variant = 'primary', className = '', href, ...props }) => {
    const baseClass = 'btn';
    const variantClass = variant === 'primary' ? 'btn-primary' : variant === 'outline' ? 'btn-outline' : '';
    
    if (href) {
        return (
            <a href={href} className={`${baseClass} ${variantClass} ${className}`} {...props}>
                {children}
            </a>
        );
    }
    
    return (
        <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;

// CSS for Buttons (inline for simplicity or in index.css)
// Redefining some styles for clarity in React
const styles = `
.btn {
    padding: 16px 32px;
    border-radius: var(--radius-sm);
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 2px;
    display: inline-block;
    transition: var(--transition-smooth);
    border: none;
    cursor: pointer;
    font-family: inherit;
}

.btn-primary {
    background: var(--color-primary);
    color: var(--color-bg);
}

.btn-primary:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px var(--color-primary-dim);
}

.btn-outline {
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: transparent;
    color: var(--color-text);
}

.btn-outline:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
}

.btn-large {
    padding: 20px 48px;
    font-size: 16px;
}
`;

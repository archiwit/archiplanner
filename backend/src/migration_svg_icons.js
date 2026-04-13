const db = require('./db');

async function migrate() {
    try {
        console.log('--- Iniciando inyección de Iconos SVG Animados ---');

        // 1. Asegurar que la columna existe
        try {
            await db.query('ALTER TABLE servicios ADD COLUMN icono_svg TEXT AFTER tag');
            console.log('✓ Columna icono_svg añadida.');
        } catch (err) {
            console.log('ℹ La columna icono_svg ya existe o no se pudo añadir.');
        }

        const icons = {
            'Bodas de Ensueño': `
                <svg viewBox="0 0 100 100" class="premium-svg-icon">
                    <circle cx="40" cy="50" r="25" class="svg-anim-path" />
                    <circle cx="60" cy="50" r="25" class="svg-anim-path" />
                    <path d="M50 40 L50 60" class="svg-anim-path" />
                </svg>
            `,
            'XV Años Espectaculares': `
                <svg viewBox="0 0 100 100" class="premium-svg-icon">
                    <path d="M20 80 L30 40 L50 20 L70 40 L80 80 Z" class="svg-anim-path" />
                    <circle cx="50" cy="20" r="5" class="svg-anim-path" />
                    <circle cx="30" cy="40" r="3" class="svg-anim-path" />
                    <circle cx="70" cy="40" r="3" class="svg-anim-path" />
                </svg>
            `,
            'Eventos Corporativos': `
                <svg viewBox="0 0 100 100" class="premium-svg-icon">
                    <rect x="20" y="30" width="20" height="50" class="svg-anim-path" />
                    <rect x="45" y="10" width="20" height="70" class="svg-anim-path" />
                    <rect x="70" y="40" width="15" height="40" class="svg-anim-path" />
                </svg>
            `,
            'Baby Shower': `
                <svg viewBox="0 0 100 100" class="premium-svg-icon">
                    <circle cx="50" cy="35" r="20" class="svg-anim-path" />
                    <path d="M50 55 L50 85" class="svg-anim-path" />
                    <rect x="40" y="75" width="20" height="5" class="svg-anim-path" />
                </svg>
            `,
            'Revelación de Sexo': `
                <svg viewBox="0 0 100 100" class="premium-svg-icon">
                    <path d="M50 20 C20 20 20 50 50 80 C80 50 80 20 50 20" class="svg-anim-path" />
                    <path d="M50 40 Q55 35 50 30 Q45 35 50 40" class="svg-anim-path" stroke-width="1" />
                    <text x="45" y="55" fill="currentColor" style="font-size: 20px; font-weight: bold;">?</text>
                </svg>
            `,
            'Aniversarios': `
                <svg viewBox="0 0 100 100" class="premium-svg-icon">
                    <path d="M40 30 Q40 60 50 60 Q60 60 60 30 Z" transform="rotate(-15 50 45)" class="svg-anim-path" />
                    <path d="M60 30 Q60 60 50 60 Q40 60 40 30 Z" transform="rotate(15 50 45)" class="svg-anim-path" />
                    <path d="M50 50 V80 M35 80 H65" class="svg-anim-path" />
                    <circle cx="50" cy="20" r="2" class="svg-anim-path" />
                    <circle cx="45" cy="12" r="1.5" class="svg-anim-path" />
                </svg>
            `,
            'Cenas Privadas': `
                <svg viewBox="0 0 100 100" class="premium-svg-icon">
                    <path d="M30 20 V80 H45 V20 Z" class="svg-anim-path" />
                    <path d="M60 40 Q60 70 75 70 Q90 70 90 40 Z" class="svg-anim-path" />
                    <path d="M75 70 V85 M65 85 H85" class="svg-anim-path" />
                    <path d="M30 35 H45 M30 50 H45" class="svg-anim-path" />
                </svg>
            `,
            'Encuentros Deportivos': `
                <svg viewBox="0 0 100 100" class="premium-svg-icon">
                    <path d="M30 20 H70 V45 Q70 65 50 65 Q30 65 30 45 Z" class="svg-anim-path" />
                    <path d="M30 30 H20 V45 Q20 55 30 55" class="svg-anim-path" />
                    <path d="M70 30 H80 V45 Q80 55 70 55" class="svg-anim-path" />
                    <path d="M50 65 V80 M35 80 H65" class="svg-anim-path" />
                </svg>
            `,
            'Pedidas de Noviazgo': `
                <svg viewBox="0 0 100 100" class="premium-svg-icon">
                    <circle cx="50" cy="65" r="25" class="svg-anim-path" />
                    <path d="M35 30 L50 10 L65 30 L55 42 L45 42 Z" class="svg-anim-path" />
                    <path d="M42 5 L45 10 M58 5 L55 10 M50 2 L50 8" class="svg-anim-path" stroke-width="1" />
                </svg>
            `
        };

        for (const [titulo, svg] of Object.entries(icons)) {
            await db.query('UPDATE servicios SET icono_svg = ? WHERE titulo = ?', [svg.trim(), titulo]);
            console.log(`✓ Icono actualizado para: ${titulo}`);
        }

        console.log('--- Migración de Iconos completada ---');
        process.exit(0);
    } catch (err) {
        console.error('Error en la migración de iconos:', err);
        process.exit(1);
    }
}

migrate();

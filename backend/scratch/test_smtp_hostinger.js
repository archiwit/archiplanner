const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config({ path: './backend/.env' });

async function testSMTP() {
    console.log('--- Diagnóstico de SMTP Hostinger ---');
    console.log('User:', process.env.EMAIL_USER);
    // No imprimimos la clave por seguridad

    const configs = [
        { host: 'smtp.hostinger.com', port: 465, secure: true, name: 'Hostinger SSL 465' },
        { host: 'smtp.hostinger.com', port: 587, secure: false, name: 'Hostinger TLS 587' },
        { host: 'smtp.titan.email', port: 465, secure: true, name: 'Titan SSL 465' }
    ];

    for (const conf of configs) {
        console.log(`\nProbando: ${conf.name}...`);
        const transporter = nodemailer.createTransport({
            host: conf.host,
            port: conf.port,
            secure: conf.secure,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false // Para pruebas, para evitar errores de certificado
            }
        });

        try {
            await transporter.verify();
            console.log(`✅ ${conf.name}: ÉXITO`);
            process.exit(0);
        } catch (err) {
            console.log(`❌ ${conf.name}: FALLÓ (${err.message})`);
        }
    }
    console.log('\n--- Fin del Diagnóstico ---');
    process.exit(1);
}

testSMTP();

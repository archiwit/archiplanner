const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        console.log("🔗 Conectando a Hostinger FTP...");
        await client.access({
            host: "46.202.172.186",
            user: "u849872745.archiplanner",
            password: "ArchiLuis.-48",
            secure: false
        });

        console.log("✅ Conexión establecida.");

        // 1. Subir Frontend (dist)
        console.log("📤 Subiendo Frontend (dist) a la raíz de Hostinger...");
        const distPath = path.resolve(__dirname, "frontend/dist");
        
        // Subimos el contenido de dist directamente a la raíz /
        await client.uploadFromDir(distPath, "/");

        console.log("✅ FRONTEND DESPLEGADO EXITOSAMENTE!");
        console.log("🚀 El sitio debería estar actualizado en https://archiplanner.com.co");

    } catch (err) {
        console.error("❌ Error en el despliegue:", err);
    } finally {
        client.close();
    }
}

deploy();

const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "backend/.env") });

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
            host: process.env.FTP_HOST || "46.202.172.186",
            user: process.env.FTP_USER || "u849872745.archiplanner",
            password: process.env.FTP_PASSWORD || "ArchiLuis.-48",
            secure: false
        });

        console.log("🚀 INICIANDO DESPLIEGUE RÁPIDO (Solo Código)...");

        // 1. Subir Frontend (dist)
        console.log("📤 Subiendo Frontend (dist)...");
        const distPath = path.resolve(__dirname, "frontend/dist");
        await client.uploadFromDir(distPath, "/");

        // 2. Subir Backend (src e index.js)
        console.log("📤 Subiendo Backend (src)...");
        const backendSrc = path.resolve(__dirname, "backend/src");
        await client.uploadFromDir(backendSrc, "api/src");

        console.log("📤 Subiendo index.js y package.json...");
        await client.uploadFrom(path.resolve(__dirname, "backend/index.js"), "api/index.js");
        await client.uploadFrom(path.resolve(__dirname, "backend/package.json"), "api/package.json");

        // 3. Subir Migraciones
        console.log("📤 Subiendo script de migración...");
        const migrationFile = path.resolve(__dirname, "backend/scripts/migration_v6.sql");
        if (fs.existsSync(migrationFile)) {
            await client.uploadFrom(migrationFile, "migration_v6.sql");
        }

        console.log("✅ DESPLIEGUE RÁPIDO COMPLETADO!");
        console.log("✨ Los cambios en el código ya están en vivo.");

    } catch (err) {
        console.error("❌ Error en el despliegue:", err);
    } finally {
        client.close();
    }
}

deploy();

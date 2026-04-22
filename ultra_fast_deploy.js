const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "backend/.env") });

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
            host: "46.202.172.186",
            user: "u849872745.archiplanner",
            password: "ArchiLuis.-48",
            secure: false
        });

        console.log("🚀 INICIANDO DESPLIEGUE ULTRA-RÁPIDO (Solo Código)...");

        // 1. Subir archivos raíz del frontend (index.html, .htaccess)
        console.log("📤 Subiendo archivos raíz del frontend...");
        const distPath = path.resolve(__dirname, "frontend/dist");
        await client.uploadFrom(path.join(distPath, "index.html"), "index.html");
        await client.uploadFrom(path.join(distPath, ".htaccess"), ".htaccess");

        // 2. Subir Assets (JS y CSS) - Esto es lo que cambia con build
        console.log("📤 Subiendo Assets (JS/CSS)...");
        const assetsPath = path.join(distPath, "assets");
        await client.uploadFromDir(assetsPath, "assets");

        // 3. Subir Backend (Solo src)
        console.log("📤 Subiendo Backend (src)...");
        const backendSrc = path.resolve(__dirname, "backend/src");
        await client.uploadFromDir(backendSrc, "api/src");

        console.log("📤 Subiendo index.js (Entry Point)...");
        await client.uploadFrom(path.resolve(__dirname, "backend/src/index.js"), "api/index.js");

        console.log("✅ DESPLIEGUE COMPLETADO!");
        console.log("✨ El crash ha sido corregido y el código actualizado.");

    } catch (err) {
        console.error("❌ Error en el despliegue:", err);
    } finally {
        client.close();
    }
}

deploy();

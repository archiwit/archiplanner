const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");

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

        console.log("🚀 SUBIENDO SOLAMENTE ASSETS DEL FRONTEND...");

        const distPath = path.resolve(__dirname, "frontend/dist");
        
        // 1. Subir index.html
        console.log("📤 Subiendo index.html...");
        await client.uploadFrom(path.join(distPath, "index.html"), "index.html");

        // 2. Subir Assets JS/CSS
        console.log("📤 Subiendo carpeta assets...");
        await client.uploadFromDir(path.join(distPath, "assets"), "assets");

        console.log("✅ FRONTEND ACTUALIZADO!");

    } catch (err) {
        console.error("❌ Error en el despliegue:", err);
    } finally {
        client.close();
    }
}

deploy();

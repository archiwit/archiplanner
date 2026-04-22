const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");

async function syncImages() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
            host: "46.202.172.186",
            user: "u849872745.archiplanner",
            password: "ArchiLuis.-48",
            secure: false
        });

        console.log("🚀 Conectado a Hostinger FTP para subir imágenes...");

        // Ensure target directory exists
        await client.ensureDir("/uploads");

        // Upload the whole local uploads folder to the server
        console.log("📁 Subiendo carpeta 'uploads' completa... Esto puede tardar unos minutos.");
        const localUploads = path.resolve(__dirname, "backend/uploads");
        await client.uploadFromDir(localUploads, "/uploads");

        console.log("✅ ¡IMÁGENES SINCRONIZADAS CORRECTAMENTE!");
        console.log("Refresca la web para ver los cambios.");

    } catch (err) {
        console.error("❌ Falló la sincronización de imágenes:", err);
    } finally {
        client.close();
    }
}

syncImages();

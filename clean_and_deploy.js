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

        console.log("🚀 LIMPIANDO Y SUBIENDO ASSETS DEL FRONTEND...");

        console.log("🗑️ Eliminando carpeta assets antigua para evitar conflictos...");
        try {
            await client.removeDir("/assets");
            console.log("Carpeta assets eliminada.");
        } catch (e) {
            console.log("No se pudo eliminar assets o no existía.");
        }

        const distPath = path.resolve(__dirname, "frontend/dist");
        
        // Subir todo el contenido de dist a la raíz del servidor
        console.log("📤 Subiendo contenido de dist...");
        await client.uploadFromDir(distPath);

        console.log("✅ FRONTEND ACTUALIZADO COMPLETAMENTE!");

    } catch (err) {
        console.error("❌ Error en el despliegue:", err);
    } finally {
        client.close();
    }
}

deploy();

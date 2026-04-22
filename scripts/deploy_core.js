const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");

async function deployCore() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
            host: "46.202.172.186",
            user: "u849872745.archiplanner",
            password: "ArchiLuis.-48",
            secure: false
        });

        console.log("Connected to Hostinger FTP (CORE MODE)");

        const distRoot = path.resolve(__dirname, "../frontend/dist");
        
        // 1. Subir index.html
        console.log("Uploading index.html...");
        await client.uploadFrom(path.join(distRoot, "index.html"), "index.html");

        // 2. Subir Assets Críticos (JS y CSS)
        console.log("Uploading core assets...");
        const assetsDir = path.resolve(distRoot, "assets");
        const assetFiles = fs.readdirSync(assetsDir);
        
        await client.ensureDir("assets");
        await client.cd("/"); // Volver a raíz por seguridad antes de subir rutas relativas
        for (const file of assetFiles) {
            // Solo subimos los bundles de JS y CSS principales para ir al grano
            if (file.startsWith("index-") && (file.endsWith(".js") || file.endsWith(".css"))) {
                console.log(`Uploading ${file}...`);
                await client.uploadFrom(path.join(assetsDir, file), `assets/${file}`);
            }
        }

        console.log("CORE DEPLOYMENT COMPLETE! The site should be fixed now.");

    } catch (err) {
        console.error("Core deployment failed:", err);
    } finally {
        client.close();
    }
}

deployCore();

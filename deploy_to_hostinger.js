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
            secure: false // Hostinger standard FTP is usually not secure by default on port 21
        });

        console.log("Connected to Hostinger FTP");

        // --- 0. Cleanup (FUSION MODE: Selective cleanup) ---
        console.log("Cleaning up selectively...");
        try { await client.remove("/default.php"); } catch(e) {}
        // try { await client.remove("/archiplanner_prod_dump.sql"); } catch(e) {}
        // try { await client.removeDir("/public_html"); } catch(e) {}
        // try { await client.removeDir("/assets"); } catch(e) {}
        // try { await client.removeDir("/images"); } catch(e) {}
        // try { await client.removeDir("/uploads"); } catch(e) {}
        // try { await client.removeDir("/api"); } catch(e) {}

        // --- 1. Upload Frontend (Root) ---
        console.log("Uploading Frontend to /...");
        
        // Upload root files (index.html, .htaccess, favicon, etc)
        const distRoot = path.resolve(__dirname, "frontend/dist");
        const rootFiles = fs.readdirSync(distRoot).filter(f => !fs.lstatSync(path.join(distRoot, f)).isDirectory());
        
        await client.cd("/");
        for (const file of rootFiles) {
            await client.uploadFrom(path.join(distRoot, file), file);
        }

        // Upload assets directory (this uploads contents of distRoot/assets INTO remote /assets)
        console.log("Uploading assets...");
        await client.uploadFromDir(path.resolve(distRoot, "assets"), "assets");
        
        // Upload images directory if it exists
        if (fs.existsSync(path.resolve(distRoot, "images"))) {
            console.log("Uploading images...");
            await client.uploadFromDir(path.resolve(distRoot, "images"), "images");
        }

        // Upload backend uploads directory to root /uploads
        const backendUploads = path.resolve(__dirname, "backend/uploads");
        if (fs.existsSync(backendUploads)) {
            console.log("Uploading backend/uploads to /uploads...");
            await client.uploadFromDir(backendUploads, "uploads");
        }
        
        console.log("Frontend uploaded successfully!");

        // --- 2. Upload Backend (API) ---
        console.log("Uploading Backend to /api...");
        await client.ensureDir("/api");
        await client.clearWorkingDir();
        
        const backendFiles = ["src", "package.json", "package-lock.json"];

        for (const item of backendFiles) {
            const localPath = path.resolve(__dirname, "backend", item);
            if (fs.lstatSync(localPath).isDirectory()) {
                await client.uploadFromDir(localPath, `/api/${item}`);
            } else {
                await client.uploadFrom(localPath, `/api/${item}`);
            }
        }

        // Create the production .env file on the server
        const prodEnvContent = `
PORT=5000
DB_HOST=localhost
DB_USER=u849872745_archiplanner
DB_PASSWORD=zRAhV8kgJ%bH4NZMARV
DB_NAME=u849872745_archiplanner
JWT_SECRET=onyx_rose_production_2026
IG_USER_ID=${process.env.IG_USER_ID || ''}
IG_ACCESS_TOKEN=${process.env.IG_ACCESS_TOKEN || ''}
NODE_ENV=production
        `.trim();
        
        const tempEnvPath = path.resolve(__dirname, "backend/.env.prod_temp");
        fs.writeFileSync(tempEnvPath, prodEnvContent);
        await client.uploadFrom(tempEnvPath, "/api/.env");
        fs.unlinkSync(tempEnvPath);

        console.log("Backend uploaded successfully!");

        // --- 3. Upload Fusion Migration Scripts ---
        console.log("Uploading Migration Scripts...");
        await client.uploadFrom(path.resolve(__dirname, "BASE_DE_DATOS_V4_FUSION.sql"), "/BASE_DE_DATOS_V4_FUSION.sql");
        await client.uploadFrom(path.resolve(__dirname, "backend/scripts/migration_v6.sql"), "/migration_v6.sql");

        console.log("DEPLOYMENT COMPLETE! Check archiplanner.com.co");
        console.log("IMPORTANT: Now run migration_v6.sql in your phpMyAdmin.");

    } catch (err) {
        console.error("Deployment failed:", err);
    } finally {
        client.close();
    }
}

deploy();

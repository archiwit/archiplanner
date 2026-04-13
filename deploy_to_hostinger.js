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

        // --- 0. Cleanup ---
        console.log("Cleaning up...");
        try { await client.remove("/default.php"); } catch(e) {}
        try { await client.removeDir("/public_html/public_html"); } catch(e) {}

        // --- 1. Upload Frontend (Public HTML) ---
        console.log("Uploading Frontend to /...");
        await client.cd("/");
        await client.uploadFromDir(path.resolve(__dirname, "frontend/dist"));
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
NODE_ENV=production
        `.trim();
        
        const tempEnvPath = path.resolve(__dirname, "backend/.env.prod_temp");
        fs.writeFileSync(tempEnvPath, prodEnvContent);
        await client.uploadFrom(tempEnvPath, "/api/.env");
        fs.unlinkSync(tempEnvPath);

        console.log("Backend uploaded successfully!");
        console.log("DEPLOYMENT COMPLETE! Check archiplanner.com.co");

    } catch (err) {
        console.error("Deployment failed:", err);
    } finally {
        client.close();
    }
}

deploy();

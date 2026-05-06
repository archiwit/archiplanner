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

        console.log("🚀 Connected to Hostinger FTP");

        // 1. Upload upload_bridge.php to root
        console.log("📤 Uploading storage bridge...");
        await client.uploadFrom(path.resolve(__dirname, "upload_bridge.php"), "upload_bridge.php");

        // 2. Upload Frontend (Root files)
        console.log("📤 Uploading frontend root files...");
        const distRoot = path.resolve(__dirname, "frontend/dist");
        const rootFiles = fs.readdirSync(distRoot).filter(f => !fs.lstatSync(path.join(distRoot, f)).isDirectory());
        
        await client.cd("/");
        for (const file of rootFiles) {
            await client.uploadFrom(path.join(distRoot, file), file);
        }

        // 3. Upload assets (Clean upload)
        console.log("📤 Uploading assets (clean)...");
        // We don't remove the whole assets dir to avoid downtime, but we upload new files
        await client.uploadFromDir(path.resolve(distRoot, "assets"), "assets");
        
        console.log("✅ Deployment to Hostinger COMPLETE!");

    } catch (err) {
        console.error("❌ Deployment failed:", err);
    } finally {
        client.close();
    }
}

deploy();

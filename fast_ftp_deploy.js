const ftp = require("basic-ftp");
const path = require("path");

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

        console.log("🚀 SUBIENDO ZIP Y UNZIP.PHP...");

        console.log("📤 Subiendo deploy.zip...");
        await client.uploadFrom(path.resolve(__dirname, "deploy.zip"), "deploy.zip");

        console.log("📤 Subiendo unzip.php...");
        await client.uploadFrom(path.resolve(__dirname, "unzip.php"), "unzip.php");

        console.log("✅ ARCHIVOS SUBIDOS EXITOSAMENTE!");

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        client.close();
    }
}

deploy();

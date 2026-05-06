const ftp = require("basic-ftp");

async function check() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "46.202.172.186",
            user: "u849872745.archiplanner",
            password: "ArchiLuis.-48",
            secure: false
        });
        
        const list = await client.list("/assets");
        console.log(`Archivos en /assets: ${list.length}`);
    } catch (err) {
        console.error(err.message);
    } finally {
        client.close();
    }
}
check();

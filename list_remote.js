const ftp = require("basic-ftp");

async function listRemote() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "46.202.172.186",
            user: "u849872745.archiplanner",
            password: "ArchiLuis.-48",
            secure: false
        });

        console.log("--- ROOT ---");
        console.log(await client.list("/"));

        console.log("--- public_html ---");
        console.log(await client.list("/public_html"));
        
        try {
            console.log("--- public_html/public_html ---");
            console.log(await client.list("/public_html/public_html"));
        } catch(e) { console.log("public_html/public_html does not exist"); }

    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}

listRemote();

// const { Client } = require("selfbot-discord");
const { Client, RichPresence } = require("discord.js-selfbot-v13");
const fs = require("fs");
const SENDERS_SRC = "./senders.json";

const startBot = async (token, content) => {
    const startClient = async () => {
        try {
            const client = new Client();

            client.on("ready", async () => {
                console.log(`✅ ${client.user.tag} is online!`);
                const getExtendURL = await RichPresence.getExternal(
                    client,
                    "1904040404040404419",
                    "https://archive.org/download/app-icon-roblox/app-icon-roblox.png" // Required if the image you use is not in Discord
                );
                const status = new RichPresence()
                    .setApplicationId("1904040404040404419")
                    .setType("PLAYING")
                    .setName("Roblox")
                    .setAssetsSmallImage(getExtendURL[0].external_asset_path);

                client.user.setPresence({ activities: [status] });
            });

            client.on("messageCreate", (msg) => {
                if (msg.author.id === client.user.id) return;
                if (msg.channel?.type?.toLowerCase() == "dm") {
                    if (!isHasSenderForClient(token, msg.author.id)) {
                        addSenderForClient(token, msg.author.id);
                        msg.reply(content || "DEFAULT REPLY");
                    }
                }
            });

            await client.login(token);

            addClient(token);

            return client;
        } catch (error) {
            console.log(error.message);
        }
    };

    return startClient();
};

const parseClients = () =>
    fs.existsSync(SENDERS_SRC) ? JSON.parse(fs.readFileSync(SENDERS_SRC)) : {};

const addClient = (token) => {
    let clients = parseClients();
    !clients[token]?.length && (clients[token] = []);
    fs.writeFileSync(SENDERS_SRC, JSON.stringify(clients));
};

const addSenderForClient = (token, sender) => {
    let clients = parseClients();
    clients[token]?.push(sender);
    fs.writeFileSync(SENDERS_SRC, JSON.stringify(clients));
};

const isHasSenderForClient = (token, sender) => {
    let clients = parseClients();
    return clients[token]?.filter((d) => d == sender).length;
};

(async () => {
    console.log("running...");
    const bots = JSON.parse(fs.readFileSync("./bots.json"));
    for (const bot of bots) {
        try {
            await startBot(bot.auth, bot.content);
        } catch (error) {
            console.log(`${bot.auth} : ${error.message}`);
        }
    }
})();

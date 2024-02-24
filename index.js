import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});
client.login(process.env.BOT_TOKEN);

client.on("messageCreate", async (message) => {
  if (!message?.author.bot) {
    console.log(message);
    message.channel.send(`ECHO: ${message.content}`);
  }
});

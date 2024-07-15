const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.modalResponses = new Collection();
client.cooldowns = new Collection();
client.currentShows = new Collection();
client.userGuesses = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const modalPath = path.join(__dirname, "modalResponses");
const modalFiles = fs
  .readdirSync(modalPath)
  .filter((file) => file.endsWith(".js"));
for (const modalFile of modalFiles) {
  const filePath = path.join(modalPath, modalFile);
  const modal = require(filePath);
  if ("execute" in modal && "customId" in modal) {
    client.modalResponses.set(modal.customId, modal);
  } else {
    console.log(
      `[WARNING] The modal at ${filePath} is missing a required "execute" property.`
    );
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(token);

/*
The API key for application "Phish Setlist Bot" is: 4A2A5AD2A0CD6F83D3A7
The Public key for application "Phish Setlist Bot" is: 84DA2116B17108C7E36F
*/

// client.on("messageCreate", async (message) => {
//   if (isCommand(message, "nextshow")) {
//     const shows = await fetchShows();
//     const nextShowToBePlayed = shows.data
//       .filter((show) => {
//         const [showYear, showMonth, showDay] = show.showdate.split("-");
//         const showDate = new Date(showYear, showMonth - 1, showDay);
//         const currentDate = new Date();
//         // Set the current date to 12:00am
//         currentDate.setHours(0, 0, 0, 0);
//         return showDate >= currentDate;
//       })
//       .sort((a, b) => new Date(a.showdate) - new Date(b.showdate))[0];
//     const showList = mapShowToDiscordResponse(nextShowToBePlayed);

//     message.channel.send(`Here's the next show to be played:\n\n${showList}`);
//   } else if (isCommand(message, "guessSetlist")) {
//     message.channel.send("Guess the setlist for the next show!");
//   } else if (isCommand(message, "help")) {
//     message.channel.send(
//       "Here are the commands you can use:\n\n- !nextshow: Get the next show to be played\n- !guessSetlist: Guess the setlist for the next show\n- !help: Get the list of commands"
//     );
//   }
// });

// const isCommand = (message, commandName) =>
//   !message?.author.bot && message.content.startsWith(`!${commandName}`);

// const mapShowToDiscordResponse = (show) =>
//   `- **${show.venue}**\n - ${show.showdate}\n - ${show.venue}, ${show.city}, ${show.state}\n - **Show Id:** ${show.showid}\n\n`;

// async function fetchShows() {
//   const urlParams = new URLSearchParams({
//     order_by: "showdate",
//     apikey: process.env.PHISH_NET_API_KEY,
//     direction: "desc",
//     limit: 100,
//   });
//   console.log();
//   const response = await fetch(
//     `${baseUrl}/shows/artist/phish.json?${urlParams}`
//   );
//   const data = await response.json();
//   //console.log(data);
//   return data;
// }

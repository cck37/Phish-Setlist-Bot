import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

/*
The API key for application "Phish Setlist Bot" is: 4A2A5AD2A0CD6F83D3A7
The Public key for application "Phish Setlist Bot" is: 84DA2116B17108C7E36F
*/

const baseUrl = "https://api.phish.net/v5";

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
  if (isCommand(message, "nextshow")) {
    const shows = await fetchShows();
    const nextShowToBePlayed = shows.data
      .filter((show) => {
        const [showYear, showMonth, showDay] = show.showdate.split("-");
        const showDate = new Date(showYear, showMonth - 1, showDay);
        const currentDate = new Date();
        // Set the current date to 12:00am
        currentDate.setHours(0, 0, 0, 0);
        return showDate >= currentDate;
      })
      .sort((a, b) => new Date(a.showdate) - new Date(b.showdate))[0];
    const showList = mapShowsToDiscordResponse(nextShowToBePlayed);

    message.channel.send(`Here's the next show to be played:\n\n${showList}`);
  } else if (isCommand(message, "guessSetlist")) {
    message.channel.send("Guess the setlist for the next show!");
  } else if (isCommand(message, "help")) {
    message.channel.send(
      "Here are the commands you can use:\n\n- !nextshow: Get the next show to be played\n- !guessSetlist: Guess the setlist for the next show\n- !help: Get the list of commands"
    );
  }
});

const isCommand = (message, commandName) =>
  !message?.author.bot && message.content.startsWith(`!${commandName}`);

const mapShowsToDiscordResponse = (show) =>
  `- **${show.venue}**\n - ${show.showdate}\n - ${show.venue}, ${show.city}, ${show.state}\n - **Show Id:** ${show.showid}\n\n`;

async function fetchShows() {
  const urlParams = new URLSearchParams({
    order_by: "showdate",
    apikey: "4A2A5AD2A0CD6F83D3A7",
    direction: "desc",
    limit: 100,
  });
  console.log();
  const response = await fetch(
    `${baseUrl}/shows/artist/phish.json?${urlParams}`
  );
  const data = await response.json();
  //console.log(data);
  return data;
}

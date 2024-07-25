const { SlashCommandBuilder, Collection } = require("discord.js");
const { fetchNextShow } = require("../../api");

const testShow = {
  showid: "1709061734",
  showyear: "2024",
  showmonth: "7",
  showday: "23",
  showdate: "2024-07-23",
  permalink:
    "https://phish.net/setlists/phish-july-23-2024-mohegan-sun-arena-uncasville-ct-usa.html",
  exclude_from_stats: "0",
  venueid: "1467",
  setlist_notes: "",
  venue: "Mohegan Sun Arena",
  city: "Uncasville",
  state: "CT",
  country: "USA",
  artistid: "1",
  artist_name: "Phish",
  tourid: "172",
  tour_name: "2024 Summer Tour",
  created_at: "2024-02-27 14:22:14",
  updated_at: "2024-07-02 15:06:07",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("startguess")
    .setDescription("Starts the game for the next show."),
  async execute(interaction) {
    await interaction.deferReply("Thinking...");
    const { member, client, guildId } = interaction;
    const { currentShows, userGuesses } = client;

    if (!member.roles.cache.some((role) => role.name === "Phish Bot Manager")) {
      await interaction.editReply(
        `You don't have the proper role to run this. You need the role \`Phish Bot Manager\` to run that command.`
      );
      return;
    }

    if (!currentShows.has(guildId)) {
      const nextShowToBePlayed = await fetchNextShow();
      currentShows.set(guildId, new Collection());
      currentShows.get(guildId).set("show", nextShowToBePlayed);
      userGuesses.set(guildId, new Collection());
      await interaction.editReply(
        `The game for the next show on ${nextShowToBePlayed.showdate} at ${nextShowToBePlayed.venue} has started! Guess the setlist by typing \`/guess\`.`
      );
    } else {
      const currentShow = currentShows.get(guildId).get("show");
      await interaction.editReply(
        `A game is already running for this server for show on ${currentShow.showdate} at ${currentShow.venue}. You can stop the game by typing \`/stopguess\`.`
      );
    }
  },
};

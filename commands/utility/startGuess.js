const { SlashCommandBuilder, Collection } = require("discord.js");
const { fetchNextShow } = require("../../api");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("startguess")
    .setDescription("Starts the game for the next show."),
  async execute(interaction) {
    await interaction.deferReply("Thinking...");
    const { currentShows, userGuesses } = interaction.client;
    if (!currentShows.has(interaction.guildId)) {
      const nextShowToBePlayed = await fetchNextShow();
      currentShows.set(interaction.guildId, new Collection());
      currentShows.get(interaction.guildId).set("show", nextShowToBePlayed);
      userGuesses.set(interaction.guildId, new Collection());
      await interaction.editReply(
        `The game for the next show on ${nextShowToBePlayed.showdate} at ${nextShowToBePlayed.venue} has started! Guess the setlist by typing \`/guess\`.`
      );
    } else {
      const currentShow = currentShows.get(interaction.guildId).get("show");
      await interaction.editReply(
        `A game is already running for this server for show on ${currentShow.showdate} at ${currentShow.venue}. You can stop the game by typing \`/stopguess\`.`
      );
    }
  },
};

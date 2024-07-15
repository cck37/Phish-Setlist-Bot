const { SlashCommandBuilder } = require("discord.js");
const {
  mapShowToDiscordResponse,
  mapUsersToDiscordResponse,
} = require("../../utils/responseMappers");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("nextshow")
    .setDescription("What show are we guessing for?"),
  async execute(interaction) {
    const { currentShows, userGuesses } = interaction.client;
    if (!currentShows.has(interaction.guildId)) {
      await interaction.reply(
        "There is no game running for this server. You can start a game by typing `/startGuess`."
      );
      return;
    }
    const currentShow = currentShows.get(interaction.guildId).get("show");
    const showResponse = mapShowToDiscordResponse(currentShow);
    await interaction.reply(`Show to guess for:\n\n${showResponse}`);
    const currentUserGuesses = userGuesses.get(interaction.guildId);
    if (currentUserGuesses.size > 0) {
      const userGuessResponse = mapUsersToDiscordResponse(
        Array.from(currentUserGuesses.keys())
      );
      await interaction.followUp(userGuessResponse);
    }
  },
};

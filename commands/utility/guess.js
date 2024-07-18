const {
  SlashCommandBuilder,
  ActionRowBuilder,
  Events,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { songs } = require("../../data/songs");

const buildSongSelect = (id, placeholder) => {
  const input = new TextInputBuilder()
    .setCustomId(id)
    .setLabel(placeholder.slice(0, 45)) // 45 max length count
    .setStyle(TextInputStyle.Short);
  /*
    // One day when i can have more than 25 options in a select menu
    // Or when I can have a proper autocomplete
    const options = songs.map((song) =>
    new StringSelectMenuOptionBuilder()
      .setLabel(song)
      .setValue(song.toLowerCase())
  );
  select.addOptions(...options); */
  // Each text input needs to be in an action row
  return new ActionRowBuilder().addComponents(input);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guess")
    .setDescription("Starts the game for the next show."),
  async execute(interaction) {
    const { currentShows } = interaction.client;
    if (!currentShows.has(interaction.guildId)) {
      await interaction.reply(
        "There is no game running for this server. You can start a game by typing `/startguess`."
      );
      return;
    }
    const currentShow = currentShows.get(interaction.guildId).get("show");
    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId("guessModal")
      .setTitle(`Guess for show ${currentShow.showdate}~${currentShow.venue}!`);

    // Create the select menu components
    const set1 = buildSongSelect(
      "s1",
      "First Set Opener, Closer (comma seperated)"
    );
    const set2 = buildSongSelect(
      "s2",
      "Second Set Opener, Closer (comma seperated)"
    );
    const wildcard = buildSongSelect("wc", "Wild Card 1, 2 (comma seperated)");
    const encore = buildSongSelect(
      "e",
      "Encore Opener, Closer (comma seperated)"
    );

    // Add inputs to the modal
    modal.addComponents(set1, set2, wildcard, encore);

    // Show the modal to the user
    await interaction.showModal(modal);
  },
};

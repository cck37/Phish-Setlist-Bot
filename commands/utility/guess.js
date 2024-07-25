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

const buildSongSelect = (id, placeholder, value = "") => {
  const input = new TextInputBuilder()
    .setCustomId(id)
    .setLabel(placeholder.slice(0, 45)) // 45 max length count
    .setStyle(TextInputStyle.Short)
    .setValue(value);
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

const joinValidSetGuesses = (accumulator, current) => {
  if (current.isValid) {
    const setId = current.id.slice(0, 2);
    const existingSet = accumulator.find((item) => item.id === setId);

    if (current.isValid) {
      if (existingSet) {
        existingSet.value += `, ${current.value}`;
      } else {
        accumulator.push({ id: setId, value: current.value });
      }
    }
  }
  return accumulator;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guess")
    .setDescription("Starts the game for the next show."),
  async execute(interaction) {
    const { user, client, guildId } = interaction;
    const { currentShows } = client;
    let previousUserGuesses = [];

    if (
      client.userGuesses.has(guildId) &&
      client.userGuesses.get(guildId).size > 0 &&
      client.userGuesses.get(guildId).has(user.username)
    ) {
      previousUserGuesses = client.userGuesses
        .get(guildId)
        .get(user.username)
        .reduce(joinValidSetGuesses, []);
    }

    if (!currentShows.has(guildId)) {
      await interaction.reply(
        "There is no game running for this server. You can start a game by typing `/startguess`."
      );
      return;
    }
    const currentShow = currentShows.get(guildId).get("show");
    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId("guessModal")
      .setTitle(`Guess for show ${currentShow.showdate}~${currentShow.venue}!`);

    // Create the select menu components
    const set1 = buildSongSelect(
      "s1",
      "First Set Opener, Closer (comma seperated)",
      previousUserGuesses.find((g) => g.id === "s1")?.value ?? ""
    );
    const set2 = buildSongSelect(
      "s2",
      "Second Set Opener, Closer (comma seperated)",
      previousUserGuesses.find((g) => g.id === "s2")?.value ?? ""
    );
    const wildcard = buildSongSelect(
      "wc",
      "Wild Card 1, 2 (comma seperated)",
      previousUserGuesses.find((g) => g.id === "wc")?.value ?? ""
    );
    const encore = buildSongSelect(
      "e",
      "Any one song for encore (no comma needed)",
      previousUserGuesses.find((g) => g.id === "e")?.value
    );

    // Add inputs to the modal
    modal.addComponents(set1, set2, wildcard, encore);

    // Show the modal to the user
    await interaction.showModal(modal);
  },
};

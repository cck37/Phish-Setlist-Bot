const { songs } = require("../data/songs");
const { mapInputToResponse } = require("../utils/responseMappers");

const customFieldsIds = ["s1", "s2", "wc", "e"];
const userInputFields = ["s1o", "s1c", "s2o", "s2c", "eo", "ec", "wc1", "wc2"];

const validRepsonse =
  "Guess has been saved and can be seen below. If you need to make changes, just type `/guess` again.";
const invalidResponse =
  "Your guess hasn't been saved. Looks like you have at least one invalid guess.\nCheck the list of songs and remember, it must match what's on this sheet:\nhttps://docs.google.com/spreadsheets/d/1X_QoZz0icaalqZSAF80uPcrc5OcXuOsL9YqUh7IOdeE/edit?usp=sharing";

module.exports = {
  customId: "guessModal",
  async execute(interaction) {
    const { user, fields, client } = interaction;
    let isAllValid = true;
    let userGuesses = {};
    let resultsString = "";
    customFieldsIds.forEach((id) => {
      const inputArray = fields.getTextInputValue(id).split(",");
      inputArray.forEach((input, idx) => {
        let newId = id;
        switch (id) {
          case "s1":
            if (idx === 0) newId = "s1o";
            else newId = "s1c";
            break;
          case "s2":
            if (idx === 0) newId = "s2o";
            else newId = "s2c";
            break;
          case "wc":
            newId = `wc${idx + 1}`;
            break;
          case "e":
            if (idx === 0) newId = "eo";
            else newId = "ec";
            break;
        }
        userGuesses[newId] = input.trim();
        const isValid = songs
          .map((s) => s.toLowerCase())
          .includes(input.trim().toLowerCase());
        if (!isValid) {
          isAllValid = false;
        }
        resultsString += mapInputToResponse(input, newId, isValid) + "\n";
      });
    });

    if (isAllValid) {
      const guess = userInputFields.map((id) => ({
        id,
        value: userGuesses[id],
      }));
      client.userGuesses.get(interaction.guildId).set(user.username, guess);
    }

    await interaction.reply({
      content: `${
        isAllValid ? validRepsonse : invalidResponse
      }\n${resultsString}`,
      ephemeral: true,
    });
  },
};

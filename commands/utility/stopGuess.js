const { SlashCommandBuilder } = require("discord.js");
const { fetchSetList } = require("../../api");

const guessIdToScore = (guessId) => {
  if (guessId.startsWith("s1") || guessId.startsWith("s2")) {
    return 4;
  } else if (guessId.startsWith("e")) {
    return 5;
  } else if (guessId.startsWith("wc")) {
    return 3;
  } else {
    return 0;
  }
};

const buildResults = (userScores) => {
  return userScores
    .map(
      (userScore) =>
        ` - **${userScore.user}**
            - Score: \`${userScore.score}\`
          - Songs guessed correctly: \n\t${
            userScore.correctGuesses.length > 0
              ? userScore.correctGuesses.map((guess) => `${guess}`).join("\n\t")
              : "\tNone"
          }`
    )
    .join("\n");
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stopguess")
    .setDescription("Stops the game for the current show."),
  async execute(interaction) {
    await interaction.deferReply("Thinking...");
    const { currentShows, userGuesses } = interaction.client;
    if (!currentShows.has(interaction.guildId)) {
      await interaction.editReply(
        "There is no game running for this server. You can start a game by typing `/startguess`."
      );
      return;
    }
    const currentShow = currentShows.get(interaction.guildId).get("show");
    const curretShowSetList = await fetchSetList(currentShow.showId); //await fetchSetList("1644953886");
    if (!curretShowSetList.length > 0) {
      await interaction.editReply(
        `The show on ${currentShow.showdate} at ${currentShow.venue} has not ended yet. You can stop the game after the show has ended.`
      );
      return;
    }
    let songsPlayed = {};
    let prevSong = {};

    for (const songObj of curretShowSetList) {
      // Opening song first set
      if (songObj.set === "1" && songObj.position === "1") {
        songsPlayed["s1o"] = songObj;
        // Opening song second set and closing song first set
      } else if (songObj.set === "2" && prevSong.set === "1") {
        songsPlayed["s1c"] = prevSong;
        songsPlayed["s2o"] = songObj;
        // Opening song encore and closing song second set
      } else if (songObj.set === "e" && prevSong.set === "2") {
        songsPlayed["s2c"] = prevSong;
        songsPlayed["eo"] = songObj;
      } else if (songObj.set === "e" && prevSong.set === "e") {
        songsPlayed["ec"] = songObj;
      }

      prevSong = songObj;
    }

    // Wildcard songs are all songs that aren't openers or closers for any set
    const songsNamesPlayed = Object.keys(songsPlayed).map(
      (key) => songsPlayed[key].song
    );
    songsPlayed["wc"] = curretShowSetList.filter(
      (songObj) => !songsNamesPlayed.includes(songObj.song)
    );

    console.log(
      Object.keys(songsPlayed).map((key) => {
        if (key === "wc") {
          return songsPlayed[key].map((song) => song.song);
        }
        return key + " " + songsPlayed[key].song;
      })
    );

    if (
      userGuesses.has(interaction.guildId) &&
      userGuesses.get(interaction.guildId).size > 0
    ) {
      const currentUserGuesses = userGuesses.get(interaction.guildId);
      const userGuessesArray = Array.from(currentUserGuesses.keys());
      const userScores = userGuessesArray.map((user) => {
        const userGuesses = currentUserGuesses.get(user);
        console.log(user, userGuesses);

        let score = 0;
        let correctGuesses = [];
        for (const guess of userGuesses) {
          // Partial guesses are allowed so skip empty guesses
          if (!guess.value) {
            continue;
          }
          if (guess.id.startsWith("wc")) {
            const songPlayedForSet = songsPlayed["wc"];
            // Wildcard entires are an array... i'm sure that wont be confusing
            const playedSongs = songPlayedForSet.map((song) =>
              song.song.toLowerCase().trim()
            );
            if (playedSongs.includes(guess.value.toLowerCase())) {
              score += guessIdToScore(guess.id);
              correctGuesses.push(`${guess.id} - ${guess.value} +${score}`);
            }
          } else {
            const songPlayedForSet = songsPlayed[guess.id];
            // Check if songsPlayedForSet is an array or an object
            if (Array.isArray(songPlayedForSet)) {
              const playedSongs = songPlayedForSet.map((song) =>
                song.song.toLowerCase().trim()
              );
              if (playedSongs.includes(guess.value.toLowerCase().trim())) {
                score += guessIdToScore(guess.id);
                correctGuesses.push(`${guess.id} - ${guess.value} +${score}`);
              }
            } else if (
              songPlayedForSet.song.toLowerCase().trim() ===
              guess.value.toLowerCase().trim()
            ) {
              score += guessIdToScore(guess.id);
              correctGuesses.push(`${guess.id} - ${guess.value} +${score}`);
            }
          }
        }
        return {
          user,
          score,
          correctGuesses,
        };
      });
      await interaction.editReply(
        `The game for the show on ${currentShow.showdate} at ${
          currentShow.venue
        } has been stopped. Here are the results:\n${buildResults(
          userScores
        )}\n\nYou can start a new game by typing \`/startguess\`.`
      );
      currentShows.delete(interaction.guildId);
      return;
    }

    currentShows.delete(interaction.guildId);
    await interaction.editReply(
      `The game for the show on ${currentShow.showdate} at ${currentShow.venue} has been stopped. You can start a new game by typing \`/startguess\`.`
    );
  },
};

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { unorderedList } = require("@discordjs/formatters");
const { fetchSetList } = require("../../api");
const {
  normalizeSongName,
  generateColorByUsername,
  guessIdToFriendlyString,
} = require("../../utils/responseMappers");

const guessIdToScore = (guessId) => {
  if (guessId.startsWith("s1") || guessId.startsWith("s2")) {
    return 4;
  } else if (guessId === "e") {
    return 5;
  } else if (guessId.startsWith("wc")) {
    return 3;
  } else {
    return 0;
  }
};

/*
const buildResultEmbed = (userScores) => {
  return userScores
    .map((userScore) =>
      unorderedList([
        `**${userScore.user}**`,
        `\n\tScore: \`${userScore.score}\``,
        `\n\tSongs guessed correctly: ${
          userScore.correctGuesses.length > 0
            ? unorderedList(
                userScore.correctGuesses.map((guess) => `\n\t${guess}`)
              )
            : "\n\tNone"
        }`,
      ])
    )
    .join("\n");
};
*/

const buildResultEmbed = (userScores, isWinner, defaultAvatarURL) =>
  new EmbedBuilder()
    .setColor(generateColorByUsername(userScores.user))
    .setTitle(`${userScores.user} ${isWinner ? "🏆" : ""}`)
    .setThumbnail(defaultAvatarURL)
    .setDescription(`Score: ${userScores.score}`)
    .addFields(
      userScores.correctGuesses.length > 0
        ? userScores.correctGuesses.map((guess) => ({
            name: guessIdToFriendlyString(guess.guessId),
            value: `${guess.songName} +${guess.points}`,
            inline: true,
          }))
        : { name: "None", value: "None" }
    )
    .setTimestamp();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stopguess")
    .setDescription("Stops the game for the current show."),
  async execute(interaction) {
    await interaction.deferReply("Thinking...");
    const { member, guild } = interaction;
    const { currentShows, userGuesses, users } = interaction.client;

    if (!member.roles.cache.some((role) => role.name === "Phish Bot Manager")) {
      await interaction.editReply(
        `You don't have the proper role to run this. You need the role \`Phish Bot Manager\` to run that command.`
      );
      return;
    }

    if (!currentShows.has(interaction.guildId)) {
      console.error("No show found:", currentShows);
      await interaction.editReply(
        "There is no game running for this server. You can start a game by typing `/startguess`."
      );
      return;
    }
    const currentShow = currentShows.get(interaction.guildId).get("show");
    console.log("Getting results for show:", currentShow);
    const curretShowSetList = await fetchSetList(currentShow.showid);
    if (!curretShowSetList.length > 0) {
      console.error("No setlist found:", curretShowSetList);
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
        // Opening closing song second set
      } else if (songObj.set === "e" && prevSong.set === "2") {
        songsPlayed["s2c"] = prevSong;
      }

      prevSong = songObj;
    }

    // Wildcard songs are all songs played
    songsPlayed["wc"] = curretShowSetList;

    // Encore is any song played in the encore
    songsPlayed["e"] = curretShowSetList.filter(
      (songObj) => songObj.set === "e"
    );

    console.log(
      "Songs played:",
      Object.keys(songsPlayed).map((key) => {
        if (key === "wc" || key === "e") {
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
        console.log(`Users ${user} guesses:`, userGuesses);
        let score = 0;
        let correctGuesses = [];
        for (const guess of userGuesses) {
          // Partial guesses are allowed so skip empty guesses
          if (!guess.value || !guess.isValid) {
            continue;
          }

          if (guess.id.startsWith("wc")) {
            const songPlayedForSet = songsPlayed["wc"];
            // Wildcard entires are an array... i'm sure that wont be confusing
            const playedSongs = songPlayedForSet.map((song) =>
              normalizeSongName(song.song)
            );
            if (playedSongs.includes(guess.value)) {
              const points = guessIdToScore(guess.id);
              score += points;
              correctGuesses.push({
                guessId: guess.id,
                songName: guess.value,
                points: points,
              });
            }
          } else if (guess.id === "e") {
            const songPlayedForSet = songsPlayed["e"];
            const playedEncoreSongs = songPlayedForSet.map((song) =>
              normalizeSongName(song.song)
            );
            // Guess played in encore at all
            if (playedEncoreSongs.includes(guess.value)) {
              const points = guessIdToScore(guess.id);
              score += points;
              correctGuesses.push({
                guessId: guess.id,
                songName: guess.value,
                points: points,
              });
            } // Guess played in show at all
            else if (
              songsPlayed["wc"]
                .map((song) => normalizeSongName(song.song))
                .includes(guess.value)
            ) {
              const points = 1;
              score += points;
              correctGuesses.push({
                guessId: "any",
                songName: guess.value,
                points: points,
              });
            }
          } else {
            const songPlayedForSet = songsPlayed[guess.id];
            if (
              normalizeSongName(songPlayedForSet.song) ===
              normalizeSongName(guess.value)
            ) {
              const points = guessIdToScore(guess.id);
              score += points;
              correctGuesses.push({
                guessId: guess.id,
                songName: guess.value,
                points: points,
              });
            }
            // Guess played in show at all
            else if (
              songsPlayed["wc"]
                .map((song) => normalizeSongName(song.song))
                .includes(guess.value)
            ) {
              const points = 1;
              score += points;
              correctGuesses.push({
                guessId: "any",
                songName: guess.value,
                points: points,
              });
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
        } has been stopped. Results for each user will be sent seperately. \nSongs played:
        ${unorderedList(
          Object.keys(songsPlayed).map((key) => {
            if (key === "wc" || key === "e") {
              return (
                guessIdToFriendlyString(key) +
                ": \n" +
                unorderedList(songsPlayed[key].map((song) => song.song))
              );
            }
            return guessIdToFriendlyString(key) + ": " + songsPlayed[key].song;
          })
        )}
        \nYou can start a new game by typing \`/startguess\`.`
      );

      userScores
        .sort((a, b) => a.score - b.score)
        .forEach(async (userScore, idx) => {
          const member = await guild.members.search({ query: userScore.user });
          await interaction.followUp({
            embeds: [
              buildResultEmbed(
                userScore,
                idx === userScores.length - 1,
                member.first().displayAvatarURL().toString()
              ),
            ],
          });
        });
      currentShows.delete(interaction.guildId);
      return;
    }

    currentShows.delete(interaction.guildId);
    await interaction.editReply(
      `The game for the show on ${currentShow.showdate} at ${currentShow.venue} has been stopped. You can start a new game by typing \`/startguess\`.`
    );
  },
};

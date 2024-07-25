const mapShowToDiscordResponse = ({
  venue,
  showdate,
  city,
  state,
  permalink,
}) =>
  `- **${venue}**\n - ${showdate}\n - ${venue}, ${city}, ${state}\n - Phish Net Link: ${permalink}\n\n`;

const mapUsersToDiscordResponse = (users) => {
  let response = "Users that have provided their guess:\n\n";
  users.forEach((user) => {
    response += `- **${user}**\n`;
  });
  return response;
};

const mapInputToResponse = (input, id, isValid) => {
  return `- **${id} - ${input}**: ${isValid ? "✔" : "❌"}`;
};

const normalizeSongName = (songName) =>
  songName
    .trim()
    .toLowerCase()
    .replace(/[.,'`‘’]/g, "");

const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

const intToRGB = (i) => {
  const c = (i & 0x00ffffff).toString(16).toUpperCase();

  return "00000".substring(0, 6 - c.length) + c;
};

const generateColorByUsername = (username) => {
  const hash = hashCode(username);
  const color = intToRGB(hash);
  return parseInt(color, 16);
};

const guessIdToFriendlyString = (guessId) => {
  switch (guessId) {
    case "s1o":
      return "Set 1 Opener";
    case "s1c":
      return "Set 1 Closer";
    case "s2o":
      return "Set 2 Opener";
    case "s2c":
      return "Set 2 Closer";
    case "wc1":
      return "Wildcard 1";
    case "wc2":
      return "Wildcard 2";
    case "e":
      return "Encore";
    case "any":
      return "Song Played";
    case "wc":
      return "Wildcard";
    default:
      return "";
  }
};

module.exports = {
  mapShowToDiscordResponse,
  mapUsersToDiscordResponse,
  mapInputToResponse,
  normalizeSongName,
  generateColorByUsername,
  guessIdToFriendlyString,
};

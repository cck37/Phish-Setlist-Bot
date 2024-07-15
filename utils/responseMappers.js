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

module.exports = {
  mapShowToDiscordResponse,
  mapUsersToDiscordResponse,
  mapInputToResponse,
};

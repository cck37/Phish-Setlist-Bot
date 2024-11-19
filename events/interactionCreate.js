const { Events, Collection } = require("discord.js");

async function applyCooldown(interaction, command) {
  const { cooldowns } = interaction.client;

  if (!cooldowns.has(interaction.commandName)) {
    cooldowns.set(interaction.commandName, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(interaction.commandName);
  const defaultCooldownDuration = 3;
  const cooldownAmount = (command?.cooldown ?? defaultCooldownDuration) * 1000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1000);

      // FIX: Apparently neither of these count as valid interactions???
      /**
       * Uncaught _DiscordAPIError DiscordAPIError[10062]: Unknown interaction
            at handleErrors (c:\Users\Botnet2\Desktop\Skript Kiddy\Phish-Setlist-Bot\node_modules\@discordjs\rest\src\lib\handlers\Shared.ts:148:10)
            at processTicksAndRejections (internal/process/task_queues:95:5)
       */
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: `Please wait, you are on a cooldown for \`${interaction.commandName}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `Please wait, you are on a cooldown for \`${interaction.commandName}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          ephemeral: true,
        });
      }
      return;
    }
  }
  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isModalSubmit()) {
      const modal = interaction.client.modalResponses.get(interaction.customId);

      if (!modal) {
        console.error(`No modal matching ${interaction.customId} was found.`);
        return;
      }

      try {
        await modal.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this modal!",
          ephemeral: true,
        });
      }
    } else if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      // FIX: _DiscordAPIError DiscordAPIError[10062]: Unknown interaction
      //applyCooldown(interaction, command);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      }
    } else {
      return;
    }
  },
};

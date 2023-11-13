import { Client } from "discord.js-selfbot-v13";
import { SpamUsers } from "./spamUsers";

const client = new Client({
  // See other options here
  // https://discordjs-self-v13.netlify.app/#/docs/docs/main/typedef/ClientOptions
  // All partials are loaded automatically
});

client.on("ready", async () => {
  console.log(`${client.user!.username} is ready!`);
});

const responses = [
  "Hiiiii",
  "Hello?",
  "Crazy?",
  "I was crazy once!",
  "They locked me in a room.",
  "A rubber room.",
  "A rubber room with rats.",
  "And rats make me crazy.",
];

/**
 * Map of user ID's mapped to timeouts of when to send a "response" to them.
 * Pick the next response from the array of responses.
 * If a new message is sent by them before the timeout is over, reset the timeout.
 * If the timeout is over, delete the entry from the map.
 */
const timeoutMap = new Map<string, NodeJS.Timeout>();
const indexMap = new Map<string, number>();

client.on("messageCreate", async (message) => {
  // Hacky "command" handling so you can add or remove users from the spam list
  if (
    message.content.startsWith("!spam") &&
    message.author.id === client.user!.id
  ) {
    const args = message.content.split(" ");
    console.log("args", args);
    if (args.length !== 3) return;
    const action = args[1];
    const channel = args[2];
    if (action === "add") {
      SpamUsers.Instance.add(channel);
      await message.react("👍");
    } else if (action === "remove") {
      SpamUsers.Instance.remove(channel);
      await message.react("👍");
    } else {
      console.log("idk what to do with", action);
    }
    return;
  }

  if (message.channel.type !== "DM") return;
  if (message.author.id === client.user!.id) return; // Don't want to loop

  const spamUsers = SpamUsers.Instance;
  if (!spamUsers.has(message.channel.id)) return;

  const timeout = timeoutMap.get(message.channel.id);

  if (timeout) {
    clearTimeout(timeout);
    timeoutMap.delete(message.channel.id);
  }

  // Random time between 5 seconds and 5 minutes
  const time = 1000; // Math.floor(Math.random() * 295000) + 5000;

  const newTimeout = setTimeout(async () => {
    const index = indexMap.get(message.channel.id) ?? 0;
    const response = responses[index];
    await message.channel.sendTyping();
    // Wait 2-8 seconds before sending the response
    await new Promise((r) =>
      setTimeout(r, Math.floor(Math.random() * 6000) + 2000)
    );
    // Send the response
    await message.channel.send(response);
    // Increment and cleanup
    indexMap.set(message.channel.id, index + 1);
    timeoutMap.delete(message.channel.id);
  }, time);

  timeoutMap.set(message.channel.id, newTimeout);
});

client.login(process.env.TOKEN!);

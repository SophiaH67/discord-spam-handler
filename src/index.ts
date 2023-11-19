import { Client } from "discord.js-selfbot-v13";
import { SpamUsers } from "./spamUsers";
import { CrazyTextGenerator } from "./text/CrazyTextGenerator";

const client = new Client({
  // See other options here
  // https://discordjs-self-v13.netlify.app/#/docs/docs/main/typedef/ClientOptions
  // All partials are loaded automatically
});

client.on("ready", async () => {
  console.log(`${client.user!.username} is ready!`);
});

/**
 * Map of user ID's mapped to timeouts of when to send a "response" to them.
 * Pick the next response from the array of responses.
 * If a new message is sent by them before the timeout is over, reset the timeout.
 * If the timeout is over, delete the entry from the map.
 */
const timeoutMap = new Map<string, NodeJS.Timeout>();

const textGenerator = new CrazyTextGenerator();

function waitUntil(time: Date) {
  return new Promise((resolve) => {
    const now = Date.now();
    const timeDiff = time.getTime() - now;
    setTimeout(resolve, timeDiff);
  });
}

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

  // Mark channel as read
  void message.markRead(); // Can do it somewhere in the background

  const timeout = timeoutMap.get(message.channel.id);

  if (timeout) {
    clearTimeout(timeout);
    timeoutMap.delete(message.channel.id);
  }

  // Random time between 5 seconds and 5 minutes
  const time = 1000; // Math.floor(Math.random() * 295000) + 5000;

  const newTimeout = setTimeout(async () => {
    const startTime = Date.now();
    const sendTime = startTime + Math.floor(Math.random() * 6000) + 2000; // 2-8 seconds after start time
    const typingP = message.channel.sendTyping();
    const responseP = textGenerator.generate(message.channel.id);
    const [_typing, response] = await Promise.all([typingP, responseP]);

    // Wait until the send time
    await waitUntil(new Date(sendTime));

    // Send the response
    await message.channel.send(response);

    // Clean up the timeout
    timeoutMap.delete(message.channel.id);
  }, time);

  timeoutMap.set(message.channel.id, newTimeout);
});

client.login(process.env.TOKEN!);

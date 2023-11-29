import type { Client } from "discord.js-selfbot-v13";
import type { BaseTestGenerator } from "./BaseTextGenerator";
import OpenAI from "openai";

const openai = new OpenAI();

export class OpenAiTextGenerator implements BaseTestGenerator {
  private threadIdMap = new Map<string, string>();

  async generate(channelId: string, client: Client): Promise<string> {
    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error(`Channel ${channelId} not found!`);
    if (!channel.isText())
      throw new Error(`Channel ${channelId} is not a text channel!`);

    const contextMessages = await channel.messages.fetch({ limit: 10 });

    // Sort by newest first
    const messages = [...contextMessages.values()].sort(
      (a, b) => b.createdTimestamp - a.createdTimestamp
    );
    // Get all messages until the last message sent by the bot
    const lastReadMessageIndex = messages.findIndex(
      (message) => message.author.id === client.user!.id
    );
    const messagesToUse = messages.slice(0, lastReadMessageIndex);

    const thread = await this.getOrCreateThreadId(channelId);

    for (const message of messagesToUse) {
      await openai.beta.threads.messages.create(thread, {
        role: "user",
        content: message.content,
      });
    }

    const run = await openai.beta.threads.runs.create(thread, {
      assistant_id: "asst_Obc2iycFJe867jkkxrUk38qL",
    });

    let actualRun: OpenAI.Beta.Threads.Runs.Run | undefined;

    while (
      actualRun?.status !== "completed" &&
      actualRun?.status !== "failed"
    ) {
      // then retrieve the actual run
      actualRun = await openai.beta.threads.runs.retrieve(
        // use the thread created earlier
        thread,
        run.id
      );
    }

    if (actualRun.status === "failed") {
      debugger;
      throw new Error("Run failed!");
    }

    // Sleep for 2 seconds to give openai time :)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get latest message from run
    const omessages = await openai.beta.threads.messages.list(thread);

    const lastMessage = omessages.data[0];

    if (lastMessage.role !== "assistant")
      throw new Error("Last message was not from assistant!");

    if (lastMessage.content[0].type !== "text")
      throw new Error("Last message was not text!");

    return lastMessage.content[0].text.value;
  }

  private async getOrCreateThreadId(channelId: string) {
    if (this.threadIdMap.has(channelId)) {
      return this.threadIdMap.get(channelId)!;
    }

    const thread = await openai.beta.threads.create();

    this.threadIdMap.set(channelId, thread.id);

    return thread.id;
  }
}

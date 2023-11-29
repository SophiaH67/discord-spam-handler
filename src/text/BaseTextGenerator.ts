import type { Client } from "discord.js-selfbot-v13";

export interface BaseTestGenerator {
  generate(channelId: string, client: Client): Promise<string> | string;
}

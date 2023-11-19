export interface BaseTestGenerator {
  generate(channelId: string): Promise<string> | string;
}

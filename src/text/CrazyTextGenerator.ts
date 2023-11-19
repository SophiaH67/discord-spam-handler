import { BaseTestGenerator } from "./BaseTextGenerator";

interface TrackedSpamChannel {
  currentIndex: number;
}

const spamDictionary = new Map<string, TrackedSpamChannel>();

const responses = [
  "Crazy?",
  "I was crazy once!",
  "They locked me in a room.",
  "A rubber room.",
  "A rubber room with rats.",
  "And rats make me crazy.",
];

export class CrazyTextGenerator implements BaseTestGenerator {
  generate(channelId: string): string {
    const trackedChannel = this.getOrCreateTrackedChannel(channelId);

    const currentIndex = trackedChannel.currentIndex;
    const response = responses[currentIndex];

    trackedChannel.currentIndex = (currentIndex + 1) % responses.length;

    return response;
  }

  private getOrCreateTrackedChannel(channelId: string): TrackedSpamChannel {
    if (spamDictionary.has(channelId)) {
      return spamDictionary.get(channelId)!;
    }

    const trackedChannel: TrackedSpamChannel = {
      currentIndex: 0,
    };

    spamDictionary.set(channelId, trackedChannel);

    return trackedChannel;
  }
}

import { writeFile } from "fs/promises";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { ClassKey } from "src";

const spamUsersPath = join(__dirname, "../data/spamUsers.json");

export class SpamUsers {
  private static instance: SpamUsers;

  private spamUsers: Record<string, ClassKey> = {}; // channelId -> class key

  static get Instance() {
    return this.instance || (this.instance = new this());
  }

  private constructor() {
    this.load();
  }

  private load() {
    if (existsSync(spamUsersPath)) {
      const file = readFileSync(spamUsersPath, "utf-8");
      const json = JSON.parse(file);
      if (Array.isArray(json)) {
        // Old format
        for (const channelId of json) {
          this.spamUsers[channelId] = "crazy";
        }
        this.save();
      } else {
        this.spamUsers = json;
      }
    }
  }

  private save() {
    writeFile(spamUsersPath, JSON.stringify(this.spamUsers));
  }

  public add(id: string, classKey: ClassKey) {
    this.spamUsers[id] = classKey;
    this.save();
  }

  public remove(id: string) {
    delete this.spamUsers[id];
    this.save();
  }

  public has(id: string) {
    return id in this.spamUsers;
  }

  public get(id: string) {
    return this.spamUsers[id];
  }
}

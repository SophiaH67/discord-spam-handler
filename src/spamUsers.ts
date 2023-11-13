import { writeFile } from "fs/promises";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const spamUsersPath = join(__dirname, "../data/spamUsers.json");

export class SpamUsers {
  private static instance: SpamUsers;

  private spamUsers: string[] = []; // Channel IDs

  static get Instance() {
    return this.instance || (this.instance = new this());
  }

  private constructor() {
    this.load();
  }

  private load() {
    if (existsSync(spamUsersPath)) {
      const file = readFileSync(spamUsersPath, "utf-8");
      this.spamUsers = JSON.parse(file);
    }
  }

  private save() {
    writeFile(spamUsersPath, JSON.stringify(this.spamUsers));
  }

  public add(id: string) {
    if (!this.spamUsers.includes(id)) {
      this.spamUsers.push(id);
      this.save();
    }
  }

  public remove(id: string) {
    const index = this.spamUsers.indexOf(id);
    if (index !== -1) {
      this.spamUsers.splice(index, 1);
      this.save();
    }
  }

  public has(id: string) {
    return this.spamUsers.includes(id);
  }
}

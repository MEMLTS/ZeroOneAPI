import fs from "fs/promises";

type AliasMap = Record<string, string[]>;

export async function loadAliasMap(filePath: string): Promise<AliasMap> {
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data);
}

export class AliasManager {
  private aliasMap: AliasMap;
  private reverseMap: Record<string, string>;

  constructor(aliasMap: AliasMap) {
    this.aliasMap = aliasMap;
    this.reverseMap = this.buildReverseMap(aliasMap);
  }

  private buildReverseMap(map: AliasMap): Record<string, string> {
    const reverseMap: Record<string, string> = {};
    for (const key in map) {
      for (const alias of map[key]) {
        reverseMap[alias] = key;
      }
    }
    return reverseMap;
  }

  getAliases(key: string): string[] {
    return this.aliasMap[key] || [];
  }

  findKeyByAlias(alias: string): string | null {
    return this.reverseMap[alias] || null;
  }
}

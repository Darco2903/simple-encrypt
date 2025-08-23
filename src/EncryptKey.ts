import fs from "fs/promises";
import crypto from "crypto";

export class EncryptKey {
    static generate(keyLength: number = 32, ivLength: number = 16) {
        const key = crypto.randomBytes(keyLength);
        const iv = crypto.randomBytes(ivLength);
        return new EncryptKey(key, iv);
    }

    static async fromHexFile(p: string) {
        const data = JSON.parse(await fs.readFile(p, { encoding: "utf-8" }));
        return EncryptKey.fromHex(data.key, data.iv);
    }

    static fromHex(key: string, iv: string) {
        return new EncryptKey(Buffer.from(key, "hex"), Buffer.from(iv, "hex"));
    }

    public readonly key: Buffer;
    public readonly iv: Buffer;

    constructor(key: Buffer, iv: Buffer) {
        this.key = key;
        this.iv = iv;
    }

    toHex() {
        return {
            key: this.key.toString("hex"),
            iv: this.iv.toString("hex"),
        };
    }

    async toHexFile(p: string) {
        await fs.writeFile(p, JSON.stringify(this.toHex()));
    }
}

import fs from "fs/promises";
import crypto from "crypto";

export class EncryptKey {
    static generate(keyLength: number = 32, ivLength: number = 16) {
        const key = crypto.randomBytes(keyLength);
        const iv = crypto.randomBytes(ivLength);
        return new EncryptKey(key, iv);
    }

    static async fromFile(p: string) {
        const data = JSON.parse(await fs.readFile(p, { encoding: "utf-8" }));
        return EncryptKey.fromString(data.key, data.iv);
    }

    static fromString(key: string, iv: string) {
        return new EncryptKey(Buffer.from(key, "hex"), Buffer.from(iv, "hex"));
    }

    #key;
    get key() {
        return this.#key;
    }

    #iv;
    get iv() {
        return this.#iv;
    }

    constructor(key: Buffer, iv: Buffer) {
        this.#key = key;
        this.#iv = iv;
    }

    async save(p: string) {
        const data = {
            key: this.#key.toString("hex"),
            iv: this.#iv.toString("hex"),
        };
        await fs.writeFile(p, JSON.stringify(data));
    }
}

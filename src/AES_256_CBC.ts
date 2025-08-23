import fs from "fs";
import { createCipheriv, createDecipheriv } from "crypto";
import { Base } from "./Base.js";
import { EncryptKey } from "./EncryptKey.js";

export class AES_256_CBC extends Base {
    public get cipher() {
        return createCipheriv(this.algorithm, this.key.key, this.key.iv);
    }

    public get decipher() {
        return createDecipheriv(this.algorithm, this.key.key, this.key.iv);
    }

    constructor(key: EncryptKey) {
        super(key, "aes-256-cbc");
    }

    public encrypt(data: Buffer) {
        const cipher = this.cipher;
        return Buffer.concat([cipher.update(data), cipher.final()]);
    }

    public decrypt(data: Buffer) {
        const decipher = this.decipher;
        return Buffer.concat([decipher.update(data), decipher.final()]);
    }

    public async encryptFromToFile(from: string, to: string, options?: { highWaterMark?: number }): Promise<void> {
        const r = fs.createReadStream(from, options);
        const w = fs.createWriteStream(to);
        await new Promise<void>((resolve, reject) => {
            r.pipe(this.cipher).pipe(w);
            w.on("finish", resolve);
            w.on("error", reject);
        });
    }

    public async decryptFromToFile(from: string, to: string, options?: { highWaterMark?: number }): Promise<void> {
        const r = fs.createReadStream(from, options);
        const w = fs.createWriteStream(to);
        await new Promise<void>((resolve, reject) => {
            r.pipe(this.decipher).pipe(w);
            w.on("finish", resolve);
            w.on("error", reject);
        });
    }
}

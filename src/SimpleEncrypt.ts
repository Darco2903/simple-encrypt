import fs from "fs/promises";
import crypto from "crypto";
import { EncryptKey } from "./EncryptKey.js";

export class SimpleEncrypt {
    #algorithm;
    get algorithm() {
        return this.#algorithm;
    }

    #type: crypto.Encoding;
    get type() {
        return this.#type;
    }

    #key: EncryptKey;
    get key() {
        return this.#key;
    }

    get cipher() {
        return this.#createCipher();
    }

    get decipher() {
        return this.#createDecipher();
    }

    constructor(key: EncryptKey, type: crypto.Encoding = "binary", { algorithm = "aes-256-cbc" }: { algorithm?: string } = {}) {
        if (!(key instanceof EncryptKey)) {
            throw new TypeError("Invalid key");
        }

        this.#key = key;
        this.#type = type;
        this.#algorithm = algorithm;
    }

    #createCipher() {
        return crypto.createCipheriv(this.#algorithm, this.#key.key, this.#key.iv);
    }

    #createDecipher() {
        return crypto.createDecipheriv(this.#algorithm, this.#key.key, this.#key.iv);
    }

    encrypt(data: Buffer) {
        const cipher = this.#createCipher();
        return Buffer.concat([cipher.update(data), cipher.final()]);
    }

    async encryptToFile(p: string, data: Buffer) {
        const encrypted = this.encrypt(data);
        await fs.writeFile(p, encrypted);
    }

    decrypt(data: Buffer) {
        const decipher = this.#createDecipher();
        return Buffer.concat([decipher.update(data), decipher.final()]);
    }

    async decryptFromFile(p: string) {
        const encrypted = await fs.readFile(p);
        return this.decrypt(encrypted);
    }
}

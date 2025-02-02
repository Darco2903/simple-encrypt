const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class EncryptKey {
    static generate(keyLength = 32, ivLength = 16) {
        const key = crypto.randomBytes(keyLength);
        const iv = crypto.randomBytes(ivLength);
        return new EncryptKey(key, iv);
    }

    static async load(p) {
        const data = JSON.parse(await fs.promises.readFile(p));
        const key = Buffer.from(data.key, "hex");
        const iv = Buffer.from(data.iv, "hex");
        return new EncryptKey(key, iv);
    }

    #key;
    get key() {
        return this.#key;
    }

    #iv;
    get iv() {
        return this.#iv;
    }

    constructor(key, iv) {
        this.#key = key;
        this.#iv = iv;
    }

    async save(p) {
        const data = {
            key: this.#key.toString("hex"),
            iv: this.#iv.toString("hex"),
        };
        await fs.promises.writeFile(p, JSON.stringify(data));
    }
}

module.exports = {
    EncryptKey,
};

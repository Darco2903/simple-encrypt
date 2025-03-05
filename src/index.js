const fs = require("fs");
const crypto = require("crypto");

const { EncryptKey } = require("./EncryptKey");

class SimpleEncrypt {
    #algorithm;
    get algorithm() {
        return this.#algorithm;
    }

    #encoding;
    get encoding() {
        return this.#encoding;
    }

    /** @type {crypto.Encoding} */
    #type;
    get type() {
        return this.#type;
    }

    /** @type {EncryptKey} */
    #key;
    get key() {
        return this.#key;
    }

    get cipher() {
        return this.#createCipher();
    }

    get decipher() {
        return this.#createDecipher();
    }

    /**
     * @param {EncryptKey} key
     * @param {crypto.Encoding} type
     * @param {Object} [options]
     * @param {string} [options.algorithm="aes-256-cbc"]
     * @param {crypto.Encoding} [options.encoding="hex"]
     * @returns {SimpleEncrypt}
     */
    constructor(key, type = "binary", { algorithm = "aes-256-cbc", encoding = "binary" } = {}) {
        if (!(key instanceof EncryptKey)) {
            throw new TypeError("Invalid key");
        }

        this.#key = key;
        this.#type = type;
        this.#encoding = encoding;
        this.#algorithm = algorithm;
    }

    #createCipher() {
        return crypto.createCipheriv(this.#algorithm, this.#key.key, this.#key.iv);
    }

    #createDecipher() {
        return crypto.createDecipheriv(this.#algorithm, this.#key.key, this.#key.iv);
    }

    encrypt(data) {
        const cipher = this.#createCipher();
        return cipher.update(data, this.#type, this.#encoding) + cipher.final(this.#encoding);
    }

    async encryptToFile(p, data) {
        const encrypted = this.encrypt(data);
        await fs.promises.writeFile(p, encrypted, { encoding: this.#encoding });
    }

    decrypt(data) {
        const decipher = this.#createDecipher();
        return decipher.update(data, this.#encoding, this.#type) + decipher.final(this.#type);
    }

    async decryptFromFile(p) {
        const encrypted = await fs.promises.readFile(p, { encoding: this.#encoding });
        return this.decrypt(encrypted);
    }
}

module.exports = {
    EncryptKey,
    SimpleEncrypt,
};

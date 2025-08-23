import fs from "fs/promises";
import { describe, it, expect } from "vitest";
import { EncryptKey, SimpleEncrypt } from "../../src";
import { afterAll } from "vitest";

const ENCRYPTED_FILE_PATH = "./encrypted.enc";
const DECRYPTED_FILE_PATH = "./decrypted.txt";

//////////////////////////
// generate

describe("SimpleEncrypt crypt/decrypt", () => {
    it("should encrypt and decrypt a buffer", async () => {
        const key = EncryptKey.generate();
        const se = new SimpleEncrypt(key);
        expect(se).toBeInstanceOf(SimpleEncrypt);
        expect(se.key).toEqual(key);

        const buff = Buffer.from("test");
        // await fs.writeFile(DECRYPTED_FILE_PATH, buff);

        const encrypted = se.encrypt(buff);
        expect(encrypted).not.toBe(buff);
        await fs.writeFile(ENCRYPTED_FILE_PATH, encrypted);

        const decrypted = se.decrypt(encrypted);
        expect(decrypted).toEqual(buff);
    });
});

describe("SimpleEncrypt crypt/decrypt ", () => {
    it("should encrypt and decrypt from/to files", async () => {
        const key = EncryptKey.generate();
        const se = new SimpleEncrypt(key);
        expect(se).toBeInstanceOf(SimpleEncrypt);
        expect(se.key).toEqual(key);

        const buff = Buffer.from("test");

        await se.encryptToFile(ENCRYPTED_FILE_PATH, buff);
        const encrypted = await fs.readFile(ENCRYPTED_FILE_PATH);
        expect(encrypted).not.toBe(se.encrypt(buff));

        const decrypted = await se.decryptFromFile(ENCRYPTED_FILE_PATH);
        expect(decrypted).toEqual(se.decrypt(encrypted));
    });
});

afterAll(async () => {
    await fs.unlink(DECRYPTED_FILE_PATH).catch((e) => {});
    await fs.unlink(ENCRYPTED_FILE_PATH).catch((e) => {});
});

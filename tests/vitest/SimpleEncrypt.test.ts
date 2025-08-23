import fs from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import { describe, it, expect } from "vitest";
import { EncryptKey, SimpleEncrypt } from "../../src";
import { afterAll } from "vitest";

const ENCRYPTED_FILE_PATH = "./encrypted.enc";
// const DECRYPTED_FILE_PATH = "./decrypted.txt";
const ENCRYPTED_STREAM_PATH = "./encrypted_stream.enc";
const DECRYPTED_STREAM_PATH = "./decrypted_stream.enc";

//////////////////////////
// generate

describe("SimpleEncrypt crypt/decrypt", () => {
    it("should encrypt and decrypt a buffer", async () => {
        const key = EncryptKey.generate();
        const se = new SimpleEncrypt(key);
        expect(se).toBeInstanceOf(SimpleEncrypt);
        expect(se.key).toEqual(key);

        const buff = Buffer.from("test");

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

describe("SimpleEncrypt crypt/decrypt ", () => {
    it("should encrypt and decrypt from/to files stream", async () => {
        const key = EncryptKey.generate();
        const se = new SimpleEncrypt(key);
        expect(se).toBeInstanceOf(SimpleEncrypt);
        expect(se.key).toEqual(key);

        const buff = Buffer.from("test");
        await fs.writeFile(DECRYPTED_STREAM_PATH, buff);

        const toEnc = createReadStream(DECRYPTED_STREAM_PATH);
        await new Promise<void>((resolve) => {
            toEnc
                .pipe(se.cipher)
                .pipe(createWriteStream(ENCRYPTED_STREAM_PATH))
                .on("finish", async () => {
                    const encrypted = await fs.readFile(ENCRYPTED_STREAM_PATH);
                    expect(encrypted).not.toBe(se.encrypt(buff));

                    const toDec = createReadStream(ENCRYPTED_STREAM_PATH);
                    toDec
                        .pipe(se.decipher)
                        .pipe(createWriteStream(DECRYPTED_STREAM_PATH))
                        .on("finish", async () => {
                            const decrypted = await fs.readFile(DECRYPTED_STREAM_PATH);
                            expect(decrypted).toEqual(se.decrypt(encrypted));

                            resolve();
                        });
                });
        });
    });
});

afterAll(async () => {
    await fs.unlink(ENCRYPTED_FILE_PATH).catch((e) => {});
    // await fs.unlink(DECRYPTED_FILE_PATH).catch((e) => {});
    await fs.unlink(ENCRYPTED_STREAM_PATH).catch((e) => {});
    await fs.unlink(DECRYPTED_STREAM_PATH).catch((e) => {});
});

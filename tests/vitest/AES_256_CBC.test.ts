import fs from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import { afterAll, describe, expect, it } from "vitest";
import { EncryptKey, AES_256_CBC } from "../../src";

const ENCRYPTED_FILE_PATH = "./encrypted_cbc.enc";
// const DECRYPTED_FILE_PATH = "./decrypted.txt";
const ENCRYPTED_STREAM_PATH = "./encrypted_stream_cbc.enc";
const DECRYPTED_STREAM_PATH = "./decrypted_stream_cbc.enc";

describe("AES_256_CBC crypt/decrypt", () => {
    it("should encrypt and decrypt a buffer", async () => {
        const key = EncryptKey.generate();
        const se = new AES_256_CBC(key);
        expect(se).toBeInstanceOf(AES_256_CBC);
        expect(se.key).toEqual(key);

        const buff = Buffer.from("test");

        const encrypted = se.encrypt(buff);
        expect(encrypted).not.toBe(buff);
        await fs.writeFile(ENCRYPTED_FILE_PATH, encrypted);

        const decrypted = se.decrypt(encrypted);
        expect(decrypted).toEqual(buff);
    });
});

describe("AES_256_CBC crypt/decrypt", () => {
    it("should encrypt and decrypt from/to files", async () => {
        const key = EncryptKey.generate();
        const se = new AES_256_CBC(key);
        expect(se).toBeInstanceOf(AES_256_CBC);
        expect(se.key).toEqual(key);

        const buff = Buffer.from("test");

        await se.encryptToFile(ENCRYPTED_FILE_PATH, buff);
        const encrypted = await fs.readFile(ENCRYPTED_FILE_PATH);
        expect(encrypted).not.toBe(se.encrypt(buff));

        const decrypted = await se.decryptFromFile(ENCRYPTED_FILE_PATH);
        expect(decrypted).toEqual(se.decrypt(encrypted));
    });
});

describe("AES_256_CBC crypt/decrypt", () => {
    it("should encrypt and decrypt from/to files stream", async () => {
        const key = EncryptKey.generate();
        const se = new AES_256_CBC(key);
        expect(se).toBeInstanceOf(AES_256_CBC);
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

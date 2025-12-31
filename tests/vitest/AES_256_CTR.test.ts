import fs from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import { afterAll, describe, expect, it } from "vitest";
import { EncryptKey, AES_256_CTR } from "../../src";

const ENCRYPTED_FILE_PATH = "./encrypted_ctr.enc";
const DECRYPTED_FILE_PATH = "./decrypted.txt";
const ENCRYPTED_STREAM_PATH = "./encrypted_stream_ctr.enc";
const DECRYPTED_STREAM_PATH = "./decrypted_stream_ctr.enc";

describe("AES_256_CTR crypt empty key/iv", () => {
    it("should fail to encrypt and decrypt a buffer with empty key/iv", async () => {
        const key = EncryptKey.fromHex("", "");
        const se = new AES_256_CTR(key);
        expect(se).toBeInstanceOf(AES_256_CTR);
        expect(se.key).toEqual(key);

        const buff = Buffer.from("test");

        try {
            se.encrypt(buff);
            throw new Error("Encryption should have failed");
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }

        try {
            se.decrypt(buff);
            throw new Error("Decryption should have failed");
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
    });
});

describe("AES_256_CTR crypt/decrypt", () => {
    it("should encrypt and decrypt a buffer", async () => {
        const key = EncryptKey.generate();
        const se = new AES_256_CTR(key);
        expect(se).toBeInstanceOf(AES_256_CTR);
        expect(se.key).toEqual(key);

        const buff = Buffer.from("test");

        const encrypted = se.encrypt(buff);
        expect(encrypted).not.toBe(buff);
        await fs.writeFile(ENCRYPTED_FILE_PATH, encrypted);

        const decrypted = se.decrypt(encrypted);
        expect(decrypted).toEqual(buff);
    });
});

describe("AES_256_CTR crypt/decrypt", () => {
    it("should encrypt and decrypt from/to files", async () => {
        const key = EncryptKey.generate();
        const se = new AES_256_CTR(key);
        expect(se).toBeInstanceOf(AES_256_CTR);
        expect(se.key).toEqual(key);

        const buff = Buffer.from("test");

        await se.encryptToFile(ENCRYPTED_FILE_PATH, buff);
        const encrypted = await fs.readFile(ENCRYPTED_FILE_PATH);
        expect(encrypted).not.toBe(se.encrypt(buff));

        const decrypted = await se.decryptFromFile(ENCRYPTED_FILE_PATH);
        expect(decrypted).toEqual(se.decrypt(encrypted));
    });
});

describe("AES_256_CTR crypt/decrypt", () => {
    it("should encrypt and decrypt from/to files stream", async () => {
        const key = EncryptKey.generate();
        const se = new AES_256_CTR(key);
        expect(se).toBeInstanceOf(AES_256_CTR);
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

describe("AES_256_CTR crypt/decrypt part", () => {
    it("should encrypt and decrypt from/to files", async () => {
        const key = EncryptKey.generate();
        const se = new AES_256_CTR(key);
        expect(se).toBeInstanceOf(AES_256_CTR);
        expect(se.key).toEqual(key);

        const buff = Buffer.from("test");
        await fs.writeFile(DECRYPTED_FILE_PATH, buff);
        await se.encryptToFile(ENCRYPTED_FILE_PATH, buff);
        const encrypted = await fs.readFile(ENCRYPTED_FILE_PATH);

        const { transform, readStart } = se.decipherRange(0, encrypted.length - 2);
        const r1 = createReadStream(ENCRYPTED_FILE_PATH, {
            start: readStart,
            end: encrypted.length - 2,
            highWaterMark: 4 * 1024 * 1024,
        });
        let res: Buffer[] = [];
        await new Promise<void>((resolve) => {
            r1.pipe(se.fixedChunkTransform)
                .pipe(transform)
                .on("data", (data) => {
                    res.push(data);
                })
                .on("end", () => {
                    expect(Buffer.concat(res)).toEqual(buff.subarray(0, encrypted.length - 2));
                    resolve();
                });
        });

        const { transform: transform2, readStart: readStart2 } = se.decipherRange(2, encrypted.length);
        const r2 = createReadStream(ENCRYPTED_FILE_PATH, {
            start: readStart2,
            end: encrypted.length,
            highWaterMark: 4 * 1024 * 1024,
        });
        let res2: Buffer[] = [];
        await new Promise<void>((resolve) => {
            r2.pipe(se.fixedChunkTransform)
                .pipe(transform2)
                .on("data", (data) => {
                    res2.push(data);
                })
                .on("end", () => {
                    expect(Buffer.concat(res2)).toEqual(buff.subarray(2, encrypted.length));
                    resolve();
                });
        });

        const { transform: transform3, readStart: readStart3 } = se.cipherRange(0, buff.length - 2);
        const r3 = createReadStream(DECRYPTED_FILE_PATH, {
            start: readStart3,
            end: buff.length - 2,
            highWaterMark: 4 * 1024 * 1024,
        });
        let res3: Buffer[] = [];
        await new Promise<void>((resolve) => {
            r3.pipe(se.fixedChunkTransform)
                .pipe(transform3)
                .on("data", (data) => {
                    res3.push(data);
                })
                .on("end", () => {
                    expect(Buffer.concat(res3)).toEqual(encrypted.subarray(0, buff.length - 2));
                    resolve();
                });
        });

        const { transform: transform4, readStart: readStart4 } = se.cipherRange(2, buff.length);
        const r4 = createReadStream(DECRYPTED_FILE_PATH, {
            start: readStart4,
            end: buff.length,
            highWaterMark: 4 * 1024 * 1024,
        });
        let res4: Buffer[] = [];
        await new Promise<void>((resolve) => {
            r4.pipe(se.fixedChunkTransform)
                .pipe(transform4)
                .on("data", (data) => {
                    res4.push(data);
                })
                .on("end", () => {
                    expect(Buffer.concat(res4)).toEqual(encrypted.subarray(2, buff.length));
                    resolve();
                });
        });
    });
});

afterAll(async () => {
    await fs.unlink(ENCRYPTED_FILE_PATH).catch((e) => {});
    await fs.unlink(DECRYPTED_FILE_PATH).catch((e) => {});
    await fs.unlink(ENCRYPTED_STREAM_PATH).catch((e) => {});
    await fs.unlink(DECRYPTED_STREAM_PATH).catch((e) => {});
});

import fs from "fs/promises";
import { describe, it, expect } from "vitest";
import { EncryptKey } from "../../src";
import { afterAll } from "vitest";

const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const KEY_FILE_PATH = "./keyfile.json";

//////////////////////////
// generate

describe("EncryptKey generate", () => {
    it("should generate a new EncryptKey instance", async () => {
        const key = EncryptKey.generate(KEY_LENGTH, IV_LENGTH);
        expect(key).toBeInstanceOf(EncryptKey);
    });
});

describe("EncryptKey fromHex", () => {
    it("should create a new EncryptKey instance from hex strings", async () => {
        const key = EncryptKey.fromHex("key", "iv");
        expect(key).toBeInstanceOf(EncryptKey);
    });
});

describe("EncryptKey toHex", () => {
    it("should export the EncryptKey instance to a JSON object", async () => {
        const key = EncryptKey.generate(KEY_LENGTH, IV_LENGTH);
        const res = key.toHex();
        expect(res).toEqual({
            key: key.key.toString("hex"),
            iv: key.iv.toString("hex"),
        });
    });
});

describe("EncryptKey toHexFile", () => {
    it("should save the EncryptKey instance to a file", async () => {
        const key = EncryptKey.generate(KEY_LENGTH, IV_LENGTH);
        await key.toHexFile(KEY_FILE_PATH);
    });
});

describe("EncryptKey fromHexFile", () => {
    it("should create an EncryptKey instance from a file", async () => {
        const key = await EncryptKey.fromHexFile(KEY_FILE_PATH);
        expect(key).toBeInstanceOf(EncryptKey);
    });
});

// clean up
afterAll(async () => {
    await fs.unlink(KEY_FILE_PATH).catch((e) => {});
});

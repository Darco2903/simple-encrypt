import fs from "fs/promises";
import { Transform } from "stream";
import { EncryptKey } from "./EncryptKey.js";

export abstract class Base {
    public readonly algorithm: string;
    public readonly key: EncryptKey;

    public abstract get cipher(): Transform;
    public abstract get decipher(): Transform;

    constructor(key: EncryptKey, algorithm: string) {
        this.key = key;
        this.algorithm = algorithm;
    }

    public abstract encrypt(data: Buffer<ArrayBuffer>): Buffer<ArrayBuffer>;
    public abstract decrypt(data: Buffer<ArrayBuffer>): Buffer<ArrayBuffer>;

    public async encryptToFile(p: string, data: Buffer<ArrayBuffer>): Promise<void> {
        const encrypted = this.encrypt(data);
        await fs.writeFile(p, encrypted);
    }

    public async decryptToFile(p: string, data: Buffer<ArrayBuffer>): Promise<void> {
        const decrypted = this.decrypt(data);
        await fs.writeFile(p, decrypted);
    }

    public async encryptFromFile(p: string): Promise<Buffer<ArrayBuffer>> {
        const data = await fs.readFile(p);
        return this.encrypt(data);
    }

    public async decryptFromFile(p: string): Promise<Buffer<ArrayBuffer>> {
        const data = await fs.readFile(p);
        return this.decrypt(data);
    }

    public abstract encryptFromToFile(from: string, to: string): Promise<void>;
    public abstract decryptFromToFile(from: string, to: string): Promise<void>;
}

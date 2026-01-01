import fs, { read } from "fs";
import { Transform } from "stream";
import { Base } from "./Base.js";
import { EncryptKey } from "./EncryptKey.js";
import { createCipheriv, createDecipheriv } from "crypto";
import { FixedChunkTransform } from "./utils/FixedChunkTransform.js";

type RangeTransform = {
    transform: Transform;
    readStart: number;
};

export class AES_256_CTR extends Base {
    public readonly CHUNK_SIZE = 1024 * 1024; // 1 MB

    public get cipher() {
        const self = this;
        let chunkIndex = 0;

        try {
            const iv = self.ivForChunk(0);
            const testCipher = createCipheriv(self.algorithm, self.key.key, iv);
            testCipher.update(Buffer.alloc(0));
            testCipher.final();
        } catch (err) {
            throw err;
        }

        return new Transform({
            transform(chunk, _encoding, callback) {
                try {
                    const iv = self.ivForChunk(chunkIndex++);
                    const cipher = createCipheriv(self.algorithm, self.key.key, iv);
                    const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]);
                    callback(null, encrypted);
                } catch (err) {
                    callback(err as Error);
                }
            },
        });
    }

    public get decipher() {
        const self = this;
        let chunkIndex = 0;

        try {
            const iv = self.ivForChunk(0);
            const testDecipher = createDecipheriv(self.algorithm, self.key.key, iv);
            testDecipher.update(Buffer.alloc(0));
            testDecipher.final();
        } catch (err) {
            throw err;
        }

        return new Transform({
            transform(chunk, _encoding, callback) {
                try {
                    const iv = self.ivForChunk(chunkIndex++);
                    const decipher = createDecipheriv(self.algorithm, self.key.key, iv);
                    const decrypted = Buffer.concat([decipher.update(chunk), decipher.final()]);
                    callback(null, decrypted);
                } catch (err) {
                    callback(err as Error);
                }
            },
        });
    }

    public get fixedChunkTransform() {
        return new FixedChunkTransform(this.CHUNK_SIZE);
    }

    constructor(key: EncryptKey) {
        super(key, "aes-256-ctr");
    }

    private ivForChunk(chunkIndex: number): Buffer {
        const iv = Buffer.from(this.key.iv);
        iv[12] ^= (chunkIndex >> 24) & 0xff;
        iv[13] ^= (chunkIndex >> 16) & 0xff;
        iv[14] ^= (chunkIndex >> 8) & 0xff;
        iv[15] ^= chunkIndex & 0xff;
        return iv;
    }

    public encrypt(data: Buffer): Buffer {
        let chunkIndex = 0;
        let res: Buffer[] = [];

        while (chunkIndex * this.CHUNK_SIZE < data.length) {
            const chunk = data.subarray(chunkIndex * this.CHUNK_SIZE, (chunkIndex + 1) * this.CHUNK_SIZE);
            const iv = this.ivForChunk(chunkIndex);
            const cipher = createCipheriv(this.algorithm, this.key.key, iv);
            const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]);
            res.push(encrypted);
            chunkIndex++;
        }
        return Buffer.concat(res);
    }

    public decrypt(data: Buffer): Buffer {
        let chunkIndex = 0;
        let res: Buffer[] = [];

        while (chunkIndex * this.CHUNK_SIZE < data.length) {
            const chunk = data.subarray(chunkIndex * this.CHUNK_SIZE, (chunkIndex + 1) * this.CHUNK_SIZE);
            const iv = this.ivForChunk(chunkIndex);
            const decipher = createDecipheriv(this.algorithm, this.key.key, iv);
            const decrypted = Buffer.concat([decipher.update(chunk), decipher.final()]);
            res.push(decrypted);
            chunkIndex++;
        }
        return Buffer.concat(res);
    }

    public async encryptFromToFile(from: string, to: string): Promise<void> {
        const r = fs.createReadStream(from, { highWaterMark: this.CHUNK_SIZE });
        const w = fs.createWriteStream(to);
        let chunkIndex = 0;

        for await (const chunk of r) {
            const iv = this.ivForChunk(chunkIndex);
            const cipher = createCipheriv(this.algorithm, this.key.key, iv);
            const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]);
            await new Promise((res) => w.write(encrypted, res));
            chunkIndex++;
        }
        await new Promise((res) => w.end(res));
    }

    public async decryptFromToFile(from: string, to: string): Promise<void> {
        const r = fs.createReadStream(from, { highWaterMark: this.CHUNK_SIZE });
        const w = fs.createWriteStream(to);
        let chunkIndex = 0;

        for await (const chunk of r) {
            const iv = this.ivForChunk(chunkIndex);
            const decipher = createDecipheriv(this.algorithm, this.key.key, iv);
            const decrypted = Buffer.concat([decipher.update(chunk), decipher.final()]);
            await new Promise((res) => w.write(decrypted, res));
            chunkIndex++;
        }
        await new Promise((res) => w.end(res));
    }

    public cipherRange(start: number, end: number): RangeTransform {
        let chunkIndex = Math.floor(start / this.CHUNK_SIZE);
        let processedBytes = chunkIndex * this.CHUNK_SIZE;
        const self = this;

        const transform = new Transform({
            transform(chunk, _encoding, callback) {
                const iv = self.ivForChunk(chunkIndex);
                const cipher = createCipheriv(self.algorithm, self.key.key, iv);
                const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]);

                let sliceStart = 0;
                let sliceEnd = encrypted.length;

                if (processedBytes < start) {
                    sliceStart = start - processedBytes;
                }
                if (processedBytes + encrypted.length > end) {
                    sliceEnd = end - processedBytes;
                }

                if (sliceStart < sliceEnd) {
                    this.push(encrypted.subarray(sliceStart, sliceEnd));
                }

                processedBytes += encrypted.length;
                chunkIndex++;

                if (processedBytes >= end) {
                    this.push(null);
                }
                callback();
            },
        });
        return {
            transform,
            readStart: processedBytes,
        };
    }

    public decipherRange(start: number, end: number): RangeTransform {
        let chunkIndex = Math.floor(start / this.CHUNK_SIZE);
        let processedBytes = chunkIndex * this.CHUNK_SIZE;
        const self = this;

        const transform = new Transform({
            transform(chunk, _encoding, callback) {
                const iv = self.ivForChunk(chunkIndex);
                const decipher = createDecipheriv(self.algorithm, self.key.key, iv);
                const decrypted = Buffer.concat([decipher.update(chunk), decipher.final()]);

                let sliceStart = 0;
                let sliceEnd = decrypted.length;

                if (processedBytes < start) {
                    sliceStart = start - processedBytes;
                }
                if (processedBytes + decrypted.length > end) {
                    sliceEnd = end - processedBytes;
                }

                if (sliceStart < sliceEnd) {
                    this.push(decrypted.subarray(sliceStart, sliceEnd));
                }

                processedBytes += decrypted.length;
                chunkIndex++;

                if (processedBytes >= end) {
                    this.push(null);
                }
                callback();
            },
        });
        return {
            transform,
            readStart: processedBytes,
        };
    }
}

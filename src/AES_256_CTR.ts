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
        return new Transform({
            transform(chunk, _encoding, callback) {
                const iv = self.ivForChunk(chunkIndex++);
                const cipher = createCipheriv(self.algorithm, self.key.key, iv);
                const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]);
                callback(null, encrypted);
            },
        });
    }

    public get decipher() {
        const self = this;
        let chunkIndex = 0;
        return new Transform({
            transform(chunk, _encoding, callback) {
                const iv = self.ivForChunk(chunkIndex++);
                const decipher = createDecipheriv(self.algorithm, self.key.key, iv);
                const decrypted = Buffer.concat([decipher.update(chunk), decipher.final()]);
                callback(null, decrypted);
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
                // console.log("Processing chunk index:", chunkIndex);
                const iv = self.ivForChunk(chunkIndex);
                const cipher = createCipheriv(self.algorithm, self.key.key, iv);
                const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]);
                // console.log(`Encrypted chunk length: ${encrypted.length}`);
                // console.log("start", start, "processedBytes", processedBytes);

                let sliceStart = 0;
                let sliceEnd = encrypted.length;

                if (processedBytes < start) {
                    sliceStart = start - processedBytes;
                    // console.log(`Adjusting sliceStart to ${sliceStart}`);
                }
                if (processedBytes + encrypted.length > end) {
                    sliceEnd = end - processedBytes;
                }

                if (sliceStart < sliceEnd) {
                    // console.log(`Pushing bytes from ${sliceStart} to ${sliceEnd} of encrypted chunk`);
                    // console.log(`Pushing bytes ${sliceEnd - sliceStart} of encrypted chunk`);
                    this.push(encrypted.subarray(sliceStart, sliceEnd));
                }

                processedBytes += encrypted.length;
                chunkIndex++;

                // console.log("After processing, processedBytes:", processedBytes);
                // console.log("End boundary:", end);

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
                // console.log("Processing chunk index:", chunkIndex);
                const iv = self.ivForChunk(chunkIndex);
                const decipher = createDecipheriv(self.algorithm, self.key.key, iv);
                const decrypted = Buffer.concat([decipher.update(chunk), decipher.final()]);
                console.log(`Decrypted chunk length: ${decrypted.length}`);
                // console.log("start", start, "processedBytes", processedBytes);

                let sliceStart = 0;
                let sliceEnd = decrypted.length;

                if (processedBytes < start) {
                    sliceStart = start - processedBytes;
                    // console.log(`Adjusting sliceStart to ${sliceStart}`);
                }
                if (processedBytes + decrypted.length > end) {
                    sliceEnd = end - processedBytes;
                }

                if (sliceStart < sliceEnd) {
                    // console.log(`Pushing bytes from ${sliceStart} to ${sliceEnd} of decrypted chunk`);
                    // console.log(`Pushing bytes ${sliceEnd - sliceStart} of decrypted chunk`);
                    this.push(decrypted.subarray(sliceStart, sliceEnd));
                }

                processedBytes += decrypted.length;
                chunkIndex++;
                // chunkIndex = Math.floor(processedBytes / self.CHUNK_SIZE);

                // console.log("After processing, processedBytes:", processedBytes);
                // console.log("End boundary:", end);

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

    // public decryptRangeFromFileToStream(from: string, start: number, end: number): Transform {
    //     const { transform, readStart } = this.decipherRange(start, end);
    //     const readStream = fs.createReadStream(from, {
    //         start: readStart,
    //         end,
    //         // highWaterMark: this.CHUNK_SIZE,
    //     });
    //     // return readStream.pipe(transform);
    //     return readStream.pipe(new FixedChunkTransform(this.CHUNK_SIZE)).pipe(transform);
    // }

    // public async decryptRangeFromFile(from: string, start: number, end: number): Promise<Buffer> {
    //     return new Promise((resolve, reject) => {
    //         const transform = this.decryptRangeFromFileToStream(from, start, end);
    //         const chunks: Buffer[] = [];
    //         transform.on("data", (chunk) => chunks.push(chunk));
    //         transform.on("end", () => resolve(Buffer.concat(chunks)));
    //         transform.on("error", reject);
    //     });
    // }

    // public async decryptRangeFromToFile(from: string, to: string, start: number, end: number): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         const writeStream = fs.createWriteStream(to);
    //         const transform = this.decryptRangeFromFileToStream(from, start, end);
    //         transform.pipe(writeStream);

    //         writeStream.on("finish", resolve);
    //         writeStream.on("error", reject);
    //         transform.on("error", reject);
    //     });
    // }
}

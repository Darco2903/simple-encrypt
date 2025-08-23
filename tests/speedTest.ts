import fs from "fs";
import { EncryptKey, AES_256_CBC } from "../src/index.js";

const F = "buff.enc";
const ENC_FILE = "./encrypted.enc";
const DEC_FILE = "./decrypted.enc";
const STREAM_ENC = "./stream-in.enc";
const STREAM_DEC = "./stream-out.enc";

const HIGH_WATER_MARK = 1024 * 1024 * 4;

(async () => {
    const se = new AES_256_CBC(EncryptKey.generate());

    const buff = Buffer.alloc(1024 * 1024 * 1000, "a");
    // console.log("Buffer size:", buff.length);
    await fs.promises.writeFile(F, buff);

    console.time("encrypt");
    const toEnc = await fs.promises.readFile(F);
    await se.encryptToFile(ENC_FILE, toEnc);
    console.timeEnd("encrypt");

    console.time("decrypt");
    const data = await se.decryptFromFile(ENC_FILE);
    await fs.promises.writeFile(DEC_FILE, data);
    console.timeEnd("decrypt");

    /////////////////

    console.time("encrypt stream");
    await new Promise<void>((resolve, reject) => {
        const streamIn = fs.createReadStream(F, { highWaterMark: HIGH_WATER_MARK });
        const streamOut = fs.createWriteStream(STREAM_DEC, { highWaterMark: HIGH_WATER_MARK });
        streamIn.pipe(se.cipher).pipe(streamOut).on("finish", resolve).on("error", reject);
    });
    console.timeEnd("encrypt stream");

    console.time("decrypt stream");
    await new Promise<void>((resolve, reject) => {
        const streamIn = fs.createReadStream(STREAM_DEC, { highWaterMark: HIGH_WATER_MARK });
        const streamOut = fs.createWriteStream(STREAM_ENC, { highWaterMark: HIGH_WATER_MARK });
        streamIn.pipe(se.decipher).pipe(streamOut).on("finish", resolve).on("error", reject);
    });
    console.timeEnd("decrypt stream");

    // cleaning
    await fs.promises.unlink(F);
    await fs.promises.unlink(ENC_FILE);
    await fs.promises.unlink(DEC_FILE);
    await fs.promises.unlink(STREAM_ENC);
    await fs.promises.unlink(STREAM_DEC);
})();

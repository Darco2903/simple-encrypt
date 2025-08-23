import fs from "fs/promises";
import path from "path";
import { color } from "console-log-colors";
import { flagString, exists } from "../utils.js";
import { EncryptKey, SimpleEncrypt } from "../../index.js";
export default async function decrypt(...options) {
    console.log(color.green("Encrypting..."));
    const keyPath = flagString(options, ["-k", "--key"]);
    const inputPath = flagString(options, ["-i", "--input"]);
    const outputPath = flagString(options, ["-o", "--output"]);
    if (!keyPath) {
        console.log(color.red("Error: Key file is required"));
        return;
    }
    if (!inputPath) {
        console.log(color.red("Error: Input file is required"));
        return;
    }
    if (!outputPath) {
        console.log(color.red("Error: Output file is required"));
        return;
    }
    const keyExists = exists(keyPath);
    const inputExists = exists(inputPath);
    if (!(await keyExists)) {
        console.log(color.red(`Error: Key file not found at ${path.resolve(keyPath)}`));
        return;
    }
    if (!(await inputExists)) {
        console.log(color.red(`Error: Input file not found at ${path.resolve(inputPath)}`));
        return;
    }
    const key = await EncryptKey.fromFile(keyPath);
    const se = new SimpleEncrypt(key);
    await fs
        .readFile(inputPath)
        .then((data) => se.encryptToFile(outputPath, data))
        .then(() => {
        console.log(color.green("Encryption complete"));
    })
        .catch((err) => {
        console.log(color.red("Error: " + err.message));
    });
}

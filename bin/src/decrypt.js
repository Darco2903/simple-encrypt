const fs = require("fs");
const path = require("path");
const { color } = require("console-log-colors");

const { flagInt, flagString, exists } = require("../utils");
const { EncryptKey, SimpleEncrypt } = require("../../src/index");

async function decrypt(...options) {
    console.log(color.green("Decrypting..."));

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

    const key = await EncryptKey.load(keyPath);
    const se = new SimpleEncrypt(key, "binary");

    await se
        .decryptFromFile(inputPath)
        .then((data) => fs.promises.writeFile(outputPath, data, "binary"))
        .then(() => {
            console.log(color.green("Decryption complete"));
        })
        .catch((err) => {
            switch (err.code) {
                case "ERR_OSSL_BAD_DECRYPT":
                    console.log(color.red("Error: Bad decrypt (wrong key?)"));
                    break;

                default:
                    console.log(color.red("Error: " + err.message));
                    break;
            }
        });
}

module.exports = decrypt;

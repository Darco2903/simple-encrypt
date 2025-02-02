const fs = require("fs");
const path = require("path");
const { color } = require("console-log-colors");

const { flagInt, flagString } = require("../utils");
const { EncryptKey } = require("../../src/index");

const IV_LENGTH = 16;

async function generate(...options) {
    console.log(color.green("Generating key..."));

    const keyLength = flagInt(options, "-b");
    const keyPath = flagString(options, ["-s", "--save"]);

    const key = EncryptKey.generate(keyLength, IV_LENGTH);

    if (keyPath) {
        await key.save(keyPath);
        console.log(color.green(`Key saved to ${keyPath}`));
    } else {
        console.log(color.yellow("Key:"), color.cyan(key.key.toString("hex")));
        console.log(color.yellow("IV:"), color.cyan(key.iv.toString("hex")));
    }
}

module.exports = generate;

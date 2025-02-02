const fs = require("fs");

async function exists(p) {
    return fs.promises
        .access(p, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
}

function flag(options, flags) {
    if (!Array.isArray(flags)) {
        flags = [flags];
    }
    for (let i = 0; i < options.length; i++) {
        if (flags.includes(options[i])) {
            return options[i + 1];
        }
    }
}

function flagInt(options, flags, defaultValue) {
    let value = flag(options, flags);
    return value ? parseInt(value) : defaultValue;
}

function flagString(options, flags, defaultValue) {
    let value = flag(options, flags);
    return value ? value : defaultValue;
}

module.exports = {
    exists,
    flag,
    flagInt,
    flagString,
};

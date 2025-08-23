import fs from "fs/promises";
export async function exists(p) {
    return fs
        .access(p, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
}
export function flag(options, flags) {
    if (!Array.isArray(flags)) {
        flags = [flags];
    }
    for (let i = 0; i < options.length; i++) {
        if (flags.includes(options[i])) {
            return options[i + 1];
        }
    }
}
export function flagInt(options, flags, defaultValue) {
    let value = flag(options, flags);
    return value ? parseInt(value) : defaultValue;
}
export function flagString(options, flags, defaultValue) {
    let value = flag(options, flags);
    return value ? value : defaultValue;
}

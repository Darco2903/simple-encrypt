import fs from "fs/promises";

export async function exists(p: string) {
    return fs
        .access(p, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
}

export function flag(options: string[], flags: string | string[]) {
    if (!Array.isArray(flags)) {
        flags = [flags];
    }
    for (let i = 0; i < options.length; i++) {
        if (flags.includes(options[i])) {
            return options[i + 1];
        }
    }
}

export function flagInt(options: string[], flags: string | string[], defaultValue?: number) {
    let value = flag(options, flags);
    return value ? parseInt(value) : defaultValue;
}

export function flagString(options: string[], flags: string | string[], defaultValue?: string) {
    let value = flag(options, flags);
    return value ? value : defaultValue;
}

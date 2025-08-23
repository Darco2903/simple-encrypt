import { color } from "console-log-colors";

const EXEC = "simple-encrypt";
const PADDING = 24;
const COMMAND_PADDING = 1;
const OPTION_PADDING = 2;

function padLeft(len: number, ...str: string[]) {
    return " ".repeat(len) + str.join(" ");
}

function logTitle(title: string) {
    console.log(color.green(title));
}

function logCommand(command: string, desc: string = "") {
    console.log(padLeft(COMMAND_PADDING, color.cyan(command.padEnd(PADDING - COMMAND_PADDING))), desc);
}

function logOption(name: string, desc: string = "", optional: boolean = false) {
    console.log(
        padLeft(OPTION_PADDING, color.yellow(name.padEnd(PADDING - OPTION_PADDING))),
        desc,
        optional ? color.gray("(optional)") : ""
    );
}

export default async function help() {
    logTitle("Usage:");
    logCommand(`npx ${EXEC} [command] [options]`);
    console.log("");

    logTitle("General:");
    logOption("-h, --help", "Display help");
    logOption("-v, --version", "Display version");

    console.log("");
    logTitle("Key Generation:");
    logCommand("generate", "Generate a random key");
    logOption("-b", "Key length in bytes", true);
    logOption("-s, --save", "Save key to file", true);

    console.log("");
    logTitle("Encryption:");
    logCommand("encrypt", "Encrypt a file");
    logOption("-k", "Key file path");
    logOption("-i", "Input file path");
    logOption("-o", "Output file path");

    console.log("");
    logTitle("Decryption:");
    logCommand("decrypt", "Decrypt a file");
    logOption("-k", "Key file path");
    logOption("-i", "Input file path");
    logOption("-o", "Output file path");

    // console.log("");
    // logTitle("Examples:");
    // console.log(color.cyan(`npx ${EXEC} generate -b 32 -iv 16 -s`));
    // console.log(color.cyan(`npx ${EXEC} encrypt -k key.json -i input.txt -o output.enc`));
    // console.log(color.cyan(`npx ${EXEC} decrypt -k key.json -i output.enc -o output.txt`));
}

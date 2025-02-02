#!/usr/bin/env node

(async () => {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log("Please provide a command, try help");
        process.exit(1);
    }

    const command = args[0];
    const options = args.slice(1);

    switch (command) {
        case "-h":
        case "--help":
            require("./src/help")();
            break;

        case "-v":
        case "--version":
            await require("./src/version")();
            break;

        case "generate":
            await require("./src/key")(...options);
            break;

        case "encrypt":
            await require("./src/encrypt")(...options);
            break;

        case "decrypt":
            await require("./src/decrypt")(...options);
            break;

        default:
            console.log("Command not found, try help");
            process.exit(1);
    }
})();

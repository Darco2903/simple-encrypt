#!/usr/bin/env node
"use strict";
(async () => {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("Please provide a command, try help");
        process.exit(1);
    }
    const command = args[0];
    const options = args.slice(1);
    console.log("Command:", command);
    console.log("Options:", options);
    switch (command) {
        case "-h":
        case "--help":
            (await import("./src/help.js")).default();
            break;
        case "-v":
        case "--version":
            (await import("./src/version.js")).default();
            break;
        case "generate":
            (await import("./src/key.js")).default(...options);
            break;
        case "encrypt":
            (await import("./src/encrypt.js")).default(...options);
            break;
        case "decrypt":
            (await import("./src/decrypt.js")).default(...options);
            break;
        default:
            console.log("Command not found, try help");
            process.exit(1);
    }
})();

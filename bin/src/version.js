async function version(params) {
    const { version } = require("../../package.json");
    console.log(version);
}

module.exports = version;

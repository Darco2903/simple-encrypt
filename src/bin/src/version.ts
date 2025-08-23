import { createRequire } from "module";
const require = createRequire(import.meta.url);

export default async function version() {
    const { version } = require("../../../package.json"); //ERR_IMPORT_ATTRIBUTE_MISSING
    console.log(version);
}

var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _EncryptKey_key, _EncryptKey_iv;
import fs from "fs/promises";
import crypto from "crypto";
export class EncryptKey {
    static generate(keyLength = 32, ivLength = 16) {
        const key = crypto.randomBytes(keyLength);
        const iv = crypto.randomBytes(ivLength);
        return new EncryptKey(key, iv);
    }
    static async fromFile(p) {
        const data = JSON.parse(await fs.readFile(p, { encoding: "utf-8" }));
        return EncryptKey.fromString(data.key, data.iv);
    }
    static fromString(key, iv) {
        return new EncryptKey(Buffer.from(key, "hex"), Buffer.from(iv, "hex"));
    }
    get key() {
        return __classPrivateFieldGet(this, _EncryptKey_key, "f");
    }
    get iv() {
        return __classPrivateFieldGet(this, _EncryptKey_iv, "f");
    }
    constructor(key, iv) {
        _EncryptKey_key.set(this, void 0);
        _EncryptKey_iv.set(this, void 0);
        __classPrivateFieldSet(this, _EncryptKey_key, key, "f");
        __classPrivateFieldSet(this, _EncryptKey_iv, iv, "f");
    }
    async save(p) {
        const data = {
            key: __classPrivateFieldGet(this, _EncryptKey_key, "f").toString("hex"),
            iv: __classPrivateFieldGet(this, _EncryptKey_iv, "f").toString("hex"),
        };
        await fs.writeFile(p, JSON.stringify(data));
    }
}
_EncryptKey_key = new WeakMap(), _EncryptKey_iv = new WeakMap();

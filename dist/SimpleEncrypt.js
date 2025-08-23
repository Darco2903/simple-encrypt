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
var _SimpleEncrypt_instances, _SimpleEncrypt_algorithm, _SimpleEncrypt_type, _SimpleEncrypt_key, _SimpleEncrypt_createCipher, _SimpleEncrypt_createDecipher;
import fs from "fs/promises";
import crypto from "crypto";
import { EncryptKey } from "./EncryptKey.js";
export class SimpleEncrypt {
    get algorithm() {
        return __classPrivateFieldGet(this, _SimpleEncrypt_algorithm, "f");
    }
    get type() {
        return __classPrivateFieldGet(this, _SimpleEncrypt_type, "f");
    }
    get key() {
        return __classPrivateFieldGet(this, _SimpleEncrypt_key, "f");
    }
    get cipher() {
        return __classPrivateFieldGet(this, _SimpleEncrypt_instances, "m", _SimpleEncrypt_createCipher).call(this);
    }
    get decipher() {
        return __classPrivateFieldGet(this, _SimpleEncrypt_instances, "m", _SimpleEncrypt_createDecipher).call(this);
    }
    constructor(key, type = "binary", { algorithm = "aes-256-cbc" } = {}) {
        _SimpleEncrypt_instances.add(this);
        _SimpleEncrypt_algorithm.set(this, void 0);
        _SimpleEncrypt_type.set(this, void 0);
        _SimpleEncrypt_key.set(this, void 0);
        if (!(key instanceof EncryptKey)) {
            throw new TypeError("Invalid key");
        }
        __classPrivateFieldSet(this, _SimpleEncrypt_key, key, "f");
        __classPrivateFieldSet(this, _SimpleEncrypt_type, type, "f");
        __classPrivateFieldSet(this, _SimpleEncrypt_algorithm, algorithm, "f");
    }
    encrypt(data) {
        const cipher = __classPrivateFieldGet(this, _SimpleEncrypt_instances, "m", _SimpleEncrypt_createCipher).call(this);
        return Buffer.concat([cipher.update(data), cipher.final()]);
    }
    async encryptToFile(p, data) {
        const encrypted = this.encrypt(data);
        await fs.writeFile(p, encrypted);
    }
    decrypt(data) {
        const decipher = __classPrivateFieldGet(this, _SimpleEncrypt_instances, "m", _SimpleEncrypt_createDecipher).call(this);
        return Buffer.concat([decipher.update(data), decipher.final()]);
    }
    async decryptFromFile(p) {
        const encrypted = await fs.readFile(p);
        return this.decrypt(encrypted);
    }
}
_SimpleEncrypt_algorithm = new WeakMap(), _SimpleEncrypt_type = new WeakMap(), _SimpleEncrypt_key = new WeakMap(), _SimpleEncrypt_instances = new WeakSet(), _SimpleEncrypt_createCipher = function _SimpleEncrypt_createCipher() {
    return crypto.createCipheriv(__classPrivateFieldGet(this, _SimpleEncrypt_algorithm, "f"), __classPrivateFieldGet(this, _SimpleEncrypt_key, "f").key, __classPrivateFieldGet(this, _SimpleEncrypt_key, "f").iv);
}, _SimpleEncrypt_createDecipher = function _SimpleEncrypt_createDecipher() {
    return crypto.createDecipheriv(__classPrivateFieldGet(this, _SimpleEncrypt_algorithm, "f"), __classPrivateFieldGet(this, _SimpleEncrypt_key, "f").key, __classPrivateFieldGet(this, _SimpleEncrypt_key, "f").iv);
};

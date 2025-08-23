import crypto from "crypto";
import { EncryptKey } from "./EncryptKey.js";
export declare class SimpleEncrypt {
    #private;
    get algorithm(): string;
    get type(): crypto.Encoding;
    get key(): EncryptKey;
    get cipher(): crypto.Cipheriv;
    get decipher(): crypto.Decipheriv;
    constructor(key: EncryptKey, type?: crypto.Encoding, { algorithm }?: {
        algorithm?: string;
    });
    encrypt(data: Buffer): Buffer<ArrayBuffer>;
    encryptToFile(p: string, data: Buffer): Promise<void>;
    decrypt(data: Buffer): Buffer<ArrayBuffer>;
    decryptFromFile(p: string): Promise<Buffer<ArrayBuffer>>;
}

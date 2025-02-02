import { Encoding, Cipher, Decipher } from "crypto";
import { EncryptKey } from "./EncryptKey";

export class SimpleEncrypt {
    public readonly algorithm: string;
    public readonly encoding: Encoding;
    public readonly type: Encoding;
    public readonly key: EncryptKey;
    public readonly cipher: Cipher;
    public readonly decipher: Decipher;

    constructor(key: EncryptKey, type: Encoding, options?: { algorithm?: string; encoding?: Encoding }): SimpleEncrypt;

    encrypt(data: any): any;
    async encryptToFile(p: string, data: any): Promise<void>;

    decrypt(data: any): any;
    async decryptFromFile(p: string): Promise<any>;
}

export { EncryptKey };

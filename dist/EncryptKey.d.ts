export declare class EncryptKey {
    #private;
    static generate(keyLength?: number, ivLength?: number): EncryptKey;
    static fromFile(p: string): Promise<EncryptKey>;
    static fromString(key: string, iv: string): EncryptKey;
    get key(): Buffer<ArrayBufferLike>;
    get iv(): Buffer<ArrayBufferLike>;
    constructor(key: Buffer, iv: Buffer);
    save(p: string): Promise<void>;
}

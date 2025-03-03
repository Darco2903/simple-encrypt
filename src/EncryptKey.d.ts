export class EncryptKey {
    static generate(keyLength?: 32 | number, ivLength?: 16 | number): EncryptKey;

    static async load(p: string): Promise<EncryptKey>;

    public readonly key: string;
    public readonly iv: string;

    constructor(key: string, iv: string): EncryptKey;

    /**
     * Save the key to a file
     * @param p The path to save the key to
     */
    async save(p: string): Promise<void>;
}

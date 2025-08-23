export declare function exists(p: string): Promise<boolean>;
export declare function flag(options: string[], flags: string | string[]): string | undefined;
export declare function flagInt(options: string[], flags: string | string[], defaultValue?: number): number | undefined;
export declare function flagString(options: string[], flags: string | string[], defaultValue?: string): string | undefined;

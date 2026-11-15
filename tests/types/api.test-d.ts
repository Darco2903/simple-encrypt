import { expectTypeOf } from "vitest";
import { EncryptKey, AES_256_CTR } from "../../src/index.js";

// Type-level tests, checked by `pnpm check` (tsc -p tests), not run by vitest.

const key = EncryptKey.generate();
const se = new AES_256_CTR(key);

expectTypeOf(se.decrypt(Buffer.from("test"))).toEqualTypeOf<Buffer<ArrayBuffer>>();
expectTypeOf(se.encrypt(Buffer.from("test"))).toEqualTypeOf<Buffer<ArrayBuffer>>();

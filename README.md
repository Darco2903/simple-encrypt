# Simple Encrypt

## Description

This is a simple encryption program that encrypts and decrypts data using node crypto.

## Installation

```bash
npm install simple-encrypt-<version>.tgz
pnpm add simple-encrypt-<version>.tgz
```

## Usage

```ts
import { EncryptKey } from "simple-encrypt";
```

### Key Generation

```ts
// Generate a key
const key = EncryptKey.generate();
console.log("Key generated");

// Save the key to a json file
await key.toHexFile("key.json");
console.log("Key saved to key.json");
```

### Load Key

```ts
// Load the key
const key = await EncryptKey.fromHexFile("key.json");
console.log("Key loaded from key.json");

// Load the key from a hex string
const key = EncryptKey.fromHex(KEY, IV);
console.log("Key loaded from hex string");
```

### Encryption / Decryption

```ts
import { AES_256_CBC } from "simple-encrypt";

const se = new SimpleEncrypt(key);

const data = Buffer.from("Hello World");
const encrypted = se.encrypt(data);
console.log("Encrypted:", encrypted); // <Buffer ...>

const decrypted = se.decrypt(encrypted);
console.log("Decrypted:", decrypted.toString()); // "Hello World"
```

## CLI

### NPM

```bash
npx simple-encrypt [command] [options]
```

### PNPM

```bash
pnpm exec simple-encrypt [command] [options]
```

#### General

| Option | Description     |
| ------ | --------------- |
| `-h`   | Display help    |
| `-v`   | Display version |

#### Key Generation

```bash
npx simple-encrypt generate [options]
```

| Option | Default | Description | Required |
| ------ | ------- | ----------- | -------- |
| `-B`   | 32      | Key length  |          |
| `-s`   |         | Save path   |          |

> :warning: **A key length different from 32 will not work with the encryption and decryption.**

<!-- #### Encryption and Decryption

```bash
npx simple-encrypt encrypt [options]
npx simple-encrypt decrypt [options]
```

| Option | Default | Description | Required |
| ------ | ------- | ----------- | -------- |
| `-k`   |         | Key path    | Yes      |
| `-i`   |         | Input path  | Yes      |
| `-o`   |         | Output path | Yes      | -->

### Examples

#### Generate a key and save it to key.json

```bash
npx simple-encrypt generate -s key.json
// or
pnpm exec simple-encrypt generate -s key.json
```

<!-- #### Encrypt input.txt and save it to output.txt

```bash
npx simple-encrypt encrypt -k key.json -i input.txt -o output.enc
```

#### Decrypt input.txt and save it to output.txt

```bash
npx simple-encrypt decrypt -k key.json -i output.enc -o output.txt
``` -->

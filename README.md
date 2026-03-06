# Simple Encrypt

## Description

Simple Encrypt is a simple encryption library for Node.js based on the built-in `crypto` module that provides a simple API for encrypting and decrypting data using AES. It also provides a CLI for generating keys and encrypting/decrypting files. It exposes two classes, `AES-256-CBC` and `AES_256_CTR`, which implement the AES encryption algorithm in CBC and CTR modes respectively. The library also provides a `EncryptKey` class for generating and managing encryption keys.

## Features

- Key generation and management
- CLI for key generation
- `AES-256-CBC` and `AES_256_CTR` encryption and decryption
- Encryption and decryption of data and files
- Encryption and decryption of streams
- `AES_256_CTR` class supports chunked encryption and decryption, allowing you to decrypt only a portion of a file without having to decrypt the entire file

## Installation

```bash
npm install @darco2903/simple-encrypt
```

## Usage

### Key Generation

```ts
import { EncryptKey } from "@darco2903/simple-encrypt";

// Generate a key
const key = EncryptKey.generate();
console.log("Key generated");

// Save the key to a json file
await key.toHexFile("key.json");
console.log("Key saved to key.json");
```

### Load Key

```ts
import { EncryptKey } from "@darco2903/simple-encrypt";

// Load the key
const keyFromFile = await EncryptKey.fromHexFile("key.json");
console.log("Key loaded from key.json");

// Load the key from a hex string
const keyFromHex = EncryptKey.fromHex(KEY, IV);
console.log("Key loaded from hex string");
```

### Encryption / Decryption

```ts
import { AES_256_CBC, EncryptKey } from "@darco2903/simple-encrypt";

const key = EncryptKey.generate();
const se = new AES_256_CBC(key);

const data = Buffer.from("Hello World");
const encrypted = se.encrypt(data);
console.log("Encrypted:", encrypted); // <Buffer ...>

const decrypted = se.decrypt(encrypted);
console.log("Decrypted:", decrypted.toString()); // "Hello World"
```

## CLI

#### NPM

```bash
npx simple-encrypt [command] [options]
```

#### PNPM

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

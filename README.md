# simple-encrypt

## Description

This is a simple encryption program that encrypts and decrypts data using node crypto. It uses a secret key to encrypt and decrypt data. These keys can be generated using the program or can be provided by the user.

## Installation

```bash
npm install simple-encrypt-<version>.tgz
```

## Usage

```js
const { EncryptKey, SimpleEncrypt } = require("simple-encrypt");
```

### Key Generation

```js
// Generate a key
const key = EncryptKey.generate();
console.log("Key generated");

// Save the key to a json file
await key.save("key.json");
console.log("Key saved to key.json");
```

### Load Key

```js
// Load the key
const key = await EncryptKey.load("key.json");
console.log("Key loaded from key.json");
```

### Encrypt and Decrypt

```js
const se = new SimpleEncrypt(key, "binary");
const encrypted = se.encrypt("Hello World");
console.log(encrypted); // <Encrypted data>

const decrypted = se.decrypt(encrypted);
console.log(decrypted); // Hello World

// Decrypt from a file
const decryptedFile = await se.decryptFromFile("path/to/encrypted/file");

// Encrypt to a file
await se.encryptToFile("path/to/encrypted/file", "Hello World");

// Stream encryption
fs.createReadStream("input_path").pipe(se.cipher).pipe(fs.createWriteStream("output_path"));

// Stream decryption
fs.createReadStream("input_path").pipe(se.decipher).pipe(fs.createWriteStream("output_path"));
```

## CLI

```bash
npx logger [command] [options]
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
| `-b`   | 32      | Key length  |          |
| `-s`   |         | Save path   |          |

> :warning: **A key length different from 32 will not work with the encryption and decryption.**

#### Encryption and Decryption

```bash
npx simple-encrypt encrypt [options]
npx simple-encrypt decrypt [options]
```

| Option | Default | Description | Required |
| ------ | ------- | ----------- | -------- |
| `-k`   |         | Key path    | Yes      |
| `-i`   |         | Input path  | Yes      |
| `-o`   |         | Output path | Yes      |

### Examples

#### Generate a key and save it to key.json

```bash
npx simple-encrypt generate -s key.json
```

#### Encrypt input.txt and save it to output.txt

```bash
npx simple-encrypt encrypt -k key.json -i input.txt -o output.enc
```

#### Decrypt input.txt and save it to output.txt

```bash
npx simple-encrypt decrypt -k key.json -i output.enc -o output.txt
```

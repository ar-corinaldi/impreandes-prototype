const NodeRSA = require('node-rsa')
const crypto = require("crypto");
const fs = require('fs')
const path = require('path')
const options = {
    modulusLength: 1028,
    publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
    },
    privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
        cipher: "aes-256-cbc",
        passphrase: "top secret",
    },
};


const gen = crypto.generateKeyPairSync("rsa", options);
const key = new NodeRSA({ b: 256 });

const pvKeyStr = `-----BEGIN PRIVATE KEY-----\n
MIHCAgEAMA0GCSqGSIb3DQEBAQUABIGtMIGqAgEAAiEAmt/PlFvMtkOESw+VTJSE\n
yy9qSbFZitggPeRcNDzZ54kCAwEAAQIgGSdIe3v9X4zPq7E4OlvUxTqAokSUCevs\n
/7tyizI961ECEQDS+SqNKT/Gm/DguEFDLdc7AhEAu+2XdsXUvOIDHlSc8xp4CwIQ\n
eFXAzJV7mAg4Y6UVLIFIIwIQV5IocW1Qa8/52gldtZ7Q7wIRAMWPVjj1lL6ceGaH\n
8UEMjE4=\n
-----END PRIVATE KEY-----`
const pcKeyStr = `-----BEGIN PUBLIC KEY-----\n
MDwwDQYJKoZIhvcNAQEBBQADKwAwKAIhAJrfz5RbzLZDhEsPlUyUhMsvakmxWYrY\n
ID3kXDQ82eeJAgMBAAE=\n
-----END PUBLIC KEY-----`

const privateKey = new NodeRSA(pvKeyStr, 'pkcs8-private-pem', { encryptionScheme: "pkcs1" });
const publicKey = new NodeRSA(pcKeyStr, 'pkcs8-public-pem', { encryptionScheme: "pkcs1" })
const file = fs.readFileSync('/Users/allancorinaldi/Desktop/LlaveroSenecaLogo.stl')
// console.log(file)
const encryptedFile = publicKey.encrypt(file, 'base64')
fs.writeFileSync(path.join(__dirname, "../file-server/encryptedFile2.txt"), encryptedFile)
const decryptedFile = privateKey.decrypt(encryptedFile, 'buffer')
fs.writeFileSync(path.join(__dirname, "../file-server/decryptedFile2.stl"), decryptedFile)

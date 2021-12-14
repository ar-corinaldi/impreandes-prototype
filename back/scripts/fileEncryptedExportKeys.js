const NodeRSA = require('node-rsa')
const crypto = require("crypto");
const fs = require('fs')
const options = {
    modulusLength: 2048,
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
console.log(gen.publicKey)
const rsa = new NodeRSA();
rsa.importKey(gen.privateKey, "private")
rsa.importKey(gen.publicKey, "public")
const privateKey = rsa.exportKey("private")
const publicKey = rsa.exportKey("public")
// const privateKey = new NodeRSA(gen.privateKey, "pkcs1-private-pem")
// const publicKey = new NodeRSA(gen.publicKey, 'pkcs1-public-pem')
const file = fs.readFileSync('/Users/allancorinaldi/Desktop/LlaveroSenecaLogo.stl')
const encryptedFile = key.encrypt(file, 'base64')
const decryptedFile = key.decrypt(encryptedFile, 'buffer')
// fs.writeFileSync("/Users/allancorinaldi/Desktop/decryptedFile2.stl", decryptedFile)

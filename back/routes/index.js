const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const CryptoJS = require("crypto-js");
const options = {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
    cipher: "aes-256-cbc",
    passphrase: "top secret",
  },
};

const gen1 = crypto.generateKeyPairSync("rsa", options);
const gen2 = crypto.generateKeyPairSync("rsa", options);
const gen3 = crypto.generateKeyPairSync("rsa", options);

router.get("/", (req, res) => {
  return res.json({ title: "Hello World!" });
});

/* GET home page. */
router.get("/publicKeys", function (req, res, next) {
  return res.json({
    print1: gen1.publicKey,
    print2: gen2.publicKey,
    print3: gen3.publicKey,
  });
});

router.post("/receiveQuote", (req, res) => {
  try {
    const { file, name } = req.body;
    const { index, length } = req.query;
    console.log(index, length);
    const message = decrypt(file);
    return res.status(200).json({ message, index, size: length });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: e });
  }
});

const decrypt = (text) => {
  const decipher = CryptoJS.AES.decrypt(text, "top secret");
  const decipherStr = decipher.toString(CryptoJS.enc.Utf8);
  return decipherStr;
};

module.exports = router;

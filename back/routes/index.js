const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const CryptoJS = require("crypto-js");
const path = require("path");
const { spawn } = require("child_process");
const CONFIG = require("../config");
const EventEmitter = require("events");
const emitter = new EventEmitter();
const NodeRSA = require("node-rsa");
const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");
const request = require("request");

emitter.on("transfer_file", (fileName) => {
  console.log("entra transfer_file event");
  const scp = spawn("scp", [
    "-i",
    CONFIG.pem,
    CONFIG.fileFrom(fileName),
    `${CONFIG.ec2_instance}:${CONFIG.fileTo}`,
  ]);
  console.log(CONFIG.fileFrom(fileName), "wtergdfgsdfg");
  scp.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });
});

emitter.on("get_timer_file", () => {
  const scp = spawn("scp", [
    "-i",
    CONFIG.pem,
    `${CONFIG.ec2_instance}:~/gcodeFiles/decryptedFileFront.txt`,
    path.join(__dirname, `../timer/`),
  ]);
  scp.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });
});

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

const pvKeyStr = `-----BEGIN PRIVATE KEY-----\n
MIHCAgEAMA0GCSqGSIb3DQEBAQUABIGtMIGqAgEAAiEAmt/PlFvMtkOESw+VTJSE\n
yy9qSbFZitggPeRcNDzZ54kCAwEAAQIgGSdIe3v9X4zPq7E4OlvUxTqAokSUCevs\n
/7tyizI961ECEQDS+SqNKT/Gm/DguEFDLdc7AhEAu+2XdsXUvOIDHlSc8xp4CwIQ\n
eFXAzJV7mAg4Y6UVLIFIIwIQV5IocW1Qa8/52gldtZ7Q7wIRAMWPVjj1lL6ceGaH\n
8UEMjE4=\n
-----END PRIVATE KEY-----`;

const pcKeyStr = `-----BEGIN PUBLIC KEY-----\n
MDwwDQYJKoZIhvcNAQEBBQADKwAwKAIhAJrfz5RbzLZDhEsPlUyUhMsvakmxWYrY\n
ID3kXDQ82eeJAgMBAAE=\n
-----END PUBLIC KEY-----`;

const privateKey1 = new NodeRSA(pvKeyStr, "pkcs8-private-pem", {
  encryptionScheme: "pkcs1",
});

router.get("/", (req, res) => {
  return res.json({ title: "Hello World!" });
});

/* GET home page. */
router.get("/publicKeys", function (req, res, next) {
  return res.json({
    print1: pcKeyStr,
  });
});

router.post("/receiveQuote", (req, res) => {
  try {
    const { file, name } = req.body;
    const { index, length } = req.query;
    console.log(index, length);
    const message = decrypt(file);
    fs.writeFileSync();
    emitter.emit("transfer_file", name);
    return res.status(200).json({ message, index, size: length });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: e });
  }
});

router.post("/uploadWithRSAString", (req, res) => {
  const { data, name } = req.body;
  const nameEncrypted = `encrypted_${name.split(".stl")[0]}.txt`;
  fs.writeFileSync(
    path.join(__dirname, `../file-server/${nameEncrypted}`),
    data,
    { flag: "as" }
  );
  return res.status(200).json({ message: "success" });
});

router.post("/uploadWithRSAReading", (req, res) => {
  try {
    const { data, name } = req.body;
    const { index, length } = req.query;
    const nameEncrypted = `encrypted_${name.split(".stl")[0]}.txt`;
    fs.writeFileSync(
      path.join(__dirname, `../file-server/${nameEncrypted}`),
      data,
      { flag: "as" }
    );
    return res.status(200).json({ message: "success" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: e });
  }
});

router.post("/parseToStl", (req, res) => {
  const { name } = req.body;
  const nameEncrypted = `encrypted_${name.split(".stl")[0]}.txt`;
  const file = fs.readFileSync(
    path.join(__dirname, `../file-server/${nameEncrypted}`),
    "utf-8"
  );
  const message = privateKey1.decrypt(file, "buffer");
  fs.writeFileSync(
    path.join(__dirname, `../file-server/decrypted_${name}`),
    message,
    { flag: "as" }
  );
  return res.status("200").json({ message: "success" });
});

router.post("/uploadWithRSA", (req, res) => {
  try {
    const { data, name } = req.body;
    const { index, length } = req.query;
    const nameEncrypted = `${name.split(".stl")[0]}_encrypted.stl`;
    fs.writeFileSync(
      path.join(__dirname, `../file-server/${nameEncrypted}`),
      data,
      { flag: "a" }
    );
    const message = privateKey1.decrypt(data, "buffer");
    console.log(message);
    fs.writeFileSync(path.join(__dirname, `../file-server/${name}`), message, {
      flag: "a",
    });
    console.log(index, length - 1, index === length - 1);
    if (parseInt(index) === parseInt(length - 1)) {
      emitter.emit("transfer_file", name);
    }
    return res.status(200).json({ message });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: e });
  }
});

router.post("/upload", (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ message: "No file" });
  }
  const file = req.files.file;
  console.log(file);
  const dir = path.join(__dirname, `../file-server/${file.name}`);
  file.mv(dir, (err) => {
    if (!err) return;
    return res.status(500).json({ message: err });
  });

  emitter.emit("transfer_file", file.name);
  return res.status(200).json({ fileName: file.name, filePath: dir });
});

router.post("/uploadEncrypted", (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ message: "No file" });
  }
  const file = req.files.file;
  console.log(file);
  const dir = path.join(__dirname, `../file-server/${file.name}`);
  file.mv(dir, (err) => {
    if (!err) return;

    return res.status(500).json({ message: err });
  });

  return res.status(200).json({ fileName: file.name, filePath: dir });
});

router.get("/decryptAndSendToSlicer", (req, res) => {
  const inDir = path.join(__dirname, `../file-server/encryptedFileFront.txt`);
  const enc = fs.readFileSync(inDir, { encoding: "utf-8" });
  const message = privateKey1.decrypt(enc, "buffer");
  const outDir = path.join(__dirname, `../file-server/decryptedFileFront.stl`);
  fs.writeFileSync(outDir, message);
  emitter.emit("transfer_file", "decryptedFileFront.stl");
  res.status(200).json({ message: "succcess" });
});

router.get("/getTimerFile", (req, res) => {
  emitter.emit("get_timer_file");
  res.status(200).json({ message: "success" });
});

router.get("/getQuotation", (req, res) => {
  try {
    const dir = path.join(__dirname, "../timer/decryptedFileFront.txt");
    const time = fs.readFileSync(dir, "utf8");
    return res.status(200).json({ quotation: time * 1000, time });
  } catch (e) {
    return res.status(500).json({ quotation: "File is not ready" });
  }
});

router.post("/sentToPrinter", async (req, res) => {
  try {
    // 13098925
    console.log("Entra");
    const file = req.files.file;
    sendToPrinter(file, res);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Failed to sent file" });
  }
});

const sendToPrinter = (file, res) => {
  const options = {
    method: "POST",
    url: "https://fd93-186-102-7-217.ngrok.io/api/files/local",
    headers: {
      "x-api-key": "DCB6FF9B7D1948D99494F67C310D1E59",
      Authorization: "Basic YWxsYW46YWxsYW4=",
    },
    formData: {
      file: {
        value: file.data,
        options: {
          filename: file.name,
          contentType: null,
        },
      },
      select: "true",
    },
  };
  request(options, function (error, response) {
    if (error) {
      throw new Error(error);
    }
    return res.status(200).json(JSON.parse(response.body));
  });
};

const decrypt = (text) => {
  const decipher = CryptoJS.AES.decrypt(text, "top secret");
  const decipherStr = decipher.toString(CryptoJS.enc.Utf8);
  return decipherStr;
};

module.exports = router;

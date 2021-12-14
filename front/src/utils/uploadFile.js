import NodeRSA from "node-rsa";
import axios from "axios";

export const rsaEncriptionCompleteForString = async (publicKey, file) => {
    const publicRSA = new NodeRSA(publicKey, "pkcs8-public-pem", { encryptionScheme: "pkcs1" })
    const realFile = Buffer.from(await file.arrayBuffer(), "utf-8")
    const encrypted = publicRSA.encrypt(realFile, "base64");
    const fileEncrypted = new File([encrypted], "encryptedFileFront.txt", { type: "text/plain" })
    const formData = new FormData();
    formData.append("file", fileEncrypted);

    console.log({ file })
    const res = await axios.post("/uploadEncrypted", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    });
}

export const rsaEncriptionComplete = async (publicKey, file) => {
    const publicRSA = new NodeRSA(publicKey, "pkcs8-public-pem", { encryptionScheme: "pkcs1" })
    let offset = 0, chunkSize = 256, len = file.size;
    const total = Math.floor(len / chunkSize);
    const realFile = Buffer.from(await file.text(), "utf-8")
    while (offset < len) {
        const index = offset / chunkSize;
        const end = Math.min(offset + chunkSize, len);
        console.log(offset, end)
        const slicedFile = realFile.slice(offset, end);
        const encrypted = publicRSA.encrypt(slicedFile, "base64");
        await axios.post(`/uploadWithRSAReading?index=${index}&length=${total}`, {
            data: encrypted,
            name: file.name
        })
        offset += chunkSize;
    }

    await axios.post(`/parseToStl`, {
        name: file.name,
    })
}

export const rsaNonEncription = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    console.log({ file })
    const res = await axios.post("/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    });
    console.log(res.data)
}

export const cryptoEncription = (publicKey, file) => {
    const enc = encryptedData(publicKey, file)
    console.log(enc)
    // const dec = 
}

const encryptedData = async (publicKey, data) => {
    // const buffer = new Uint8Array(await data.arrayBuffer());
    crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha512",
        },
        // We convert the data string to a buffer using `Buffer.from`
        Buffer.from(await data.text())
    )
}

const download = (buf) => {
    const dataView = new DataView(buf);
    const blob = new Blob([dataView], { type: "application/sla" });
    const downloadURL = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadURL;
    a.download = "decrypted_LlaveroSenecaLogo.stl";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        return window.URL.revokeObjectURL(downloadURL);
    }, 1000);
}

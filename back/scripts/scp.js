const { spawn } = require('child_process')
const CONFIG = require('../config')

console.log("scp", "-i", CONFIG.pem, CONFIG.fileFrom('LlaveroSenecaLogo.stl'), `${CONFIG.ec2_instance}:${CONFIG.fileTo}`)
const scp = spawn("scp", ["-i", CONFIG.pem, CONFIG.fileFrom('LlaveroSenecaLogo.stl'), `${CONFIG.ec2_instance}:${CONFIG.fileTo}`]);
scp.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
    // res.status(200).json({ fileName: file.name, filePath: dir })

});
scp.stderr.on("data", () => {
    console.log(`stderr: ${data}`);
    // res.status(200).json({ fileName: file.name, filePath: dir })
})
scp.on('error', (error) => {
    console.log(`error: ${error.message}`);
    // res.status(200).json({ fileName: file.name, filePath: dir })
});

scp.on("close", code => {
    console.log(`child process exited with code ${code}`);
    if (code !== 0) {
        console.log('Error')
        return
    }
    // res.status(200).json({ fileName: file.name, filePath: dir })
});

console.log(scp);

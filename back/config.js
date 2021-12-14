const path = require('path');

module.exports = {
  pem: "/Users/allancorinaldi/Desktop/Noveno\ Semestre/Tesis/tesis.pem",
  fileFrom: (fileName) => path.join(__dirname, `file-server/${fileName}`),
  ec2_instance: "ubuntu@ec2-54-209-163-228.compute-1.amazonaws.com",
  fileTo: "~/stlFiles/",
}
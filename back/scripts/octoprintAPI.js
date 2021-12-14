const axios = require("axios");
const API_TOKEN = `55DE5F271053421FAD242EBF4CED05F7`;
const OctoPrint = require("octo-client");
const options = {
  hostname: "octopi.local",
  path: "/api/files",
  method: "GET",
  Authorization: `Bearer ${API_TOKEN}`,
};

OctoPrint.files();
// axios.get();

var data = new FormData();
data.append(
  "file",
  fs.createReadStream("/Users/allancorinaldi/Desktop/1635869626427.gcode")
);
data.append("foldername", "test");
data.append("select", "true");

var config = {
  method: "post",
  url: "octopi.local/api/files/local",
  headers: {
    Authorization: "Bearer DCB6FF9B7D1948D99494F67C310D1E59",
    ...data.getHeaders(),
  },
  data: data,
};

axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });

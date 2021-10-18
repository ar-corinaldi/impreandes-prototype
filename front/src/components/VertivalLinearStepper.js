import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CryptoJS from "crypto-js";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";

const encrypt = (text) => {
  const cipher = CryptoJS.AES.encrypt(text, "top secret");
  const cipherStr = cipher.toString();
  return cipherStr;
};

const getPublicKeys = async (setter, setIsLoading) => {
  try {
    setIsLoading(true);
    const res = await fetch("/publicKeys");
    const json = await res.json();
    console.log({ json });
    setter(json);
  } catch (e) {
    console.error(e);
  } finally {
    setTimeout(() => setIsLoading(false), 1000);
  }
};

const downloadFile = (results, setIsLoading) => {
  try {
    setIsLoading(true);
    console.log(results)
    const dataView = new DataView(new TextEncoder().encode(results).buffer);
    const blob = new Blob([dataView], { type: "application/sla" });
    const downloadURL = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadURL;
    a.download = "LlaveroSenecaLogo.stl";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      return window.URL.revokeObjectURL(downloadURL);
    }, 1000);
  } finally {
    setTimeout(() => setIsLoading(false), 1000);
  }
};

const onSubmitData = async (file, publicKey, setter, setIsLoading) => {
  try {
    setIsLoading(true);
    // const arr = [];
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });
    console.log(res)
    // console.log(new TextDecoder().decode(data));
    // while (offset < len) {
    //   const index = offset / chunkSize;
    //   const end = Math.min(offset + chunkSize, len);
    //   console.log(offset, end)
    //   const slicedFile = file.slice(offset, end);

    //   const buffer = await slicedFile.arrayBuffer();
    //   const data = new Uint8Array(buffer);
    //   const encrypted = encrypt(new TextDecoder().decode(data));
    //   const body = {
    //     file: encrypted,
    //     name: file.name,
    //   };


    //   const res = await fetch(`/receiveQuote?index=${index}&length=${total}`, {
    //     method: "POST",
    //     headers: {
    //       Accept: "multipart/form-data",
    //       "Content-Type": "multipart/form-data",
    //     },
    //     body: JSON.stringify(body),
    //   });
    //   const obj = await res.json();
    //   arr.push(obj.message);

    //   offset += chunkSize;
    // }
    // let results = "";
    // for (let message of arr) {
    //   results += message;
    // }
    // console.log(results);
    // setter(results);
  } finally {
    setTimeout(() => setIsLoading(false), 1000);
  }
};

const steps = [
  {
    label: "Pregunta y recibe llaves publicas de las impresoras",
    description: (data, setIsLoading) => {
      return (
        <div>
          <button
            onClick={() =>
              data && data.length === 2
                ? getPublicKeys(data[1], setIsLoading)
                : null
            }
          >
            Pedir llaves publicas
          </button>
        </div>
      );
    },
  },
  {
    label:
      "Encripta con llave publica y manda el archivo a la impresora que desea cotizar",
    description: (data, publicKeys, setter, setIsLoading) => {
      return (
        <div>
          Archivo a subir:{" "}
          <input
            type="file"
            onChange={(event) =>
              data && data.length === 2 ? data[1](event.target.files[0]) : null
            }
          />
          <button
            onClick={() =>
              data && data.length === 2
                ? onSubmitData(data[0], publicKeys.print1, setter, setIsLoading)
                : null
            }
          >
            Subir
          </button>
        </div>
      );
    },
  },
  {
    label: "Descarga el archivo desencriptado",
    description: (results, setIsLoading) => (
      <button onClick={() => downloadFile(results, setIsLoading)}>
        Descargar
      </button>
    ),
  },
];

export default function VerticalLinearStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [file, setFile] = React.useState(null);
  const [publicKeys, setPublicKeys] = React.useState({});
  const [resultedData, setResultedData] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ maxWidth: 400 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                index === 2 ? (
                  <Typography variant="caption">Ultimo paso</Typography>
                ) : null
              }
            >
              {step.label}
            </StepLabel>
            <StepContent>
              {index === 0 &&
                step.description([publicKeys, setPublicKeys], setIsLoading)}
              {index === 1 &&
                step.description(
                  [file, setFile],
                  publicKeys,
                  setResultedData,
                  setIsLoading
                )}
              {index === 2 && step.description(resultedData, setIsLoading)}
              <Box sx={{ mb: 2 }}>
                {isLoading ? (
                  <CircularProgress />
                ) : (
                  <div>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      {index === steps.length - 1 ? "Terminar" : "Continuar"}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Anterior
                    </Button>
                  </div>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            Reset
          </Button>
        </Paper>
      )}
    </Box>
  );
}

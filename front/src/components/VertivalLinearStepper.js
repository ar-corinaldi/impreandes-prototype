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
import { rsaEncriptionCompleteForString } from "../utils/uploadFile";

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

const onSubmitData = async (file, publicKey, setter, setIsLoading) => {
  try {
    setIsLoading(true);
    rsaEncriptionCompleteForString(publicKey, file);
  } finally {
    setTimeout(() => setIsLoading(false), 1000);
  }
};

const onSendToSlicer = async (setIsLoading) => {
  try {
    setIsLoading(true);
    const res = await fetch("/decryptAndSendToSlicer");
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  } finally {
    setIsLoading(false);
  }
};

const verificaEstimacionTiempo = async (setIsLoading) => {
  try {
    setIsLoading(true);
    const res = await fetch("/getTimerFile");
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  } finally {
    setIsLoading(false);
  }
};

const darCotizacion = async (setIsLoading, setter, setterTime) => {
  try {
    setIsLoading(true);
    const res = await fetch("/getQuotation");
    const data = await res.json();
    setter(data.quotation);
    setterTime(data.time);
    console.log(data);
  } catch (e) {
    console.error(e);
  } finally {
    setIsLoading(false);
  }
};

const enviarAImpresora = async (setIsLoading, file) => {
  try {
    setIsLoading(true);
    const myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      "Bearer DCB6FF9B7D1948D99494F67C310D1E59"
    );

    const formdata = new FormData();
    formdata.append("file", file, file.name);
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };
    const res = await fetch("/sentToPrinter", requestOptions);
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  } finally {
    setIsLoading(false);
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
    label: "Encripta con llave publica y manda el archivo al servidor",
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
    label: "Desencripta el servidor con llave privada y manda al Slicer",
    description: (setIsLoading) => {
      return (
        <div>
          Enviar archivo desenciptado al Slicer
          <button onClick={() => onSendToSlicer(setIsLoading)}>Enviar</button>
        </div>
      );
    },
  },
  {
    label: "Verifica si esta la estimacion del tiempo",
    description: (setIsLoading) => {
      return (
        <div>
          <button onClick={() => verificaEstimacionTiempo(setIsLoading)}>
            Verifica
          </button>
        </div>
      );
    },
  },
  {
    label: "Dar cotizacion",
    description: (setIsLoading, setter, value, setterTime, time) => {
      return (
        <div>
          <button
            onClick={() => darCotizacion(setIsLoading, setter, setterTime)}
          >
            Cotizar
          </button>
          <div>
            {parseInt(value).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </div>
          <div>Time in seconds: {time}</div>
        </div>
      );
    },
  },
  {
    label: "Enviar archivo a impresora",
    description: (setIsLoading, gCode, setGCode) => {
      return (
        <div>
          <input
            type="file"
            onChange={(event) => setGCode(event.target.files[0])}
          />
          <button onClick={() => enviarAImpresora(setIsLoading, gCode)}>
            Enviar a impresora
          </button>
        </div>
      );
    },
  },
  {
    label: "Imprimir en impresora",
    description: (setIsLoading, setter, value, setterTime, time) => {
      return (
        <div>
          <button
            onClick={() => darCotizacion(setIsLoading, setter, setterTime)}
          >
            Imprimir
          </button>
        </div>
      );
    },
  },
];

export default function VerticalLinearStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [file, setFile] = React.useState(null);
  const [publicKeys, setPublicKeys] = React.useState({});
  const [resultedData, setResultedData] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [cotizacion, setCotizacion] = React.useState(0);
  const [time, setTime] = React.useState(0);
  const [gCode, setGCode] = React.useState(null);

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
                  <Typography constiant="caption">Ultimo paso</Typography>
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
              {index === 2 && step.description(setIsLoading)}
              {index === 3 && step.description(setIsLoading)}
              {index === 4 &&
                step.description(
                  setIsLoading,
                  setCotizacion,
                  cotizacion,
                  setTime,
                  time
                )}
              {index === 5 && step.description(setIsLoading, gCode, setGCode)}
              <Box sx={{ mb: 2 }}>
                {isLoading ? (
                  <CircularProgress />
                ) : (
                  <div>
                    <Button
                      constiant="contained"
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

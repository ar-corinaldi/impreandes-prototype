import React, { useEffect } from "react";
import { Grid } from "@mui/material";
import VerticalLinearStepper from "./components/VertivalLinearStepper";

function App() {
  useEffect(() => {
    fetch("/").then((x) => x.json().then(console.log));
  }, []);

  return (
    <div className="App">
      <Grid container flexDirection="column" alignItems="center">
        <Grid>Assymetric test</Grid>
        <VerticalLinearStepper />
      </Grid>
    </div>
  );
}

export default App;

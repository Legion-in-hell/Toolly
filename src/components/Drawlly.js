import React from "react";
import { Box } from "@mui/material";
import NavigationPanel from "./NavigationPanel";
import TopBar from "./TopBar";

function Drawlly() {
  return (
    <Box sx={{ display: "flex" }}>
      <div style={{ marginLeft: "300px", marginTop: "80px" }}>
        <h1>Drawlly</h1>
      </div>
      <TopBar />
      <NavigationPanel />
    </Box>
  );
}

export default Drawlly;

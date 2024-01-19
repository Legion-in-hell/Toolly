import React from "react";
import { Box } from "@mui/material";
import NavigationPanel from "./NavigationPanel";
import TopBar from "./TopBar";

function Drawlly() {
  return (
    <Box sx={{ display: "flex" }}>
      <TopBar />
      <NavigationPanel />
    </Box>
  );
}

export default Drawlly;

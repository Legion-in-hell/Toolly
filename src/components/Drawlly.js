import React from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { Box } from "@mui/material";
import TopBar from "./TopBar";
import NavigationPanel from "./NavigationPanel";

function Drawlly() {
  return (
    <>
      <TopBar />
      <NavigationPanel />
      <Box sx={{ marginLeft: "300px", marginTop: "30px" }}>
        <div style={{ height: "800px" }}>
          <Excalidraw />
        </div>
      </Box>
    </>
  );
}

export default Drawlly;

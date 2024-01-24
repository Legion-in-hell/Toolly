import React from "react";
import { Box } from "@mui/material";
import TopBar from "./TopBar";
import NavigationPanel from "./NavigationPanel";

function IdeaBox() {
  return (
    <>
      <TopBar />
      <NavigationPanel />
      <Box sx={{ display: "flex" }}>
        <div style={{ marginLeft: "300px", marginTop: "40px" }}>
          <h1>IdeaBox</h1>
        </div>
      </Box>
    </>
  );
}

export default IdeaBox;

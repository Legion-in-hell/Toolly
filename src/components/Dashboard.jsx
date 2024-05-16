import React, { useEffect } from "react";
import { Box } from "@mui/material";
import TopBar from "./TopBar";
import NavigationPanel from "./NavigationPanel";

function Dashboard() {
  return (
    <>
      <TopBar />
      <NavigationPanel />
      <Box sx={{ display: "flex" }}>
        <div style={{ marginLeft: "300px", marginTop: "40px" }}>
          PLACEHOLDER
        </div>
      </Box>
    </>
  );
}

export default Dashboard;

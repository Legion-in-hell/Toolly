import React from "react";
import { Box } from "@mui/material";
import NavigationPanel from "./NavigationPanel";

function Dashboard() {
  return (
    <Box sx={{ display: "flex" }}>
      <NavigationPanel />
    </Box>
  );
}

export default Dashboard;

import React, { useEffect } from "react";
import { Box } from "@mui/material";
import NavigationPanel from "./NavigationPanel";
import TopBar from "./TopBar";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [navigate, token]);

  return (
    <Box sx={{ display: "flex" }}>
      <div style={{ marginLeft: "300px", marginTop: "80px" }}>
        <h1>Dashboard</h1>
      </div>
      <TopBar />
      <NavigationPanel />
    </Box>
  );
}

export default Dashboard;

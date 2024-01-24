import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import TopBar from "./TopBar";
import NavigationPanel from "./NavigationPanel";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [navigate, token]);

  return (
    <>
      <TopBar />
      <NavigationPanel />
      <Box sx={{ display: "flex" }}>
        <div style={{ marginLeft: "300px", marginTop: "40px" }}>
          <h1>Dashboard</h1>
        </div>
      </Box>
    </>
  );
}

export default Dashboard;

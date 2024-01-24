import React from "react";
import { Box } from "@mui/material";
import PostItBoard from "./PostIt";
import TopBar from "./TopBar";
import NavigationPanel from "./NavigationPanel";

const FolderPage = () => {
  return (
    <>
      <TopBar />
      <NavigationPanel />
      <Box sx={{ display: "flex", marginLeft: "300px", marginTop: "50px" }}>
        <div style={{ display: "flex", flex: 1, height: "100vh" }}>
          <div
            style={{
              flex: 1,
              paddingRight: "2px",
              borderRight: "1px solid #ccc",
            }}
          >
            Todo
          </div>
          <div
            style={{
              flex: 1,
              paddingLeft: "2px",
              justifyContent: "flex-end",
              display: "flex",
            }}
          >
            <PostItBoard />
          </div>
        </div>
      </Box>
    </>
  );
};

export default FolderPage;

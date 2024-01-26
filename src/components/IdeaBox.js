import React from "react";
import { Box } from "@mui/material";
import TopBar from "./TopBar";
import NavigationPanel from "./NavigationPanel";
import PostItBoard from "./PostIt";

function IdeaBox() {
  return (
    <>
      <TopBar />
      <NavigationPanel />
      <Box sx={{ display: "flex", marginLeft: "300px", marginTop: "30px" }}>
        <div style={{ display: "flex", flex: 1, height: "100vh" }}>
          Placeholder
          <div
            style={{
              flex: 1,
              marginRight: "10px",
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
}

export default IdeaBox;

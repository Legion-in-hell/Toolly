import React from "react";
import { Box } from "@mui/material";
import PostItBoard from "./PostIt";
import TopBar from "./TopBar";
import NavigationPanel from "./NavigationPanel";
import Todo from "./Todo";
import { useParams } from "react-router-dom";

const FolderPage = () => {
  const { folderId } = useParams();

  return (
    <>
      <TopBar />
      <NavigationPanel />
      <Box sx={{ display: "flex", marginLeft: "300px", marginTop: "30px" }}>
        <div style={{ display: "flex", flex: 1, height: "100vh" }}>
          <div
            style={{
              flex: 1,
              paddingRight: "2px",
              borderRight: "0px solid #ccc",
            }}
          >
            <Todo folderId={folderId} />
          </div>
          <div
            style={{
              flex: 1,
              marginRight: "10px",
              justifyContent: "flex-end",
              display: "flex",
            }}
          >
            <PostItBoard folderId={folderId} />
          </div>
        </div>
      </Box>
    </>
  );
};

export default React.memo(FolderPage);

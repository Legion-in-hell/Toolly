import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import SettingsIcon from "@mui/icons-material/Settings";
import { usePomodoro } from "./PomodoroContext"; // Assurez-vous que le chemin est correct

const TopBar = () => {
  const {
    minutes,
    seconds,
    isActive,
    soundOn,
    toggleTimer,
    toggleSound,
    workMinutes,
    breakMinutes,
    updateWorkMinutes,
    updateBreakMinutes,
    setWorkMinutes,
    setBreakMinutes,
  } = usePomodoro();

  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setDate(now.toLocaleDateString());
      setTime(now.toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time) => {
    return String(time).padStart(2, "0");
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const handleSettingsSave = () => {
    updateWorkMinutes(parseInt(workMinutes, 10));
    updateBreakMinutes(parseInt(breakMinutes, 10));
    setIsSettingsOpen(false);
  };

  const drawerWidth = 277;

  return (
    <Box sx={{}}>
      <AppBar position="fixed" sx={{ marginLeft: drawerWidth }}>
        <Toolbar style={{ marginLeft: drawerWidth }}>
          <Typography variant="h6">Dashboard</Typography>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <Box display="flex" alignItems="center">
                <Typography variant="h4">
                  {formatTime(minutes)}:{formatTime(seconds)}
                </Typography>
                <Box ml={2}>
                  <IconButton onClick={openSettings}>
                    <SettingsIcon />
                  </IconButton>
                  <IconButton onClick={toggleSound}>
                    {soundOn ? <VolumeUpIcon /> : <VolumeOffIcon />}
                  </IconButton>
                  <Button
                    onClick={toggleTimer}
                    variant="contained"
                    color="primary"
                  >
                    {isActive ? "Pause" : "Start"}
                  </Button>
                </Box>
              </Box>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            {" "}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                top: 8,
              }}
            >
              <Typography variant="body1">Time: {time}</Typography>
              <Typography variant="body1">Date: {date}</Typography>
            </div>
          </div>
        </Toolbar>
      </AppBar>
      <Dialog open={isSettingsOpen} onClose={handleSettingsClose}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <TextField
            label="Work Minutes"
            type="number"
            fullWidth
            margin="dense"
            value={workMinutes}
            onChange={(e) => setWorkMinutes(e.target.value)}
          />
          <TextField
            label="Break Minutes"
            type="number"
            fullWidth
            margin="dense"
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSettingsClose}>Cancel</Button>
          <Button onClick={handleSettingsSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TopBar;

import React, { useEffect, useState } from "react";
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
import SettingsIcon from "@mui/icons-material/Settings";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

const TopBar = () => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [isBreak, setIsBreakTime] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            if (soundOn) {
              const audio = null; //todo new Audio("/sounds/bell.mp3");
              audio.play();
            }
            if (isBreak) {
              setIsBreakTime(false);
              setMinutes(workMinutes);
            } else {
              setIsBreakTime(true);
              setMinutes(breakMinutes);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, soundOn, isBreak, workMinutes, breakMinutes]);

  const toggleSound = () => {
    setSoundOn(!soundOn);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

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
    setMinutes(workMinutes);
    setSeconds(0);
    setIsSettingsOpen(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setDate(now.toLocaleDateString());
      setTime(now.toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
            <div>Date: {date}</div>
            <div>Time: {time}&nbsp;</div>
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

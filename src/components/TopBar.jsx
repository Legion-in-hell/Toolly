import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import {
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { usePomodoro } from "./PomodoroContext";

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
  } = usePomodoro();

  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempWorkMinutes, setTempWorkMinutes] = useState(workMinutes);
  const [tempBreakMinutes, setTempBreakMinutes] = useState(breakMinutes);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = useCallback((time) => {
    return String(time).padStart(2, "0");
  }, []);

  const formattedDate = useMemo(() => {
    return currentDateTime.toLocaleDateString();
  }, [currentDateTime]);

  const formattedTime = useMemo(() => {
    return currentDateTime.toLocaleTimeString();
  }, [currentDateTime]);

  const handleSettingsOpen = useCallback(() => {
    setTempWorkMinutes(workMinutes);
    setTempBreakMinutes(breakMinutes);
    setIsSettingsOpen(true);
  }, [workMinutes, breakMinutes]);

  const handleSettingsClose = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleSettingsSave = useCallback(() => {
    updateWorkMinutes(parseInt(tempWorkMinutes, 10));
    updateBreakMinutes(parseInt(tempBreakMinutes, 10));
    setIsSettingsOpen(false);
  }, [
    tempWorkMinutes,
    tempBreakMinutes,
    updateWorkMinutes,
    updateBreakMinutes,
  ]);

  const drawerWidth = 277;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{ marginLeft: drawerWidth, width: `calc(100% - ${drawerWidth}px)` }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="h4" sx={{ mr: 2 }}>
              {formatTime(minutes)}:{formatTime(seconds)}
            </Typography>
            <IconButton onClick={handleSettingsOpen} color="inherit">
              <SettingsIcon />
            </IconButton>
            <IconButton onClick={toggleSound} color="inherit">
              {soundOn ? <VolumeUpIcon /> : <VolumeOffIcon />}
            </IconButton>
            <Button onClick={toggleTimer} variant="contained" color="secondary">
              {isActive ? "Pause" : "Start"}
            </Button>
          </Box>
          <Box sx={{ ml: 2, textAlign: "right" }}>
            <Typography variant="body2">{formattedTime}</Typography>
            <Typography variant="body2">{formattedDate}</Typography>
          </Box>
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
            value={tempWorkMinutes}
            onChange={(e) => setTempWorkMinutes(e.target.value)}
          />
          <TextField
            label="Break Minutes"
            type="number"
            fullWidth
            margin="dense"
            value={tempBreakMinutes}
            onChange={(e) => setTempBreakMinutes(e.target.value)}
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

export default React.memo(TopBar);

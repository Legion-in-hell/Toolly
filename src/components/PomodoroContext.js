import React, { createContext, useState, useEffect, useContext } from "react";
import MP3 from "./assets/alarm.mp3"; // Assurez-vous que le chemin vers le fichier MP3 est correct

const PomodoroContext = createContext();

export const usePomodoro = () => useContext(PomodoroContext);

export const PomodoroProvider = ({ children }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [isBreak, setIsBreak] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            if (soundOn) {
              const audio = new Audio(MP3);
              audio.play();
            }
            if (isBreak) {
              setIsBreak(false);
              setMinutes(workMinutes);
            } else {
              setIsBreak(true);
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

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(workMinutes);
    setSeconds(0);
  };

  const toggleSound = () => {
    setSoundOn(!soundOn);
  };

  const updateWorkMinutes = (newMinutes) => {
    setWorkMinutes(newMinutes);
    if (!isActive) {
      setMinutes(newMinutes);
      setSeconds(0);
    }
  };

  const updateBreakMinutes = (newMinutes) => {
    setBreakMinutes(newMinutes);
    if (isActive && isBreak) {
      setMinutes(newMinutes);
      setSeconds(0);
    }
  };

  return (
    <PomodoroContext.Provider
      value={{
        minutes,
        seconds,
        isActive,
        soundOn,
        isBreak,
        workMinutes,
        breakMinutes,
        toggleTimer,
        resetTimer,
        toggleSound,
        updateWorkMinutes,
        updateBreakMinutes,
        setBreakMinutes,
        setWorkMinutes,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

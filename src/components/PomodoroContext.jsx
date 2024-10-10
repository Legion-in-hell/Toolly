import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import MP3 from "./assets/alarm.mp3";

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

  const playAlarm = useCallback(() => {
    if (soundOn) {
      const audio = new Audio(MP3);
      audio
        .play()
        .catch((error) => console.error("Error playing audio:", error));
    }
  }, [soundOn]);

  const switchMode = useCallback(() => {
    playAlarm();
    setIsBreak((prevIsBreak) => !prevIsBreak);
    setMinutes(isBreak ? workMinutes : breakMinutes);
    setSeconds(0);
  }, [isBreak, workMinutes, breakMinutes, playAlarm]);

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            switchMode();
          } else {
            setMinutes((prevMinutes) => prevMinutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds((prevSeconds) => prevSeconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, switchMode]);

  const toggleTimer = useCallback(() => {
    setIsActive((prevIsActive) => !prevIsActive);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setMinutes(workMinutes);
    setSeconds(0);
    setIsBreak(false);
  }, [workMinutes]);

  const toggleSound = useCallback(() => {
    setSoundOn((prevSoundOn) => !prevSoundOn);
  }, []);

  const updateWorkMinutes = useCallback(
    (newMinutes) => {
      setWorkMinutes(newMinutes);
      if (!isActive && !isBreak) {
        setMinutes(newMinutes);
        setSeconds(0);
      }
    },
    [isActive, isBreak]
  );

  const updateBreakMinutes = useCallback(
    (newMinutes) => {
      setBreakMinutes(newMinutes);
      if (!isActive && isBreak) {
        setMinutes(newMinutes);
        setSeconds(0);
      }
    },
    [isActive, isBreak]
  );

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
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

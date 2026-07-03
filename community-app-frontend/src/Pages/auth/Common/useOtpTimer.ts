import { useState, useEffect } from "react";

const useOtpTimer = (initialDuration: number = 180) => {
  const [timer, setTimer] = useState<number>(initialDuration);

  useEffect(() => {
    let countdown: ReturnType<typeof setTimeout> | undefined;
    if (timer > 0) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => {
      if (countdown) {
        clearTimeout(countdown);
      }
    };
  }, [timer]);

  const resetTimer = () => {
    setTimer(initialDuration);
  };

  const formatTimer = (): string => {
    const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
    const seconds = String(timer % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return { timer, resetTimer, formatTimer };
};

export default useOtpTimer;

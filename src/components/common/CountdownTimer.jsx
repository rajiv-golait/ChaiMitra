import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ expiryTimestamp, className }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryTimestamp) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (!expiryTimestamp) return;

    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  if (!expiryTimestamp) {
    return null;
  }

  const timerComponents = [];
  Object.keys(timeLeft).forEach((interval) => {
    if (timeLeft[interval] === undefined) {
      return;
    }

    timerComponents.push(
      <div key={interval} className="flex flex-col items-center">
        <span className="text-2xl font-bold">{String(timeLeft[interval]).padStart(2, '0')}</span>
        <span className="text-xs uppercase">{interval}</span>
      </div>
    );
  });

  return (
    <div className={`flex items-center space-x-2 text-red-500 font-mono ${className}`}>
      <Clock className="w-6 h-6" />
      {timerComponents.length ? (
        <div className="flex space-x-2">
          {timerComponents.map((component, index) => (
            <React.Fragment key={index}>
              {component}
              {index < timerComponents.length - 1 && <span className="text-2xl">:</span>}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <span className="font-semibold">Deal has expired!</span>
      )}
    </div>
  );
};

export default CountdownTimer;


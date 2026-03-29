'use client';
import { useState, useEffect } from 'react';

export function useCountdown(expiresAt: string) {
  const [time, setTime] = useState({ d:0, h:0, m:0, s:0, expired:false });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTime({ d:0,h:0,m:0,s:0,expired:true }); return; }
      setTime({
        d: Math.floor(diff/864e5),
        h: Math.floor((diff%864e5)/36e5),
        m: Math.floor((diff%36e5)/6e4),
        s: Math.floor((diff%6e4)/1e3),
        expired: false,
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  return time;
}

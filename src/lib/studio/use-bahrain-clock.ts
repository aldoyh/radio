import { useEffect, useState } from "react";

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Bahrain",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const dateFmt = new Intl.DateTimeFormat("ar-BH", {
  timeZone: "Asia/Bahrain",
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function useBahrainClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return {
    time: timeFmt.format(now),
    date: dateFmt.format(now),
  };
}

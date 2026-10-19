"use client";

import { useSyncExternalStore } from "react";

// Хүргэлтийн завсрууд одоогийн цагаас хамаарна — серверт (prerender) мэдэгдэхгүй тул
// hydration-ий дараа л тооцно; минут тутам шинэчилнэ
const subscribeMinute = (onChange: () => void) => {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
};
const currentMinute = () => Math.floor(Date.now() / 60_000) * 60_000;
const noTime = () => null;

/** Минутаар бөөрөнхийлсөн одоогийн цаг (ms); hydration-ий өмнө null */
export function useMinuteClock() {
  return useSyncExternalStore(subscribeMinute, currentMinute, noTime);
}

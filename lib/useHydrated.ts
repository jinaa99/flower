"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** Hydration-ий дараа true — persist store (localStorage)-ийг серверийн HTML-тэй зөрөхгүй харуулахад */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

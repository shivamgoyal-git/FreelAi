"use client";

import { useEffect } from "react";

let activeLocks = 0;

export function useBodyScrollLock(lock: boolean) {
  useEffect(() => {
    if (!lock) return;

    activeLocks++;
    
    // Save original styles
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    document.body.style.overflow = "hidden";

    return () => {
      activeLocks--;
      if (activeLocks <= 0) {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        activeLocks = 0; // prevent negative value edge cases
      }
    };
  }, [lock]);
}

export default useBodyScrollLock;

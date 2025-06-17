"use client";

import { useState, useEffect } from 'react';

export function useScrollspy(ids: string[], offset: number = 0) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const listener = () => {
      const scroll = window.scrollY;
      
      const active = ids.find(id => {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const top = rect.top + scroll - offset;
          const bottom = top + rect.height;
          // Check if the element is in the viewport (top part of it)
          // Or if it's the last element and we've scrolled past its top
          return scroll >= top && scroll < bottom;
        }
        return false;
      });

      // Fallback: if no element is strictly in view (e.g., scrolled to bottom past last element's content)
      // pick the last one whose top is above current scroll position.
      if (!active) {
        for (let i = ids.length - 1; i >= 0; i--) {
          const element = document.getElementById(ids[i]);
          if (element) {
            const rect = element.getBoundingClientRect();
            const top = rect.top + scroll - offset;
            if (scroll >= top - (window.innerHeight * 0.2)) { // Give some leeway for elements near top
              setActiveId(ids[i]);
              return;
            }
          }
        }
         setActiveId(null); // If nothing found, set to null
      } else {
         setActiveId(active);
      }
    };

    listener(); // Call on mount
    window.addEventListener('scroll', listener);
    window.addEventListener('resize', listener);
    return () => {
      window.removeEventListener('scroll', listener);
      window.removeEventListener('resize', listener);
    };
  }, [ids, offset]);

  return activeId;
}

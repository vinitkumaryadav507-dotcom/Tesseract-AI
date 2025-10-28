
"use client";

import { useState, useEffect, memo } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

const Typewriter = memo(({ text, speed = 20, onComplete }: TypewriterProps) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(''); 
    if (text) {
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(prev => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(timer);
          if (onComplete) {
            onComplete();
          }
        }
      }, speed);
      return () => clearInterval(timer);
    }
  }, [text, speed, onComplete]);

  return <p className="whitespace-pre-wrap">{displayedText}</p>;
});

Typewriter.displayName = 'Typewriter';

export { Typewriter };

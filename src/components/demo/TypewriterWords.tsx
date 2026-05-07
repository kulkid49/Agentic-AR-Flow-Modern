import { useEffect, useMemo, useRef, useState } from "react";

type TypewriterWordsProps = {
  text: string;
  start: boolean;
  wordDelayMs?: number;
  className?: string;
  caret?: boolean;
  onDone?: () => void;
};

export default function TypewriterWords({
  text,
  start,
  wordDelayMs = 70,
  className,
  caret = true,
  onDone,
}: TypewriterWordsProps) {
  const words = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return [];
    return trimmed.split(/\s+/g);
  }, [text]);

  const [count, setCount] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    setCount(0);
    doneRef.current = false;
  }, [text]);

  useEffect(() => {
    if (!start) return;
    if (doneRef.current) return;
    if (words.length === 0) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
      return;
    }

    const id = window.setInterval(() => {
      setCount((prev) => {
        const next = Math.min(prev + 1, words.length);
        if (next >= words.length && !doneRef.current) {
          doneRef.current = true;
          window.setTimeout(() => onDone?.(), 0);
        }
        return next;
      });
    }, Math.max(10, wordDelayMs));

    return () => {
      window.clearInterval(id);
    };
  }, [start, wordDelayMs, words.length, onDone]);

  const shown = words.slice(0, start ? count : 0).join(" ");
  const isTyping = start && !doneRef.current && words.length > 0;

  return (
    <span className={className}>
      {shown}
      {caret && isTyping && (
        <span className="inline-block ml-1 align-baseline animate-caret-blink">|</span>
      )}
    </span>
  );
}

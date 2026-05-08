import { useEffect, useMemo, useRef, useState } from "react";

type TypewriterCharsProps = {
  text: string;
  start: boolean;
  charDelayMs?: number;
  className?: string;
  onDone?: () => void;
};

export default function TypewriterChars({
  text,
  start,
  charDelayMs = 40,
  className,
  onDone,
}: TypewriterCharsProps) {
  const content = useMemo(() => text ?? "", [text]);
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    setCount(0);
    doneRef.current = false;
  }, [content]);

  useEffect(() => {
    if (!start) return;
    if (doneRef.current) return;

    const total = content.length;
    if (total === 0) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
      return;
    }

    const id = window.setInterval(() => {
      setCount((prev) => {
        const next = Math.min(prev + 1, total);
        if (next >= total && !doneRef.current) {
          doneRef.current = true;
          window.setTimeout(() => onDone?.(), 0);
        }
        return next;
      });
    }, Math.max(10, charDelayMs));

    return () => window.clearInterval(id);
  }, [start, charDelayMs, content, onDone]);

  const shown = start ? content.slice(0, count) : "";
  const isTyping = start && !doneRef.current && content.length > 0;

  return (
    <div className={className}>
      <span>{shown}</span>
      {isTyping && (
        <span className="inline-block ml-1 align-baseline animate-caret-blink">|</span>
      )}
    </div>
  );
}


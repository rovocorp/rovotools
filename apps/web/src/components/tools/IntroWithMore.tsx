"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";

const MIN_SPLIT_CHARS = 180;
const MIN_REST_CHARS = 40;

export function splitFirstSentence(text: string): { lead: string; rest: string } | null {
  if (text.length <= MIN_SPLIT_CHARS) return null;
  const match = /^([^.!?]*[.!?])\s+([\s\S]+)$/.exec(text);
  if (!match) return null;
  const lead = (match[1] ?? "").trim();
  const rest = (match[2] ?? "").trim();
  if (rest.length < MIN_REST_CHARS) return null;
  return { lead, rest };
}

export default function IntroWithMore({
  text,
  className,
}: {
  text: string;
  className?: string;
}): React.ReactElement {
  const split = splitFirstSentence(text);
  const [open, setOpen] = useState(false);
  const restId = useId();

  if (!split) {
    return <p className={className}>{text}</p>;
  }

  return (
    <p className={className}>
      {split.lead} {!open ? <span aria-hidden="true">…</span> : null}{" "}
      <span id={restId} hidden={!open}>
        {split.rest}{" "}
      </span>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={restId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-0.5 align-baseline whitespace-nowrap text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        {open ? "Less" : "More"}
        {open ? (
          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
    </p>
  );
}

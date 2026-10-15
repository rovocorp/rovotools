"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { splitAtFirstSentence } from "@/components/tools/IntroWithMore";

const MIN_TOTAL_CHARS = 180;

export default function CategoryIntro({
  paragraphs,
  className,
}: {
  paragraphs: readonly string[];
  className?: string;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const restId = useId();
  const paras = paragraphs.filter((paragraph) => paragraph.trim().length > 0);
  const totalLength = paras.reduce((sum, paragraph) => sum + paragraph.length, 0);
  const first = paras[0] ?? "";
  const split = totalLength > MIN_TOTAL_CHARS ? splitAtFirstSentence(first) : null;

  if (!split) {
    return (
      <div className={className}>
        {paras.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    );
  }

  const restParas = [split.rest, ...paras.slice(1)];
  const toggle = (
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
  );

  if (!open) {
    return (
      <div className={className}>
        <p>
          {split.lead} <span aria-hidden="true">…</span> {toggle}
        </p>
        <div id={restId} hidden>
          {restParas.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <p>{split.lead}</p>
      <div id={restId}>
        {restParas.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <p>{toggle}</p>
    </div>
  );
}

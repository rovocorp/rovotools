"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

const FEEDBACK_KEY = "rovotools:feedback";

function storeLocalFeedback(toolId: string, useful: boolean): void {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    const parsed: unknown = raw === null ? {} : JSON.parse(raw);
    const record = typeof parsed === "object" && parsed !== null ? (parsed as Record<string, boolean>) : {};
    record[toolId] = useful;
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(record));
  } catch {
    // Best-effort local persistence.
  }
}

export default function FeedbackWidget({ toolId }: { toolId: string }): React.ReactElement {
  const [vote, setVote] = useState<"yes" | "no" | null>(null);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  function submit(next: "yes" | "no"): void {
    setVote(next);
    // Anonymous usage signal only — never includes tool inputs. Stored
    // locally; no server in the static build.
    trackEvent("tool_feedback", { toolId, useful: next === "yes" });
    storeLocalFeedback(toolId, next === "yes");
    setSent(true);
  }

  return (
    <section aria-labelledby="feedback-heading" className="mt-12 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
      <h2 id="feedback-heading" className="font-semibold">
        Was this tool useful?
      </h2>
      {sent ? (
        <p aria-live="polite" className="mt-2 text-sm text-green-700 dark:text-green-400">
          Thanks for your feedback.
        </p>
      ) : (
        <div className="mt-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={vote === "yes" ? "default" : "outline"}
              size="sm"
              onClick={() => void submit("yes")}
              aria-pressed={vote === "yes"}
            >
              <ThumbsUp className="h-4 w-4" aria-hidden="true" /> Yes
            </Button>
            <Button
              type="button"
              variant={vote === "no" ? "default" : "outline"}
              size="sm"
              onClick={() => void submit("no")}
              aria-pressed={vote === "no"}
            >
              <ThumbsDown className="h-4 w-4" aria-hidden="true" /> No
            </Button>
          </div>
          <label htmlFor={`feedback-comment-${toolId}`} className="mt-3 block text-xs text-zinc-600 dark:text-zinc-400">
            Optional comment (never include passwords or private data)
          </label>
          <input
            id={`feedback-comment-${toolId}`}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={500}
            placeholder="What could be better?"
            className="mt-1 h-10 w-full max-w-md rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      )}
    </section>
  );
}

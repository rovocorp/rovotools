"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

export default function FeedbackWidget({ toolId }: { toolId: string }): React.ReactElement {
  const [vote, setVote] = useState<"yes" | "no" | null>(null);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(next: "yes" | "no"): Promise<void> {
    setVote(next);
    setError(null);
    // Anonymous usage signal only — never includes tool inputs.
    trackEvent("tool_feedback", { toolId, useful: next === "yes" });
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ toolId, useful: next === "yes", comment: comment.trim().slice(0, 500) || undefined }),
      });
      if (!res.ok) {
        throw new Error("request failed");
      }
      setSent(true);
    } catch {
      setError("Could not send feedback. Please try again.");
    }
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
          {error !== null ? (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

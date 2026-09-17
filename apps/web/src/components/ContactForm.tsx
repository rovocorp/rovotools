"use client";

import { useState } from "react";
import { z } from "zod";
import { SUPPORT_EMAIL } from "@rovotools/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const TOPICS = [
  "General enquiry",
  "Support",
  "Bug report",
  "Feature request",
  "Business",
  "Privacy",
  "Other",
] as const;

const MAX_MESSAGE = 5000;

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(320),
  topic: z.enum(TOPICS, { errorMap: () => ({ message: "Choose a topic." }) }),
  company: z.string().trim().max(160).optional(),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine((value) => value === "" || /^[+()\-.\s\d]+$/.test(value), "Enter a valid phone number.")
    .optional(),
  subject: z.string().trim().min(3, "Enter a subject.").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(MAX_MESSAGE),
  consent: z.literal(true, { errorMap: () => ({ message: "Please accept the privacy policy." }) }),
  // Honeypot — must stay empty. Bots fill it; humans never see it.
  website: z.string().max(0, "Invalid submission."),
});

type ContactInput = z.infer<typeof contactSchema>;

const EMPTY: ContactInput = {
  name: "",
  email: "",
  topic: "General enquiry",
  company: "",
  phone: "",
  subject: "",
  message: "",
  consent: false as unknown as true,
  website: "",
};

export default function ContactForm(): React.ReactElement {
  const [values, setValues] = useState<ContactInput>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactInput, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  function set<K extends keyof ContactInput>(key: K, value: ContactInput[K]): void {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ContactInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactInput | undefined;
        if (key !== undefined && fieldErrors[key] === undefined) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    // Honeypot filled — pretend success without storing anything.
    if (parsed.data.website !== "") {
      setStatus("sent");
      return;
    }
    setStatus("sending");
    try {
      const { website: _trap, ...payload } = parsed.data;
      void _trap;
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <p aria-live="polite" className="rounded-xl border border-green-200 bg-green-50 p-6 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
        Thanks — your message has been received. We usually reply within a few business days.
      </p>
    );
  }

  const messageLength = values.message.length;

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name">Name *</Label>
          <Input id="contact-name" value={values.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" maxLength={120} />
          {errors.name !== undefined ? <p role="alert" className="text-xs text-red-600">{errors.name}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-email">Email *</Label>
          <Input id="contact-email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" maxLength={320} />
          {errors.email !== undefined ? <p role="alert" className="text-xs text-red-600">{errors.email}</p> : null}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-topic">Topic *</Label>
          <select
            id="contact-topic"
            value={values.topic}
            onChange={(e) => set("topic", e.target.value as ContactInput["topic"])}
            className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
          >
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          {errors.topic !== undefined ? <p role="alert" className="text-xs text-red-600">{errors.topic}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-company">Company <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input id="contact-company" value={values.company ?? ""} onChange={(e) => set("company", e.target.value)} autoComplete="organization" maxLength={160} />
          {errors.company !== undefined ? <p role="alert" className="text-xs text-red-600">{errors.company}</p> : null}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-phone">Phone <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input id="contact-phone" type="tel" value={values.phone ?? ""} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" maxLength={40} />
          {errors.phone !== undefined ? <p role="alert" className="text-xs text-red-600">{errors.phone}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-subject">Subject *</Label>
          <Input id="contact-subject" value={values.subject} onChange={(e) => set("subject", e.target.value)} maxLength={200} />
          {errors.subject !== undefined ? <p role="alert" className="text-xs text-red-600">{errors.subject}</p> : null}
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="contact-message">Message *</Label>
          <span className={cn("text-xs", messageLength > MAX_MESSAGE ? "text-red-600" : "text-muted-foreground")} aria-live="polite">
            {messageLength}/{MAX_MESSAGE}
          </span>
        </div>
        <textarea
          id="contact-message"
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          rows={6}
          maxLength={MAX_MESSAGE}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        {errors.message !== undefined ? <p role="alert" className="text-xs text-red-600">{errors.message}</p> : null}
      </div>
      {/* Honeypot — hidden from humans, catches bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" type="text" value={values.website} onChange={(e) => set("website", e.target.value)} tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex items-start gap-2">
        <input
          id="contact-consent"
          type="checkbox"
          checked={values.consent === true}
          onChange={(e) => set("consent", e.target.checked as unknown as true)}
          className="mt-1 h-4 w-4 rounded border-zinc-300"
        />
        <Label htmlFor="contact-consent" className="text-xs font-normal">
          I agree to the processing of my details to handle this enquiry, as described in the{" "}
          <a href="/privacy" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            privacy policy
          </a>
          . *
        </Label>
      </div>
      {errors.consent !== undefined ? <p role="alert" className="text-xs text-red-600">{errors.consent}</p> : null}
      {status === "failed" ? (
        <p role="alert" className="text-sm text-red-600">
          Something went wrong. Please try again or email {SUPPORT_EMAIL}.
        </p>
      ) : null}
      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

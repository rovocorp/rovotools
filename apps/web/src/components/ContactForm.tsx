"use client";

import { useState } from "react";
import { z } from "zod";
import { SUPPORT_EMAIL } from "@rovotools/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().email("Enter a valid email address."),
  subject: z.string().trim().min(3, "Enter a subject."),
  message: z.string().trim().min(10, "Message must be at least 10 characters."),
});

type ContactInput = z.infer<typeof contactSchema>;

export default function ContactForm(): React.ReactElement {
  const [values, setValues] = useState<ContactInput>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactInput, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  function set<K extends keyof ContactInput>(key: K, value: string): void {
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
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
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

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name">Name</Label>
          <Input id="contact-name" value={values.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
          {errors.name !== undefined ? <p role="alert" className="text-xs text-red-600">{errors.name}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
          {errors.email !== undefined ? <p role="alert" className="text-xs text-red-600">{errors.email}</p> : null}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input id="contact-subject" value={values.subject} onChange={(e) => set("subject", e.target.value)} />
        {errors.subject !== undefined ? <p role="alert" className="text-xs text-red-600">{errors.subject}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <textarea
          id="contact-message"
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        {errors.message !== undefined ? <p role="alert" className="text-xs text-red-600">{errors.message}</p> : null}
      </div>
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

"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";

type TrustSignal = {
  value: string;
  label: string;
};

const trustSignals: TrustSignal[] = [
  {
    value: "2m",
    label: "Tasks organized",
  },
  {
    value: "98%",
    label: "On-time focus",
  },
  {
    value: "24/7",
    label: "Planning clarity",
  },
];

export function CreateAccountPanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setStatusMessage("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setStatusMessage("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 700));
      setStatusMessage(`Account created for ${name}.`);
      setPassword("");
      setConfirmPassword("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
  <div className="grid gap-6 lg:items-stretch" aria-label="Create account">

        <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card p-6 shadow-2xl shadow-chart-4/10 sm:p-8 lg:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-chart-1 via-chart-3 to-chart-5" />
          <div className="mx-auto flex h-full max-w-md flex-col justify-center">
            <div>
              <p className="text-sm font-medium text-chart-4">Get started</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Create your Lazylet account
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This form is frontend-only for now and ready for your backend
                signup flow.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground"
                >
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Juan Dela Cruz"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-foreground"
                >
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl bg-chart-4 text-base font-bold tracking-tight text-zinc-950 shadow-lg shadow-chart-4/20 hover:bg-chart-4/90 sm:text-lg"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>

              {statusMessage ? (
                <p className="text-sm text-muted-foreground">{statusMessage}</p>
              ) : null}
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}

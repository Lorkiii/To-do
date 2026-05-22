"use client";

import Link from "next/link";
import { SubmitEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/layout/auth-shell";

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 text-foreground"
      viewBox="0 0 24 24">
      <path
        d="M12.24 10.29v3.45h5.7c-.23 1.46-.86 2.54-1.84 3.28-1.16.88-2.64 1.38-4.39 1.38-3.37 0-6.11-2.72-6.11-6.08s2.74-6.08 6.11-6.08c1.82 0 3.15.72 4.12 1.63l2.43-2.43C16.76 4.04 14.69 3 11.71 3 6.45 3 2.24 7.21 2.24 12.32s4.21 9.32 9.47 9.32c2.78 0 5.05-.91 6.74-2.61 1.74-1.74 2.31-4.18 2.31-6.15 0-.61-.05-1.17-.15-1.67l-8.37-.92z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LoginPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");

    if (!email.trim() || !password.trim()) {
      setStatusMessage("Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 700));
      setStatusMessage(
        `Signed in as ${email}${remember ? " (remembered)" : ""}.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="grid gap-6 lg:items-stretch" aria-label="Login">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card p-6 shadow-2xl shadow-chart-4/10 sm:p-8 lg:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-chart-1 via-chart-3 to-chart-5" />
          <div className="mx-auto flex h-full max-w-md flex-col justify-center">
            <div>
              <p className="text-sm font-medium text-chart-4">Welcome back</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Log in to Lazylet
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                No backend is connected yet, so this screen is ready for your
                future auth flow.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 w-full justify-center gap-3 rounded-xl">
                <GoogleIcon />
                Continue with Google
              </Button>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or continue with email
                <span className="h-px flex-1 bg-border" />
              </div>
            </div>

            {/* Frontend-only form for now; wire these controls to auth when the backend is ready. */}
            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground">
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
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="remember"
                  className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="size-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                  Remember me
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="h-12 w-full rounded-xl bg-chart-4 text-base font-bold tracking-tight text-zinc-950 shadow-lg shadow-chart-4/20 hover:bg-chart-4/90 sm:text-lg">
                {isSubmitting ? "Logging in..." : "Log in"}
              </Button>

              {statusMessage ? (
                <p className="text-sm text-muted-foreground">{statusMessage}</p>
              ) : null}
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              New to Lazylet?{" "}
              <Link
                href="/create-account"
                className="font-medium text-foreground underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}

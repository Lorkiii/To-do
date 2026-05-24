"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";

const signupHighlights = [
  "Create task lists fast",
  "Track project progress",
  "Plan deadlines clearly",
];

export function CreateAccountPanel() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");
    setIsSuccess(false);

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      setStatusMessage("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setStatusMessage("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          email,
          password,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatusMessage(result.error ?? "Unable to create account.");
        return;
      }

      setIsSuccess(true);
      setStatusMessage(`Account created for ${firstName} ${lastName}.`);
      setFirstName("");
      setLastName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setStatusMessage("Unable to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative isolate min-h-screen overflow-hidden">
        <div className="app-surface-gradient absolute inset-0 -z-10" />
        <div className="app-grid-overlay absolute inset-0 -z-10 opacity-35" />

        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/40 px-4 py-3 backdrop-blur md:px-5">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
              aria-label="Lazylet home">
              <span className="flex size-10 items-center justify-center rounded-2xl border border-border bg-muted text-lg font-bold text-foreground">
                L
              </span>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Lazylet
              </span>
            </Link>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-10 rounded-xl border-border bg-card/40 px-4 text-foreground hover:bg-muted">
              <Link href="/">Back home</Link>
            </Button>
          </header>

          <div className="grid flex-1 items-center gap-8 py-12 lg:grid-cols-[0.9fr_0.75fr] lg:py-16">
            <div className="max-w-2xl">
              <p className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-accent">
                Create workspace
              </p>
              <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Start with a cleaner way to plan your work.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Set up Lazylet and keep tasks, projects, and dates in one dark,
                focused workspace from day one.
              </p>

              <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                {signupHighlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="rounded-2xl border border-border bg-card/40 px-4 py-3">
                    {highlight}
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[2rem] border border-border bg-card/70 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-accent">
                      Starter setup
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Create your profile, add priorities, and plan your first
                      project.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card/40 px-4 py-3 text-right">
                    <p className="text-2xl font-semibold text-foreground">3</p>
                    <p className="text-xs text-muted-foreground">steps</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-2 text-sm text-muted-foreground">
                  <div className="rounded-xl bg-muted px-3 py-2">
                    Profile details
                  </div>
                  <div className="rounded-xl bg-muted px-3 py-2">
                    First task list
                  </div>
                  <div className="rounded-xl bg-muted px-3 py-2">
                    Project deadline
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-[2rem] border border-border bg-card/70 p-3 shadow-2xl backdrop-blur-xl"
              aria-label="Create account">
              <div className="rounded-[1.5rem] border border-border bg-background/80 p-6 sm:p-8">
                <div>
                  <p className="text-sm font-medium text-accent">
                    Account setup
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                    Create your Lazylet account
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    This form is frontend-only for now and ready for your
                    backend signup flow.
                  </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                  {/* name input */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-foreground">
                        First name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Juan Dela Cruz"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        className="h-12 w-full rounded-xl border border-input bg-card/40 px-4 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-foreground">
                        Last name
                      </label>
                      <input
                        id="last-name"
                        name="last-name"
                        type="text"
                        autoComplete="last-name"
                        placeholder="Dela Cruz"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        className="h-12 w-full rounded-xl border border-input bg-card/40 px-4 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="username"
                      className="text-sm font-medium text-foreground">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      placeholder="juan2026"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="h-12 w-full rounded-xl border border-input bg-card/40 px-4 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
                    />
                  </div>

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
                      className="h-12 w-full rounded-xl border border-input bg-card/40 px-4 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-foreground">
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
                      className="h-12 w-full rounded-xl border border-input bg-card/40 px-4 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirm-password"
                      className="text-sm font-medium text-foreground">
                      Confirm password
                    </label>
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      className="h-12 w-full rounded-xl border border-input bg-card/40 px-4 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl bg-primary text-base font-bold tracking-tight text-primary-foreground hover:bg-primary/90 sm:text-lg">
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </Button>

                  {statusMessage ? (
                    <p
                      className={`text-sm ${
                        isSuccess ? "text-accent" : "text-muted-foreground"
                      }`}>
                      {statusMessage}
                    </p>
                  ) : null}
                </form>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-foreground underline-offset-4 transition hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

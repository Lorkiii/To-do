"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  loginFieldSchemas,
  loginSchema,
  validateField,
} from "@/prisma/validation/schemaValidation";
import { CheckBtn } from "../checkModal";

const loginHighlights = [
  "Daily focus planning",
  "Project-aware tasks",
  "Deadline reminders",
];

type LoginFieldErrors = {
  emailOrUsername: string;
  password: string;
};

const emptyLoginFieldErrors: LoginFieldErrors = {
  emailOrUsername: "",
  password: "",
};

function getInputClassName(error: string) {
  return `h-12 w-full rounded-xl border border-input bg-card/40 px-4 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25 ${
    error
      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20"
      : ""
  }`;
}

//Google Icon
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

// login panel
export function LoginPanel() {
  // router is used to redirect the user to the dashboard page
  const router = useRouter();
  // emailOrUsername is used to store the email or username of the user
  // password is used to store the password of the user
  // fieldErrors is used to store the errors of the form
  // remember is used to store the remember me checkbox
  // isSubmitting is used to store the submitting state of the form
  // statusMessage is used to store the status message of the form
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState(emptyLoginFieldErrors);
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  function validateLoginForm() {
    const result = loginSchema.safeParse({ emailOrUsername, password });
    const nextErrors = { ...emptyLoginFieldErrors };

    if (!result.success) {
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as keyof LoginFieldErrors | undefined;

        if (fieldName && fieldName in nextErrors) {
          nextErrors[fieldName] ||= issue.message;
        }
      }
    }

    return nextErrors;
  }

  function handleEmailOrUsernameChange(value: string) {
    setEmailOrUsername(value);
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      emailOrUsername: validateField(loginFieldSchemas.emailOrUsername, value),
    }));
    setStatusMessage("");
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      password: validateField(loginFieldSchemas.password, value),
    }));
    setStatusMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");

    const nextFieldErrors = validateLoginForm();
    setFieldErrors(nextFieldErrors);

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setStatusMessage("Please fix the highlighted fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await signIn("credentials", {
        emailOrUsername,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setStatusMessage(result.error);
        return;
      }
      if (result?.ok) {
        router.replace("/dashboard");
        router.refresh();
      }
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
                Welcome back
              </p>
              <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Step back into your focused workspace.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Pick up your tasks, priorities, and deadlines with the same
                clean dark workspace from the landing page.
              </p>

              <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                {loginHighlights.map((highlight) => (
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
                      Today&apos;s overview
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      5 tasks complete, 3 priorities ready for review.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card/40 px-4 py-3 text-right">
                    <p className="text-2xl font-semibold text-foreground">
                      72%
                    </p>
                    <p className="text-xs text-muted-foreground">progress</p>
                  </div>
                </div>
                <div className="mt-5 overflow-hidden rounded-full bg-muted">
                  <div className="h-2 w-[72%] rounded-full bg-accent" />
                </div>
              </div>
            </div>

            <div
              className="rounded-[2rem] border border-border bg-card/70 p-3 shadow-2xl backdrop-blur-xl"
              aria-label="Login">
              <div className="rounded-[1.5rem] border border-border bg-background/80 p-6 sm:p-8">
                <div>
                  <p className="text-sm font-medium text-accent">
                    Account login
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                    Log in to Lazylet
                  </h2>
                </div>

                <div className="mt-8 space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-12 w-full justify-center gap-3 rounded-xl border-border bg-card/40 text-foreground hover:bg-muted">
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
                      htmlFor="emailOrUsername"
                      className="text-sm font-medium text-foreground">
                      Email or Username
                    </label>
                    <input
                      id="emailOrUsername"
                      name="emailOrUsername"
                      type="text"
                      autoComplete="username"
                      placeholder="Enter your email or username"
                      value={emailOrUsername}
                      onChange={(event) =>
                        handleEmailOrUsernameChange(event.target.value)
                      }
                      {...(fieldErrors.emailOrUsername
                        ? { "aria-invalid": "true" as const }
                        : {})}
                      aria-describedby={
                        fieldErrors.emailOrUsername
                          ? "email-or-username-error"
                          : undefined
                      }
                      className={getInputClassName(fieldErrors.emailOrUsername)}
                    />
                    {fieldErrors.emailOrUsername ? (
                      <p
                        id="email-or-username-error"
                        className="text-xs font-medium text-red-500">
                        {fieldErrors.emailOrUsername}
                      </p>
                    ) : null}
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
                        className="text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25">
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
                      onChange={(event) =>
                        handlePasswordChange(event.target.value)
                      }
                      {...(fieldErrors.password
                        ? { "aria-invalid": "true" as const }
                        : {})}
                      aria-describedby={
                        fieldErrors.password
                          ? "login-password-error"
                          : undefined
                      }
                      className={getInputClassName(fieldErrors.password)}
                    />
                    {fieldErrors.password ? (
                      <p
                        id="login-password-error"
                        className="text-xs font-medium text-red-500">
                        {fieldErrors.password}
                      </p>
                    ) : null}
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
                        className="size-4 rounded border-input bg-card/40 accent-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
                      />
                      Remember me
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="h-12 w-full rounded-xl bg-primary text-base font-bold tracking-tight text-primary-foreground hover:bg-primary/90 sm:text-lg">
                    {isSubmitting ? "Logging in..." : "Log in"}
                  </Button>
                  <CheckBtn />

                  {statusMessage ? (
                    <p className="text-sm text-muted-foreground text-center text-red-500 fade-in-out">
                      {statusMessage}
                    </p>
                  ) : null}
                </form>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                  New to Lazylet?{" "}
                  <Link
                    href="/create-account"
                    className="font-medium text-foreground underline-offset-4 transition hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25">
                    Create account
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

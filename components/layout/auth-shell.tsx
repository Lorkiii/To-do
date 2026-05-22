import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative isolate flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-muted via-background to-secondary" />
        <div className="absolute left-1/2 top-10 -z-10 size-64 -translate-x-1/2 rounded-full bg-chart-4/20 blur-3xl sm:size-96" />
        <div className="w-full max-w-6xl flex justify-center items-center w-full">{children}</div>
      </section>
    </main>
  );
}

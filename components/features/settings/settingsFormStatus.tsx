import { cn } from "@/lib/utils";

export function SettingsFormStatus({
  message,
  tone = "error",
}: {
  message: string;
  tone?: "error" | "success";
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        tone === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      )}>
      {message}
    </p>
  );
}

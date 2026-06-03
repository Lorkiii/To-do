type TaskEmptyStateProps = {
  message: string;
  description?: string;
};

export default function TaskEmptyState({ message, description }: TaskEmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background/55 p-8 text-center">
      <h2 className="font-semibold text-foreground">{message}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {description || "No tasks found"}
      </p>
    </div>
  );
}

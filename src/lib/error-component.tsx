import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

const FALLBACK_MESSAGE = "حدث خطأ غير متوقع. أعد تحميل الصفحة.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-ink px-6 text-center text-cream">
      <span className="text-rb-red" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="font-display text-lg font-semibold">تعذر فتح الاستوديو</h1>
      <p className="max-w-md text-sm break-words text-cream/60">{errorMessage(error)}</p>
    </main>
  );
}

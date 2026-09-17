import { forwardRef } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/studio/store";

type Props = {
  onToggle: () => void;
};

export const PowerOrb = forwardRef<HTMLButtonElement, Props>(function PowerOrb(
  { onToggle },
  ref,
) {
  const status = useStudioStore((s) => s.status);
  const live = status === "live";
  const buffering = status === "buffering";

  return (
    <div className="relative z-20 flex flex-col items-center">
      <div className="orb-ring relative flex items-center justify-center">
        <span className="orb-notch" aria-hidden />
        <button
          ref={ref}
          type="button"
          onClick={onToggle}
          aria-label={live ? "إيقاف البث" : "تشغيل البث"}
          className={cn(
            "orb-core relative size-[86%] overflow-hidden rounded-full",
            "transition-transform duration-150 ease-out",
            "active:scale-[0.96] focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-cream/80 focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
            live && "is-live",
            buffering && "is-buffering",
          )}
        >
          <img
            src="/studio/logo.jpg"
            alt=""
            className="absolute inset-0 size-full scale-110 object-cover"
            draggable={false}
          />
          <span className="orb-sheen" aria-hidden />
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "bg-ink/45 transition-opacity duration-200",
              live ? "opacity-0" : "opacity-100",
            )}
          >
            {buffering ? (
              <span className="orb-spinner" />
            ) : (
              <Play
                className="size-14 text-cream drop-shadow-md ltr:ml-1 rtl:mr-1 sm:size-16"
                fill="currentColor"
                strokeWidth={1.25}
              />
            )}
          </span>
          {live && (
            <span className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center sm:bottom-4">
              <Pause className="size-5 text-cream/80" fill="currentColor" strokeWidth={1} />
            </span>
          )}
        </button>
      </div>
    </div>
  );
});

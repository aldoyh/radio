import { useCallback, useEffect, useRef } from "react";
import { stationById } from "./stations";
import { useStudioStore } from "./store";

type HlsInstance = import("hls.js").default;
type HlsCtor = typeof import("hls.js").default;

const graph: {
  ctx: AudioContext | null;
  analyser: AnalyserNode | null;
  source: MediaElementAudioSourceNode | null;
  bound: HTMLAudioElement | null;
} = {
  ctx: null,
  analyser: null,
  source: null,
  bound: null,
};

export function useRadioEngine(audio: HTMLAudioElement | null) {
  const hlsRef = useRef<HlsInstance | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(graph.analyser);
  const loadedUrl = useRef<string | null>(null);
  const wantPlay = useRef(false);

  const stationId = useStudioStore((s) => s.stationId);
  const volume = useStudioStore((s) => s.volume);
  const muted = useStudioStore((s) => s.muted);
  const status = useStudioStore((s) => s.status);
  const setStatus = useStudioStore((s) => s.setStatus);
  const streamUrl = stationById(stationId).url;

  const ensureGraph = useCallback(async () => {
    if (!audio) return null;
    const AC =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;

    if (!graph.ctx) {
      graph.ctx = new AC();
    }
    if (graph.ctx.state === "suspended") {
      await graph.ctx.resume();
    }
    if (!graph.analyser) {
      const analyser = graph.ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.52;
      graph.analyser = analyser;
    }
    if (!graph.source || graph.bound !== audio) {
      try {
        graph.source = graph.ctx.createMediaElementSource(audio);
        graph.source.connect(graph.analyser);
        graph.analyser.connect(graph.ctx.destination);
        graph.bound = audio;
      } catch {
        // Element already connected (Strict Mode remount) — reuse it.
      }
    }
    analyserRef.current = graph.analyser;
    return graph.analyser;
  }, [audio]);

  const loadStream = useCallback(
    async (url: string) => {
      if (!audio) return;
      const Hls: HlsCtor = (await import("hls.js")).default;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      audio.removeAttribute("src");
      audio.load();
      loadedUrl.current = url;

      if (Hls.isSupported()) {
        const hls = new Hls({
          lowLatencyMode: true,
          enableWorker: true,
          xhrSetup(xhr) {
            xhr.withCredentials = false;
          },
        });
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (!data.fatal) return;
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          setStatus("error", "تعذر تشغيل البث. حاول مرة أخرى.");
        });
        hls.loadSource(url);
        hls.attachMedia(audio);
        hlsRef.current = hls;
      } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
        audio.src = url;
      } else {
        setStatus("error", "المتصفح لا يدعم بث الراديو.");
      }
    },
    [audio, setStatus],
  );

  useEffect(() => {
    if (!audio) return;

    const onPlaying = () => setStatus("live");
    const onWaiting = () => {
      if (wantPlay.current) setStatus("buffering");
    };
    const onPause = () => {
      if (wantPlay.current) return;
      setStatus("paused");
    };
    const onError = () => {
      if (wantPlay.current) setStatus("error", "تعذر تشغيل البث.");
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
    };
  }, [audio, setStatus]);

  useEffect(() => {
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [audio, volume, muted]);

  useEffect(() => {
    if (!audio || !wantPlay.current) return;
    if (loadedUrl.current === streamUrl) return;
    setStatus("buffering");
    void (async () => {
      await loadStream(streamUrl);
      try {
        await audio.play();
      } catch {
        setStatus("error", "اضغط التشغيل مرة أخرى.");
      }
    })();
  }, [audio, streamUrl, loadStream, setStatus]);

  useEffect(() => {
    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      loadedUrl.current = null;
    };
  }, []);

  const play = useCallback(async () => {
    if (!audio) return;
    wantPlay.current = true;
    setStatus("buffering");
    await ensureGraph();
    if (loadedUrl.current !== streamUrl) {
      await loadStream(streamUrl);
    }
    try {
      await audio.play();
      setStatus("live");
    } catch {
      wantPlay.current = false;
      setStatus("error", "اضغط التشغيل مرة أخرى.");
    }
  }, [audio, ensureGraph, loadStream, streamUrl, setStatus]);

  const pause = useCallback(() => {
    wantPlay.current = false;
    audio?.pause();
    setStatus("paused");
  }, [audio, setStatus]);

  const toggle = useCallback(() => {
    if (status === "live" || status === "buffering") pause();
    else void play();
  }, [status, play, pause]);

  return { toggle, play, pause, analyserRef };
}

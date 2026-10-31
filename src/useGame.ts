import { useCallback, useEffect, useRef, useState } from "react";
import { createGame, offlineProgress, restoreGame, stepCombat } from "./game";
import type { Game } from "./game";
const SAVE_KEY = "infinity-flow-save-v1";
const LEGACY_SAVE_KEY = "infinity-flow-salvo-v1";
export type OfflineReport = ReturnType<typeof offlineProgress>;
function load() {
  try {
    return restoreGame(
      localStorage.getItem(SAVE_KEY) ?? localStorage.getItem(LEGACY_SAVE_KEY),
    );
  } catch {
    return createGame();
  }
}
export function useGame() {
  const initial = useRef<OfflineReport | null>(null);
  const [game, setGame] = useState<Game>(() => {
    const report = offlineProgress(load());
    if (report.seconds >= 30 && report.game.started) initial.current = report;
    return report.game;
  });
  const [report, setReport] = useState(initial.current);
  const [saveError, setSaveError] = useState(false);
  const ref = useRef(game);
  ref.current = game;
  const save = useCallback((g: Game) => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(g));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, []);
  useEffect(() => {
    save(game);
  }, [game, save]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return;
      setGame((g) => ({ ...stepCombat(g), lastSaved: Date.now() }));
    }, 1000);
    const resume = () => {
      const result = offlineProgress(ref.current);
      ref.current = result.game;
      setGame(result.game);
      if (result.seconds >= 30 && result.game.started) setReport(result);
    };
    const visibility = () => {
      if (document.hidden) {
        const g = { ...ref.current, lastSaved: Date.now() };
        ref.current = g;
        save(g);
        setGame(g);
      } else resume();
    };
    const unload = () => {
      const g = {
        ...ref.current,
        lastSaved: document.hidden ? ref.current.lastSaved : Date.now(),
      };
      ref.current = g;
      save(g);
    };
    const pageshow = (event: PageTransitionEvent) => {
      if (event.persisted && !document.hidden) resume();
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", unload);
    window.addEventListener("pageshow", pageshow);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", unload);
      window.removeEventListener("pageshow", pageshow);
    };
  }, [save]);
  return {
    game,
    setGame,
    report,
    closeReport: () => setReport(null),
    saveError,
  };
}

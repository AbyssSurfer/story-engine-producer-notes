"use client";

import { useEffect, useMemo, useState } from "react";

type SceneSetupType = "Actuality / OTF" | "MIV";
type CaptureMode = "Actuality" | "OTF" | "MIV";
type ViewMode = "log" | "create" | "active" | "review";

type Note = {
  id: number;
  text: string;
  createdAt: string;
  isGold: boolean;
  captureMode: CaptureMode;
};

type Scene = {
  id: number;
  sceneName: string;
  location: string;
  participants: string;
  sceneSetupType: SceneSetupType;
  startedAt: string;
  endedAt: string | null;
  notes: Note[];
};

const HOT_KEYS = ["Funny", "Awkward", "Angry", "Laughs", "Cries", "Flirty"];
const STORAGE_KEY = "story-engine-scenes";

const getModeLabel = (mode: CaptureMode) => {
  if (mode === "Actuality") return "ACT";
  if (mode === "OTF") return "OTF";
  return "MIV";
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("log");
  const [now, setNow] = useState(new Date());

  const [sceneName, setSceneName] = useState("");
  const [location, setLocation] = useState("");
  const [participants, setParticipants] = useState("");
  const [sceneSetupType, setSceneSetupType] =
    useState<SceneSetupType>("Actuality / OTF");

  const [captureMode, setCaptureMode] = useState<CaptureMode>("Actuality");
  const [noteText, setNoteText] = useState("");

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<number | null>(null);
  const [reviewSceneId, setReviewSceneId] = useState<number | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Scene[];
        setScenes(parsed);
      } catch {
        console.warn("Could not parse saved scenes");
      }
    }
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes));
  }, [scenes, hasLoaded]);

  const activeScene = useMemo(
    () => scenes.find((scene) => scene.id === activeSceneId) ?? null,
    [scenes, activeSceneId]
  );

  const reviewScene = useMemo(
    () => scenes.find((scene) => scene.id === reviewSceneId) ?? null,
    [scenes, reviewSceneId]
  );

  const sortedScenes = [...scenes].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  const activeSceneLatestNotes = activeScene
    ? [...activeScene.notes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 3)
    : [];

  const reviewSceneNotes = reviewScene
    ? [...reviewScene.notes].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    : [];

  const resetCreateForm = () => {
    setSceneName("");
    setLocation("");
    setParticipants("");
    setSceneSetupType("Actuality / OTF");
  };

  const createScene = () => {
    const newScene: Scene = {
      id: Date.now(),
      sceneName: sceneName.trim() || "Untitled Scene",
      location: location.trim() || "Unknown location",
      participants: participants.trim(),
      sceneSetupType,
      startedAt: new Date().toISOString(),
      endedAt: null,
      notes: [],
    };

    setScenes((prev) => [newScene, ...prev]);
    setActiveSceneId(newScene.id);
    setCaptureMode(sceneSetupType === "MIV" ? "MIV" : "Actuality");
    setNoteText("");
    resetCreateForm();
    setViewMode("active");
  };

  const addNoteToActiveScene = (text: string, isGold = false) => {
    if (!activeSceneId) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    const newNote: Note = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      text: trimmed,
      createdAt: new Date().toISOString(),
      isGold,
      captureMode,
    };

    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === activeSceneId
          ? { ...scene, notes: [...scene.notes, newNote] }
          : scene
      )
    );
  };

  const handleTypedNote = () => {
    if (!noteText.trim()) return;
    addNoteToActiveScene(noteText);
    setNoteText("");
  };

  const handleHotKey = (label: string) => {
    addNoteToActiveScene(`[${label}]`);
  };

  const toggleGold = (sceneId: number, noteId: number) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id !== sceneId
          ? scene
          : {
            ...scene,
            notes: scene.notes.map((note) =>
              note.id === noteId ? { ...note, isGold: !note.isGold } : note
            ),
          }
      )
    );
  };

  const endActiveScene = () => {
    if (!activeSceneId) return;

    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === activeSceneId
          ? { ...scene, endedAt: new Date().toISOString() }
          : scene
      )
    );

    setActiveSceneId(null);
    setNoteText("");
    setCaptureMode("Actuality");
    setViewMode("log");
  };

  if (!hasLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-white">
        <p className="text-sm text-zinc-400">Loading…</p>
      </main>
    );
  }

  if (viewMode === "create") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
          <div className="mb-6">
            <p className="text-xs text-zinc-500">
              {now.toLocaleDateString()} - {now.toLocaleTimeString()}
            </p>

            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-zinc-400">
              Story Engine
            </p>

            <h1 className="mt-2 text-3xl font-semibold">New Scene</h1>

            <p className="mt-2 text-sm text-zinc-400">
              Create a scene container and begin capturing producer notes.
            </p>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              createScene();
            }}
          >
            <div>
              <label className="mb-1 block text-sm text-zinc-300">
                Scene Name
              </label>
              <input
                type="text"
                placeholder="Jess has coffee with Paul"
                value={sceneName}
                onChange={(e) => setSceneName(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-300">
                Location
              </label>
              <input
                type="text"
                placeholder="Kitchen"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-300">
                Participants
              </label>
              <input
                type="text"
                placeholder="Paul, Jess, Sam"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Scene Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSceneSetupType("Actuality / OTF")}
                  className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${sceneSetupType === "Actuality / OTF"
                    ? "border-white bg-white text-black"
                    : "border-zinc-700 bg-zinc-950 text-white"
                    }`}
                >
                  Actuality / OTF
                </button>
                <button
                  type="button"
                  onClick={() => setSceneSetupType("MIV")}
                  className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${sceneSetupType === "MIV"
                    ? "border-white bg-white text-black"
                    : "border-zinc-700 bg-zinc-950 text-white"
                    }`}
                >
                  Master Interview
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetCreateForm();
                  setViewMode("log");
                }}
                className="w-1/3 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:border-zinc-500 hover:bg-zinc-900"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-2/3 rounded-lg bg-white px-4 py-3 font-medium text-black transition hover:bg-zinc-200"
              >
                Start Scene
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  if (viewMode === "active" && activeScene) {
    const isMivScene = activeScene.sceneSetupType === "MIV";

    return (
      <main className="min-h-screen bg-zinc-950 p-3 text-white">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-xl">
            <p className="text-[11px] text-zinc-500">
              {now.toLocaleDateString()} - {now.toLocaleTimeString()}
            </p>

            <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-zinc-400">
              Active Scene
            </p>

            <h1 className="mt-2 text-2xl font-semibold leading-tight">
              {activeScene.sceneName}
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {activeScene.location}
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Started {formatTime(activeScene.startedAt)}
            </p>

            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              {isMivScene ? (
                <>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                    Mode
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    Master Interview
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    All notes in this scene are tagged as MIV.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                    Mode
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCaptureMode("Actuality")}
                      className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${captureMode === "Actuality"
                        ? "border-white bg-white text-black"
                        : "border-zinc-700 bg-zinc-900 text-white"
                        }`}
                    >
                      Actuality
                    </button>
                    <button
                      type="button"
                      onClick={() => setCaptureMode("OTF")}
                      className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${captureMode === "OTF"
                        ? "border-white bg-white text-black"
                        : "border-zinc-700 bg-zinc-900 text-white"
                        }`}
                    >
                      OTF
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm text-zinc-300">
                Add Producer Note
              </label>

              <input
                type="text"
                placeholder="Type note and press Enter..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleTypedNote();
                  }
                }}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none focus:border-zinc-500"
              />
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                Quick Tags
              </p>

              <div className="grid grid-cols-2 gap-2">
                {HOT_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleHotKey(key)}
                    className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white transition hover:border-zinc-500 hover:bg-zinc-900"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                  Latest Notes
                </h2>
                <p className="text-[11px] text-zinc-500">Showing last 3</p>
              </div>

              <div className="mt-3 space-y-3">
                {activeSceneLatestNotes.length === 0 ? (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
                    No notes yet.
                  </div>
                ) : (
                  activeSceneLatestNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-950 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 text-[11px] text-zinc-500">
                            <span>{formatTime(note.createdAt)}</span>
                            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                              {getModeLabel(note.captureMode)}
                            </span>
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-white">
                            {note.text}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleGold(activeScene.id, note.id)}
                          className={`shrink-0 rounded-md border px-2 py-1 text-xs font-medium transition ${note.isGold
                            ? "border-amber-400 bg-amber-300 text-black"
                            : "border-zinc-700 bg-zinc-900 text-zinc-300"
                            }`}
                          title="Toggle standout moment"
                        >
                          ★
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const confirmEnd = confirm("End this scene and return to Scene Log?");
                if (!confirmEnd) return;
                endActiveScene();
              }}
              className="mt-6 w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-500"
            >
              End Scene
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (viewMode === "review" && reviewScene) {
    return (
      <main className="min-h-screen bg-zinc-950 p-3 text-white">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-xl">
            <p className="text-[11px] text-zinc-500">
              {now.toLocaleDateString()} - {now.toLocaleTimeString()}
            </p>

            <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-zinc-400">
              Review Scene
            </p>

            <h1 className="mt-2 text-2xl font-semibold leading-tight">
              {reviewScene.sceneName}
            </h1>

            <p className="mt-2 text-sm text-zinc-400">{reviewScene.location}</p>

            <p className="mt-1 text-sm text-zinc-500">
              {formatDate(reviewScene.startedAt)} · {formatTime(reviewScene.startedAt)}
              {" - "}
              {reviewScene.endedAt ? formatTime(reviewScene.endedAt) : "Open"}
            </p>

            <div className="mt-5">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                Scene Notes
              </h2>

              <div className="mt-3 space-y-3">
                {reviewSceneNotes.length === 0 ? (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
                    No notes recorded.
                  </div>
                ) : (
                  reviewSceneNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-950 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 text-[11px] text-zinc-500">
                            <span>{formatTime(note.createdAt)}</span>
                            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                              {getModeLabel(note.captureMode)}
                            </span>
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-white">
                            {note.text}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleGold(reviewScene.id, note.id)}
                          className={`shrink-0 rounded-md border px-2 py-1 text-xs font-medium transition ${note.isGold
                            ? "border-amber-400 bg-amber-300 text-black"
                            : "border-zinc-700 bg-zinc-900 text-zinc-300"
                            }`}
                          title="Toggle standout moment"
                        >
                          ★
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setReviewSceneId(null);
                setViewMode("log");
              }}
              className="mt-6 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:border-zinc-500 hover:bg-zinc-900"
            >
              Back to Scene Log
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-white">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-xl">
          <p className="text-xs text-zinc-500">
            {now.toLocaleDateString()} - {now.toLocaleTimeString()}
          </p>

          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-zinc-400">
            Story Engine
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold">Scene Log</h1>
            <button
              type="button"
              onClick={() => setViewMode("create")}
              className="rounded-lg bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              New Scene
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {sortedScenes.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-500">
                No scenes captured yet.
              </div>
            ) : (
              sortedScenes.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => {
                    setReviewSceneId(scene.id);
                    setViewMode("review");
                  }}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-left transition hover:border-zinc-600 hover:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-base font-medium text-white">
                        {scene.sceneName}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">{scene.location}</p>
                      <p className="mt-2 text-sm text-zinc-500">
                        {formatDate(scene.startedAt)} · {formatTime(scene.startedAt)}
                        {" - "}
                        {scene.endedAt ? formatTime(scene.endedAt) : "Open"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded bg-zinc-800 px-2 py-1 text-[10px] uppercase tracking-wide text-zinc-300">
                      {scene.sceneSetupType === "MIV" ? "MIV" : "ACT/OTF"}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
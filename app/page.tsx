"use client";

import { useEffect, useState } from "react";

type SceneSetupType = "Actuality / OTF" | "MIV";
type CaptureMode = "Actuality" | "OTF" | "MIV";

type Scene = {
  sceneName: string;
  location: string;
  participants: string;
  sceneSetupType: SceneSetupType;
  startedAt: Date;
};

type Note = {
  id: number;
  text: string;
  createdAt: Date;
  isGold: boolean;
  captureMode: CaptureMode;
};

const HOT_KEYS = ["Funny", "Awkward", "Angry", "Laughs", "Cries", "Flirty"];

const getModeLabel = (mode: CaptureMode) => {
  if (mode === "Actuality") return "ACT";
  if (mode === "OTF") return "OTF";
  return "MIV";
};

export default function Home() {
  const [sceneName, setSceneName] = useState("");
  const [location, setLocation] = useState("");
  const [participants, setParticipants] = useState("");
  const [sceneSetupType, setSceneSetupType] =
    useState<SceneSetupType>("Actuality / OTF");

  const [now, setNow] = useState(new Date());
  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [captureMode, setCaptureMode] = useState<CaptureMode>("Actuality");

  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addNote = (text: string, isGold = false) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newNote: Note = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      text: trimmed,
      createdAt: new Date(),
      isGold,
      captureMode,
    };

    setNotes((prev) => [newNote, ...prev]);
  };

  const handleAddTypedNote = () => {
    if (!noteText.trim()) return;
    addNote(noteText);
    setNoteText("");
  };

  const handleHotKey = (label: string) => {
    addNote(`[${label}]`);
  };

  const toggleGold = (id: number) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, isGold: !note.isGold } : note
      )
    );
  };

  const visibleNotes = notes.slice(0, 3);

  if (activeScene) {
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
              {activeScene.sceneName || "Untitled Scene"}
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {activeScene.location} · {activeScene.participants}
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Started {activeScene.startedAt.toLocaleTimeString()}
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
                      className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${
                        captureMode === "Actuality"
                          ? "border-white bg-white text-black"
                          : "border-zinc-700 bg-zinc-900 text-white"
                      }`}
                    >
                      Actuality
                    </button>
                    <button
                      type="button"
                      onClick={() => setCaptureMode("OTF")}
                      className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${
                        captureMode === "OTF"
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
                    handleAddTypedNote();
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
                {visibleNotes.length === 0 ? (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
                    No notes yet.
                  </div>
                ) : (
                  visibleNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-950 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 text-[11px] text-zinc-500">
                            <span>{note.createdAt.toLocaleTimeString()}</span>
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
                          onClick={() => toggleGold(note.id)}
                          className={`shrink-0 rounded-md border px-2 py-1 text-xs font-medium transition ${
                            note.isGold
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
                setActiveScene(null);
                setNoteText("");
                setNotes([]);
                setCaptureMode("Actuality");
              }}
              className="mt-6 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:border-zinc-500 hover:bg-zinc-900"
            >
              End Scene
            </button>
          </div>
        </div>
      </main>
    );
  }

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

          <h1 className="mt-2 text-3xl font-semibold">Start Scene</h1>

          <p className="mt-2 text-sm text-zinc-400">
            Create a scene container and begin capturing producer notes.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();

            const scene = {
              sceneName,
              location,
              participants,
              sceneSetupType,
              startedAt: new Date(),
            };

            setActiveScene(scene);
            setNotes([]);
            setNoteText("");
            setCaptureMode(sceneSetupType === "MIV" ? "MIV" : "Actuality");

            setSceneName("");
            setLocation("");
            setParticipants("");
            setSceneSetupType("Actuality / OTF");
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
            <label className="mb-1 block text-sm text-zinc-300">Location</label>
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
                className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${
                  sceneSetupType === "Actuality / OTF"
                    ? "border-white bg-white text-black"
                    : "border-zinc-700 bg-zinc-950 text-white"
                }`}
              >
                Actuality / OTF
              </button>
              <button
                type="button"
                onClick={() => setSceneSetupType("MIV")}
                className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${
                  sceneSetupType === "MIV"
                    ? "border-white bg-white text-black"
                    : "border-zinc-700 bg-zinc-950 text-white"
                }`}
              >
                Master Interview
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-white px-4 py-3 font-medium text-black transition hover:bg-zinc-200"
          >
            Start Scene
          </button>
        </form>
      </div>
    </main>
  );
}
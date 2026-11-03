"use client";

import type { Locale } from "@/lib/i18n/config";
import { academyLessonText } from "@/lib/academy/academyLessonText";
import { useEffect, useState } from "react";
import { Bookmark, NotebookPen, Pencil, Trash2, X } from "lucide-react";
import type { AcademyBookmark, AcademyLearnerNote } from "@/types/academy";
import { academyRequest, recordAcademyClientEvent } from "./academyClient";

type LessonToolsProps = {
  courseId: string;
  initialBookmarks: AcademyBookmark[];
  initialNotes: AcademyLearnerNote[];
  lessonId: string;
  locale?: Locale;
  moduleId: string;
  positionSeconds?: number | null;
};

function academyTimestamp(value?: string) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return (
    new Date(timestamp).toISOString().replace("T", " ").slice(0, 16) + " UTC"
  );
}

export function LessonTools({
  courseId,
  initialBookmarks,
  initialNotes,
  lessonId,
  locale = "en",
  moduleId,
  positionSeconds = null,
}: LessonToolsProps) {
  const tr = academyLessonText(locale);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [notes, setNotes] = useState(initialNotes);
  const [noteText, setNoteText] = useState("");
  const [label, setLabel] = useState("");
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(
    null,
  );
  const [editingBookmarkLabel, setEditingBookmarkLabel] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    kind: "error" | "status";
    message: string;
  } | null>(null);
  const lessonBookmarks = bookmarks.filter(
    (item) => item.lessonId === lessonId,
  );
  const lessonNotes = notes.filter((item) => item.lessonId === lessonId);
  const hasUnsavedText = Boolean(noteText || editingNoteId);

  useEffect(() => {
    if (!hasUnsavedText) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedText]);

  function showStatus(message: string) {
    setFeedback({ kind: "status", message });
  }

  function showError(error: unknown, fallback: string) {
    setFeedback({
      kind: "error",
      message: error instanceof Error ? error.message : fallback,
    });
  }

  async function addBookmark() {
    setFeedback(null);
    setPendingAction("bookmark:create");
    try {
      const bookmark = await academyRequest<AcademyBookmark>(
        "/api/academy/bookmarks",
        {
          body: JSON.stringify({
            courseId,
            label: label || null,
            lessonId,
            moduleId,
            positionSeconds,
          }),
          method: "POST",
        },
      );
      setBookmarks((current) => [bookmark, ...current]);
      setLabel("");
      showStatus(tr("Bookmark saved."));
      recordAcademyClientEvent({
        courseId,
        lessonId,
        moduleId,
        name: "academy_bookmark_created",
      });
    } catch (error) {
      showError(error, tr("Bookmark could not be saved."));
    } finally {
      setPendingAction(null);
    }
  }

  async function saveBookmark(id: string) {
    setPendingAction(`bookmark:update:${id}`);
    try {
      const bookmark = await academyRequest<AcademyBookmark>(
        `/api/academy/bookmarks/${id}`,
        {
          body: JSON.stringify({ label: editingBookmarkLabel }),
          method: "PATCH",
        },
      );
      setBookmarks((current) =>
        current.map((item) => (item.id === id ? bookmark : item)),
      );
      setEditingBookmarkId(null);
      showStatus(tr("Bookmark label updated."));
    } catch (error) {
      showError(error, tr("Bookmark could not be updated."));
    } finally {
      setPendingAction(null);
    }
  }

  async function removeBookmark(bookmark: AcademyBookmark) {
    if (
      !window.confirm(
        locale === "es"
          ? `¿Eliminar el marcador “${bookmark.label || tr("Lesson bookmark")}”?`
          : `Delete bookmark “${bookmark.label || tr("Lesson bookmark")}”?`,
      )
    )
      return;
    setPendingAction(`bookmark:delete:${bookmark.id}`);
    try {
      await academyRequest(`/api/academy/bookmarks/${bookmark.id}`, {
        method: "DELETE",
      });
      setBookmarks((current) =>
        current.filter((item) => item.id !== bookmark.id),
      );
      showStatus(tr("Bookmark removed."));
    } catch (error) {
      showError(error, tr("Bookmark could not be deleted."));
    } finally {
      setPendingAction(null);
    }
  }

  async function addNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setPendingAction("note:create");
    try {
      const note = await academyRequest<AcademyLearnerNote>(
        "/api/academy/notes",
        {
          body: JSON.stringify({
            courseId,
            lessonId,
            moduleId,
            noteText,
            positionSeconds,
          }),
          method: "POST",
        },
      );
      setNotes((current) => [note, ...current]);
      setNoteText("");
      showStatus(tr("Private note saved."));
      recordAcademyClientEvent({
        courseId,
        lessonId,
        moduleId,
        name: "academy_note_created",
      });
    } catch (error) {
      showError(error, tr("Private note could not be saved."));
    } finally {
      setPendingAction(null);
    }
  }

  async function saveNote(id: string) {
    setPendingAction(`note:update:${id}`);
    try {
      const note = await academyRequest<AcademyLearnerNote>(
        `/api/academy/notes/${id}`,
        {
          body: JSON.stringify({ noteText: editingNoteText }),
          method: "PATCH",
        },
      );
      setNotes((current) =>
        current.map((item) => (item.id === id ? note : item)),
      );
      setEditingNoteId(null);
      setEditingNoteText("");
      showStatus(tr("Private note updated."));
    } catch (error) {
      showError(error, tr("Private note could not be updated."));
    } finally {
      setPendingAction(null);
    }
  }

  async function removeNote(note: AcademyLearnerNote) {
    if (!window.confirm(tr("Delete this private note? This cannot be undone.")))
      return;
    setPendingAction(`note:delete:${note.id}`);
    try {
      await academyRequest(`/api/academy/notes/${note.id}`, {
        method: "DELETE",
      });
      setNotes((current) => current.filter((item) => item.id !== note.id));
      showStatus(tr("Private note removed."));
    } catch (error) {
      showError(error, tr("Private note could not be deleted."));
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <aside className="academy-lesson-tools" aria-label={tr("Lesson tools")}>
      <section>
        <div className="academy-tool-heading">
          <Bookmark size={18} aria-hidden="true" />
          <h2>{tr("Bookmarks")}</h2>
        </div>
        <label htmlFor="academy-bookmark-label">{tr("Optional label")}</label>
        <div className="academy-inline-form">
          <input
            id="academy-bookmark-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            maxLength={120}
            placeholder={tr("Key idea or timestamp")}
          />
          <button
            type="button"
            className="button button-secondary"
            onClick={() => void addBookmark()}
            disabled={pendingAction !== null}
          >
            {pendingAction === "bookmark:create" ? tr("Saving…") : tr("Save")}
          </button>
        </div>
        {lessonBookmarks.length ? (
          <ul>
            {lessonBookmarks.map((bookmark) => (
              <li key={bookmark.id}>
                {editingBookmarkId === bookmark.id ? (
                  <div className="academy-edit-item">
                    <label htmlFor={`bookmark-${bookmark.id}`}>
                      {tr("Bookmark label")}
                    </label>
                    <input
                      id={`bookmark-${bookmark.id}`}
                      maxLength={120}
                      value={editingBookmarkLabel}
                      onChange={(event) =>
                        setEditingBookmarkLabel(event.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => void saveBookmark(bookmark.id)}
                      disabled={pendingAction !== null}
                    >
                      {tr("Save")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingBookmarkId(null)}
                      aria-label={tr("Cancel bookmark editing")}
                    >
                      <X size={15} aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{bookmark.label || tr("Lesson bookmark")}</span>
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBookmarkId(bookmark.id);
                          setEditingBookmarkLabel(bookmark.label ?? "");
                        }}
                        aria-label={`${tr("Edit bookmark")} ${bookmark.label || tr("Lesson bookmark")}`}
                      >
                        <Pencil size={15} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeBookmark(bookmark)}
                        disabled={pendingAction !== null}
                        aria-label={`${tr("Delete bookmark")} ${bookmark.label || tr("Lesson bookmark")}`}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>{tr("No bookmarks in this lesson yet.")}</p>
        )}
      </section>
      <section>
        <div className="academy-tool-heading">
          <NotebookPen size={18} aria-hidden="true" />
          <h2>{tr("Private notes")}</h2>
        </div>
        <form onSubmit={addNote}>
          <label htmlFor="academy-note">{tr("Note")}</label>
          <textarea
            id="academy-note"
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            maxLength={5000}
            required
            rows={5}
            placeholder={tr("Capture your own learning notes…")}
            aria-describedby="academy-note-limit"
          />
          <small id="academy-note-limit">
            {5_000 - noteText.length} characters remaining
          </small>
          <button
            className="button button-secondary"
            type="submit"
            disabled={pendingAction !== null}
          >
            {pendingAction === "note:create"
              ? tr("Saving…")
              : tr("Save private note")}
          </button>
        </form>
        {lessonNotes.length ? (
          <ul>
            {lessonNotes.map((note) => (
              <li key={note.id}>
                {editingNoteId === note.id ? (
                  <div className="academy-edit-item">
                    <label htmlFor={`note-${note.id}`}>
                      {tr("Edit private note")}
                    </label>
                    <textarea
                      id={`note-${note.id}`}
                      maxLength={5_000}
                      rows={5}
                      value={editingNoteText}
                      onChange={(event) =>
                        setEditingNoteText(event.target.value)
                      }
                    />
                    <small>
                      {5_000 - editingNoteText.length} characters remaining
                    </small>
                    <div>
                      <button
                        type="button"
                        onClick={() => void saveNote(note.id)}
                        disabled={pendingAction !== null}
                      >
                        {tr("Save changes")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingNoteId(null)}
                      >
                        {tr("Cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <span>{note.noteText}</span>
                      {academyTimestamp(note.updatedAt ?? note.createdAt) ? (
                        <small>
                          Updated{" "}
                          {academyTimestamp(note.updatedAt ?? note.createdAt)}
                        </small>
                      ) : null}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNoteId(note.id);
                          setEditingNoteText(note.noteText);
                        }}
                        aria-label={tr("Edit private note")}
                      >
                        <Pencil size={15} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeNote(note)}
                        disabled={pendingAction !== null}
                        aria-label={tr("Delete private note")}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>{tr("Your notes are private and visible only to you.")}</p>
        )}
      </section>
      {feedback ? (
        <p
          className={`academy-tool-message ${feedback.kind}`}
          role={feedback.kind === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      ) : null}
    </aside>
  );
}

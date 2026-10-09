import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useRoam } from "../context/useRoam";

function Diaries({ setNotice }) {
  const {
    trips,
    diaryEntries,
    addDiaryEntry,
    updateDiaryEntry,
    deleteDiaryEntry,
  } = useRoam();

  const [searchParams] = useSearchParams();
  const requestedTripId = searchParams.get("tripId");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterTrip, setFilterTrip] = useState("all");

  const [title, setTitle] = useState("");
  const [tripId, setTripId] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [story, setStory] = useState("");

  const filteredEntries = diaryEntries
    .filter(
      (entry) =>
        filterTrip === "all" ||
        String(entry.tripId) === filterTrip
    )
    .slice()
    .sort((a, b) => b.entryDate.localeCompare(a.entryDate));

  function resetForm() {
    setTitle("");
    setTripId("");
    setEntryDate(new Date().toISOString().slice(0, 10));
    setStory("");
    setEditingId(null);
    setShowForm(false);
  }

  function openNewEntry() {
    const requestedTrip = trips.find(
      (trip) => String(trip.id) === requestedTripId
    );

    setTitle("");
    setTripId(
      requestedTrip
        ? String(requestedTrip.id)
        : trips.length > 0
          ? String(trips[0].id)
          : ""
    );
    setEntryDate(new Date().toISOString().slice(0, 10));
    setStory("");
    setEditingId(null);
    setShowForm(true);
  }

  function openEditEntry(entry) {
    setTitle(entry.title);
    setTripId(String(entry.tripId));
    setEntryDate(entry.entryDate);
    setStory(entry.story);
    setEditingId(entry.id);
    setShowForm(true);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim() || !tripId || !story.trim()) {
      return;
    }

    const selectedTrip = trips.find(
      (trip) => String(trip.id) === tripId
    );

    if (!selectedTrip) {
      setNotice("Please choose a valid trip first.");
      return;
    }

    const entry = {
      title: title.trim(),
      tripId: selectedTrip.id,
      tripName: selectedTrip.name,
      destination: selectedTrip.destination,
      entryDate,
      story: story.trim(),
    };

    if (editingId !== null) {
      updateDiaryEntry(editingId, entry);
      setNotice("Your memory has been updated ✨");
    } else {
      addDiaryEntry(entry);
      setNotice("A little memory, safely tucked away 📔");
    }

    resetForm();
  }

  function handleDelete(entry) {
    const confirmed = window.confirm(
      `Delete "${entry.title}" from your diary?`
    );

    if (!confirmed) return;

    deleteDiaryEntry(entry.id);
    setNotice("Diary entry removed.");
  }

  function getTripName(entry) {
    const linkedTrip = trips.find(
      (trip) => trip.id === entry.tripId
    );

    return linkedTrip
      ? `${linkedTrip.name} · ${linkedTrip.destination}`
      : `${entry.tripName || "Past adventure"} · ${entry.destination || "Destination saved in memory"}`;
  }

  return (
    <section className="inner-page diary-page">
      <span className="eyebrow">BITS OF LIFE, PRESERVED</span>

      <h1>
        Dear diary, <span>we went places.</span>
      </h1>

      <p className="inner-intro">
        The blurry photos. The wrong turns. The best meal of your life.
        All the little things worth remembering.
      </p>

      <button
        type="button"
        className="primary-button new-trip-button"
        onClick={openNewEntry}
      >
        + Write a little memory
      </button>

      {showForm && (
        <div className="diary-paper diary-editor">
          <span className="diary-tape">
            {editingId !== null ? "A MEMORY, REVISITED" : "FRESH FROM YOUR HEART"}
          </span>

          <button
            type="button"
            className="modal-close"
            onClick={resetForm}
            aria-label="Close diary editor"
          >
            ×
          </button>

          <h2>
            {editingId !== null
              ? "Let's edit this memory."
              : "Dear diary..."}
          </h2>

          <form onSubmit={handleSubmit} className="diary-form">
            <label>
              Give this memory a title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. The sunset we almost missed"
                required
              />
            </label>

            <label>
              Which adventure was this?
              <select
                value={tripId}
                onChange={(event) => setTripId(event.target.value)}
                required
              >
                <option value="">Choose a trip</option>
                {trips.map((trip) => (
                  <option key={trip.id} value={String(trip.id)}>
                    {trip.name} — {trip.destination}
                  </option>
                ))}
              </select>
            </label>

            <label>
              When did it happen?
              <input
                type="date"
                value={entryDate}
                onChange={(event) => setEntryDate(event.target.value)}
                required
              />
            </label>

            <label>
              Tell your story
              <textarea
                value={story}
                onChange={(event) => setStory(event.target.value)}
                placeholder="Start anywhere. What did you see, feel, eat, or get completely lost doing?"
                rows={7}
                required
              />
            </label>

            <div className="diary-form-actions">
              <button className="primary-button" type="submit">
                {editingId !== null
                  ? "Save memory ✨"
                  : "Tuck it into my diary 📔"}
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="diary-collection-heading">
        <div>
          <span className="eyebrow">YOUR LITTLE TIME CAPSULE</span>
          <h2>Memories & moments</h2>
        </div>

        {diaryEntries.length > 0 && (
          <label className="diary-filter">
            <span className="eyebrow">FROM</span>
            <select
              value={filterTrip}
              onChange={(event) => setFilterTrip(event.target.value)}
            >
              <option value="all">All adventures</option>
              {trips.map((trip) => (
                <option key={trip.id} value={String(trip.id)}>
                  {trip.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {filteredEntries.length === 0 ? (
        <div className="diary-paper diary-empty">
          <span className="diary-doodle">✿</span>
          <h2>
            {diaryEntries.length === 0
              ? "Your story starts with a little hello."
              : "No memories from this adventure. Yet."}
          </h2>
          <p>
            {trips.length === 0
              ? "Create a trip first, then come back to save its memories."
              : "The tiny details are often the ones worth keeping. Write your first entry whenever you're ready."}
          </p>
          {trips.length > 0 && (
            <button
              type="button"
              className="primary-button"
              onClick={openNewEntry}
            >
              Start a diary entry ✎
            </button>
          )}
        </div>
      ) : (
        <div className="diary-entry-grid">
          {filteredEntries.map((entry, index) => (
            <article
              className={`diary-paper diary-entry diary-entry-${index % 3}`}
              key={entry.id}
            >
              <span className="diary-tape">A LITTLE MEMORY</span>
              <span className="diary-doodle">✿</span>

              <span className="eyebrow">
                {new Date(`${entry.entryDate}T12:00:00`).toLocaleDateString(
                  undefined,
                  { day: "numeric", month: "long", year: "numeric" }
                )}
              </span>

              <h2>{entry.title}</h2>

              <p className="diary-entry-trip">
                📍 {getTripName(entry)}
              </p>

              <p className="diary-entry-story">{entry.story}</p>

              <div className="diary-entry-actions">
                <button
                  type="button"
                  className="text-action"
                  onClick={() => openEditEntry(entry)}
                >
                  Edit memory ↗
                </button>

                <button
                  type="button"
                  className="text-action diary-delete"
                  onClick={() => handleDelete(entry)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Diaries;
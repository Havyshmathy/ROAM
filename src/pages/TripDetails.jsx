
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoam } from "../context/useRoam";

function formatDate(date) {
  if (!date) return "Not decided yet";

  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDuration(startDate, endDate) {
  if (!startDate || !endDate) return "Dates still flexible";

  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    return "Dates to be confirmed";
  }

  const days =
    Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

  return `${days} ${days === 1 ? "day" : "days"}`;
}

function TripDetails({ setNotice, openTripForm }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    trips,
    diaryEntries,
    deleteDiaryEntry,
    itineraryStops,
    loadItinerary,
    addItineraryStop,
    updateItineraryStop,
    deleteItineraryStop,
  } = useRoam();

  const trip = trips.find((item) => String(item.id) === id);

  const [placeName, setPlaceName] = useState("");
  const [placeDescription, setPlaceDescription] = useState("");
  const [editingStopId, setEditingStopId] = useState(null);
  const [selectedStopId, setSelectedStopId] = useState(null);
  const [showPlaceForm, setShowPlaceForm] = useState(false);

  // Load this trip's itinerary from PostgreSQL.
  useEffect(() => {
    if (!trip?.id || typeof trip.id === "number") return;

    loadItinerary(trip.id).catch((error) => {
      setNotice?.(
        error.message || "Could not load your itinerary."
      );
    });
  }, [trip?.id, loadItinerary, setNotice]);

  const tripStops = useMemo(
    () =>
      itineraryStops
        .filter((stop) => String(stop.tripId) === id)
        .slice()
        .sort((a, b) => a.order - b.order),
    [itineraryStops, id]
  );

  const selectedStop =
    tripStops.find(
      (stop) => String(stop.id) === String(selectedStopId)
    ) ||
    tripStops[0] ||
    null;

  const entries = useMemo(
    () =>
      diaryEntries
        .filter((entry) => String(entry.tripId) === id)
        .slice()
        .sort((a, b) => b.entryDate.localeCompare(a.entryDate)),
    [diaryEntries, id]
  );

  if (!trip) {
    return (
      <section className="inner-page trip-details-page">
        <span className="eyebrow">A LITTLE DETOUR</span>
        <h1>We couldn't find that trip.</h1>
        <p className="inner-intro">
          It may have been removed, or the link may be out of date.
        </p>
        <button
          type="button"
          className="primary-button"
          onClick={() => navigate("/trips")}
        >
          ← Back to all trips
        </button>
      </section>
    );
  }

  function handleDeleteEntry(entry) {
    const confirmed = window.confirm(
      `Delete "${entry.title}" from your diary?`
    );

    if (!confirmed) return;

    deleteDiaryEntry(entry.id);
    setNotice?.("Diary entry removed.");
  }

  function resetPlaceForm() {
    setPlaceName("");
    setPlaceDescription("");
    setEditingStopId(null);
    setShowPlaceForm(false);
  }

  function openNewPlaceForm() {
    setPlaceName("");
    setPlaceDescription("");
    setEditingStopId(null);
    setShowPlaceForm(true);
  }

  function openEditPlaceForm(stop) {
    setPlaceName(stop.name);
    setPlaceDescription(stop.description || "");
    setEditingStopId(stop.id);
    setShowPlaceForm(true);
  }

  // Save new and edited itinerary stops through the context API.
  async function handlePlaceSubmit(event) {
    event.preventDefault();

    if (!placeName.trim()) return;

    const changes = {
      name: placeName.trim(),
      description: placeDescription.trim(),
    };

    try {
      if (editingStopId !== null) {
        await updateItineraryStop(editingStopId, changes);
        setSelectedStopId(editingStopId);
        setNotice?.("Your stop has been updated ✨");
      } else {
        await addItineraryStop({
          tripId: trip.id,
          ...changes,
        });
        setNotice?.("A new stop added to your route ✈️");
      }

      resetPlaceForm();
    } catch (error) {
      setNotice?.(
        error.message || "Could not save this itinerary stop."
      );
    }
  }

  async function handleDeletePlace(stop) {
    const confirmed = window.confirm(
      `Remove "${stop.name}" from this itinerary?`
    );

    if (!confirmed) return;

    try {
      await deleteItineraryStop(stop.id);

      if (String(selectedStopId) === String(stop.id)) {
        setSelectedStopId(null);
      }

      if (String(editingStopId) === String(stop.id)) {
        resetPlaceForm();
      }

      setNotice?.("Stop removed from your itinerary.");
    } catch (error) {
      setNotice?.(
        error.message || "Could not remove this itinerary stop."
      );
    }
  }

  return (
    <section className="inner-page trip-details-page">
      <button
        type="button"
        className="trip-back-link"
        onClick={() => navigate("/trips")}
      >
        <span className="back-arrow">←</span>
        <span>All adventures</span>
      </button>

      <div className="trip-detail-hero">
        <span className="eyebrow">YOUR NEXT CHAPTER</span>

        <h1>{trip.name}</h1>

        <p className="trip-detail-destination">
          <span aria-hidden="true">📍</span> {trip.destination}
        </p>

        <p className="trip-detail-dates">
          <span aria-hidden="true">♡</span>{" "}
          {trip.startDate
            ? formatDate(trip.startDate)
            : trip.date || "Dates TBD"}
          {trip.endDate && ` — ${formatDate(trip.endDate)}`}
        </p>

        <div className="trip-detail-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate(`/diaries?tripId=${trip.id}`)}
          >
            + Write a memory
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => openTripForm?.(trip)}
          >
            Edit trip details ↗
          </button>
        </div>
      </div>

      <div className="trip-detail-overview">
        <article className="diary-paper trip-notes-card">
          <span className="eyebrow">A NOTE TO FUTURE ME</span>
          <h2>The little plan</h2>
          <p>
            {trip.notes?.trim() ||
              "No notes yet. Add a few plans, places to visit, or things you don't want to forget."}
          </p>
        </article>

        <article className="diary-paper trip-facts-card">
          <span className="eyebrow">AT A GLANCE</span>
          <h2>Trip details</h2>

          <dl className="trip-facts-list">
            <div>
              <dt>Destination</dt>
              <dd>{trip.destination}</dd>
            </div>
            <div>
              <dt>Start date</dt>
              <dd>{formatDate(trip.startDate)}</dd>
            </div>
            <div>
              <dt>End date</dt>
              <dd>{formatDate(trip.endDate)}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{getDuration(trip.startDate, trip.endDate)}</dd>
            </div>
            <div>
              <dt>Memories</dt>
              <dd>{entries.length}</dd>
            </div>
          </dl>
        </article>
      </div>

      <section className="trip-itinerary">
        <div className="trip-itinerary-heading">
          <div>
            <span className="eyebrow">THE PLACES ALONG THE WAY</span>
            <h2>Our little route <span>♡</span></h2>
            <p>Add each place in the order you want to visit it.</p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={openNewPlaceForm}
          >
            + Add a place
          </button>
        </div>

        {showPlaceForm && (
          <div className="diary-paper itinerary-editor">
            <button
              type="button"
              className="modal-close"
              aria-label="Close place form"
              onClick={resetPlaceForm}
            >
              ×
            </button>

            <span className="eyebrow">
              {editingStopId !== null
                ? "A LITTLE CHANGE OF PLANS"
                : "A NEW PIN ON THE MAP"}
            </span>

            <h3>
              {editingStopId !== null
                ? "Edit this stop"
                : "Where shall we wander?"}
            </h3>

            <form
              className="itinerary-form"
              onSubmit={handlePlaceSubmit}
            >
              <label>
                Place name
                <input
                  value={placeName}
                  onChange={(event) =>
                    setPlaceName(event.target.value)
                  }
                  placeholder="e.g. Fushimi Inari Shrine"
                  required
                />
              </label>

              <label>
                A little note about this place
                <textarea
                  value={placeDescription}
                  onChange={(event) =>
                    setPlaceDescription(event.target.value)
                  }
                  placeholder="What do you want to see, do, eat, or remember here?"
                  rows={3}
                />
              </label>

              <div className="diary-form-actions">
                <button type="submit" className="primary-button">
                  {editingStopId !== null
                    ? "Save changes ✨"
                    : "Add to my route ✈️"}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetPlaceForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {tripStops.length === 0 ? (
          <div className="diary-paper itinerary-empty">
            <span className="diary-doodle">✿</span>
            <h3>Your route is a blank page.</h3>
            <p>
              Add your first place, then keep going. Your stops will
              line up in the order you add them.
            </p>
            <button
              type="button"
              className="secondary-button"
              onClick={openNewPlaceForm}
            >
              Pin the first place
            </button>
          </div>
        ) : (
          <>
            <div className="itinerary-timeline">
              {tripStops.map((stop, index) => (
                <button
                  type="button"
                  key={stop.id}
                  className={`itinerary-stop ${
                    String(selectedStop?.id) === String(stop.id)
                      ? "is-selected"
                      : ""
                  }`}
                  onClick={() => setSelectedStopId(stop.id)}
                  aria-pressed={
                    String(selectedStop?.id) === String(stop.id)
                  }
                >
                  <span className="itinerary-stop-line">
                    <span className="itinerary-stop-number">
                      {index + 1}
                    </span>
                  </span>
                  <span className="itinerary-stop-name">
                    {stop.name}
                  </span>
                </button>
              ))}
            </div>

            {selectedStop && (
              <article className="diary-paper itinerary-place-detail">
                <div className="itinerary-detail-top">
                  <div>
                    <span className="eyebrow">
                      STOP{" "}
                      {tripStops.findIndex(
                        (stop) =>
                          String(stop.id) === String(selectedStop.id)
                      ) + 1}{" "}
                      · YOUR TRAVEL NOTES
                    </span>
                    <h3>{selectedStop.name}</h3>
                  </div>
                  <span className="itinerary-pin">✿</span>
                </div>

                <p className="itinerary-description">
                  {selectedStop.description ||
                    "No notes for this place yet. Edit this stop to add a little detail."}
                </p>

                <div className="diary-entry-actions">
                  <button
                    type="button"
                    className="text-action"
                    onClick={() => openEditPlaceForm(selectedStop)}
                  >
                    Edit stop ↗
                  </button>

                  <button
                    type="button"
                    className="text-action diary-delete"
                    onClick={() => handleDeletePlace(selectedStop)}
                  >
                    Remove stop
                  </button>
                </div>
              </article>
            )}
          </>
        )}
      </section>

      <div className="trip-memories-heading">
        <div>
          <span className="eyebrow">LITTLE MOMENTS, KEPT FOREVER</span>
          <h2>Travel diaries</h2>
        </div>
        <span className="trip-memory-count">
          {entries.length} {entries.length === 1 ? "memory" : "memories"}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="diary-paper trip-no-memories">
          <span className="diary-doodle">✿</span>
          <h2>Every adventure has a first story.</h2>
          <p>
            Your diary entries linked to this trip will appear here.
            Save the funny moments, the unexpected detours, and the
            little things you never want to forget.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate(`/diaries?tripId=${trip.id}`)}
          >
            Write your first memory ✎
          </button>
        </div>
      ) : (
        <div className="diary-entry-grid">
          {entries.map((entry, index) => (
            <article
              className={`diary-paper diary-entry diary-entry-${index % 3}`}
              key={entry.id}
            >
              <span className="diary-tape">FROM YOUR TRAVELS</span>
              <span className="diary-doodle">✿</span>

              <span className="eyebrow">
                {formatDate(entry.entryDate)}
              </span>

              <h2>{entry.title}</h2>
              <p className="diary-entry-story">{entry.story}</p>

              <div className="diary-entry-actions">
                <button
                  type="button"
                  className="text-action"
                  onClick={() =>
                    navigate(`/diaries?tripId=${trip.id}`)
                  }
                >
                  Open diary ↗
                </button>

                <button
                  type="button"
                  className="text-action diary-delete"
                  onClick={() => handleDeleteEntry(entry)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="trip-detail-footer">
        Made of plans, little detours, and memories. ♡
      </p>
    </section>
  );
}

export default TripDetails;


function TripModal({
  showTripForm,
  setShowTripForm,
  createTrip,
  tripName,
  setTripName,
  tripDestination,
  setTripDestination,
  tripStartDate,
  setTripStartDate,
  tripEndDate,
  setTripEndDate,
  tripNotes,
  setTripNotes,
  editingTripId,
}) {
  if (!showTripForm) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => setShowTripForm(false)}
    >
      <form
        className="trip-modal"
        onSubmit={createTrip}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close"
          type="button"
          onClick={() => setShowTripForm(false)}
          aria-label="Close trip form"
        >
          ×
        </button>

        <span className="modal-emoji">🧳</span>

        <span className="eyebrow">
          SOMETHING EXCITING IS BREWING
        </span>

        <h2>
          {editingTripId !== null
            ? "Edit your little plan."
            : "Let's make a little plan."}
        </h2>

        <p>It doesn't have to be booked to be real.</p>

        <label>
          What are we calling this adventure?
          <input
            value={tripName}
            onChange={(event) => setTripName(event.target.value)}
            placeholder="e.g. Operation Beach Hair"
            required
          />
        </label>

        <label>
          Where are we headed?
          <input
            value={tripDestination}
            onChange={(event) =>
              setTripDestination(event.target.value)
            }
            placeholder="e.g. Gokarna, or somewhere unknown..."
            required
          />
        </label>

        <div className="trip-date-fields">
          <label>
            Leaving on
            <input
              type="date"
              value={tripStartDate}
              onChange={(event) =>
                setTripStartDate(event.target.value)
              }
              max={tripEndDate || undefined}
            />
          </label>

          <label>
            Coming back
            <input
              type="date"
              value={tripEndDate}
              onChange={(event) =>
                setTripEndDate(event.target.value)
              }
              min={tripStartDate || undefined}
            />
          </label>
        </div>

        <label>
          Little notes (optional)
          <textarea
            value={tripNotes}
            onChange={(event) => setTripNotes(event.target.value)}
            placeholder="Things to see, food to try, people to go with..."
            rows={3}
          />
        </label>

        <button
          className="primary-button modal-submit"
          type="submit"
        >
          {editingTripId !== null
            ? "Save trip changes ✨"
            : "Put it on the map ✈️"}
        </button>
      </form>
    </div>
  );
}

export default TripModal;
import { useNavigate } from "react-router-dom";
function Trips({ trips, openTripForm }) {
  const navigate = useNavigate();
  return (
    
    <section className="inner-page">
      <span className="eyebrow">
        PLANS, POSSIBILITIES & PACKING LISTS
      </span>

      <h1>
        Adventure is <span>pending.</span>
      </h1>

      <p className="inner-intro">
        Big plans, tiny weekends, or a trip that's just a Pinterest
        board in your head.
      </p>

      <button
        className="primary-button new-trip-button"
        onClick={() => openTripForm()}
      >
        + Start a new adventure
      </button>

      {trips.length === 0 ? (
        <div className="empty-state">
          <span>🧳</span>
          <h3>No adventures planned just yet.</h3>
          <p>Your next little escape can start right here.</p>
        </div>
      ) : (
        <div className="trip-grid">
          {trips.map((trip, index) => (
            <article
              className="trip-card"
              key={trip.id}
              onClick={() => navigate(`/trips/${trip.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className={`trip-art trip-art-${index % 3}`}>
                <span>{["🗺️", "🚂", "🏕️"][index % 3]}</span>
                <span className="trip-sticker">
                  TRIP #{index + 1}
                </span>
              </div>

              <div className="trip-card-copy">
                <span className="eyebrow">THE NEXT CHAPTER</span>
                <h3>{trip.name}</h3>
                <p>📍 {trip.destination}</p>
                <p>🗓️ {trip.date}</p>

                <button
                  className="text-action"
                  onClick={(event) => {
                    event.stopPropagation();
                    openTripForm(trip);
                  }}
                >
                  Edit trip details ↗
                </button>

              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Trips;
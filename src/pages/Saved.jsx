
import { places } from "../data/places";

function Saved({ savedPlaces, toggleSaved, openTripForm, goTo }) {
  const savedItems = places.filter((place) =>
    savedPlaces.includes(place.id)
  );

  return (
    <section className="inner-page">
      <span className="eyebrow">YOUR LITTLE TREASURE CHEST</span>

      <h1>
        For a future <span>you.</span>
      </h1>

      <p className="inner-intro">
        All the places you whispered, "one day, definitely."
      </p>

      {savedItems.length === 0 ? (
        <div className="empty-state saved-empty">
          <span>💌</span>
          <h3>Your wishlist is a blank postcard.</h3>
          <p>
            Find a place you love and tap the little heart to keep it.
          </p>

          <button
            className="primary-button"
            onClick={() => goTo("/discover")}
          >
            Find somewhere ↗
          </button>
        </div>
      ) : (
        <div className="place-grid">
          {savedItems.map((place) => (
            <article className="place-card" key={place.id}>
              <div className={`place-art ${place.color}`}>
                <span className="place-emoji">{place.emoji}</span>
                <span className="place-category">{place.category}</span>

                
                <button
                type="button"
                className="save-button is-saved"
                style={{ zIndex: 2, cursor: "pointer" }}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleSaved(place.id);
                }}
                aria-label={`Remove ${place.name} from saved places`}
                aria-pressed="true"
                >
                ♥
                </button>
              </div>

              <div className="place-info">
                <div className="place-location">{place.country}</div>

                <div className="place-title-row">
                  <h3>{place.name}</h3>
                  <span className="place-rating">✳ {place.rating}</span>
                </div>

                <p>{place.description}</p>

                <button
                  className="text-action"
                  onClick={() =>
                    openTripForm(
                      `A little trip to ${place.name}`,
                      place.name
                    )
                  }
                >
                  Add to a trip ↗
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Saved;
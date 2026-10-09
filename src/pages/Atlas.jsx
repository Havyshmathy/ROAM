
import { places } from "../data/places";

function Atlas({ savedPlaces, goTo }) {
  const savedItems = places.filter((place) =>
    savedPlaces.includes(place.id)
  );

  return (
    <section className="inner-page">
      <span className="eyebrow">A MAP OF YOUR LITTLE WORLD</span>

      <h1>
        Your atlas, <span>your rules.</span>
      </h1>

      <p className="inner-intro">
        Every saved place is a pin in the story you're writing.
      </p>

      <div className="atlas-panel">
        <div className="atlas-map-art">
          <span className="map-squiggle">〰</span>

          {savedItems.length > 0 ? (
            savedItems.map((place, index) => (
              <button
                type="button"
                key={place.id}
                className={`map-pin ${
                  ["pin-a", "pin-b", "pin-c"][index % 3]
                }`}
                onClick={() => goTo("/saved")}
                title={`View ${place.name} in your saved places`}
              >
                📍 {place.name}
              </button>
            ))
          ) : (
            <span className="map-center">🌍</span>
          )}

          <p>YOUR WORLD IS STILL UNFOLDING</p>
        </div>

        <div className="atlas-summary">
          <span className="eyebrow">YOUR COLLECTION</span>

          <h2>
            {savedItems.length}{" "}
            {savedItems.length === 1 ? "place" : "places"} saved
          </h2>

          <p>
            {savedItems.length > 0
              ? "Every little pin is somewhere you want to explore."
              : "Little dreams have a way of becoming plane tickets. Start by saving a place you love."}
          </p>

          <button
            className="primary-button"
            onClick={() =>
              goTo(savedItems.length > 0 ? "/saved" : "/discover")
            }
          >
            {savedItems.length > 0
              ? "See saved places ↗"
              : "Find somewhere ↗"}
          </button>
        </div>
      </div>

      <button
        className="secondary-button"
        onClick={() => goTo("/discover")}
      >
        ← Back to discovering
      </button>
    </section>
  );
}

export default Atlas;
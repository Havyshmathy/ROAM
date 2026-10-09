
function PlaceCard({ place, isSaved, onToggleSave, onPlan, index = 0 }) {
  return (
    <article
      className="place-card"
      style={{ "--card-index": index }}
    >
      <div className={`place-art ${place.color}`}>
        <span className="place-emoji">{place.emoji}</span>
        <span className="place-category">{place.category}</span>

        <button
          className={`save-button ${isSaved ? "is-saved" : ""}`}
          onClick={() => onToggleSave(place.id)}
          aria-label={isSaved ? "Remove from saved" : "Save place"}
        >
          {isSaved ? "♥" : "♡"}
        </button>

        <span className="art-number">
          No. {String(place.id).padStart(2, "0")}
        </span>
      </div>

      <div className="place-info">
        <div className="place-location">{place.country}</div>

        <div className="place-title-row">
          <h3>{place.name}</h3>
          <span className="place-rating">✳ {place.rating}</span>
        </div>

        <p>{place.description}</p>

        <div className="place-card-bottom">
          <div className="tag-row">
            {place.tags.map((tag) => (
              <span className="tiny-tag" key={tag}>
                #{tag}
              </span>
            ))}
          </div>

          <button className="text-action" onClick={() => onPlan(place)}>
            Plan this ↗
          </button>
        </div>
      </div>
    </article>
  );
}

export default PlaceCard;
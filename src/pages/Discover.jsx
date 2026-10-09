
import { categories } from "../data/places";

function Discover({
  search,
  setSearch,
  category,
  setCategory,
  filteredPlaces,
  saved,
  toggleSaved,
  openTripForm,
  trips,
}) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span>✳</span> YOUR NEXT CHAPTER STARTS HERE
          </span>

          <h1>
            The world is big.
            <br />
            <span>Your plans can be</span>
            <br />
            <span className="hero-highlight">a little silly.</span>
          </h1>

          <p className="hero-description">
            For places you dream about, roads you get lost on,
            and stories you'll tell a hundred times.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              document.getElementById("discover-grid")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            Find your somewhere <span>↗</span>
          </button>

          <div className="hero-footnote">
            <span>✦</span> No itinerary required. Daydreaming counts.
          </div>
        </div>

        <div className="hero-art">
          <div className="art-sun" />
          <div className="art-label label-top">POSTCARD FROM</div>
          <div className="art-stamp">
            WISH<br />YOU<br />WERE<br />HERE!
          </div>
          <div className="art-land art-land-back" />
          <div className="art-land art-land-front" />
          <div className="art-water" />
          <div className="art-palm">🌴</div>
          <div className="art-person">🧍🏻‍♀️</div>
          <div className="art-caption">
            <span>somewhere, someday</span>
            <span>♡</span>
          </div>
          <div className="floating-star star-one">✳</div>
          <div className="floating-star star-two">✦</div>
          <div className="floating-note">
            take the<br />scenic route ↗
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="stat">
          <span className="stat-emoji">🌎</span>
          <div>
            <strong>1 big world</strong>
            <span>yours to explore</span>
          </div>
        </div>

        <div className="stat">
          <span className="stat-emoji">💌</span>
          <div>
            <strong>{saved.length} little saves</strong>
            <span>for a future you</span>
          </div>
        </div>

        <div className="stat">
          <span className="stat-emoji">✈️</span>
          <div>
            <strong>{trips.length} adventures</strong>
            <span>in the making</span>
          </div>
        </div>
      </section>

      <section className="discover-section" id="discover-grid">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A LITTLE INSPIRATION</span>
            <h2>
              Places that are <span>calling.</span>
            </h2>
            <p>Consider this your sign to go somewhere.</p>
          </div>

          <span className="handwritten">psst... save the good ones ↘</span>
        </div>

        <div className="search-row">
          <label className="search-box">
            <span>⌕</span>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search places, moods, little escapes..."
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>

          <span className="results-label">
            {filteredPlaces.length} PLACES TO DAYDREAM ABOUT
          </span>
        </div>

        <div className="category-row">
          {categories.map((item) => (
            <button
              key={item}
              className={`category-chip ${
                category === item ? "selected" : ""
              }`}
              onClick={() => setCategory(item)}
            >
              {item === "Everything" ? "✳ " : ""}
              {item}
            </button>
          ))}
        </div>

        <div className="place-grid">
          {filteredPlaces.map((place, index) => (
            <article
              className="place-card"
              key={place.id}
              style={{ "--card-index": index }}
            >
              <div className={`place-art ${place.color}`}>
                <span className="place-emoji">{place.emoji}</span>
                <span className="place-category">{place.category}</span>

                                
                
                
                <button
                type="button"
                className={`save-button ${
                    saved.includes(place.id) ? "is-saved" : ""
                }`}
                style={{ zIndex: 2, cursor: "pointer" }}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleSaved(place.id);
                }}
                aria-label={
                    saved.includes(place.id)
                    ? "Remove from saved"
                    : "Save place"
                }
                aria-pressed={saved.includes(place.id)}
                >
                {saved.includes(place.id) ? "♥" : "♡"}
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

                  <button
                    className="text-action"
                    onClick={() =>
                      openTripForm(
                        `A little trip to ${place.name}`,
                        place.name
                      )
                    }
                  >
                    Plan this ↗
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredPlaces.length === 0 && (
          <div className="empty-state">
            <span>🕵️‍♀️</span>
            <h3>No places found. Yet.</h3>
            <p>Try another search. Your somewhere is out there.</p>

            <button
              className="secondary-button"
              onClick={() => {
                setSearch("");
                setCategory("Everything");
              }}
            >
              Reset the compass
            </button>
          </div>
        )}
      </section>
    </>
  );
}

export default Discover;
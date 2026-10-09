import {
useCallback,
useEffect,
useState,
} from "react";

import RoamContext from "./roamContextValue";

import {
getToken,
getCurrentUser,
loginUser,
registerUser,
logoutUser,
getTrips as fetchTrips,
createTrip as createTripApi,
updateTripApi,
deleteTripApi,
getItinerary as fetchItinerary,
createItineraryStop as createItineraryStopApi,
updateItineraryStopApi,
deleteItineraryStopApi,
} from "../lib/api";

function readStorage(key, fallback) {
try {
const value = localStorage.getItem(key);
return value === null ? fallback : JSON.parse(value);
} catch {
return fallback;
}
}

// Convert a PostgreSQL trip into the shape used by the existing UI.
function formatTrip(trip) {
const startDate = trip.startDate
? trip.startDate.slice(0, 10)
: "";

const endDate = trip.endDate
? trip.endDate.slice(0, 10)
: "";

return {
...trip,
name: trip.title,
notes: trip.description || "",
startDate,
endDate,
date: startDate || "Dates not set yet",
};
}

// Convert a PostgreSQL itinerary stop into the shape used by the UI.
function formatStop(stop, tripId) {
return {
...stop,
tripId,
name: stop.title ?? stop.name,
order: stop.position ?? stop.order ?? 0,
visitDate: stop.visitDate
? String(stop.visitDate).slice(0, 10)
: "",
};
}

export function RoamProvider({ children }) {
const [savedPlaces, setSavedPlaces] = useState(() =>
readStorage("roam-saved-places", [])
);

const [trips, setTrips] = useState(() =>
readStorage("roam-trips", [])
);

const [diaryEntries, setDiaryEntries] = useState(() =>
readStorage("roam-diary-entries", [])
);

const [itineraryStops, setItineraryStops] = useState(() =>
readStorage("roam-itinerary-stops", [])
);

const [user, setUser] = useState(null);
const [authLoading, setAuthLoading] = useState(true);
const [tripsLoading, setTripsLoading] = useState(false);

useEffect(() => {
localStorage.setItem(
"roam-saved-places",
JSON.stringify(savedPlaces)
);
}, [savedPlaces]);

useEffect(() => {
localStorage.setItem(
"roam-trips",
JSON.stringify(trips)
);
}, [trips]);

useEffect(() => {
localStorage.setItem(
"roam-diary-entries",
JSON.stringify(diaryEntries)
);
}, [diaryEntries]);

useEffect(() => {
localStorage.setItem(
"roam-itinerary-stops",
JSON.stringify(itineraryStops)
);
}, [itineraryStops]);

// Restore the logged-in user when the app opens.
useEffect(() => {
async function restoreSession() {
if (!getToken()) {
setAuthLoading(false);
return;
}


  try {
    const data = await getCurrentUser();
    setUser(data.user ?? data);
  } catch {
    logoutUser();
    setUser(null);
  } finally {
    setAuthLoading(false);
  }
}

restoreSession();


}, []);

// Load trips from PostgreSQL for the logged-in user.
useEffect(() => {
if (!user) return;


let cancelled = false;

async function loadTrips() {
  setTripsLoading(true);

  try {
    const backendTrips = await fetchTrips();

    if (!cancelled) {
      const formattedTrips = backendTrips.map(formatTrip);

      // Retain older local trips that have not been migrated.
      const localTrips = readStorage("roam-trips", []);

      const legacyTrips = localTrips.filter(
        (trip) => typeof trip.id === "number"
      );

      setTrips([
        ...formattedTrips,
        ...legacyTrips,
      ]);
    }
  } catch (error) {
    console.error(
      "Could not load trips:",
      error.message
    );
  } finally {
    if (!cancelled) {
      setTripsLoading(false);
    }
  }
}

loadTrips();

return () => {
  cancelled = true;
};


}, [user]);

function toggleSavedPlace(id) {
setSavedPlaces((current) => {
if (current.includes(id)) {
return current.filter(
(placeId) => placeId !== id
);
}


  return [...current, id];
});


}

// New trips are saved in PostgreSQL.
async function addTrip(trip) {
const savedTrip = await createTripApi(trip);
const formattedTrip = formatTrip(savedTrip);


setTrips((current) => [
  formattedTrip,
  ...current.filter(
    (item) =>
      String(item.id) !== String(formattedTrip.id)
  ),
]);

return formattedTrip;


}

// Numeric IDs belong to older local trips.
// PostgreSQL-generated IDs are strings.
async function updateTrip(id, changes) {
if (typeof id === "number") {
setTrips((current) =>
current.map((trip) =>
trip.id === id
? { ...trip, ...changes }
: trip
)
);


  return;
}

const updatedTrip = await updateTripApi(id, changes);
const formattedTrip = formatTrip(updatedTrip);

setTrips((current) =>
  current.map((trip) =>
    String(trip.id) === String(id)
      ? formattedTrip
      : trip
  )
);

return formattedTrip;


}

async function deleteTrip(id) {
if (typeof id !== "number") {
await deleteTripApi(id);
}


setTrips((current) =>
  current.filter(
    (trip) => String(trip.id) !== String(id)
  )
);


}

function addDiaryEntry(entry) {
setDiaryEntries((current) => [
...current,
{ ...entry, id: Date.now() },
]);
}

function updateDiaryEntry(id, changes) {
setDiaryEntries((current) =>
current.map((entry) =>
entry.id === id
? { ...entry, ...changes }
: entry
)
);
}

function deleteDiaryEntry(id) {
setDiaryEntries((current) =>
current.filter((entry) => entry.id !== id)
);
}

// Load itinerary stops for a PostgreSQL trip.
const loadItinerary = useCallback(async (tripId) => {
if (typeof tripId === "number") {
return;
}


const backendStops = await fetchItinerary(tripId);

const formattedStops = backendStops.map((stop) =>
  formatStop(stop, tripId)
);

setItineraryStops((current) => [
  ...current.filter(
    (stop) => String(stop.tripId) !== String(tripId)
  ),
  ...formattedStops,
]);


}, []);

// Add a stop to PostgreSQL for database trips.
// Keep older local trips working as before.
async function addItineraryStop(stop) {
if (typeof stop.tripId === "number") {
const id = `${stop.tripId}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;


  setItineraryStops((current) => {
    const tripStops = current.filter(
      (item) =>
        String(item.tripId) === String(stop.tripId)
    );

    const nextOrder =
      tripStops.length === 0
        ? 1
        : Math.max(
            ...tripStops.map((item) => item.order)
          ) + 1;

    return [
      ...current,
      { ...stop, id, order: nextOrder },
    ];
  });

  return;
}

const existingStops = itineraryStops.filter(
  (item) =>
    String(item.tripId) === String(stop.tripId)
);

const nextOrder =
  existingStops.length === 0
    ? 1
    : Math.max(
        ...existingStops.map((item) => item.order)
      ) + 1;

const savedStop = await createItineraryStopApi(
  stop.tripId,
  {
    ...stop,
    order: nextOrder,
  }
);

const formattedStop = formatStop(
  savedStop,
  stop.tripId
);

setItineraryStops((current) => [
  ...current,
  formattedStop,
]);

return formattedStop;


}

// Update a stop in PostgreSQL for database trips.
function updateItineraryStop(id, changes) {
return updateItineraryStopAsync(id, changes);
}

async function updateItineraryStopAsync(id, changes) {
const existingStop = itineraryStops.find(
(stop) => String(stop.id) === String(id)
);


if (!existingStop) {
  return;
}

if (typeof existingStop.tripId === "number") {
  setItineraryStops((current) =>
    current.map((stop) =>
      String(stop.id) === String(id)
        ? { ...stop, ...changes }
        : stop
    )
  );

  return;
}

const updatedStop = await updateItineraryStopApi(
  existingStop.tripId,
  id,
  changes
);

const formattedStop = formatStop(
  updatedStop,
  existingStop.tripId
);

setItineraryStops((current) =>
  current.map((stop) =>
    String(stop.id) === String(id)
      ? formattedStop
      : stop
  )
);

return formattedStop;


}

// Delete a stop from PostgreSQL for database trips.
async function deleteItineraryStop(id) {
const existingStop = itineraryStops.find(
(stop) => String(stop.id) === String(id)
);


if (!existingStop) {
  return;
}

if (typeof existingStop.tripId !== "number") {
  await deleteItineraryStopApi(
    existingStop.tripId,
    id
  );
}

setItineraryStops((current) =>
  current.filter(
    (stop) => String(stop.id) !== String(id)
  )
);


}

async function login(email, password) {
const data = await loginUser(email, password);
setUser(data.user ?? data);
return data;
}

async function register(name, email, password) {
const data = await registerUser(
name,
email,
password
);


setUser(data.user ?? data);
return data;


}

function logout() {
logoutUser();
setUser(null);
}

return (
<RoamContext.Provider
value={{
user,
authLoading,
tripsLoading,
login,
register,
logout,
savedPlaces,
toggleSavedPlace,
trips,
addTrip,
updateTrip,
deleteTrip,
diaryEntries,
addDiaryEntry,
updateDiaryEntry,
deleteDiaryEntry,
itineraryStops,
loadItinerary,
addItineraryStop,
updateItineraryStop,
deleteItineraryStop,
}}
>
{children}
</RoamContext.Provider>
);
}

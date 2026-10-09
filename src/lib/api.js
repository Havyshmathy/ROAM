const API_BASE_URL =
import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "roam-token";

export function getToken() {
return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, options = {}) {
const token = getToken();

const response = await fetch(`${API_BASE_URL}${path}`, {
...options,
headers: {
"Content-Type": "application/json",
...(token ? { Authorization: `Bearer ${token}` } : {}),
...options.headers,
},
});

const data = await response.json().catch(() => ({}));

if (!response.ok) {
throw new Error(data.message || "Something went wrong. Please try again.");
}

return data;
}

export async function registerUser(name, email, password) {
const data = await apiRequest("/auth/register", {
method: "POST",
body: JSON.stringify({ name, email, password }),
});

if (data.token) saveToken(data.token);
return data;
}

export async function loginUser(email, password) {
const data = await apiRequest("/auth/login", {
method: "POST",
body: JSON.stringify({ email, password }),
});

if (data.token) saveToken(data.token);
return data;
}

export async function getCurrentUser() {
return apiRequest("/auth/me");
}

export function logoutUser() {
clearToken();
}

export async function getTrips() {
  const data = await apiRequest("/trips");
  return data.trips;
}

export async function createTrip(trip) {
  const data = await apiRequest("/trips", {
    method: "POST",
    body: JSON.stringify({
      title: trip.name,
      destination: trip.destination,
      description: trip.notes,
      startDate: trip.startDate || null,
      endDate: trip.endDate || null,
    }),
  });

  return data.trip;
}

export async function updateTripApi(id, trip) {
  const data = await apiRequest(`/trips/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      title: trip.name,
      destination: trip.destination,
      description: trip.notes,
      startDate: trip.startDate || null,
      endDate: trip.endDate || null,
    }),
  });

  return data.trip;
}

export async function deleteTripApi(id) {
  return apiRequest(`/trips/${id}`, {
    method: "DELETE",
  });
}

export async function getItinerary(tripId) {
  const data = await apiRequest(
    `/trips/${tripId}/itinerary`
  );
  return data.stops;
}

export async function createItineraryStop(tripId, stop) {
  const data = await apiRequest(
    `/trips/${tripId}/itinerary`,
    {
      method: "POST",
      body: JSON.stringify({
        title: stop.name,
        description: stop.description || "",
        visitDate: stop.visitDate || null,
        dayNumber: stop.dayNumber || 1,
        position: stop.position ?? stop.order ?? 0,
      }),
    }
  );

  return data.stop;
}

export async function updateItineraryStopApi(
  tripId,
  stopId,
  changes
) {
  const body = {};

  if (changes.name !== undefined) {
    body.title = changes.name;
  }

  if (changes.description !== undefined) {
    body.description = changes.description;
  }

  if (changes.visitDate !== undefined) {
    body.visitDate = changes.visitDate || null;
  }

  if (changes.dayNumber !== undefined) {
    body.dayNumber = changes.dayNumber;
  }

  if (changes.position !== undefined || changes.order !== undefined) {
    body.position = changes.position ?? changes.order;
  }

  const data = await apiRequest(
    `/trips/${tripId}/itinerary/${stopId}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );

  return data.stop;
}

export async function deleteItineraryStopApi(tripId, stopId) {
  return apiRequest(
    `/trips/${tripId}/itinerary/${stopId}`,
    { method: "DELETE" }
  );
}

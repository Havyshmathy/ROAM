
import { useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";

import { places } from "./data/places";
import { useRoam } from "./context/useRoam";
import Layout from "./components/Layout";
import TripModal from "./components/TripModal";

import Discover from "./pages/Discover";
import Atlas from "./pages/Atlas";
import Trips from "./pages/Trips";
import Diaries from "./pages/Diaries";
import Saved from "./pages/Saved";
import TripDetails from "./pages/TripDetails";
import Auth from "./pages/Auth";

function ProtectedLayout() {
  const { user, authLoading } = useRoam();

  if (authLoading) {
    return <p>Loading your ROAM session...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
}

function App() {
  const navigate = useNavigate();

  const {
    savedPlaces,
    toggleSavedPlace,
    trips,
    addTrip,
    updateTrip,
  } = useRoam();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Everything");

  const [showTripForm, setShowTripForm] = useState(false);
  const [tripName, setTripName] = useState("");
  const [tripDestination, setTripDestination] = useState("");
  const [tripStartDate, setTripStartDate] = useState("");
  const [tripEndDate, setTripEndDate] = useState("");
  const [tripNotes, setTripNotes] = useState("");
  const [editingTripId, setEditingTripId] = useState(null);
  const [notice, setNotice] = useState("");

  const filteredPlaces = useMemo(
    () =>
      places.filter((place) => {
        const searchableText = [
          place.name,
          place.country,
          place.description,
          ...place.tags,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch = searchableText.includes(
          search.toLowerCase()
        );

        const matchesCategory =
          category === "Everything" || place.category === category;

        return matchesSearch && matchesCategory;
      }),
    [search, category]
  );

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2300);
  }

  function toggleSaved(id) {
    const wasSaved = savedPlaces.includes(id);

    toggleSavedPlace(id);

    showNotice(
      wasSaved
        ? "Removed from your atlas"
        : "Tucked into your atlas ✨"
    );
  }

  
  function openTripForm(trip = null) {
    setTripName(trip?.name || "");
    setTripDestination(trip?.destination || "");
    setTripStartDate(trip?.startDate || "");
    setTripEndDate(trip?.endDate || "");
    setTripNotes(trip?.notes || "");
    setEditingTripId(trip?.id ?? null);
    setShowTripForm(true);
  }

  

    async function createTrip(event) {
      event.preventDefault();

      if (!tripName.trim() || !tripDestination.trim()) return;

      const trip = {
        name: tripName.trim(),
        destination: tripDestination.trim(),
        startDate: tripStartDate,
        endDate: tripEndDate,
        notes: tripNotes.trim(),
        date:
          tripStartDate && tripEndDate
            ? `${tripStartDate} – ${tripEndDate}`
            : tripStartDate
              ? `From ${tripStartDate}`
              : "Dates TBD · Adventure pending",
      };

      const isEditing = editingTripId !== null;

      try {
        if (isEditing) {
          await updateTrip(editingTripId, trip);
        } else {
          await addTrip(trip);
        }

        setTripName("");
        setTripDestination("");
        setTripStartDate("");
        setTripEndDate("");
        setTripNotes("");
        setEditingTripId(null);
        setShowTripForm(false);

        navigate("/trips");

        showNotice(
          isEditing
            ? "Trip details updated ✨"
            : "Your next adventure has entered the chat ✈️"
        );
      } catch (error) {
        showNotice(error.message || "Could not save your trip. Please try again.");
      }
    }


  function resetDiscover() {
    setCategory("Everything");
    setSearch("");
  }

  function goTo(path) {
    resetDiscover();
    navigate(path);
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<Auth />} />

        <Route element={<ProtectedLayout />}>
          <Route
            path="/"
            element={<Navigate to="/discover" replace />}
          />

          <Route
            path="/discover"
            element={
              <Discover
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                filteredPlaces={filteredPlaces}
                saved={savedPlaces}
                toggleSaved={toggleSaved}
                openTripForm={openTripForm}
                trips={trips}
              />
            }
          />

          
          <Route
            path="/atlas"
            element={
              <Atlas
                savedPlaces={savedPlaces}
                goTo={goTo}
              />
            }
          />

          <Route
            path="/trips"
            element={
              <Trips
                trips={trips}
                openTripForm={openTripForm}
              />
            }
          />

          <Route
            path="/trips/:id"
            element={
              <TripDetails
                setNotice={showNotice}
                openTripForm={openTripForm}
              />
            }
          />

          <Route
            path="/diaries"
            element={<Diaries setNotice={showNotice} />}
          />

          <Route
            path="/saved"
            element={
              <Saved
                savedPlaces={savedPlaces}
                toggleSaved={toggleSaved}
                openTripForm={openTripForm}
                goTo={goTo}
              />
            }
          />

          <Route
            path="*"
            element={<Navigate to="/discover" replace />}
          />
        </Route>
      </Routes>

      
      <TripModal
        showTripForm={showTripForm}
        setShowTripForm={setShowTripForm}
        createTrip={createTrip}
        tripName={tripName}
        setTripName={setTripName}
        tripDestination={tripDestination}
        setTripDestination={setTripDestination}
        tripStartDate={tripStartDate}
        setTripStartDate={setTripStartDate}
        tripEndDate={tripEndDate}
        setTripEndDate={setTripEndDate}
        tripNotes={tripNotes}
        setTripNotes={setTripNotes}
        editingTripId={editingTripId}
      />

      {notice && <div className="toast">{notice}</div>}
    </>
  );
}

export default App;
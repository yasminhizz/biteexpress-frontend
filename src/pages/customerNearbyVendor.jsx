import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header1";
import "./customerNearbyVendor.css";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";


const mapContainerStyle = {
  width: "100%",
  height: "400px",
};


const UITM_DEFAULT_COORDS = {
  lat: 3.072143788985748,
  lng: 101.49967247273597,
};


const UITM_BOUNDS = {
  north: 3.0825,
  south: 3.065,
  east: 101.505,
  west: 101.488,
};


export default function CustomerNearbyVendor() {
  const navigate = useNavigate();
  const mapRef = useRef(null);


  const [mapCenter, setMapCenter] = useState(UITM_DEFAULT_COORDS);
  const [userCoords, setUserCoords] = useState(UITM_DEFAULT_COORDS);
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [allVendors, setAllVendors] = useState([]);
  const [vendorsWithin1km, setVendorsWithin1km] = useState([]);
  const [vendorsWithin2km, setVendorsWithin2km] = useState([]);
  const [vendorsWithin3km, setVendorsWithin3km] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [showLocationPopup, setShowLocationPopup] = useState(true);


  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBl3CsmsR1nVz-JIHYh2VERjtHfZs_IJEg",
  });


  const isInsideUitm = ({ lat, lng }) =>
    lat >= UITM_BOUNDS.south &&
    lat <= UITM_BOUNDS.north &&
    lng >= UITM_BOUNDS.west &&
    lng <= UITM_BOUNDS.east;


  const handleDismissPopup = (coords = UITM_DEFAULT_COORDS, allowed = false) => {
    setUserCoords(coords);
    setMapCenter(coords);
    setLocationAllowed(allowed);
    setShowLocationPopup(false);
  };


  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const detected = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        const finalCoords = isInsideUitm(detected)
          ? detected
          : UITM_DEFAULT_COORDS;
        handleDismissPopup(finalCoords, true);
      },
      () => handleDismissPopup(UITM_DEFAULT_COORDS, false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };


  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/vendors/all");
        const data = await res.json();
        setAllVendors(data.allVendors || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingVendors(false);
      }
    };
    fetchVendors();
  }, []);


  useEffect(() => {
    if (!locationAllowed || !allVendors.length) return;


    const R = 6371;
    const haversine = (lat1, lon1, lat2, lon2) => {
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };


    const sorted = allVendors
      .map(v => ({
        ...v,
        distance: haversine(
          userCoords.lat,
          userCoords.lng,
          v.latitude,
          v.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance);


    setVendorsWithin1km(sorted.filter(v => v.distance <= 1).slice(0, 5));
    setVendorsWithin2km(
      sorted.filter(v => v.distance > 1 && v.distance <= 2).slice(0, 5)
    );
    setVendorsWithin3km(
      sorted.filter(v => v.distance > 2 && v.distance <= 3).slice(0, 5)
    );
  }, [locationAllowed, allVendors, userCoords]);


  useEffect(() => {
    if (mapRef.current) {
      window.google.maps.event.trigger(mapRef.current, "resize");
      mapRef.current.setCenter(mapCenter);
    }
  }, [mapCenter]);


  if (loadError) return <div>Map failed to load</div>;
  if (!isLoaded) return <div>Loading map…</div>;


  return (
    <>
      <Header />


      {showLocationPopup && (
        <div className="location-toast">
          <strong>Allow BiteExpress to access your location?</strong>
          <p className="popup-message">
            BiteExpress currently only shows vendors within UiTM Shah Alam.
          </p>
          <div className="toast-actions">
            <button onClick={requestLocation}>Allow</button>
            <button onClick={() => handleDismissPopup()}>Later</button>
          </div>
        </div>
      )}


      <h1 className="page-title">Vendors Near You</h1>


      <div className="map-fullwidth">
        <div className="map-container">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={15}
            center={mapCenter}
            onLoad={map => (mapRef.current = map)}
          >
            {locationAllowed && (
              <Marker
                position={userCoords}
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                }}
                label={{ text: "You", fontWeight: "bold" }}
              />
            )}


            {allVendors.map(v => (
              <Marker
                key={v.id}
                position={{ lat: v.latitude, lng: v.longitude }}
                label={v.businessName?.charAt(0)}
                onClick={() => navigate(`/customer/vendor/${v.id}`)}
              />
            ))}
          </GoogleMap>
        </div>
      </div>


      <div className="nearby-vendors-page">
        {locationAllowed &&
          [
            { title: "Within 1 KM", data: vendorsWithin1km },
            { title: "Within 2 KM", data: vendorsWithin2km },
            { title: "Within 3 KM", data: vendorsWithin3km },
          ].map(
            section =>
              section.data.length > 0 && (
                <section key={section.title}>
                  <h3>{section.title}</h3>


                  <div className="vendors-row">
                    {section.data.map(v => (
                      <div
                        key={v.id}
                        className="vendor-card-rect"
                        onClick={() => navigate(`/customer/vendor/${v.id}`)}
                      >
                        <div className="vendor-avatar-rect">
                          {v.profileImageURL ? (
                            <img
                              src={v.profileImageURL}
                              alt={v.businessName}
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "";
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="vendor-initial">
                              {v.businessName?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="vendor-details">
                          <div className="vendor-name">{v.businessName}</div>
                          <div className="vendor-distance">
                            {v.distance.toFixed(2)} km
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
          )}
      </div>
    </>
  );
}

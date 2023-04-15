import { Loader } from "@googlemaps/js-api-loader";
import {
  ArrowsPointingOutIcon,
  ArrowsRightLeftIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/solid";
import maplibregl from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Map, { GeolocateControl, Layer, Marker, Source } from "react-map-gl";

import "maplibre-gl/dist/maplibre-gl.css";
import MapRouteList from "./MapRouteList";

// create a file called .env.local and root directory and place your API key
// VITE_GOOGLE_MAPS_API_KEY=<API_KEY>
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const layerStyle = {
  id: "route",
  type: "line",
  source: "route",
  layout: {
    "line-join": "round",
    "line-cap": "round",
  },
  paint: {
    "line-color": "#888",
    "line-width": 8,
  },
};

const MapComponent = () => {
  const [origin, setStartPosition] = useState();
  const [destination, setEndPosition] = useState();
  const [directionsData, setDirectionsData] = useState(null);

  const geolocateControlRef = useRef();
  const mapRef = useRef();

  useEffect(() => {
    if (origin && destination) {
      setDirectionsData(null);
      const loadingToastId = toast.loading("Fetching Routes");

      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: "weekly",
      });

      loader.load().then(async () => {
        const directionsService = new google.maps.DirectionsService();
        const { encoding } = await google.maps.importLibrary("geometry");

        const request = {
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          travelMode: "DRIVING",
        };

        directionsService.route(request, function (result, status) {
          toast.dismiss(loadingToastId);
          if (status == "OK") {
            const { overview_polyline, bounds, legs } = result.routes[0];
            const route = encoding.decodePath(overview_polyline);

            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();

            console.log(result);

            setDirectionsData({
              pathsInGeoJson: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: route.map((point) => [point.lng(), point.lat()]),
                },
              },
              bounds: [
                [ne.lng(), ne.lat()],
                [sw.lng(), sw.lat()],
              ],
            });
          } else if (status === "ZERO_RESULTS") {
            toast.error("No Direction found between the selected points");
          }
        });
      });
    }
  }, [origin, destination]);

  const handleMapClick = useCallback(
    (e) => {
      if (!origin) {
        setStartPosition(e.lngLat);
      } else {
        setEndPosition(e.lngLat);
      }
    },
    [origin, destination]
  );

  const handleLocateUserClick = useCallback((e) => {
    geolocateControlRef.current?.trigger();
    toast("Finding User Location", {
      icon: "📍",
    });
  }, []);

  const handleGeoLocateSuccess = (e) => {
    toast.dismiss();
    toast("User Location Found", {
      icon: "✅",
    });
  };

  const handleGeoLocateError = (e) => {
    toast.dismiss();
    toast("Unable to Find User Location", {
      icon: "❌",
    });
  };

  const handleSwapStartAndEndPoint = () => {
    if (origin && destination) {
      const endPositionTemp = destination;
      setEndPosition(origin);
      setStartPosition(endPositionTemp);
    }
  };

  const handleFitToBounds = () => {
    if (mapRef.current && directionsData) {
      mapRef.current.fitBounds(directionsData.bounds, {
        padding: { top: 100, left: 300, right: 100 },
        duration: 1000,
      });
    }
  };

  return (
    <div className="h-screen w-screen">
      <Map
        mapLib={maplibregl}
        mapStyle="https://demotiles.maplibre.org/style.json"
        onClick={handleMapClick}
        ref={mapRef}
      >
        {origin ? (
          <Marker longitude={origin.lng} latitude={origin.lat} />
        ) : null}

        {destination ? (
          <Marker
            longitude={destination.lng}
            latitude={destination.lat}
            color="#C90F1F"
          />
        ) : null}

        {directionsData ? (
          <Source
            id="route"
            type="geojson"
            data={directionsData.pathsInGeoJson}
          >
            <Layer {...layerStyle} />
          </Source>
        ) : null}

        <GeolocateControl
          style={{ display: "none" }}
          ref={geolocateControlRef}
          onGeolocate={handleGeoLocateSuccess}
          onError={handleGeoLocateError}
        />
      </Map>

      {directionsData ? (
        <MapRouteList
          paths={directionsData.pathsInGeoJson.geometry.coordinates}
        />
      ) : null}

      <div className="fixed bottom-4 right-4 z-10">
        <button
          type="button"
          className="rounded-l-lg bg-white p-3 hover:bg-gray-100"
          onClick={handleLocateUserClick}
        >
          <ViewfinderCircleIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          className=" bg-white p-3 hover:bg-gray-100"
          onClick={handleFitToBounds}
        >
          <ArrowsPointingOutIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="rounded-r-lg bg-white p-3 hover:bg-gray-100"
          onClick={handleSwapStartAndEndPoint}
        >
          <ArrowsRightLeftIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default MapComponent;

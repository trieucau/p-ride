// import { Loader } from "@googlemaps/js-api-loader";
// import { Box } from "@chakra-ui/react";
// import React, { useContext } from "react";

// // CONTEXT
// import { LocationContext } from "../../context/location";

// const Map = ({ h, w }) => {
//   const { currentLocation, pickUpLocation, dropLocation } =
//     useContext(LocationContext);

//   const loader = new Loader({
//     apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
//     version: "weekly",
//     libraries: ["places"],
//   });

//   React.useEffect(() => {
//     const debounceHandler = setTimeout(() => {
//       loader.load().then(() => {
//         const directionsService = new google.maps.DirectionsService();
//         const directionsRenderer = new google.maps.DirectionsRenderer();

//         directionsRenderer.setOptions({
//           polylineOptions: {
//             strokeColor: "#000ce6",
//           },
//         });

//         const map = new google.maps.Map(document.getElementById("map"), {
//           center: {
//             lat: currentLocation.geometry.lat || 12.9736067,
//             lng: currentLocation.geometry.lng || 77.5517457,
//           },
//           zoom: 15,
//         });

//         directionsRenderer.setMap(map);

//         if (pickUpLocation?.geometry?.lat && dropLocation?.geometry?.lng) {
//           directionsService
//             .route({
//               origin: {
//                 lat: pickUpLocation?.geometry?.lat || 0,
//                 lng: pickUpLocation?.geometry?.lng || 0,
//               },
//               destination: {
//                 lat: dropLocation?.geometry?.lat || 0,
//                 lng: dropLocation?.geometry?.lng || 0,
//               },
//               travelMode: google.maps.TravelMode.DRIVING,
//             })
//             .then((resp) => directionsRenderer.setDirections(resp))
//             .catch((err) => console.log(err));
//         }
//       });
//     }, 2000);

//     return () => {
//       clearTimeout(debounceHandler);
//     };
//   }, [loader, currentLocation, pickUpLocation, dropLocation]);

//   return <Box id="map" h={h || "100vh"} w={w || "100vw"} />;
// };

// export default Map;

// ----------------

import { Box } from "@chakra-ui/react";
import React, { useContext, useEffect, useRef } from "react";

// CONTEXT
import { LocationContext } from "../../context/location";

// UTILS
import { getRouteGeoJSON } from "../../utils/osrmRoute";

// OPENLAYERS
import MapOL from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

const Map = ({ h, w }) => {
  const { currentLocation, pickUpLocation, dropLocation } =
    useContext(LocationContext);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routeLayerRef = useRef(null);

  // INIT MAP (chỉ chạy 1 lần)
  useEffect(() => {
    if (mapInstance.current) return;

    const center = fromLonLat([
      currentLocation?.geometry?.lng || 77.5517457,
      currentLocation?.geometry?.lat || 12.9736067,
    ]);

    mapInstance.current = new MapOL({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center,
        zoom: 15,
      }),
    });
  }, []);

  // UPDATE ROUTE
  useEffect(() => {
    const drawRoute = async () => {
      if (!pickUpLocation?.lat || !dropLocation?.lat || !mapInstance.current)
        return;

      const geometry = await getRouteGeoJSON(pickUpLocation, dropLocation);
      if (!geometry) return;

      const coords = geometry.coordinates.map((c) => fromLonLat(c));

      const feature = new Feature({
        geometry: new LineString(coords),
      });

      feature.setStyle(
        new Style({
          stroke: new Stroke({
            color: "#000ce6",
            width: 4,
          }),
        })
      );

      const source = new VectorSource({
        features: [feature],
      });

      // remove old route
      if (routeLayerRef.current) {
        mapInstance.current.removeLayer(routeLayerRef.current);
      }

      const vectorLayer = new VectorLayer({ source });
      routeLayerRef.current = vectorLayer;
      mapInstance.current.addLayer(vectorLayer);
    };

    drawRoute();
  }, [pickUpLocation, dropLocation]);

  return <Box ref={mapRef} h={h || "100vh"} w={w || "100vw"} />;
};

export default Map;

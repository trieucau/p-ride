// import { Loader } from "@googlemaps/js-api-loader";
// import { Box } from "@chakra-ui/react";
// import React, { useContext, useMemo } from "react";
// import { useRouter } from "next/router";
// import { LocationContext } from "context/Location";

// const Map: React.FC<{ isRideStarted: boolean }> = ({ isRideStarted }) => {
//   const loader = useMemo(
//     () =>
//       new Loader({
//         apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY as string,
//         version: "weekly",
//         libraries: ["places"],
//       }),
//     []
//   );

//   const router = useRouter();

//   const { getRideDetails, currentLocation } = useContext(LocationContext);

//   React.useEffect(() => {
//     loader.load().then(async () => {
//       const map = new google.maps.Map(
//         document.getElementById("map") as HTMLElement,
//         {
//           center: {
//             lat: 12.9736067,
//             lng: 77.5517457,
//           },
//           zoom: 15,
//         }
//       );

//       const directionsService = new google.maps.DirectionsService();
//       const directionsRenderer = new google.maps.DirectionsRenderer();

//       directionsRenderer.setOptions({
//         polylineOptions: {
//           strokeColor: "#000ce6",
//         },
//       });

//       directionsRenderer.setMap(map);
//       if (!router?.query?.id) return;

//       const ride = getRideDetails(router.query?.id as string);

//       if (!ride) return;

//       let origin = currentLocation.geometry;
//       let destination = ride?.from?.geometry;

//       if (isRideStarted) {
//         origin = ride?.from?.geometry;
//         destination = ride?.to?.geometry;
//       }

//       console.log(origin, destination);

//       directionsService
//         .route({
//           origin,
//           destination,
//           travelMode: google.maps.TravelMode.DRIVING,
//         })
//         .then((resp) => directionsRenderer.setDirections(resp))
//         .catch((err) => console.log(err));
//     });
//   }, [loader, router, isRideStarted, currentLocation]);

//   return <Box id="map" h={"100%"} w={"100%"} />;
// };

// export default Map;

// -----------------

import { Box } from "@chakra-ui/react";
import React, { useContext, useEffect, useRef } from "react";
import { useRouter } from "next/router";

// CONTEXT
import { LocationContext } from "context/Location";

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

// UTILS
import { getRouteGeoJSON } from "utils/osrmRoute.js";

const Map: React.FC<{ isRideStarted: boolean }> = ({ isRideStarted }) => {
  const router = useRouter();
  const { getRideDetails, currentLocation } = useContext(LocationContext);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<MapOL | null>(null);
  const routeLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  // INIT MAP (1 lần)
  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return;

    mapInstance.current = new MapOL({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([77.5517457, 12.9736067]),
        zoom: 15,
      }),
    });
  }, []);

  // DRAW ROUTE
  useEffect(() => {
    const drawRoute = async () => {
      if (!router?.query?.id || !mapInstance.current) return;

      const ride = getRideDetails(router.query.id as string);
      if (!ride) return;

      let origin = currentLocation.geometry;
      let destination = ride.from.geometry;

      if (isRideStarted) {
        origin = ride.from.geometry;
        destination = ride.to.geometry;
      }

      const geometry = await getRouteGeoJSON(origin, destination);
      if (!geometry) return;

      const coords = geometry.coordinates.map((c: number[]) => fromLonLat(c));

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

      // clear old route
      if (routeLayerRef.current) {
        mapInstance.current.removeLayer(routeLayerRef.current);
      }

      const layer = new VectorLayer({ source });
      routeLayerRef.current = layer;
      mapInstance.current.addLayer(layer);
    };

    drawRoute();
  }, [router, isRideStarted, currentLocation]);

  return <Box ref={mapRef} h="100%" w="100%" />;
};

export default Map;

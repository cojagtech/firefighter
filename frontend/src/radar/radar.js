import { calculateDistance } from "../utils/distance";

export function findNearestVehicles(incident, engines) {
  let radius = 1;
  const maxRadius = 20;
  let detected = [];

  while (radius <= maxRadius) {
    detected = engines
      .map((engine) => {
        const distance = calculateDistance(
          incident.lat,
          incident.lng,
          parseFloat(engine.latitude),
          parseFloat(engine.longitude)
        );

        return {
          ...engine,
          distance,
        };
      })
      .filter((engine) => engine.distance <= radius);

    if (detected.length > 0) {
      break;
    }

    radius++;
  }

  detected.sort((a, b) => a.distance - b.distance);

  return detected;
}
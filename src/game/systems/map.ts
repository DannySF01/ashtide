export type LocationType =
  | "resource"
  | "ruins"
  | "tribe_camp"
  | "danger"
  | "unknown";
export type LocationState = "undiscovered" | "discovered" | "explored";

export interface MapLocation {
  id: string;
  name: string;
  type: LocationType;
  state: LocationState;
  distanceTicks: number; // travel + explore time
  riskBaseChance: number;
  x: number; // position on the map display, 0-100 (percentage)
  y: number;
}

export function discoverLocation(location: MapLocation): MapLocation {
  if (location.state !== "undiscovered") return location;
  return { ...location, state: "discovered" };
}

export function markExplored(location: MapLocation): MapLocation {
  return { ...location, state: "explored" };
}

/** Locations the player can currently travel to: discovered but not yet explored. */
export function getAvailableLocations(locations: MapLocation[]): MapLocation[] {
  return locations.filter((l) => l.state === "discovered");
}

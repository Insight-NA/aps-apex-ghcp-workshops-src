export interface Route {
    legs: Leg[];
    geometry: GeoJSON.Feature;
    distance: number;
    duration: number;
}

export interface Leg {
    steps: Step[];
    summary: string;
    distance: number;
    duration: number;
}

export interface Step {
    instruction: string;
    distance: number;
    duration: number;
    location: [number, number];
}

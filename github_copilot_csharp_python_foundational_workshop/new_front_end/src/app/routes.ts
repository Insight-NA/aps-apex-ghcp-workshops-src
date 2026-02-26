import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { TripPlanner } from "./components/TripPlanner";
import { SavedTrips } from "./components/SavedTrips";
import { SharedTrips } from "./components/SharedTrips";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: TripPlanner },
      { path: "saved", Component: SavedTrips },
      { path: "shared", Component: SharedTrips },
    ],
  },
]);

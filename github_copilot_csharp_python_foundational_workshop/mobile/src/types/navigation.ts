export type RootStackParamList = {
    Auth: undefined;
    App: undefined;
};

export type AuthStackParamList = {
    Landing: undefined;
    Login: undefined;
};

export type AppStackParamList = {
    Tabs: undefined;
    TripDetail: { tripId: string };
    TripPlanner: { tripId?: string };
    PlaceDetail: { placeId: string };
};

export type MainTabParamList = {
    Home: undefined;
    Trips: undefined;
    Explore: undefined;
    NewTrip: undefined;
    Profile: undefined;
};

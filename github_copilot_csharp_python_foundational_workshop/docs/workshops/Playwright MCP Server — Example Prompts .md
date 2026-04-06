Playwright MCP Server — Example Prompts for Road Trip App
1. Screenshot & Visual Snapshot of Each Route

Using the Playwright MCP server, navigate to http://localhost:5173/ and take a screenshot.Then navigate to /explore, /itinerary, /trips, /start, and /all-trips in sequence,taking a screenshot of each page and saving them to a folder called e2e-screenshots/.Finally, assert that each page has the title "Road Trip Planner".
2. Explore Page — Search & Category Filter

Using the Playwright MCP server, navigate to http://localhost:5173/explore.Type "Yellowstone" into the search input with placeholder "Search and Explore".Wait for search result cards to appear, then take a screenshot.Next, click the "Parks & Nature" category pill and verify that the results update.Click the first result card's "Add to Trip" button and confirm a toast notification appears.

3. Itinerary — Add Stops, Calculate Route, and Optimize
Using the Playwright MCP server:
1. Navigate to http://localhost:5173/itinerary.
2. Click the "Itinerary" tab if it is not already active.
3. Find the input with placeholder "Add a stop (City, Place)..." and type "Denver, CO", then press Enter.
4. Add a second stop: "Salt Lake City, UT", then press Enter.
5. Add a third stop: "Las Vegas, NV", then press Enter.
6. Verify 3 stop items appear in the stops list.
7. Click the "Calculate Route" button and wait for the route to load.
8. Assert the "Optimize" button becomes visible.
9. Click "Optimize" and verify the stop order may have changed.
10. Take a screenshot of the final state.

4. Vehicle Tab — Dropdown Selection & AI Analyzer
Using the Playwright MCP server:
1. Navigate to http://localhost:5173/itinerary.
2. Click the "Vehicle" tab.
3. Assert that the vehicle type dropdown is visible.
4. Select "RV Large" from the vehicle type dropdown.
5. Verify that Height, Weight, Width, Range, and MPG inputs are updated with new values.
6. Find the custom vehicle AI text input and type: "2023 Ford F-150 with a 36-gallon tank and 20 MPG highway".
7. Click the "Analyze" button.
8. Wait for the vehicle dimension inputs to be populated by the AI response.
9. Take a screenshot of the populated vehicle specs form.

5. Directions Tab — Turn-by-Turn Review
Using the Playwright MCP server:
1. Navigate to http://localhost:5173/itinerary.
2. Add stops: "Los Angeles, CA" and "San Francisco, CA" using the stop input.
3. Click "Calculate Route" and wait for route data to load.
4. Click the "Directions" tab.
5. Assert that at least one leg header is visible containing a distance and duration.
6. Assert that individual step instructions are rendered in the list.
7. Scroll down the directions panel and take a screenshot.

6. Save Trip — Unauthenticated Flow & Demo Login
Using the Playwright MCP server:
1. Navigate to http://localhost:5173/itinerary.
2. Add two stops: "Austin, TX" and "Nashville, TN".
3. Scroll to the Save Trip section at the bottom of the Itinerary tab.
4. Fill in the trip name input with "Southern Road Trip".
5. Fill in the description textarea with "From Texas to Tennessee".
6. Assert that the "Demo Login" button is visible (user is unauthenticated).
7. Click "Demo Login" and wait for the auth:login event or for the AuthStatus component to appear in the top-right.
8. Now click the "Save" button and wait for the success toast notification.
9. Take a screenshot confirming the save was successful.

7. My Trips Page — Auth Guard & Empty State
Using the Playwright MCP server:
1. Navigate to http://localhost:5173/trips.
2. Assert that a "Sign in to see your trips" message is visible (unauthenticated state).
3. Evaluate localStorage to confirm no "token" key is present.
4. Inject a fake token into localStorage: execute JS to set localStorage.setItem('token', 'test-token')
   and localStorage.setItem('user_email', 'test@example.com').
5. Reload the page.
6. Assert that the loading spinner appears, then resolves to either a trip list or empty state message.
7. Take a screenshot of the authenticated empty state.

8. Start Trip — Template Navigation
Using the Playwright MCP server:
1. Navigate to http://localhost:5173/start.
2. Assert that four quick-start template cards are visible:
   "Weekend Getaway", "Cross Country", "National Parks", "Hidden Gems".
3. Click the "Weekend Getaway" card.
4. Assert the browser navigates to http://localhost:5173/itinerary.
5. Go back to /start.
6. Click the "AI Trip Planner" button (gradient button).
7. Assert navigation to /itinerary again.
8. Go back to /start and click "Start from scratch".
9. Assert navigation to /itinerary.
# FarmPlus: AI Crop Yield Prediction Platform
## Official Technical Documentation

---

## 1. Project Overview

### Project Title
**FarmPlus: AI-Powered Crop Yield Prediction and Advisory System**

### Problem Statement
Farmers face significant uncertainty due to unpredictable weather patterns, climate change, and volatile environmental factors. Traditional farming methods rely heavily on intuition and historical norms, which are becoming less reliable. Without data-driven insights, farmers struggle to optimize their inputs (fertilizer, pesticide, irrigation), leading to suboptimal yields, financial losses, and resource wastage. Furthermore, farmers lack real-time, localized environmental alerts (like sudden rain or frost) that could prevent catastrophic crop damage.

### Objectives
1. Provide accurate, data-driven crop yield predictions using Machine Learning algorithms based on historical data, weather, and soil inputs.
2. Deliver actionable, crop-specific agricultural recommendations to optimize yield.
3. Enable proactive disaster mitigation through real-time, GPS-localized weather monitoring and SMS alerts.
4. Establish a continuous feedback loop where applied recommendations update the yield prediction, helping farmers quantify the ROI of their actions.

### Target Users
*   **Small to Medium-Scale Farmers:** Looking to optimize resource usage and improve yields.
*   **Agricultural Extension Workers:** Using the tool to advise groups of farmers.
*   **Agri-Business Consultants:** Planning supply chain logistics based on regional yield predictions.

### Real-world Impact
FarmPlus bridges the gap between advanced data science and on-the-ground agriculture. By converting complex ML outputs into plain-language advice and SMS alerts, it empowers rural farmers to make informed decisions, reduce input wastage (fertilizer/pesticide runoff), and protect their livelihoods against extreme weather events.

### Why this project was built
The project was conceptualized to address the stark lack of accessible, user-friendly precision agriculture tools in developing regions. While ML models for agriculture exist, they are rarely packaged in a localized, accessible dashboard with offline notification capabilities (SMS) tailored for the end user.

### Unique Features and Innovations
*   **Closed-Loop Action Tracking:** Unlike static calculators, when a farmer marks a recommendation as "Applied" and inputs their new fertilizer/pesticide value, the system instantly recalculates their predicted yield to show the exact quantitative improvement.
*   **Hyper-local SMS Alerts:** Integrates GPS map picking with OpenWeatherMap and Twilio to scan forecasts automatically and send localized SMS warnings for rain, frost, or extreme heat.
*   **Microservice Architecture:** Clean separation of concerns using an Express.js Node backend for business logic/auth and a dedicated Python FastAPI service for heavy ML computations.

---

## 2. System Architecture

### High-Level Architecture Explanation
FarmPlus operates on a modern, containerized microservices architecture to ensure scalability and separation of concerns.
*   **Client Layer:** A React.js Single Page Application (SPA) providing a responsive dashboard and map-based interfaces.
*   **API Gateway / Business Logic Layer:** A Node.js/Express backend that handles user authentication, CRUD operations, profile management, and coordinates external API calls.
*   **Machine Learning Layer:** A Python FastAPI microservice that loads pre-trained scikit-learn models (`crop_yield_model.pkl`, `scaler.pkl`) to perform inference and scenario analysis.
*   **Data Persistence Layer:** MongoDB for storing user profiles, prediction histories, and action-tracking recommendations.
*   **External Integrations:** OpenWeatherMap (Weather data) and Twilio (SMS delivery).

### Complete Data Flow
1.  **User Input:** The farmer submits farm parameters (area, rainfall, fertilizer, etc.) via the React frontend.
2.  **Request Handling:** The frontend makes a REST API call to the Express backend (`/api/predictions`).
3.  **ML Inference:** The Express backend proxies the numerical data to the FastAPI ML service (`/predict-with-confidence`).
4.  **Advisory Generation:** FastAPI returns the yield prediction. The Express backend uses its `recommendationsEngine` to generate contextual advice based on the ML results and input thresholds.
5.  **Storage:** The Express backend saves both the prediction and the generated recommendations into MongoDB.
6.  **Response:** The combined data is returned to the React frontend and visualized on the dashboard.
7.  **Background Processing:** A cron job runs on the Express server every 6 hours, scanning registered GPS coordinates, fetching weather data from OpenWeatherMap, and triggering Twilio SMS alerts if severe weather is detected.

---

## 3. Feature Breakdown (Detailed)

### Farmer Registration and Authentication
*   **Purpose:** Securely identify farmers and segregate data.
*   **How it works:** Users register using a phone number. Twilio Verify API sends an OTP. Upon verification, the backend issues a JSON Web Token (JWT).
*   **Workflow:** Enter phone number -> Receive OTP -> Submit OTP -> Receive JWT -> Redirect to Dashboard.
*   **Backend workflow:** `POST /api/auth/send-verification` -> `POST /api/auth/verify-code` -> Generate JWT.
*   **Files Involved:** `AuthPage.jsx`, `auth.js` (Routes), `User.js` (Model).
*   **DB Collections:** `users`.

### Farm Location Management
*   **Purpose:** Pinpoint the exact location of the farm for accurate weather data.
*   **How it works:** Uses `react-leaflet` to display an interactive map. Users can auto-detect via HTML5 Geolocation, search via Nominatim API, or click on the map.
*   **Data flow:** Frontend coordinates -> `PATCH /api/profile` -> Saved as `farm_lat` and `farm_lng` in DB.
*   **Files Involved:** `FarmLocationPicker.jsx`, `profile.js`.

### Weather Monitoring & Rain Prediction System
*   **Purpose:** Display real-time environmental data on the dashboard.
*   **How it works:** The frontend pings the backend, which requests current weather and a 5-day forecast from OpenWeatherMap using the user's `farm_lat` and `farm_lng`. The backend analyzes the 3-hour precipitation probabilities.
*   **API Endpoints:** `GET /api/weather/current`, `GET /api/weather/forecast`.
*   **Files Involved:** `weatherService.js`, `weather.js` (Routes), `DashboardPage.jsx`.

### Real SMS Alert System
*   **Purpose:** Notify farmers offline about critical events.
*   **How it works:** A cron job (`setInterval`) triggers `sendBulkWeatherAlerts()` every 6 hours. It filters users with `sms_alerts_enabled: true`, checks their forecast, and if rain > 5mm, wind > 15m/s, or extreme temps are found, uses `twilioClient.messages.create` to send an SMS.
*   **Technologies:** Twilio Programmable SMS, Node.js Timers.
*   **Files Involved:** `smsService.js`, `server.js`.

### Crop Recommendation Engine
*   **Purpose:** Provide actionable advice based on prediction inputs.
*   **How it works:** The `recommendationsEngine.js` evaluates inputs against optimal ranges (`OPTIMAL_RANGES`). E.g., if input fertilizer is 30kg/ha but optimal is 80kg/ha, it generates a "Low Fertilizer" warning recommendation.

### Recommendation Tracking and Feedback System
*   **Purpose:** Allow farmers to track actions and see immediate yield improvements.
*   **How it works:** When a user clicks "Apply" on a recommendation (e.g., Fertilizer) and enters a new value (e.g., 50kg), the frontend calls `PATCH /api/recommendations/:id/apply`. The backend marks the recommendation as applied, replaces the old fertilizer value with the new one, re-runs the FastAPI prediction, saves a *new* prediction document, and returns the updated yield.
*   **Files Involved:** `RecommendationsPanel.jsx`, `recommendations.js`.

### Dashboard and Analytics
*   **Purpose:** High-level overview of farming operations.
*   **How it works:** Aggregates prediction history into Recharts visualizers (Yield Trend, Crop Comparison) and displays recent critical recommendations and weather.
*   **Files Involved:** `DashboardPage.jsx`, `PredictionChart.jsx`.

---

## 4. Frontend Documentation

### Folder Structure
```text
Frontend/
├── public/              # Static assets
├── src/
│   ├── api/             # Axios configuration and API wrapper functions (api.js)
│   ├── components/      # Reusable UI components (PredictionCard, Layout, FarmLocationPicker)
│   ├── hooks/           # Custom React hooks (useAuth, useRecommendations)
│   ├── pages/           # Route-level components (DashboardPage, ProfilePage)
│   ├── App.jsx          # Main application router
│   ├── index.css        # Global CSS, variables, and styling classes
│   └── main.jsx         # React DOM entry point
├── Dockerfile           # Nginx production build configuration
├── nginx.conf           # Nginx routing configuration for React SPA
├── package.json         # Dependencies and scripts
└── vite.config.js       # Vite bundler configuration
```

### Component Hierarchy
*   `App` (Router Provider)
    *   `Layout` (Sidebar + Top Navbar)
        *   `DashboardPage`
            *   `WeatherWidget`
            *   `PredictionCard`
            *   `YieldTrendChart`
            *   `RecommendationsPanel`
        *   `ProfilePage`
            *   `FarmLocationPicker` (Leaflet Map)
        *   `RecommendationsPage`

### State Management & Routing
*   **State:** Uses React Context + Custom Hooks (`useAuth` for global user state, local component state `useState` for UI forms).
*   **Routing:** `react-router-dom` v6. Protected routes redirect to `/login` if `useAuth` returns no token.
*   **UI Libraries:** `lucide-react` for icons, `recharts` for SVG charting, `react-leaflet` for mapping, `react-hot-toast` for toast notifications. Pure CSS (no Tailwind) for maximum customizability.

---

## 5. Backend Documentation

### Folder Structure
```text
server/
├── config/              # Database connection setup (db.js)
├── middleware/          # Express middlewares (auth.js for JWT validation)
├── models/              # Mongoose schemas (User.js, Prediction.js, Recommendation.js)
├── routes/              # Express API routers (auth, predictions, weather, profile)
├── services/            # Core business logic
│   ├── mlBridge.js             # Axios client proxying to FastAPI
│   ├── recommendationsEngine.js# Logic to generate advice
│   ├── smsService.js           # Twilio SMS delivery and Bulk Cron logic
│   └── weatherService.js       # OpenWeatherMap API integration
├── server.js            # Express application entry point & Cron initialization
├── .env                 # Environment variables
└── package.json         # Node dependencies
```

### Authentication Flow
1. Client requests OTP (`/send-verification`). Backend calls Twilio.
2. Client submits OTP (`/verify-code`). Backend verifies via Twilio.
3. If verified, backend checks if `User` exists in MongoDB. If not, creates one.
4. Backend signs a JWT payload `({ phone_number })` using `JWT_SECRET`.
5. Subsequent requests pass `Authorization: Bearer <token>`. The `authMiddleware` verifies the token and attaches `req.user`.

### Error Handling Strategy
*   Controllers use `try...catch` blocks.
*   Errors are caught and sent as JSON: `res.status(500).json({ error: error.message })`.
*   Specific expected errors (like missing coordinates) send specific flags: `res.status(400).json({ error: 'Farm location not set', needs_location: true })`.

---

## 6. Database Documentation

### Database Technology
**MongoDB** (NoSQL Document Store), accessed via **Mongoose** ODM. Chosen for its flexibility in handling dynamic schema updates (e.g., adding arbitrary crop metadata) and high read/write speeds for prediction logs.

### Schema Design & Collections
1.  **Users (`users`)**
    *   `phone_number` (String, Unique Index)
    *   `farm_name`, `farm_location`, `farm_state` (String)
    *   `farm_area_acres`, `farm_lat`, `farm_lng` (Number) - GPS coordinates
    *   `sms_alerts_enabled` (Boolean)
2.  **Predictions (`predictions`)**
    *   Inputs: `crop`, `season`, `state`, `area`, `rainfall`, `fertilizer` (Numbers/Strings)
    *   Outputs: `yield_prediction` (Number), `confidence_level` (String)
    *   `user_phone` (String, Indexed to link to User)
3.  **Recommendations (`recommendations`)**
    *   `prediction_id` (ObjectId, ref: 'Prediction')
    *   `category` (Enum: fertilizer, irrigation, etc.)
    *   `severity` (Enum: info, warning, critical)
    *   `is_applied` (Boolean) — Used for action tracking
    *   `applied_notes` (String), `outcome` (Enum)

### Indexing Strategy
Compound indexes exist to speed up dashboard queries:
*   `Prediction`: `{ user_phone: 1, created_at: -1 }` (for history retrieval)
*   `Recommendation`: `{ user_phone: 1, is_applied: 1 }` (for action history tabs)

---

## 7. APIs Documentation

### REST API Endpoints (Express Server)

**Weather API**
*   `GET /api/weather/current`
    *   Headers: `Authorization: Bearer <token>`
    *   Returns: `{ weather: { temperature, humidity... }, farm: { lat, lng } }`
*   `GET /api/weather/forecast`
    *   Returns 5-day array and calculated severe weather alerts.

**Recommendations API**
*   `PATCH /api/recommendations/:id/apply`
    *   Body: `{ notes: "Added urea", new_value: 50 }`
    *   Returns: `{ recommendation: {...}, newPrediction: {...} }`
    *   *Note: Providing new_value triggers ML recalculation.*

**Predictions API**
*   `POST /api/predictions`
    *   Body: `{ crop: "Rice", area: 5, fertilizer: 40... }`
    *   Returns: `{ prediction: {...}, recommendations: [...] }`

**Profile API**
*   `PATCH /api/profile`
    *   Body: `{ farm_lat: 26.8, farm_lng: 80.9 }`

*(All routes expect HTTP 200 on success, HTTP 400 for bad input, HTTP 401 for unauthorized, HTTP 500 for server errors).*

---

## 8. AI and Prediction System

### Processing Flow
1. Express backend receives raw data.
2. Express issues HTTP POST to FastAPI `http://fastapi:8000/predict-with-confidence`.
3. FastAPI loads `scaler.pkl` to normalize numerical inputs to match training data distribution.
4. The normalized array is passed to `crop_yield_model.pkl` (e.g., Random Forest / Gradient Boosting model).
5. The model outputs the `yield_prediction` (Tonnes per Hectare).
6. FastAPI calculates confidence bounds based on historical variance for that crop/state.

### Feedback Loop Mechanism
When a farmer records an `actual_yield` via `PATCH /api/predictions/:id/actual`, the system calculates `accuracy_error`. In the future, a cron job can extract predictions with `actual_yield` and retrain `crop_yield_model.pkl` to improve local accuracy over time.

---

## 9. Weather and SMS Integration

### Workflow
1. **OpenWeatherMap Integration:** `weatherService.js` makes Axios calls to `api.openweathermap.org`. It parses the 5-day/3-hour JSON array.
2. **Trigger Conditions:** The logic loops over the forecast. If `rain_3h > 5mm`, `wind > 15m/s`, or `temp > 42°C`, it generates an Alert Object with specific agricultural precautions.
3. **SMS Service:** `smsService.js` receives the Alert Object, formats a plain-text string, and uses the Twilio Node SDK (`twilioClient.messages.create`) to push the SMS to the user's registered phone number.
4. **Automation:** `server.js` establishes a `setInterval` that triggers this entire pipeline for all opted-in users every 6 hours.

---

## 10. Map and Location System

*   **Leaflet Integration:** `react-leaflet` is used because it relies on OpenStreetMap tiles, requiring no paid API keys (unlike Google Maps).
*   **GPS Detection:** Uses standard browser `navigator.geolocation.getCurrentPosition()`.
*   **Manual Selection:** A custom `useMapEvents` hook captures map clicks, extracts `latlng`, and updates the marker state.
*   **Geocoding:** Nominatim API (`nominatim.openstreetmap.org`) is used to convert coordinates into human-readable village/city names for the UI.

---

## 11. Security

*   **Authentication:** JWT (JSON Web Tokens) signed with a strong `JWT_SECRET`. Tokens are stored in `localStorage` and sent via `Authorization` headers.
*   **Authorization:** `authMiddleware` intercepts routes. If no token or invalid token is present, it blocks execution (`401 Unauthorized`).
*   **Data Isolation:** Every DB query enforces `user_phone: req.user.phone_number`. A user can never retrieve predictions or profiles belonging to another phone number.
*   **Environment Variables:** Sensitive keys (Twilio SID, OpenWeatherMap Key, DB URI) are strictly kept in `.env` files and passed securely via Docker Compose. They are never exposed to the React frontend (only `VITE_` prefixed variables are exposed).

---

## 12. Docker and Deployment

### Docker Architecture
The system utilizes `docker-compose` to orchestrate 4 interconnected containers:
1.  **farmplus-mongo:** Official `mongo:6` image. Uses a named volume `mongo_data` for persistence.
2.  **farmplus-fastapi:** Builds from `Backend/Dockerfile`. Runs Uvicorn Python server.
3.  **farmplus-express:** Builds from `server/Dockerfile`. Node.js environment.
4.  **farmplus-frontend:** Builds from `Frontend/Dockerfile`. A multi-stage build: compiles Vite/React, then serves static files via an `nginx:alpine` web server.

### Environment Configuration
The root `docker-compose.yml` injects variables from the root `.env` into the respective containers. Networking is handled via Docker's internal DNS (e.g., Express connects to MongoDB using `mongodb://mongo:27017`).

---

## 13. Dependencies and Packages

**Frontend (`package.json`)**
*   `react`, `react-dom`: Core UI library.
*   `react-router-dom`: Client-side navigation.
*   `recharts`: Lightweight, declarative SVG charting.
*   `leaflet`, `react-leaflet`: Interactive maps.
*   `axios`: HTTP requests.

**Backend Node (`package.json`)**
*   `express`: Web framework.
*   `mongoose`: MongoDB object modeling.
*   `jsonwebtoken`: Auth token generation/verification.
*   `twilio`: SMS API SDK.
*   `cors`: Cross-Origin Resource Sharing enablement.

---

## 14. Setup Guide

### Prerequisites
*   Docker & Docker Compose installed.
*   Node.js v18+ (for local development without Docker).
*   Keys: Twilio Account SID/Auth Token, OpenWeatherMap API Key.

### Running with Docker (Recommended for Production)
1.  Clone the repository.
2.  Create a `.env` file in the root directory:
    ```env
    FRONTEND_PORT=3000
    EXPRESS_PORT=5000
    FASTAPI_PORT=8000
    JWT_SECRET=super_secret_key_here
    OPENWEATHER_API_KEY=your_openweathermap_key
    TWILIO_ACCOUNT_SID=your_twilio_sid
    TWILIO_AUTH_TOKEN=your_twilio_token
    TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_sid
    TWILIO_PHONE_NUMBER=+1234567890
    ```
3.  Run the stack:
    ```bash
    docker compose up -d --build
    ```
4.  Access the application at `http://localhost:3000`.

---

## 15. Testing

*   **API Testing:** Can be performed using Postman. Hit `POST http://localhost:5000/api/auth/dev-login` with `{ "phone_number": "1234567890" }` to bypass Twilio and receive a valid JWT for testing.
*   **End-to-End Testing (Manual Workflow):**
    1. Login.
    2. Navigate to Profile -> Auto-detect GPS -> Save.
    3. Navigate to Dashboard -> Verify Weather Widget loads based on coordinates.
    4. Make a Prediction -> View Recommendations.
    5. Click "Mark as Applied" on a Fertilizer recommendation -> Enter new value -> Verify new Prediction is generated and displayed.

---

## 16. Challenges and Solutions

1.  **Challenge:** Tying recommendation actions to quantitative yield changes.
    *   *Solution:* Instead of complex delta mathematics in Node.js, the system modifies the user's input payload and re-queries the authoritative FastAPI ML model to generate an entirely new "post-action" prediction, ensuring data consistency.
2.  **Challenge:** Free mapping solution without API limits.
    *   *Solution:* Bypassed Google Maps in favor of Leaflet + OpenStreetMap + Nominatim for reverse geocoding. This ensures 100% free, unrestricted map usage.
3.  **Challenge:** CORS issues between microservices.
    *   *Solution:* Docker Compose internal networking isolates backend services from the browser. The frontend only talks to Express (port 5000/80 via Nginx proxy). Express acts as an API Gateway, securely routing traffic to FastAPI (port 8000) internally.

---

## 17. Future Scope

*   **IoT Sensor Integration:** Direct ingestion of soil moisture and NPK data from field sensors via MQTT, bypassing manual form entry.
*   **Satellite Imagery (NDVI):** Integrating Sentinel-2 API to fetch farm vegetation indices based on the user's saved GPS coordinates.
*   **Community Forum:** Allowing farmers in similar regions to share their applied recommendations and outcomes.
*   **Voice/Local Language Support:** Translating SMS alerts into regional languages (Hindi, Marathi, etc.) using AI translation APIs.

---

## 18. Conclusion

FarmPlus successfully merges predictive machine learning with practical, daily agricultural advisory. By transitioning from a simple "calculator" to a closed-loop "action-tracking advisory system" complete with offline SMS weather alerts, it provides tangible, measurable value to farmers. The containerized microservice architecture ensures the platform is highly scalable, resilient, and ready for production deployment in rural technological ecosystems.

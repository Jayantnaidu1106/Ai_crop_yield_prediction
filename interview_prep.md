# 🌾 AI Crop Yield Prediction — Complete Interview Prep Guide

---

## 📌 What is this project? (Say this in an interview)

> "I built a full-stack web application called **FarmPlus** that helps farmers predict how much crop yield they'll get — in tonnes per hectare — based on inputs like soil area, rainfall, fertilizer, pesticide, and temperature. I trained a **Random Forest ML model** in Python, deployed it as a **FastAPI microservice**, and connected it to a **React frontend** through an **Express.js backend**. The whole thing is containerised with **Docker**."

---

## 🧱 Architecture — How it all fits together

```
React Frontend (Vite, port 5173)
        ↓  (HTTP + JWT)
Express.js Server (Node.js, port 5000)   ←→  MongoDB (users, predictions, recommendations)
        ↓  (HTTP, internal)
FastAPI ML Microservice (Python, port 8000)
        ↓
Random Forest Model (.pkl file loaded in memory)
```

**Three separate servers. Each has one job:**

| Server | Language | Job |
|--------|----------|-----|
| React (Vite) | JavaScript | UI — forms, charts, dashboard |
| Express.js | Node.js | Auth, saving predictions, recommendations, weather alerts |
| FastAPI | Python | Only one thing — run the ML model and return a prediction |

---

## 🤖 The ML Model — Explained Simply

### What it does
Takes **10 inputs** from a farmer and predicts **yield** (how many tonnes of crop per hectare).

### The 10 inputs
`Crop`, `Year`, `Season`, `State`, `Area (hectares)`, `Production`, `Annual Rainfall (mm)`, `Fertilizer (kg/ha)`, `Pesticide (kg/ha)`, `Temperature (°C)`

### Why Random Forest?
- It's an **ensemble** of many decision trees (200 trees)
- Each tree votes → the average vote is the final answer
- More robust than a single decision tree — doesn't overfit easily
- Also naturally gives a **confidence score** (how much the trees agree with each other)

### How it was trained (`run_model.py`)
1. Load CSV data
2. Convert text columns (Crop name, Season, State) into numbers using **Label Encoding**
3. Fill missing values with column averages
4. **Scale** all features using `StandardScaler` (so big numbers like rainfall don't dominate)
5. Split: **80% train, 20% test**
6. Run **GridSearchCV** — tries different combinations of hyperparameters automatically and picks the best
7. Evaluate: **R² score ~0.92** on test data (means model explains 92% of variation in yield)
8. Save the trained model as `crop_yield_model.pkl` and scaler as `scaler.pkl`

### What is the confidence score?
- The 200 trees each give their own prediction
- If all 200 trees agree → **high confidence**
- If trees disagree a lot → **low confidence**
- Mathematically: `confidence = (1 - std/mean) × 100`

---

## 🐍 Backend 1 — FastAPI (Python)

**File:** `Backend/main.py` + `services/ml_service.py`

### What it does
- Loads `crop_yield_model.pkl` once on startup (stays in memory)
- Exposes 3 endpoints:
  - `POST /predict` → returns predicted yield
  - `POST /predict-with-confidence` → returns yield + confidence score + upper/lower bounds
  - `POST /scenario-analysis` → what if I increase fertilizer? runs multiple predictions at once

### How a prediction request flows
```
1. React sends form data to Express (/api/predictions)
2. Express receives it, calls FastAPI internally (http://localhost:8000/predict)
3. FastAPI loads the features, scales them, runs the model
4. Returns prediction back to Express
5. Express saves it to MongoDB and returns to React
```

---

## 🟢 Backend 2 — Express.js (Node.js)

**File:** `server/server.js`

### Routes
| Route | What it does |
|-------|-------------|
| `/api/auth` | Login with phone number + OTP via Twilio SMS |
| `/api/predictions` | Save prediction, get history, export CSV |
| `/api/recommendations` | AI-generated crop advice based on prediction |
| `/api/dashboard` | Summary stats for the farmer's dashboard |
| `/api/weather` | Fetches weather from OpenWeatherMap API |
| `/api/profile` | User profile CRUD |

### Auth Flow
1. User enters phone number
2. Express calls **Twilio API** → sends OTP SMS
3. User enters OTP → Express verifies it
4. If valid → generates **JWT token**
5. React stores JWT in `localStorage`
6. Every future API request sends JWT in `Authorization: Bearer <token>` header

---

## ⚛️ Frontend — React (Vite)

- Uses **axios** with a request interceptor to auto-attach JWT to every request
- Pages: Prediction form, History, Dashboard, Recommendations, Weather, Profile
- Calls Express backend — **never calls FastAPI directly**

---

## 🗄️ Database — MongoDB

### Collections (like tables)
- **users** — phone, name, location, farm size
- **predictions** — all 10 inputs + predicted yield + confidence score + timestamp
- **recommendations** — tips generated per prediction (read/unread, applied/not applied)

### Schema design decision
> "I designed it with a **normalised relational schema** in mind — users, predictions, and recommendations as separate entities linked by IDs — even though I used MongoDB. This means if we ever migrate to PostgreSQL, the schema is already compatible."

---

## 🐳 Docker

- **3 containers**: FastAPI, Express, React (served by nginx or Vite)
- `docker-compose.yml` — starts all 3 with one command: `docker-compose up`
- Each container only knows its own port — they talk via internal Docker network

---

## 📊 Key Numbers to Remember

| Metric | Value |
|--------|-------|
| ML Model | Random Forest Regressor |
| Trees in forest | 200 estimators |
| Input features | 10 |
| Train/Test split | 80% / 20% |
| R² accuracy | ~0.92 |
| Confidence score range | 0 – 100 |
| API ports | FastAPI: 8000, Express: 5000, React: 5173 |

---

# 🎤 Interview Questions + Answers

---

## ROUND 1 — Basic / HR Level

---

**Q1. What does your project do?**

> "FarmPlus is a web app that predicts crop yield for farmers. A farmer enters details like crop type, area, rainfall, fertilizer — and the app tells them the expected yield in tonnes per hectare, with a confidence score showing how reliable the prediction is."

---

**Q2. Why did you build this?**

> "Agriculture is unpredictable. Farmers often don't know if they're over-fertilising or if the weather conditions are suitable for a good yield. I wanted to give them a data-driven tool. ML is well-suited here because yield depends on many interacting factors that are hard to reason about manually."

---

**Q3. What is your role in the project?**

> "I built the entire project — ML model training, FastAPI deployment, Express backend with auth and database, and the React frontend. I also Dockerised the whole stack."

---

**Q4. What tech stack did you use and why?**

> "Python + FastAPI for the ML microservice because Python has the best ML libraries (scikit-learn). Node.js + Express for the main backend because it's fast for I/O-heavy tasks like auth and database operations. React for a dynamic UI. MongoDB for flexible schema during prototyping. Docker to make deployment consistent."

---

## ROUND 2 — Technical Questions

---

**Q5. What is Random Forest? Why did you choose it over other models?**

> "Random Forest is an ensemble of decision trees. Each tree is trained on a random subset of data and features. The final prediction is the average of all trees. I chose it because:
> 1. It handles non-linear relationships well
> 2. It doesn't overfit easily
> 3. It naturally gives a confidence estimate through tree variance
> 4. It works well with mixed data (numbers + encoded categories)"

---

**Q6. What is R² score? What does 0.92 mean?**

> "R² (R-squared) measures how well the model explains the variation in the data. A score of 0.92 means the model explains **92% of the variation** in crop yield. The remaining 8% is noise or factors not in the data. 1.0 would be perfect, 0 would be no better than just predicting the average."

---

**Q7. What is the confidence score and how is it calculated?**

> "The confidence score comes from the 200 individual trees in the Random Forest. Each tree gives its own prediction. If all trees agree, the standard deviation is low → high confidence. If they disagree, confidence is low. The formula is: `confidence = (1 - std/mean) × 100`. So 85 means the trees are very aligned."

---

**Q8. Why two backends — FastAPI and Express? Why not just one?**

> "Separation of concerns. FastAPI is a Python framework — I needed Python for the ML model (scikit-learn). Express is JavaScript — better for JWT auth, Twilio SMS integration, and MongoDB operations. Combining both in one language would mean either rewriting the ML in JS (terrible) or doing auth in Python (messy). Microservices kept them clean and independent."

---

**Q9. How does authentication work?**

> "Phone-based OTP auth using Twilio. User enters phone → Express calls Twilio API → Twilio sends SMS with OTP → user enters OTP → Express verifies → generates JWT → stored in localStorage → attached to every request via Axios interceptor."

---

**Q10. What is JWT? Why use it?**

> "JSON Web Token. It's a signed string containing user info (like user ID). The server signs it with a secret key. On every request, the server just verifies the signature — no database lookup needed. It's stateless and fast."

---

**Q11. Why MongoDB instead of PostgreSQL?**

> "For a prototype, MongoDB is faster to iterate on — you can change the schema without migrations. I also designed the schema in a normalised relational way (users, predictions, recommendations as separate collections linked by IDs) so it's PostgreSQL-compatible if we scale up and need stronger consistency guarantees."

---

**Q12. What does Docker do here?**

> "Docker packages each service — FastAPI, Express, and React — into isolated containers with all their dependencies. Instead of 'it works on my machine', anyone can run `docker-compose up` and get the exact same environment. The three containers communicate over Docker's internal network."

---

## ROUND 3 — Drilling / Pressure Questions ⚡

---

**Q13. ⚡ You mentioned R² of ~0.92. How did you actually get that number?**

> "The training script (`run_model.py`) uses `r2_score()` from scikit-learn, evaluated on the 20% test set that the model never saw during training. GridSearchCV also gives a cross-validation R² on the training data. The ~0.92 is the test set score."

> ⚠️ *Be honest if asked: "I need to run it on the final dataset to confirm the exact figure — the evaluation code is in place."*

---

**Q14. ⚡ What's the difference between R² and accuracy?**

> "Accuracy is for classification (correct/wrong). R² is for regression (predicting a number). Since crop yield is a continuous number — not a category — we use R². Calling it 'accuracy' on the resume is a simplification for readability, but technically it's the R² score."

---

**Q15. ⚡ What happens if the FastAPI service goes down? Does the whole app crash?**

> "Currently yes — if FastAPI is down, predictions fail. A production fix would be: retry logic in Express, a circuit breaker pattern, or a fallback cached prediction. This is a known limitation of the current prototype."

---

**Q16. ⚡ What is GridSearchCV? Couldn't you just train once?**

> "GridSearchCV automatically tries every combination of hyperparameters you specify and picks the best one using cross-validation. Without it, I'd have to manually try each combination — which is error-prone and slow. It found the best number of trees, depth, and split settings automatically."

---

**Q17. ⚡ What is StandardScaler and why do you need it?**

> "It scales all features to have mean=0 and std=1. Without it, a feature like `Annual Rainfall (500mm)` would dominate a feature like `Pesticide (5kg)` just because of scale — even if pesticide is equally important. Scaling puts all features on equal footing."

---

**Q18. ⚡ Why store the scaler in a `.pkl` file?**

> "The scaler is 'fit' on training data — it learns the mean and std of each feature. At prediction time, you must use **the same scaler** that was used during training. If you refit on new data, the scaling changes and the model gives wrong predictions. So you save and reuse the original scaler."

---

**Q19. ⚡ What's the difference between your two prediction endpoints?**

> "`/predict` just returns a single yield number. `/predict-with-confidence` runs all 200 trees individually, computes mean, std, confidence score, and 95% confidence interval (mean ± 1.96 × std). The frontend uses the second one so farmers see both the prediction and how reliable it is."

---

**Q20. ⚡ What is a 95% confidence interval?**

> "It means: if we ran this prediction 100 times with slight data variations, 95 of those times the true yield would fall between the lower and upper bound. For example: 'predicted yield is 3.2 t/ha, and we're 95% confident the real yield will be between 2.8 and 3.6 t/ha.'"

---

**Q21. ⚡ How does the recommendation engine work?**

> "After a prediction is saved, the Express backend generates recommendations — for example, if rainfall is low, suggest irrigation; if yield is below average, suggest different fertilizer dosage. These are stored in MongoDB as separate documents linked to the prediction ID, and the farmer can mark them as 'applied' or 'not applied' and later record the outcome."

---

**Q22. ⚡ What's Label Encoding? Could you use One-Hot Encoding instead?**

> "Label Encoding converts each category to a number — 'Rice' → 0, 'Wheat' → 1, etc. One-Hot Encoding would create a separate column for each category. Random Forest doesn't assume order between numbers, so label encoding works fine here. One-Hot would massively increase feature count (many crops, many states) and potentially hurt performance."

---

**Q23. ⚡ What would you improve if you had more time?**

> "Three things:
> 1. **More data** — train on a larger, more geographically diverse dataset
> 2. **Model versioning** — right now the model is a static `.pkl` file; I'd add MLflow or similar to track experiments
> 3. **Fallback handling** — if FastAPI is down, show the last cached prediction instead of an error"

---

## 🧠 Quick-Fire Cheat Sheet

| Question | One-line answer |
|----------|----------------|
| What model? | Random Forest Regressor, 200 trees |
| Accuracy metric? | R² score ~0.92 on test set |
| Confidence score? | Tree agreement: `(1 - std/mean) × 100` |
| Why FastAPI? | Python needed for scikit-learn |
| Why Express? | JWT, Twilio, MongoDB in Node.js |
| Why MongoDB? | Flexible schema for prototype |
| Why Docker? | Consistent deployment across machines |
| What is JWT? | Signed token for stateless auth |
| What is StandardScaler? | Normalises features to same scale |
| What is GridSearchCV? | Auto-finds best hyperparameters |

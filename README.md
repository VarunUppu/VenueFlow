# VenueFlow

> Smart stadium crowd management REST API — built with Node.js, Express, Firebase Admin SDK, and deployed on Google Cloud Run.

---

## Architecture

```
VenueFlow/
├── src/
│   ├── app.js                  # Express entry point
│   ├── firebase.js             # Firebase Admin SDK singleton
│   ├── routes/
│   │   ├── zones.js            # GET /zones
│   │   ├── gates.js            # GET /gates/recommend?zone=<id>
│   │   ├── queues.js           # GET /queues
│   │   └── incidents.js        # POST /incidents
│   ├── services/
│   │   └── routing.js          # Pure gate recommendation logic
│   └── middleware/
│       ├── auth.js             # Firebase Auth token verification
│       └── rateLimit.js        # In-memory push nudge rate limiter
├── functions/
│   └── simulateData.js         # Firebase Cloud Function (30s pubsub simulator)
├── tests/
│   ├── routing.test.js         # Gate algorithm unit tests
│   └── zones.test.js           # Zone status threshold tests
├── Dockerfile                  # Multi-stage production container
├── cloudbuild.yaml             # Cloud Build CI/CD pipeline
└── .env.example                # Required environment variables
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | — | Health check |
| `GET` | `/zones` | — | All zones with occupancy & status |
| `GET` | `/gates/recommend?zone=<id>` | — | Lowest-wait gate for zone |
| `GET` | `/queues` | — | All facility wait times |
| `POST` | `/incidents` | ✅ Bearer token | Report incident + FCM push |

### Zone Status Thresholds
| Occupancy | Status |
|-----------|--------|
| < 75% | `safe` |
| 75–89% | `warning` |
| ≥ 90% | `critical` |

---

## Getting Started

### 1. Clone and install
```bash
git clone https://github.com/VarunUppu/VenueFlow.git
cd VenueFlow
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your Firebase credentials and API keys
```

### 3. Run locally
```bash
npm run dev
```

### 4. Run tests
```bash
npm test
```

---

## Deployment

### Cloud Run (via Cloud Build)
```bash
gcloud builds submit --config cloudbuild.yaml
```

Secrets are injected via **Google Secret Manager** — no secrets in the image.

### Firebase Cloud Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

---

## Environment Variables

See [`.env.example`](.env.example) for all required keys:

| Variable | Description |
|----------|-------------|
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `FCM_SERVER_KEY` | Firebase Cloud Messaging key |

---

## License

MIT

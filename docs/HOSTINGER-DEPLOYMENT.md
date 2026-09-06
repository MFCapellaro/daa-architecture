# Hostinger Deployment

## Application

Use one Node.js application for the DAA platform. The same process serves the frontend and the API.

```text
Start command: npm run backend
Entry point: apps/backend/src/server.ts
Environment: production
```

Configure the subdomain `dronsair.3cdesign.com.ar` as the application domain and add the variables from `.env.example` in hPanel. Never commit the real keys.

## Google Maps keys

Use two keys:

- `GOOGLE_MAPS_BROWSER_KEY`: restricted by HTTP referrer to `https://dronsair.3cdesign.com.ar/*`, with Maps JavaScript API enabled.
- `GOOGLE_MAPS_SERVER_KEY`: restricted to the Hostinger server IP, with Geocoding API enabled.

## Batch geocoding

After deployment, authenticate as the administrator and call:

```text
POST /api/directory/geocode-batch
Authorization: Bearer <admin-session-token>
```

The operation skips records already geocoded, resolves records with an address/city/province/country, stores coordinates and provider metadata, and reports missing or failed records for review.
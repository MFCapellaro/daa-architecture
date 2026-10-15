# Hostinger Deployment

## Application

Use one Node.js application for the DAA platform. The same process serves the frontend and the API.

```text
Start command: npm run backend
Entry point: apps/backend/src/server.ts
Environment: production
```

Configure the subdomain `dronsair.3cdesign.com.ar` as the application domain and set the required environment variables in hPanel. Never commit real keys or credentials.

## Google Maps keys

Use two keys:

- `GOOGLE_MAPS_BROWSER_KEY`: restricted by HTTP referrer to `https://dronsair.3cdesign.com.ar/*`, with Maps JavaScript API enabled.
- `VITE_GOOGLE_MAP_ID`: a Map ID created in the same Google Cloud project, exposed to the frontend build; the frontend falls back to Google's `DEMO_MAP_ID` when it is not set.
- `GOOGLE_MAPS_SERVER_KEY`: restricted to the Hostinger server IP, with Geocoding API enabled.

## Participant password recovery

The login page sends participant password recovery links through SMTP. Configure these
environment variables in hPanel before using **¿Olvidaste tu contraseña?**:

- `APP_BASE_URL`: `https://dronsair.3cdesign.com.ar`
- `SMTP_HOST`: SMTP server hostname supplied by the mail provider.
- `SMTP_PORT`: SMTP port (defaults to `587`; port `465` defaults to TLS).
- `SMTP_SECURE`: `true` when the provider requires implicit TLS; otherwise `false`.
- `SMTP_USER` and `SMTP_PASS`: SMTP account credentials.
- `SMTP_FROM`: sender address accepted by the SMTP provider.

The recovery link expires after 30 minutes and can be used once. This email flow is for
participant accounts only; reset the administrator password by changing `ADMIN_PASSWORD`
in hPanel. Never put SMTP credentials in the frontend or commit them to the repository.

# Pools

Dealer Pools are stored as YAML records in `submissions/`. Each record keeps its dealer, publication visibility, product terms, optimized product images, participant quantities, and lifecycle timestamps.
Set `POOL_SUBMISSIONS_DIRECTORY` to a durable writable directory when deploying outside a persistent workspace.

## Agreement gate

Pool creation, dealer editing, and the dealer's own pool list require an active Dealer account that has accepted the current agreement version. The agreement text is served by the frontend from `apps/acuerdo/AcuerdoDealer.txt`; acceptance stores the version, timestamp, electronic acceptance ID, legal name, CUIT, and authorized representative in the Dealer account.

Update `DEALER_AGREEMENT_VERSION` in the participant account service when a new agreement version needs to be accepted. A Dealer with an older acceptance must accept the new version before managing Pools.

## Lifecycle

- New Dealer Pools are hidden until an administrator reviews and makes them visible.
- Only visible Pools with an unexpired validity date appear on the public Pools page.
- A Pool expires automatically when its validity ends and is retained in the historical list as incomplete.
- Participant quantities are recorded against the Pool target. Reaching the target closes the Pool as complete and rejects further participation.
- Closed Pools and Pools with participants cannot be deleted. Administrators can hide them without removing their history.
- Participants and the publishing Dealer receive in-app closure notices. An expired Pool notice includes visible, active offers for a similar product in the Pool participant's province or city.

## API

- `GET /api/pools`: visible, active opportunities; optional authentication marks the signed-in participant's existing memberships.
- `POST /api/pools`: create a hidden Pool (Dealer with accepted agreement).
- `PATCH /api/pools/:id`: edit an active Pool owned by the Dealer with accepted agreement.
- `GET /api/pools/mine`: Dealer's active and historical Pools with participant details (accepted agreement required).
- `POST /api/pools/:id/join`: record a participant's unit quantity.
- `GET /api/pools/me/notifications`: closure notices for the signed-in Dealer or participant.
- `/api/admin/pools`: administrator CRUD, visibility review, and participant records.

Pool images are converted in the browser to JPEG, constrained to 1200 px and 450 KB each, with a maximum of five images per Pool.

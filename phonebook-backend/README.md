# Phonebook Backend Step 10

## Run locally

```bash
npm install
npm run start
```

Server starts on port `3001` by default.

## Test with VS Code REST Client

Use requests in `requests.rest`.

## Deploy to Render

1. Push this backend folder to a GitHub repository.
2. In Render, create a new **Web Service**.
3. Set:
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variable `PORT` only if your platform requires it (Render provides this automatically).
5. Open the deployed URL and test endpoints.

Logs in Render:
- Open service dashboard -> Logs tab.

## Deploy to Fly.io

Run these commands in the backend root (where `package.json` is):

```bash
flyctl launch
flyctl deploy
flyctl logs
```

Logs in Fly.io:
- Keep `flyctl logs` running while testing.

## Endpoints to verify after deployment

- `/`
- `/info`
- `/api/persons`
- `/api/persons/:id`

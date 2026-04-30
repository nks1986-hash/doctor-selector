# Doctor Selector — Medical Triage Chatbot

A simple chatbot that asks a patient for symptoms and uses OpenAI's ChatGPT
to suggest the most appropriate medical specialty (e.g. Cardiologist,
Dermatologist, …). Falls back to **General Physician** when the model
response is unclear.

## Project layout

```
doctor-selector/
├── api.js            # OpenAI integration (prompt + response parsing)
├── server.js         # Express backend, exposes POST /api/triage
├── public/
│   ├── index.html    # Chat UI markup
│   ├── styles.css    # Mobile-friendly styling
│   └── frontend.js   # UI controller (vanilla JS)
├── .env.example      # Copy to .env and fill in your key
└── package.json
```

## Prerequisites

- [Node.js](https://nodejs.org/) **18 or newer** (includes `npm`)
- An OpenAI API key — get one at <https://platform.openai.com/api-keys>

## How to run the project

### 1. Open the project folder

```powershell
cd c:\project\doctor-selector\w2\doctor-selector
```

### 2. Install dependencies

```powershell
npm install
```

### 3. Configure environment variables

Copy the example file and add your OpenAI key:

```powershell
Copy-Item .env.example .env
notepad .env
```

Set at least:

```ini
OPENAI_API_KEY=sk-your-real-key-here
OPENAI_MODEL=gpt-4o-mini   # optional, defaults to gpt-4o-mini
PORT=3000                  # optional, defaults to 3000
```

> Without a valid `OPENAI_API_KEY` the API still responds, but every
> request falls back to **General Physician** with `"degraded": true`.

### 4. Start the server

```powershell
npm start
```

For auto-restart on file changes during development:

```powershell
npm run dev
```

You should see:

```text
Doctor Selector running at http://localhost:3000
```

### 5. Use the app

- **UI** — open <http://localhost:3000> in your browser and describe symptoms.
- **Health check:**

  ```powershell
  Invoke-RestMethod http://localhost:3000/api/health
  ```

- **Triage API:**

  ```powershell
  Invoke-RestMethod -Method Post `
    -Uri http://localhost:3000/api/triage `
    -ContentType 'application/json' `
    -Body '{"symptoms":"I have chest pain and shortness of breath"}'
  ```

### 6. Stop the server

Press `Ctrl + C` in the terminal running `npm start`. To kill it from
another shell:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `OPENAI_API_KEY is not set` in logs / `degraded: true` in responses | Add a valid key to `.env` and restart `npm start`. |
| `EADDRINUSE :::3000` | Another process owns port 3000 — change `PORT` in `.env` or kill the other process (see step 6). |
| `npm install` fails | Ensure Node 18+ is installed: `node -v`. |

## API

`POST /api/triage`

```json
{ "symptoms": "I have chest pain and shortness of breath" }
```

Response:

```json
{ "specialty": "Cardiologist", "message": "You should consult a Cardiologist." }
```

## Notes

- The OpenAI key is read from the `OPENAI_API_KEY` env var — never hard-coded.
- Model is configurable via `OPENAI_MODEL` (defaults to `gpt-4o-mini`;
  `gpt-4` and `gpt-3.5-turbo` also work).
- Queries and assigned specialties are appended to `logs/queries.log`
  for lightweight analytics. Delete the `logs/` folder to disable history.
- This tool is **not** a diagnostic device — always defer to qualified
  medical professionals.

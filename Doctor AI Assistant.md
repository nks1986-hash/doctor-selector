# Doctor AI Assistant

## Hackathon Demo Overview

**Doctor AI Assistant** is a conversational AI web app that helps users identify the most relevant medical specialist from plain-language symptoms. Instead of forcing patients to guess whether they need a cardiologist, dermatologist, neurologist, ENT specialist, or general physician, the app guides them through a simple chat flow and returns a clear recommendation.

This project turns an everyday healthcare pain point into a fast, accessible triage experience: describe symptoms, get a likely specialty, and reduce the chance of booking the wrong first consultation.

---

## Quick Links

- **Live Demo:** [https://doctor-selector-six.vercel.app/](https://doctor-selector-six.vercel.app/)
- **GitHub Repository:** [https://github.com/nks1986-hash/doctor-selector](https://github.com/nks1986-hash/doctor-selector)
- **Judge Review HTML:** [docs/index.html](./docs/index.html)
- **Demo Video File:** [demo-video.mp4](./demo-video.mp4)

---

## Demo Video

<!-- markdownlint-disable MD033 -->
<video src="./demo-video.mp4" controls width="100%" preload="metadata"></video>
<!-- markdownlint-enable MD033 -->

If the viewer does not support inline playback, open [demo-video.mp4](./demo-video.mp4) directly.

---

## Problem

Patients often know **what they feel**, but not **which doctor to visit first**. That creates three common issues:

- Wrong specialist appointments that waste time and money.
- Delays in getting to the right care.
- Confusion for users who do not have immediate access to primary-care guidance.

---

## Solution

Doctor AI Assistant provides a lightweight symptom triage experience through a familiar chat interface.

- Users enter symptoms in natural language.
- The backend sends the request to OpenAI with a constrained, medical-triage prompt.
- The system recommends the most appropriate specialty.
- If the response is uncertain, the app safely falls back to **General Physician**.

---

## How The Demo Works

1. The user opens the chat interface.
2. They describe symptoms such as chest pain, skin rash, headache, or ear pain.
3. The app sends the message to the backend API.
4. The backend applies prompt engineering and specialty mapping logic.
5. The user receives a recommended doctor category with a concise response.

---

## Demo Script For Judges

Use this flow during the presentation:

1. Open the live app and explain the core problem in one sentence: *patients know symptoms, but not the right specialist*.
2. Enter a symptom set like **"I have chest pain and shortness of breath"** and show the cardiology recommendation.
3. Try a second example such as **"I have a persistent skin rash and itching"** to show a different specialty outcome.
4. Call out that the app is already deployed and accessible online.
5. Close with the scalability story: hospital triage, telemedicine intake, and faster patient routing.

---

## Core Features

- Conversational symptom collection through a clean web chat UI.
- AI-powered specialist recommendation using the OpenAI API.
- Backend API built with Express and environment-based key handling.
- Fallback behavior to **General Physician** when the response is ambiguous.
- Lightweight architecture that is easy to extend with new specialties and rules.
- Live deployment on Vercel for instant access during judging.

---

## Architecture Snapshot

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | HTML, CSS, JavaScript | Collects symptoms and renders the chat experience |
| Backend | Node.js, Express | Receives requests and securely calls the AI layer |
| AI Layer | OpenAI ChatGPT API | Interprets symptoms and maps them to a medical specialty |
| Hosting | Vercel | Makes the full experience live and shareable |

---

## Impact

Doctor AI Assistant demonstrates how AI can improve the first step of healthcare access.

- Faster direction toward the right specialist.
- Reduced confusion for patients.
- Better triage efficiency for digital health workflows.
- A product path that can support clinics, insurers, and telehealth platforms.

---

## Future Scope

- Severity and urgency detection.
- Appointment booking integration.
- Multilingual conversations.
- Region-specific specialist networks.
- Analytics for symptom trends and routing quality.

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **AI:** OpenAI ChatGPT API
- **Deployment:** Vercel

---

## Disclaimer

Doctor AI Assistant is an informational triage tool. It does **not** provide medical diagnosis, emergency evaluation, or treatment advice. Users should always consult a qualified healthcare professional for medical concerns.

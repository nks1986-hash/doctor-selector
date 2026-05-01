# Doctor AI Assistant

## Project Overview

**Doctor AI Assistant** is an intelligent, conversational web application that helps patients quickly identify the most appropriate medical specialist based on their symptoms. By combining a friendly chatbot interface with the reasoning capabilities of the ChatGPT API, the assistant streamlines the often confusing first step of seeking medical care: *“Which doctor should I see?”*

### What It Does

The application engages users in a natural, guided conversation to gather details about their symptoms, duration, severity, and relevant medical history. It then analyzes the input using AI and recommends the most suitable doctor specialty (e.g., Cardiologist, Dermatologist, Neurologist, ENT Specialist, General Physician).

### How It Works

- **Frontend Chatbot UI** — A clean, responsive web interface (HTML, CSS, JavaScript) that simulates a real-time chat experience and demonstrates the product story end-to-end.
- **Backend API Layer** — A Node.js/Express server that securely relays conversations to the ChatGPT API using environment-based API key management, ensuring no credentials are exposed to the client.
- **Prompt Engineering** — Carefully crafted prompts enforce structured, medically relevant responses, preventing the AI from generating ambiguous or out-of-scope output.
- **Symptom-to-Specialty Mapping Logic** — AI-driven prompt engineering combined with a curated mapping layer ensures that vague or overlapping symptoms are translated into the correct medical specialty recommendation. The architecture is designed with a clean separation of concerns between UI, API, and logic layers, making it easily extensible to new specialties, languages, and triage rules.
- **Deployment** — Hosted on Vercel for instant, scalable, and globally accessible delivery.

### Why It Matters

Patients often waste valuable time and money visiting the wrong type of specialist. Doctor AI Assistant:

- Reduces decision delays in seeking the right care.
- Improves healthcare triage efficiency for both patients and providers.
- Lowers barriers for users in regions with limited access to primary-care guidance.
- Acts as an always-on, judgment-free first point of contact.
- Scalable across hospitals, telemedicine platforms, and insurance portals.
- Supports better health outcomes through faster, more accurate specialist matching.
- Delivers a fully functional end-to-end product ready for review, extension, and further productization.

### Key Features

- 💬 Conversational, human-like chat interface
- 🧠 AI-powered specialty assignment via ChatGPT with prompt engineering
- 🌐 Live deployment on Vercel
- 🎥 3-minute video walkthrough showcasing real interactions and recommendations
- ⚡ Lightweight, fast, and mobile-friendly
- 🔒 Secure, environment-based API key handling on the backend
- 🔧 Extensible architecture — easily add new specialties, languages, or triage rules
- 📦 Complete, organized public repository with full source code

---

## Repository and Links

- **GitHub Repository:** [https://github.com/nks1986-hash/doctor-selector](https://github.com/nks1986-hash/doctor-selector)
- **Live Deployment:** [https://doctor-selector-six.vercel.app/](https://doctor-selector-six.vercel.app/)

### 🎬 3-Minute Video Demo

> *Embed or link your demo video here.*

```text
[ Demo Video Placeholder ]
```

Replace this section with the video link or embed once available, e.g.:
`[Watch the Demo](https://your-video-link.com)`

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **AI:** OpenAI ChatGPT API
- **Hosting:** Vercel

---

## Disclaimer

Doctor AI Assistant is an informational tool designed to assist users in identifying a relevant medical specialty. It does **not** provide medical diagnosis or treatment and should not be used as a substitute for professional medical advice. Always consult a qualified healthcare provider for medical concerns.

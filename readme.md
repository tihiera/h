## Hask – Tokenizing Human Potential on Algorand

Hask is a demo dApp that lets users create a profile, tokenize it as an Algorand ASA (Algorand Standard Asset), and allow others to invest in them by holding their profile tokens.

It’s a playful proof-of-concept that mixes AI + blockchain to show how personal reputation and achievement could be turned into investable upside.

#### ✨ Features

- Profile Creation – Users create accounts with their name, bio, and social links.
- AI Worth Estimation – Gemini LLM estimates how much a user is “worth” based on their description.
- Profile Tokenization – One-click ASA creation on Algorand LocalNet.
- Investments – Other users can opt-in, send investment requests, and receive profile tokens when accepted.
- Notifications – Pending/accepted investment requests appear in a notification panel.
- Demo-Ready – Works fully on LocalNet (via AlgoKit + Lora Explorer). No real funds required.

#### 🚀 Quick Start
Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

Frontend
cd frontend
npm install
npm run dev


Backend runs on http://localhost:8000
Frontend runs on http://localhost:5173

Make sure to have algokit installed. Follow this [link](https://dev.algorand.co/getting-started/algokit-quick-start/) to install

#### 🛠️ Tech Stack

FastAPI – backend API + blockchain orchestration
AlgoKit Utils – manage Algorand LocalNet, accounts, and ASAs

React + Tailwind – frontend UI
Gemini (Google Generative AI) – estimate user valuation

🎥 Demo Flow
User signs up → backend estimates worth via AI
User launches profile → backend mints ASA (profile token)
Other users browse feed → invest → opt-in + request created
Target user accepts → token transfer completes
Both sides see results live via notifications

⚠️ Disclaimer

This project is a hackathon demo / prototype.
It’s not financial advice and not intended for production. We will deploy the project on the mainnet in teh coming day. And possibly build the cross-platform app for both device
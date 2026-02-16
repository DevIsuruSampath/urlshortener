# Backend — Multi-Step URL Shortener API

Standalone FastAPI backend with SQLite.

## Setup
```bash
cd apps/backend
pip install -r requirements.txt
python main.py
```

## API Docs
Open http://localhost:8000/docs

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/create` | Create short link (6-char code) |
| `GET` | `/start/{short_code}` | Start visitor session |
| `POST` | `/step-complete` | Complete a step (anti-skip) |
| `GET` | `/verify/{session_id}` | Get original URL (only if step=3) |

## Anti-Cheat Logic
- Steps must be completed sequentially: 0 → 1 → 2 → 3
- Cannot skip steps (API rejects out-of-order requests)
- Cannot verify until all 3 steps are completed
- Session marked `is_verified=true` only after step 3

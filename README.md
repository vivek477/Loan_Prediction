# LoanAI — Intelligent Loan Default Risk Assessment System

> **Milestones 7–9:** Full-Stack Flask Web Application & Cloud Deployment for Machine Learning Loan Default Risk Prediction.

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0+-000000?style=flat&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

---

## Overview

**LoanAI** is an end-to-end Machine Learning web application designed to predict the likelihood of an applicant defaulting on a loan. Trained and modeled on the Kaggle Banking Loan Default dataset (`Loan_default.csv`), the application evaluates key financial metrics—including credit score, debt-to-income (DTI) ratio, loan-to-income (LTI) ratio, employment stability, co-signer status, and education level—to deliver an explainable risk probability and actionable underwriting factors.

### Architecture

```
┌────────────────────────────────────────────────────────┐
│             Responsive Web Frontend                    │
│   (Vite SPA + Modern CSS + Animated Risk Gauge)        │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP POST /api/predict
                           ▼
┌────────────────────────────────────────────────────────┐
│             Flask REST API Backend                     │
│  (predict_risk scoring engine + /api/health endpoint)  │
└──────────────────────────┬─────────────────────────────┘
                           │ WSGI Entrypoint
                           ▼
┌────────────────────────────────────────────────────────┐
│             Production Deployment Engine               │
│  (Gunicorn WSGI / Docker / Render Blueprint / Cloud)   │
└────────────────────────────────────────────────────────┘
```

---

## Features

- **Interactive Applicant Risk Assessment:** Real-time form evaluating applicant credit score, income, loan amount, employment details, co-signers, and more.
- **Dynamic Risk Gauge:** Visual breakdown with Low, Moderate, and High default risk classifications and confidence scoring.
- **Explainable AI (Factor Importance):** Highlights the specific financial variables driving each decision (e.g., DTI impact, credit score contribution, loan-to-income ratio).
- **Persistent Assessment History:** Saves and manages previous evaluations locally in the browser with one-click reload.
- **Production-Ready WSGI:** Ready for enterprise cloud deployment via Gunicorn and multi-worker multiprocessing.

---

## Free Cloud Deployment Guides

This repository includes turnkey configuration files for deploying directly to free cloud hosting platforms:

### Option 1: Deploy on Render (Recommended — 100% Free)

Render provides free hosting for Python web applications. This repository includes `render.yaml` and `Procfile` configured for Render.

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy LoanAI ML application"
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to [dashboard.render.com](https://dashboard.render.com/) (sign up for free using your GitHub account).
   - Click **New +** > **Web Service**.
   - Connect your GitHub repository.
   - Configure settings:
     - **Name:** `loanai-predictor`
     - **Environment:** `Python 3`
     - **Region:** Any (e.g., Singapore or Oregon)
     - **Branch:** `main`
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 60`
     - **Plan:** Free
   - Click **Deploy Web Service**.
   - Your application will be live at `https://<your-service-name>.onrender.com` in 1–2 minutes!

---

### Option 2: Deploy on Hugging Face Spaces (Free with 24/7 Uptime)

Hugging Face Spaces offers free CPU containers that do not sleep:

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Set a **Space name** (e.g., `loan-default-prediction`).
3. Select **Docker** as the Space SDK (Choose "Blank" template).
4. Select **Free / CPU basic** hardware.
5. Clone the space repository locally or push your existing repository:
   ```bash
   git remote add space https://huggingface.co/spaces/<your-username>/<space-name>
   git push space main
   ```
   *(The included `Dockerfile` automatically builds Python 3.11 with Gunicorn on port `7860` as required by Hugging Face).*

---

### Option 3: Deploy on Railway / Koyeb

1. Create a free account on [Railway.app](https://railway.app) or [Koyeb.com](https://koyeb.com).
2. Connect your GitHub repository.
3. The platform automatically detects `Procfile` and `requirements.txt` to build and serve the application.

---

## Local Development & Setup

### 1. Prerequisites
- Python 3.10 or higher
- `pip`

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/<your-repo-name>.git
cd "ML PROJECT"

# Create a virtual environment
python3 -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Run Application Locally
```bash
# Direct Python run
python app.py

# Or via Gunicorn
gunicorn app:app --bind 0.0.0.0:5000 --workers 2
```

Navigate to [http://localhost:5000](http://localhost:5000) in your browser.

---

## API Documentation

### Health Check
- **Endpoint:** `GET /api/health`
- **Response:**
  ```json
  {
    "engine": "flask",
    "message": "LoanAI Flask API is running.",
    "status": "ok"
  }
  ```

### Risk Prediction
- **Endpoint:** `POST /api/predict`
- **Request Headers:** `Content-Type: application/json`
- **Sample Request Body:**
  ```json
  {
    "age": 32,
    "income": 650000,
    "loanAmount": 250000,
    "creditScore": 740,
    "monthsEmployed": 42,
    "numCreditLines": 3,
    "interestRate": 7.5,
    "loanTerm": 36,
    "dtiRatio": 22,
    "employmentType": "Full-time",
    "education": "Bachelor's",
    "hasMortgage": "No",
    "hasDependents": "No",
    "loanPurpose": "Home",
    "hasCoSigner": "Yes"
  }
  ```
- **Sample Response:**
  ```json
  {
    "confidence": 88,
    "engine": "flask",
    "prediction": 0,
    "probability": 0.124,
    "riskLevel": "Low"
  }
  ```

---

## Repository Structure

```
├── app.py                     # Root WSGI application entrypoint
├── requirements.txt           # Python backend dependencies (Flask, CORS, Gunicorn)
├── Procfile                   # Process file for Render, Railway & Heroku
├── render.yaml                # Render Infrastructure-as-Code Blueprint
├── Dockerfile                 # Docker container config for Hugging Face Spaces
├── runtime.txt                # Pinned Python version specification
├── README.md                  # Project documentation & deployment guides
├── WEEK-2 TASK.ipynb          # Model research, EDA, and validation notebook
├── ML_SOP_Project.pdf         # Standard Operating Procedure documentation
├── PREPROCESING GUIDE.pdf     # Data preprocessing & feature engineering guide
└── UI/
    ├── dist/                  # Production-compiled static assets
    │   ├── index.html
    │   └── assets/
    ├── server/
    │   └── app.py             # Flask application & ML inference logic
    ├── src/                   # Frontend source code (Vite SPA)
    ├── package.json
    └── vite.config.js
```

---

## License

This project is licensed under the MIT License.

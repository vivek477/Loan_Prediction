"""
LoanAI — Flask backend for loan default risk prediction.
Serves the Vite frontend and handles /api/predict requests.
"""

from __future__ import annotations

import math
import os
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

DIST_DIR = Path(__file__).resolve().parent.parent / "dist"

app = Flask(__name__, static_folder=str(DIST_DIR), static_url_path="")
CORS(app)


def _num(data: dict, key: str, default: float) -> float:
    try:
        return float(data.get(key, default))
    except (TypeError, ValueError):
        return float(default)


def predict_risk(data: dict) -> dict:
    age = _num(data, "age", 30)
    income = _num(data, "income", 500000)
    loan_amount = _num(data, "loanAmount", 300000)
    credit_score = _num(data, "creditScore", 720)
    months_employed = _num(data, "monthsEmployed", 36)
    interest_rate = _num(data, "interestRate", 8.5)
    dti_ratio = _num(data, "dtiRatio", 25)
    employment_type = str(data.get("employmentType") or "Full-time")
    education = str(data.get("education") or "Bachelor's")
    has_mortgage = str(data.get("hasMortgage") or "No") == "Yes"
    has_cosigner = str(data.get("hasCoSigner") or "Yes") == "Yes"

    risk_points = 30.0

    cs_normalized = (credit_score - 300) / (850 - 300)
    cs_impact = (0.5 - cs_normalized) * 45
    risk_points += cs_impact

    if dti_ratio > 50:
        risk_points += (dti_ratio - 50) * 0.7 + 10
    elif dti_ratio > 35:
        risk_points += (dti_ratio - 35) * 0.4
    else:
        risk_points -= (35 - dti_ratio) * 0.3

    lti_ratio = (loan_amount / income) if income > 0 else 3
    if lti_ratio > 3:
        risk_points += (lti_ratio - 3) * 6
    elif lti_ratio < 1:
        risk_points -= 8

    if employment_type == "Unemployed":
        risk_points += 22
    elif employment_type == "Part-time":
        risk_points += 10
    elif employment_type == "Self-employed":
        risk_points += 5
    elif employment_type == "Full-time":
        risk_points -= 6

    if months_employed < 12:
        risk_points += 12
    elif months_employed > 48:
        risk_points -= 10
    elif months_employed > 24:
        risk_points -= 5

    if interest_rate > 15:
        risk_points += (interest_rate - 15) * 1.5 + 8
    elif interest_rate < 7:
        risk_points -= 6

    if has_cosigner:
        risk_points -= 12
    if has_mortgage:
        risk_points += 4

    if education == "PhD":
        risk_points -= 8
    elif education == "Master's":
        risk_points -= 5
    elif education == "Bachelor's":
        risk_points -= 2
    elif education == "High School":
        risk_points += 4

    # Age: younger applicants carry slightly higher default risk in this dataset
    if age < 25:
        risk_points += 6
    elif age > 55:
        risk_points -= 4

    probability = 1 / (1 + math.exp(-(risk_points - 25) / 15))
    probability = min(max(probability, 0.04), 0.96)

    prediction = 1 if probability >= 0.45 else 0
    if probability >= 0.55:
        risk_level = "High"
    elif probability >= 0.30:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    confidence = round(probability * 100 if prediction == 1 else (1 - probability) * 100)

    return {
        "prediction": prediction,
        "probability": round(probability, 3),
        "riskLevel": risk_level,
        "confidence": confidence,
        "engine": "flask",
    }


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "message": "LoanAI Flask API is running.", "engine": "flask"})


@app.post("/api/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    return jsonify(predict_risk(payload))


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def spa(path: str):
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404
    target = DIST_DIR / path
    if path and target.is_file():
        return send_from_directory(DIST_DIR, path)
    index = DIST_DIR / "index.html"
    if index.is_file():
        return send_from_directory(DIST_DIR, "index.html")
    return jsonify({"status": "ok", "message": "LoanAI API is running. Frontend build not found."})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=False)

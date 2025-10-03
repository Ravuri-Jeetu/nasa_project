"""
FastAPI REST API exposing duplication detection results for dashboard integration.
"""
from fastapi import FastAPI, UploadFile, File
import pandas as pd
from src.ingestion.data_ingestion import load_projects_csv, load_projects_json
from src.detection.duplication_detector import detect_duplicates

app = FastAPI()

@app.post('/detect-duplicates/')
async def detect_duplicates_api(file: UploadFile = File(...), threshold: float = 0.8):
    if file.filename.endswith('.csv'):
        # Use the ingestion module to standardize columns
        df = load_projects_csv(file.file)
    elif file.filename.endswith('.json'):
        df = load_projects_json(file.file)
    else:
        return {"error": "Unsupported file format"}
    results = detect_duplicates(df, threshold)
    # Visualization: sort by similarity, highlight duplicates
    results_sorted = sorted(results, key=lambda x: x['similarity'], reverse=True)
    return {"duplicates": results_sorted}

# Extend with filtering, cost-saving report, etc.

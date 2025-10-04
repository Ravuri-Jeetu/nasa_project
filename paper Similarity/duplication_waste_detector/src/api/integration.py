"""
FastAPI REST API exposing duplication detection results for dashboard integration.
"""
from fastapi import FastAPI, UploadFile, File
import pandas as pd
from src.ingestion.data_ingestion import load_projects_csv, load_projects_json
from src.detection.duplication_detector import detect_duplicates, cluster_projects, cluster_projects_jsonl
app = FastAPI()

# API endpoint to cluster projects from a JSONL file using semantic embeddings
@app.post('/detect-jsonl-clusters/')
async def detect_jsonl_clusters_api(file: UploadFile = File(...), similarity_threshold: float = 0.9):
    """
    Upload a JSONL file and get clusters of similar projects above the similarity threshold using semantic embeddings.
    """
    # Save uploaded file to disk temporarily
    import tempfile
    import shutil
    with tempfile.NamedTemporaryFile(delete=False, suffix='.jsonl') as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    clusters_json = cluster_projects_jsonl(tmp_path, similarity_threshold=similarity_threshold)
    return clusters_json


# API endpoint to return clusters of similar projects
@app.post('/detect-clusters/')
async def detect_clusters_api(file: UploadFile = File(...), similarity_threshold: float = 0.9):
    """
    Upload a CSV/JSON file and get clusters of similar projects above the similarity threshold.
    """
    if file.filename.endswith('.csv'):
        df = load_projects_csv(file.file)
    elif file.filename.endswith('.json'):
        df = load_projects_json(file.file)
    else:
        return {"error": "Unsupported file format"}
    clusters_json = cluster_projects(df, similarity_threshold=similarity_threshold)
    return clusters_json

# Extend with filtering, cost-saving report, etc.

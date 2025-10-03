# Duplication & Waste Detector

This module identifies overlapping or duplicate research projects across years/divisions to help management reduce redundant efforts and save costs.

## Features
- Data ingestion from CSV/JSON
- Duplication detection using text similarity (TF-IDF, embeddings)
- Adjustable similarity threshold
- Dashboard-friendly JSON/API output
- Optional: cost-saving report, merge suggestions, interactive filtering

## Structure
- `src/ingestion/data_ingestion.py`: Data loading functions
- `src/detection/duplication_detector.py`: Similarity detection logic
- `src/api/integration.py`: REST API (FastAPI)
- `src/utils/helpers.py`: Utility functions
- `tests/`: Unit tests

## Setup
See `requirements.txt` for dependencies. Run `integration.py` to start the API.

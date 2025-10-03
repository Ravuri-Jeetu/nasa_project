"""
Data ingestion module for loading research project datasets from CSV, JSON, or database.
"""
import pandas as pd
from typing import Union

def load_projects_csv(path: str) -> pd.DataFrame:
    """Load projects from a CSV file and standardize columns for Taskbook_cleaned_for_NLP.csv."""
    df = pd.read_csv(path)
    # Standardize column names for downstream processing
    df = df.rename(columns={
        'Title': 'title',
        'Abstract': 'abstract',
        'Methods': 'methods',
        'Results': 'results',
        'Conclusion': 'conclusion'
    })
    return df

def load_projects_json(path: str) -> pd.DataFrame:
    """Load projects from a JSON file."""
    return pd.read_json(path)

# Extend with database ingestion as needed

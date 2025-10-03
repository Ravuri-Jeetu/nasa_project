import pandas as pd
from src.detection.duplication_detector import detect_duplicates

def test_detect_duplicates_basic():
    data = [
        {"project_id": 1, "title": "AI for Space", "abstract": "AI research for space missions", "keywords": "AI, space", "year": 2020, "division": "A", "team_members": "John", "funding_amount": 100000},
        {"project_id": 2, "title": "AI for Mars", "abstract": "AI research for Mars missions", "keywords": "AI, Mars", "year": 2021, "division": "B", "team_members": "Jane", "funding_amount": 120000},
        {"project_id": 3, "title": "AI for Space", "abstract": "AI research for space missions", "keywords": "AI, space", "year": 2022, "division": "A", "team_members": "John", "funding_amount": 110000}
    ]
    df = pd.DataFrame(data)
    results = detect_duplicates(df, threshold=0.9)
    assert len(results) > 0
    for r in results:
        assert r['similarity'] >= 0.9

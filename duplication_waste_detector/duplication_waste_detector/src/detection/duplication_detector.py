"""
Duplication detection module using text similarity algorithms.
"""
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any

def detect_duplicates(df: pd.DataFrame, threshold: float = 0.8) -> List[Dict[str, Any]]:
    """
    Identify duplicate/overlapping projects based on title, abstract, methods, results, and conclusion.
    Returns a list of dicts with project pairs and similarity scores.
    """
    # Combine relevant fields for similarity
    texts = (
        df['title'].fillna('') + ' ' +
        df['abstract'].fillna('') + ' ' +
        df['methods'].fillna('') + ' ' +
        df['results'].fillna('') + ' ' +
        df['conclusion'].fillna('')
    )
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(texts)
    sim_matrix = cosine_similarity(tfidf_matrix)
    results = []
    n = len(df)
    for i in range(n):
        for j in range(i+1, n):
            score = sim_matrix[i, j]
            if score >= threshold:
                # Optionally, add cost info if available
                cost_1 = df.iloc[i].get('funding_amount', None)
                cost_2 = df.iloc[j].get('funding_amount', None)
                results.append({
                    'project_1': {
                        'title': df.iloc[i]['title'],
                        'abstract': df.iloc[i]['abstract'],
                        'methods': df.iloc[i]['methods'],
                        'results': df.iloc[i]['results'],
                        'conclusion': df.iloc[i]['conclusion'],
                        'funding_amount': cost_1
                    },
                    'project_2': {
                        'title': df.iloc[j]['title'],
                        'abstract': df.iloc[j]['abstract'],
                        'methods': df.iloc[j]['methods'],
                        'results': df.iloc[j]['results'],
                        'conclusion': df.iloc[j]['conclusion'],
                        'funding_amount': cost_2
                    },
                    'similarity': score
                })
    return results

# Extend with embeddings-based detection as needed

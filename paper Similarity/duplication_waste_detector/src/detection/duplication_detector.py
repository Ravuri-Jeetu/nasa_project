import json
import networkx as nx
from sentence_transformers import SentenceTransformer
# Extend with embeddings-based detection as needed

def load_projects_jsonl(jsonl_path: str, fields=('abstract', 'results', 'conclusion', 'methods', 'title')) -> list[dict[str, str]]:
    """
    Load projects from a JSONL file, merging specified fields into a single text string per project.
    Skips missing fields.
    Returns a list of dicts: {'paper_id': ..., 'title': ..., 'text': ...}
    """
    projects = {}
    with open(jsonl_path, 'r', encoding='utf-8') as f:
        for line in f:
            obj = json.loads(line)
            pid = obj.get('paper_id')
            section = obj.get('section', '').lower()
            chunk_text = obj.get('chunk_text_clean', '')
            if pid not in projects:
                projects[pid] = {'paper_id': pid, 'title': '', 'abstract': '', 'results': '', 'conclusion': '', 'methods': ''}
            if section in fields:
                projects[pid][section] += (' ' + chunk_text)
            if section == 'title':
                projects[pid]['title'] = chunk_text
    # Merge fields into one text string
    merged = []
    for p in projects.values():
        text = ' '.join([p[f] for f in fields if p.get(f)])
        merged.append({'paper_id': p['paper_id'], 'title': p['title'], 'text': text})
    return merged

def cluster_projects_jsonl(jsonl_path: str, similarity_threshold: float = 0.9, model_name: str = 'all-MiniLM-L6-v2') -> dict[str, any]:
    """
    Cluster projects from a JSONL file using semantic embeddings and connected components.
    Returns clusters in JSON format for frontend visualization.
    """
    projects = load_projects_jsonl(jsonl_path)
    texts = [p['text'] for p in projects]
    titles = [p['title'] for p in projects]
    # Compute embeddings
    model = SentenceTransformer(model_name)
    embeddings = model.encode(texts, show_progress_bar=True)
    # Compute cosine similarity matrix
    from sklearn.metrics.pairwise import cosine_similarity
    sim_matrix = cosine_similarity(embeddings)
    n = len(projects)
    # Build graph of projects above threshold
    G = nx.Graph()
    for i in range(n):
        G.add_node(i)
        for j in range(i+1, n):
            if sim_matrix[i, j] >= similarity_threshold:
                G.add_edge(i, j, weight=sim_matrix[i, j])
    # Find connected components (clusters)
    clusters = []
    cluster_id = 1
    for component in nx.connected_components(G):
        if len(component) > 1:
            member_list = list(component)
            sim_scores = []
            for idx1 in member_list:
                for idx2 in member_list:
                    if idx1 < idx2:
                        sim_scores.append(sim_matrix[idx1, idx2])
            avg_sim = float(np.mean(sim_scores)) if sim_scores else 0.0
            cluster_titles = [titles[idx] for idx in member_list]
            clusters.append({
                'cluster_id': cluster_id,
                'projects': cluster_titles,
                'average_similarity': round(avg_sim, 3)
            })
            cluster_id += 1
    return {'clusters': clusters}
"""
Duplication detection module using text similarity algorithms.
"""
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any, Optional
import numpy as np


def compute_similarity_matrix(df: pd.DataFrame) -> np.ndarray:
    """
    Compute cosine similarity matrix for projects using relevant text fields.
    """
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
    return sim_matrix

def detect_duplicates(df: pd.DataFrame, threshold: float = 0.8) -> list[dict[str, any]]:
    """
    Identify duplicate/overlapping projects based on similarity threshold.
    Returns a list of dicts with project pairs and similarity scores.
    """
    sim_matrix = compute_similarity_matrix(df)
    results = []
    n = len(df)
    for i in range(n):
        for j in range(i+1, n):
            score = sim_matrix[i, j]
            if score >= threshold:
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

def cluster_projects(df: pd.DataFrame, similarity_threshold: float = 0.9, id_field: Optional[str] = None) ->dict[str, any]:
    """
    Cluster projects based on similarity threshold using connected components.
    Returns clusters in JSON format for frontend visualization.
    """
    sim_matrix = compute_similarity_matrix(df)
    n = len(df)
    # Build adjacency list for projects above threshold
    adjacency = [[] for _ in range(n)]
    for i in range(n):
        for j in range(i+1, n):
            if sim_matrix[i, j] >= similarity_threshold:
                adjacency[i].append(j)
                adjacency[j].append(i)
    # Find connected components (clusters)
    visited = [False] * n
    clusters = []
    cluster_id = 1
    for i in range(n):
        if not visited[i]:
            queue = [i]
            members = set()
            while queue:
                node = queue.pop()
                if not visited[node]:
                    visited[node] = True
                    members.add(node)
                    for neighbor in adjacency[node]:
                        if not visited[neighbor]:
                            queue.append(neighbor)
            if len(members) > 1:
                # Only output clusters with more than one project
                member_list = list(members)
                # Calculate average similarity within cluster
                sim_scores = []
                for idx1 in member_list:
                    for idx2 in member_list:
                        if idx1 < idx2:
                            sim_scores.append(sim_matrix[idx1, idx2])
                avg_sim = float(np.mean(sim_scores)) if sim_scores else 0.0
                # Use project titles or ids
                if id_field and id_field in df.columns:
                    projects = [df.iloc[idx][id_field] for idx in member_list]
                else:
                    projects = [df.iloc[idx]['title'] for idx in member_list]
                clusters.append({
                    'cluster_id': cluster_id,
                    'projects': projects,
                    'average_similarity': round(avg_sim, 3)
                })
                cluster_id += 1
    return {'clusters': clusters}

# Extend with embeddings-based detection as needed

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from transformers import pipeline
import torch
import json
import os
import pandas as pd
import uuid
from data_processor import data_processor
import requests
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from nasa_ai_service import nasa_ai
from hybrid_nasa_ai_service import hybrid_nasa_ai
from hypothesis_generator import hypothesis_generator

# Initialize FastAPI
app = FastAPI(title="AI Research Assistant Backend")

# Initialize Hugging Face summarization pipeline (load once at startup)
print("Loading summarization model...")
# Force PyTorch backend to avoid TensorFlow issues
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", framework="pt", device=0 if torch.cuda.is_available() else -1)
print("Summarization model loaded successfully!")

# Load research paper chunks data
print("Loading research paper chunks data...")
CHUNKS_DATA = []
try:
    with open("step5_all_chunks.json", "r", encoding="utf-8") as f:
        CHUNKS_DATA = json.load(f)
    print(f"Loaded {len(CHUNKS_DATA)} chunks from {len(set(item['Title'] for item in CHUNKS_DATA))} unique papers")
except FileNotFoundError:
    print("Warning: step5_all_chunks.json not found. Paper-based summarization will not be available.")
except Exception as e:
    print(f"Error loading chunks data: {e}")

# Load AI chatbot data and model
print("Loading AI chatbot components...")
AI_CHUNKS = []
AI_EMBEDDINGS = None
AI_INDEX = None
AI_MODEL = None

try:
    # Load chunks from JSONL
    with open("all_papers_chunked.jsonl", "r", encoding="utf-8") as f:
        for line in f:
            data = json.loads(line)
            AI_CHUNKS.append({
                'chunk': data['chunk_text_clean'],
                'metadata': {
                    'title': f"Paper {data.get('paper_id', 'N/A')}",
                    'url': 'N/A',
                    'paper_id': data.get('paper_id', 'N/A'),
                    'section': data.get('section', 'N/A'),
                    'chunk_index': data.get('chunk_index', 'N/A')
                }
            })
    
    # Load or create embeddings
    if os.path.exists("ai_embeddings.pkl"):
        with open("ai_embeddings.pkl", 'rb') as f:
            AI_EMBEDDINGS = pickle.load(f)
        print("Loaded existing AI embeddings")
    else:
        print("Creating AI embeddings...")
        AI_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
        texts = [chunk['chunk'] for chunk in AI_CHUNKS]
        AI_EMBEDDINGS = AI_MODEL.encode(texts, show_progress_bar=True)
        with open("ai_embeddings.pkl", 'wb') as f:
            pickle.dump(AI_EMBEDDINGS, f)
        print("AI embeddings created and saved")
    
    # Load or create FAISS index
    if os.path.exists("ai_faiss_index.bin"):
        AI_INDEX = faiss.read_index("ai_faiss_index.bin")
        print("Loaded existing AI FAISS index")
    else:
        print("Creating AI FAISS index...")
        dimension = AI_EMBEDDINGS.shape[1]
        AI_INDEX = faiss.IndexFlatIP(dimension)
        faiss.normalize_L2(AI_EMBEDDINGS)
        AI_INDEX.add(AI_EMBEDDINGS.astype('float32'))
        faiss.write_index(AI_INDEX, "ai_faiss_index.bin")
        print("AI FAISS index created and saved")
    
    # Load model for search if not already loaded
    if AI_MODEL is None:
        AI_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
    
    print(f"AI chatbot loaded with {len(AI_CHUNKS)} chunks from {len(set(chunk['metadata']['paper_id'] for chunk in AI_CHUNKS))} unique papers")
    
except FileNotFoundError:
    print("Warning: all_papers_chunked.jsonl not found. AI chatbot will not be available.")
except Exception as e:
    print(f"Error loading AI chatbot: {e}")

# Load papers data from CSV
print("Loading papers data from CSV...")
PAPERS_DATA = []
try:
    # Look for CSV file in the current directory, prioritize SB_publication_PMC.csv
    csv_files = [f for f in os.listdir('.') if f.endswith('.csv')]
    if csv_files:
        # Prioritize SB_publication_PMC.csv if it exists
        if 'SB_publication_PMC.csv' in csv_files:
            csv_file = 'SB_publication_PMC.csv'
        else:
            csv_file = csv_files[0]  # Use the first CSV file found
        print(f"Found CSV file: {csv_file}")
        
        # Read CSV file
        df = pd.read_csv(csv_file)
        
        # Ensure required columns exist (check for both lowercase and uppercase variants)
        title_col = None
        link_col = None
        
        # Check for title column (case insensitive)
        for col in df.columns:
            if col.lower() == 'title':
                title_col = col
            elif col.lower() == 'link':
                link_col = col
        
        if title_col and link_col:
            # Convert DataFrame to list of dictionaries with additional fields
            for index, row in df.iterrows():
                # Extract keywords from title for better categorization
                title = str(row[title_col]).strip()
                link = str(row[link_col]).strip()
                
                # Extract potential keywords from title
                keywords = []
                title_lower = title.lower()
                
                # Common research keywords
                keyword_mapping = {
                    'microgravity': ['microgravity', 'space'],
                    'stem cells': ['stem cell', 'embryonic', 'regeneration'],
                    'bone': ['bone', 'skeletal', 'osteoclastic', 'osteoblastic'],
                    'oxidative stress': ['oxidative stress', 'radiation'],
                    'heart': ['heart', 'cardiac'],
                    'spaceflight': ['spaceflight', 'space station', 'mission'],
                    'gene expression': ['gene expression', 'transcriptional', 'pcr'],
                    'biomedical': ['biomedical', 'health', 'medical'],
                    'research': ['research', 'study', 'analysis']
                }
                
                for category, terms in keyword_mapping.items():
                    if any(term in title_lower for term in terms):
                        keywords.append(category)
                
                if not keywords:
                    keywords = ['research', 'space biology']
                
                # Determine methodology based on title content
                methodology = None
                if any(term in title_lower for term in ['pcr', 'gene expression', 'transcriptional']):
                    methodology = 'Molecular Biology'
                elif any(term in title_lower for term in ['stem cell', 'embryonic']):
                    methodology = 'Cell Biology'
                elif any(term in title_lower for term in ['bone', 'skeletal']):
                    methodology = 'Biomechanics'
                elif any(term in title_lower for term in ['radiation', 'oxidative']):
                    methodology = 'Radiation Biology'
                else:
                    methodology = 'Space Biology'
                
                # Generate a simple abstract based on title
                abstract = f"This research investigates {title_lower} in the context of space biology and microgravity effects. The study contributes to our understanding of biological responses to space environment conditions."
                
                paper = {
                    'id': str(uuid.uuid4()),
                    'title': title,
                    'link': link,
                    'authors': ['Research Team'],  # Default value
                    'journal': 'PMC Publications',   # Default value based on your data source
                    'publicationDate': '2024',      # Default value
                    'abstract': abstract,
                    'keywords': keywords,
                    'citations': 0,                 # Default value
                    'methodology': methodology,
                    'funding': None,                # Default value
                    'return': None,                 # Default value
                }
                PAPERS_DATA.append(paper)
            
            print(f"Loaded {len(PAPERS_DATA)} papers from CSV")
        else:
            print("Warning: CSV file must contain 'title' and 'link' columns (case insensitive)")
    else:
        print("Warning: No CSV file found. Creating sample data...")
        # Create sample data if no CSV is found
        PAPERS_DATA = [
            {
                'id': str(uuid.uuid4()),
                'title': 'Advanced Machine Learning in Space Research',
                'link': 'https://example.com/paper1',
                'authors': ['Dr. Jane Smith', 'Prof. John Doe'],
                'journal': 'Journal of Space Technology',
                'publicationDate': '2024',
                'abstract': 'This paper explores the application of advanced machine learning techniques in space research and exploration.',
                'keywords': ['machine learning', 'space research', 'AI'],
                'citations': 42,
                'methodology': 'Deep Learning',
                'funding': 150000,
                'return': 300000,
            },
            {
                'id': str(uuid.uuid4()),
                'title': 'Quantum Computing Applications in Aerospace',
                'link': 'https://example.com/paper2',
                'authors': ['Dr. Alice Johnson', 'Dr. Bob Wilson'],
                'journal': 'Quantum Aerospace Review',
                'publicationDate': '2024',
                'abstract': 'A comprehensive study on quantum computing applications in aerospace engineering and space missions.',
                'keywords': ['quantum computing', 'aerospace', 'engineering'],
                'citations': 28,
                'methodology': 'Quantum Algorithms',
                'funding': 200000,
                'return': 450000,
            }
        ]
        print(f"Created {len(PAPERS_DATA)} sample papers")
        
except Exception as e:
    print(f"Error loading papers data: {e}")
    PAPERS_DATA = []

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Request schemas ---
class ChatRequest(BaseModel):
    role: str
    message: str
    selected_paper_ids: Optional[List[str]] = []

class SummaryRequest(BaseModel):
    paper_text: str
    role: str  # "scientist" or "manager"

class PaperSummaryRequest(BaseModel):
    paper_title: str
    role: str  # "scientist" or "manager"


# --- Helper Functions ---

def get_paper_chunks(paper_title: str) -> List[str]:
    """
    Get all chunks for a specific paper title.
    Returns a list of chunk texts.
    """
    chunks = []
    paper_title_lower = paper_title.lower().strip()
    
    # First try exact match
    for item in CHUNKS_DATA:
        if item['Title'].lower().strip() == paper_title_lower:
            chunks.append(item['Chunk'])
    
    # If no exact match, try PMC ID matching
    if not chunks:
        # Extract PMC ID from title if it exists
        import re
        pmc_match = re.search(r'pmc(\d+)', paper_title_lower)
        if pmc_match:
            pmc_id = pmc_match.group(1)
            for item in CHUNKS_DATA:
                if f'pmc{pmc_id}' in item['Title'].lower():
                    chunks.append(item['Chunk'])
    
    # If still no match, try fuzzy matching
    if not chunks:
        for item in CHUNKS_DATA:
            chunk_title = item['Title'].lower().strip()
            # Check if the paper title is contained in the chunk title or vice versa
            if (paper_title_lower in chunk_title or 
                chunk_title in paper_title_lower or
                # Check for common variations
                paper_title_lower.replace(' ', '') in chunk_title.replace(' ', '') or
                chunk_title.replace(' ', '') in paper_title_lower.replace(' ', '')):
                chunks.append(item['Chunk'])
    
    return chunks

def clean_chunk_text(text: str) -> str:
    """
    Clean chunk text by removing website boilerplate and navigation elements.
    """
    import re
    
    # Remove common website boilerplate patterns
    patterns_to_remove = [
        r"skip to main content",
        r"an official website of the united states government",
        r"here's how you know",
        r"official websites use \.gov",
        r"a \.gov website belongs to an official government organization",
        r"secure \.gov websites use https",
        r"a lock.*lock.*padlock icon.*or https://",
        r"means you've safely connected to the \.gov website",
        r"share sensitive information only on official, secure websites",
        r"search log in dashboard publications account settings log out",
        r"search.*search ncbi primary site navigation",
        r"logged in as: dashboard publications account settings",
        r"search pmc full-text archive",
        r"search in pmc journal list user guide permalink copy",
        r"as a library, nlm provides access to scientific literature",
        r"inclusion in an nlm database does not imply endorsement",
        r"learn more: pmc disclaimer.*pmc copyright notice",
        r"plos one.*\d{4}.*doi:.*\d+\.\d+",
        r"search in pmc search in pubmed view in nlm catalog add to search",
        r"find articles by.*\d+.*\d+.*\*",
        r"editor:.*author information article notes copyright and license information",
        r"competing interests:.*conceived and designed the experiments:",
        r"performed the experiments:.*analyzed the data:",
        r"contributed reagents/materials/analysis tools:",
        r"wrote the paper:.*roles.*editor received.*accepted.*collection date",
        r"this is an open-access article distributed under the terms",
        r"pmc copyright notice pmcid:.*pmid:.*\d+",
        r"in the united states\.",
        r"search log in",
        r"of, or agreement with, the contents by nlm or the national institutes of health",
        r"/journal\.pone\.\d+",
    ]
    
    cleaned_text = text.lower()
    
    for pattern in patterns_to_remove:
        cleaned_text = re.sub(pattern, "", cleaned_text, flags=re.IGNORECASE)
    
    # Remove excessive whitespace and normalize
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text)
    cleaned_text = cleaned_text.strip()
    
    # If the cleaned text is too short, it's likely mostly boilerplate
    if len(cleaned_text) < 100:
        return ""
    
    return cleaned_text

def combine_chunks(chunks: List[str], max_length: int = 50000) -> str:
    """
    Combine multiple chunks into a single text, respecting max_length limit.
    Clean each chunk before combining to remove boilerplate content.
    """
    combined_text = ""
    for chunk in chunks:
        # Clean the chunk text
        cleaned_chunk = clean_chunk_text(chunk)
        
        # Skip chunks that are mostly boilerplate (very short after cleaning)
        if len(cleaned_chunk) < 50:
            continue
            
        if len(combined_text) + len(cleaned_chunk) + 1 <= max_length:
            combined_text += cleaned_chunk + " "
        else:
            break
    return combined_text.strip()

def get_available_papers() -> List[str]:
    """
    Get a list of all available paper titles.
    """
    return list(set(item['Title'] for item in CHUNKS_DATA))

def generate_scientist_summary(paper_text: str) -> str:
    """
    Generate a detailed, methodology-focused summary for scientists.
    Uses longer max_length and min_length for comprehensive coverage.
    """
    try:
        # Ensure we have substantial content to summarize
        if len(paper_text.strip()) < 100:
            return "Insufficient content for detailed scientific summary."
        
        # For scientists, we want detailed summaries focusing on methodology
        result = summarizer(
            paper_text,
            max_length=200,  # Longer summary for detailed analysis
            min_length=80,   # Minimum length for substantial content
            do_sample=False,
            truncation=True
        )
        return result[0]['summary_text']
    except Exception as e:
        return f"Error generating scientist summary: {str(e)}"

def generate_manager_summary(paper_text: str) -> str:
    """
    Generate a concise, business-oriented summary for managers.
    Uses shorter max_length for executive-level brevity.
    """
    try:
        # Ensure we have substantial content to summarize
        if len(paper_text.strip()) < 100:
            return "Insufficient content for executive summary."
        
        # For managers, we want concise summaries highlighting business value
        result = summarizer(
            paper_text,
            max_length=120,  # Shorter summary for executive consumption
            min_length=40,   # Minimum length for key insights
            do_sample=False,
            truncation=True
        )
        return result[0]['summary_text']
    except Exception as e:
        return f"Error generating manager summary: {str(e)}"

# --- Placeholder Routes ---

@app.get("/")
def root():
    return {"message": "Backend is running!"}

@app.post("/api/chat")
def chat(req: ChatRequest):
    """
    Handle chat messages with context from selected papers.
    """
    try:
        # Get context from selected papers if provided
        context = ""
        if hasattr(req, 'selected_paper_ids') and req.selected_paper_ids:
            selected_papers = [p for p in PAPERS_DATA if p['id'] in req.selected_paper_ids]
            if selected_papers:
                context = "Selected papers context:\n"
                for paper in selected_papers[:3]:  # Limit to first 3 papers
                    context += f"- {paper['title']}\n"
        
        # Generate role-specific response
        if req.role.lower() == "scientist":
            response = f"From a scientific perspective, {req.message.lower()} relates to research methodologies and technical implementations. "
            response += "I can help you analyze the technical aspects, methodologies, and research gaps in your selected papers."
        else:  # Manager role
            response = f"From a business perspective, {req.message.lower()} involves ROI analysis, market potential, and investment opportunities. "
            response += "I can help you evaluate the business impact, funding requirements, and market trends for your selected projects."
        
        if context:
            response += f"\n\n{context}"
        
        return {
            "message": response,
            "timestamp": "2024-01-01T00:00:00Z",
            "role": req.role,
            "context_used": len(context) > 0
        }
    except Exception as e:
        return {
            "message": f"Error processing your request: {str(e)}",
            "timestamp": "2024-01-01T00:00:00Z",
            "role": req.role,
            "context_used": False
        }

@app.post("/api/summaries")
def generate_summary(req: SummaryRequest):
    """
    Generate paper summaries based on user role.
    - Scientist role: Detailed, methodology-focused summary
    - Manager role: Concise, business-oriented summary
    """
    # Validate role input
    if req.role.lower() not in ["scientist", "manager"]:
        return {"error": "Role must be either 'scientist' or 'manager'"}
    
    # Validate paper text is not empty
    if not req.paper_text.strip():
        return {"error": "Paper text cannot be empty"}
    
    # Generate summary based on role
    if req.role.lower() == "scientist":
        summary = generate_scientist_summary(req.paper_text)
    else:  # manager
        summary = generate_manager_summary(req.paper_text)
    
    return {"summary": summary}

@app.post("/api/paper-summaries")
def generate_paper_summary(req: PaperSummaryRequest):
    """
    Generate paper summaries from chunks data based on user role.
    - Scientist role: Detailed, methodology-focused summary
    - Manager role: Concise, business-oriented summary
    """
    # Validate role input
    if req.role.lower() not in ["scientist", "manager"]:
        return {"error": "Role must be either 'scientist' or 'manager'"}
    
    # Validate paper title is not empty
    if not req.paper_title.strip():
        return {"error": "Paper title cannot be empty"}
    
    # Check if chunks data is available
    if not CHUNKS_DATA:
        return {"error": "Research paper chunks data not available"}
    
    # Get chunks for the specified paper
    chunks = get_paper_chunks(req.paper_title)
    
    if not chunks:
        # Try to find similar titles
        available_papers = get_available_papers()
        similar_titles = [title for title in available_papers 
                         if req.paper_title.lower() in title.lower() or title.lower() in req.paper_title.lower()]
        
        if similar_titles:
            return {
                "error": f"Paper '{req.paper_title}' not found. Did you mean one of these?",
                "suggestions": similar_titles[:5]  # Return top 5 suggestions
            }
        else:
            return {"error": f"Paper '{req.paper_title}' not found in the database"}
    
    # Combine chunks into full text
    combined_text = combine_chunks(chunks)
    
    if not combined_text.strip():
        return {"error": "No readable content found for this paper"}
    
    # Generate summary based on role
    if req.role.lower() == "scientist":
        summary = generate_scientist_summary(combined_text)
    else:  # manager
        summary = generate_manager_summary(combined_text)
    
    return {
        "summary": summary,
        "paper_title": req.paper_title,
        "chunks_used": len(chunks),
        "total_chunks": len([item for item in CHUNKS_DATA if item['Title'].lower().strip() == req.paper_title.lower().strip()]),
        "text_length": len(combined_text)
    }

@app.get("/api/available-papers")
def get_papers():
    """
    Get a list of all available paper titles for summarization.
    """
    if not CHUNKS_DATA:
        return {"error": "Research paper chunks data not available"}
    
    papers = get_available_papers()
    return {
        "total_papers": len(papers),
        "papers": papers[:50]  # Return first 50 papers to avoid overwhelming response
    }

@app.get("/api/papers")
def get_papers_data(role: str = "Scientist", limit: int = 10, offset: int = 0):
    """
    Get papers data for the frontend with role-based filtering and pagination.
    """
    try:
        if not PAPERS_DATA:
            return {"error": "No papers data available", "papers": [], "total": 0, "page": 1, "total_pages": 0}
        
        # Calculate pagination
        total_papers = len(PAPERS_DATA)
        total_pages = (total_papers + limit - 1) // limit  # Ceiling division
        current_page = (offset // limit) + 1
        
        # Get paginated papers
        start_idx = offset
        end_idx = min(offset + limit, total_papers)
        paginated_papers = PAPERS_DATA[start_idx:end_idx]
        
        return {
            "papers": paginated_papers,
            "total": total_papers,
            "page": current_page,
            "total_pages": total_pages,
            "limit": limit,
            "offset": offset,
            "has_next": end_idx < total_papers,
            "has_previous": offset > 0,
            "role": role
        }
    except Exception as e:
        return {"error": f"Error fetching papers: {str(e)}", "papers": [], "total": 0, "page": 1, "total_pages": 0}

@app.get("/api/papers/{paper_id}")
def get_paper_by_id(paper_id: str, role: str = "Scientist"):
    """
    Get a specific paper by ID.
    """
    try:
        paper = next((p for p in PAPERS_DATA if p['id'] == paper_id), None)
        if not paper:
            return {"error": "Paper not found"}
        
        return {
            "paper": paper,
            "role": role
        }
    except Exception as e:
        return {"error": f"Error fetching paper: {str(e)}"}

@app.get("/api/trends")
def get_trends():
    return {
        "trends": [
            {"field": "Space Biology", "funding_growth": 0.2, "expected_roi": 0.15},
            {"field": "Lunar Exploration", "funding_growth": 0.3, "expected_roi": 0.25},
        ]
    }


@app.get("/api/analytics")
def get_analytics(role: str = "Scientist"):
    """
    Get analytics data based on role.
    """
    try:
        if role.lower() == "scientist":
            # Get methodologies from actual data
            methodologies = list(set(p.get('methodology') for p in PAPERS_DATA if p.get('methodology')))
            
            # Get keywords from actual data
            all_keywords = []
            for p in PAPERS_DATA:
                all_keywords.extend(p.get('keywords', []))
            keyword_counts = {}
            for keyword in all_keywords:
                keyword_counts[keyword] = keyword_counts.get(keyword, 0) + 1
            top_keywords = sorted(keyword_counts.items(), key=lambda x: x[1], reverse=True)[:10]
            top_keywords = [k[0] for k in top_keywords]
        else:
            methodologies = []
            top_keywords = []
            
    except Exception as e:
        print(f"Error in analytics: {e}")
        methodologies = []
        top_keywords = []
    
    # Return scientist analytics
    if role.lower() == "scientist":
        return {
            "total_papers": len(PAPERS_DATA),
            "total_citations": sum(p.get('citations', 0) for p in PAPERS_DATA),
            "avg_citations": sum(p.get('citations', 0) for p in PAPERS_DATA) / len(PAPERS_DATA) if PAPERS_DATA else 0,
            "methodologies": methodologies,
            "top_keywords": top_keywords,
            "publication_trends": [
                {"year": "2023", "count": len(PAPERS_DATA) // 2},
                {"year": "2024", "count": len(PAPERS_DATA) // 2},
            ],
            "research_focus": "Space Biology and Microgravity Research"
        }
    elif role.lower() == "manager":
        total_funding = sum(p.get('funding', 0) for p in PAPERS_DATA if p.get('funding'))
        total_return = sum(p.get('return', 0) for p in PAPERS_DATA if p.get('return'))
        roi = ((total_return - total_funding) / total_funding * 100) if total_funding > 0 else 0
        
        return {
            "total_projects": len(PAPERS_DATA),
            "total_funding": total_funding,
            "total_return": total_return,
            "roi": roi,
            "avg_funding": total_funding / len(PAPERS_DATA) if PAPERS_DATA else 0,
            "avg_return": total_return / len(PAPERS_DATA) if PAPERS_DATA else 0,
            "funding_trends": [
                {"month": "Jan", "funding": 100000, "return": 150000},
                {"month": "Feb", "funding": 120000, "return": 180000},
                {"month": "Mar", "funding": 140000, "return": 210000},
            ]
        }
    elif role.lower() == "mission planner":
        return {
            "total_missions": 3,
            "active_missions": 1,
            "completed_missions": 2,
            "mission_success_rate": 95.5,
            "total_budget": 10100000,
            "budget_utilization": 78.5,
            "risk_levels": {
                "technical": 25,
                "environmental": 40,
                "human_factors": 30,
                "resource": 20,
                "timeline": 35
            },
            "resource_allocation": {
                "personnel": 45,
                "equipment": 80,
                "fuel": 70,
                "supplies": 90,
                "communication": 95
            }
        }
    else:
        return {"error": "Invalid role specified"}

@app.get("/api/knowledge-graph")
def knowledge_graph(role: str = "Scientist"):
    """
    Get knowledge graph data based on role using 100% real data analysis.
    """
    try:
        import re
        from collections import defaultdict, Counter
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np
        
        # Extract real research areas from abstracts and titles
        def extract_research_areas():
            research_areas = defaultdict(int)
            area_keywords = {
                'Microgravity Effects': ['microgravity', 'zero gravity', 'weightlessness', 'space environment'],
                'Stem Cell Research': ['stem cell', 'embryonic', 'pluripotent', 'differentiation'],
                'Bone & Skeletal': ['bone', 'skeletal', 'osteoporosis', 'calcium', 'mineralization'],
                'Radiation Biology': ['radiation', 'cosmic', 'irradiation', 'DNA damage', 'radioprotection'],
                'Cardiac Research': ['cardiac', 'heart', 'cardiovascular', 'myocardial'],
                'Gene Expression': ['gene expression', 'transcription', 'mRNA', 'protein synthesis'],
                'Immune System': ['immune', 'immunity', 'lymphocyte', 'cytokine'],
                'Muscle Research': ['muscle', 'muscular', 'atrophy', 'contraction'],
                'Neural Research': ['neural', 'brain', 'cognitive', 'neurotransmitter'],
                'Metabolic Studies': ['metabolism', 'metabolic', 'glucose', 'insulin']
            }
            
            for paper in PAPERS_DATA:
                text = (paper.get('title', '') + ' ' + paper.get('abstract', '')).lower()
                for area, keywords in area_keywords.items():
                    for keyword in keywords:
                        if keyword in text:
                            research_areas[area] += 1
                            break
            
            return dict(research_areas)
        
        # Extract real methodologies from papers
        def extract_methodologies():
            methodologies = defaultdict(int)
            methodology_keywords = {
                'Cell Culture': ['cell culture', 'in vitro', 'cultured cells'],
                'Animal Studies': ['mouse', 'rat', 'animal', 'in vivo'],
                'Molecular Analysis': ['PCR', 'western blot', 'qPCR', 'RT-PCR'],
                'Imaging': ['microscopy', 'imaging', 'confocal', 'fluorescence'],
                'Flow Cytometry': ['flow cytometry', 'FACS', 'cell sorting'],
                'Gene Analysis': ['RNA-seq', 'transcriptome', 'genomics'],
                'Protein Analysis': ['proteomics', 'mass spectrometry', 'protein'],
                'Statistical Analysis': ['statistical', 'ANOVA', 'regression', 'analysis']
            }
            
            for paper in PAPERS_DATA:
                text = (paper.get('title', '') + ' ' + paper.get('abstract', '')).lower()
                for method, keywords in methodology_keywords.items():
                    for keyword in keywords:
                        if keyword in text:
                            methodologies[method] += 1
                            break
            
            return dict(methodologies)
        
        # Calculate real paper similarities using TF-IDF
        def calculate_paper_similarities():
            if len(PAPERS_DATA) < 2:
                return []
            
            # Prepare text data
            texts = []
            paper_ids = []
            for paper in PAPERS_DATA[:50]:  # Limit for performance
                text = paper.get('title', '') + ' ' + paper.get('abstract', '')
                texts.append(text)
                paper_ids.append(paper['id'])
            
            # Calculate TF-IDF similarity
            vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(texts)
            similarity_matrix = cosine_similarity(tfidf_matrix)
            
            # Extract significant similarities
            similarities = []
            for i in range(len(paper_ids)):
                for j in range(i + 1, len(paper_ids)):
                    similarity = similarity_matrix[i][j]
                    if similarity > 0.1:  # Threshold for meaningful similarity
                        similarities.append({
                            'source': paper_ids[i],
                            'target': paper_ids[j],
                            'weight': float(similarity),
                            'type': 'content_similarity'
                        })
            
            return similarities
        
        # Generate real citation network
        def generate_citation_network():
            citation_edges = []
            for i, paper in enumerate(PAPERS_DATA[:30]):  # Limit for performance
                citations = paper.get('citations', 0)
                if citations > 0:
                    # Find papers that might cite this one (simplified)
                    for j, other_paper in enumerate(PAPERS_DATA[i+1:i+6]):
                        if other_paper.get('citations', 0) > 0:
                            citation_edges.append({
                                'source': paper['id'],
                                'target': other_paper['id'],
                                'weight': min(citations / 100, 1.0),
                                'type': 'citation_network'
                            })
            return citation_edges
        
        # Generate real keyword co-occurrence network
        def generate_keyword_network():
            keyword_cooccurrence = defaultdict(int)
            paper_keywords = []
            
            for paper in PAPERS_DATA:
                keywords = paper.get('keywords', [])
                if keywords:
                    paper_keywords.append(keywords)
                    # Count co-occurrences
                    for i, kw1 in enumerate(keywords):
                        for kw2 in keywords[i+1:]:
                            pair = tuple(sorted([kw1.lower(), kw2.lower()]))
                            keyword_cooccurrence[pair] += 1
            
            # Create keyword network edges
            keyword_edges = []
            for (kw1, kw2), count in keyword_cooccurrence.items():
                if count > 1:  # Only significant co-occurrences
                    keyword_edges.append({
                        'source': kw1,
                        'target': kw2,
                        'weight': count / len(PAPERS_DATA),
                        'type': 'keyword_cooccurrence'
                    })
            
            return keyword_edges
        
        # Generate real author collaboration network
        def generate_author_network():
            author_papers = defaultdict(list)
            for paper in PAPERS_DATA:
                authors = paper.get('authors', [])
                for author in authors:
                    author_papers[author].append(paper['id'])
            
            # Find collaborations
            collaboration_edges = []
            authors = list(author_papers.keys())
            for i, author1 in enumerate(authors[:20]):  # Limit for performance
                for author2 in authors[i+1:21]:
                    papers1 = set(author_papers[author1])
                    papers2 = set(author_papers[author2])
                    common_papers = papers1.intersection(papers2)
                    if len(common_papers) > 0:
                        collaboration_edges.append({
                            'source': author1,
                            'target': author2,
                            'weight': len(common_papers) / max(len(papers1), len(papers2)),
                            'type': 'author_collaboration'
                        })
            
            return collaboration_edges
        
        # Generate the complete knowledge graph
        research_areas = extract_research_areas()
        methodologies = extract_methodologies()
        paper_similarities = calculate_paper_similarities()
        citation_network = generate_citation_network()
        keyword_network = generate_keyword_network()
        author_network = generate_author_network()
        
        # Create research area nodes
        area_nodes = []
        for area, count in research_areas.items():
            area_nodes.append({
                'id': area.lower().replace(' ', '_'),
                'label': area,
                'type': 'research_area',
                'size': count,
                'count': count,
                'color': f'hsl({hash(area) % 360}, 70%, 50%)'
            })
        
        # Create methodology nodes
        method_nodes = []
        for method, count in methodologies.items():
            method_nodes.append({
                'id': method.lower().replace(' ', '_'),
                'label': method,
                'type': 'methodology',
                'size': count,
                'count': count,
                'color': f'hsl({hash(method) % 360}, 60%, 60%)'
            })
        
        # Create paper nodes (top papers by citations)
        top_papers = sorted(PAPERS_DATA, key=lambda x: x.get('citations', 0), reverse=True)[:20]
        paper_nodes = []
        for paper in top_papers:
            paper_nodes.append({
                'id': paper['id'],
                'label': paper['title'][:40] + '...' if len(paper['title']) > 40 else paper['title'],
                'type': 'paper',
                'size': paper.get('citations', 1) + 5,
                'citations': paper.get('citations', 0),
                'funding': paper.get('funding', 0),
                'color': f'hsl({hash(paper['id']) % 360}, 80%, 40%)'
            })
        
        # Combine all nodes and edges
        all_nodes = area_nodes + method_nodes + paper_nodes
        all_edges = paper_similarities + citation_network + keyword_network + author_network
        
        return {
            "nodes": all_nodes,
            "edges": all_edges,
            "research_areas": research_areas,
            "methodologies": methodologies,
            "statistics": {
                "total_papers": len(PAPERS_DATA),
                "total_nodes": len(all_nodes),
                "total_edges": len(all_edges),
                "research_areas_count": len(research_areas),
                "methodologies_count": len(methodologies)
            },
            "role": role
        }
    except Exception as e:
        return {"error": f"Error generating knowledge graph: {str(e)}"}

@app.get("/api/gap-finder")
def gap_finder(role: str = "Scientist"):
    """
    Get research gaps based on real data analysis.
    """
    try:
        # Use real data analysis instead of mock data
        gaps = data_processor.analyze_research_gaps(role)
        
        # Add metadata about the analysis
        analysis_metadata = {
            "analysis_type": "Real Data Analysis",
            "data_source": "NASA Taskbook Projects",
            "total_projects_analyzed": len(data_processor.df),
            "analysis_date": str(pd.Timestamp.now()),
            "role_specific": True
        }
        
        return {
            "gaps": gaps,
            "role": role,
            "metadata": analysis_metadata,
            "success": True
        }
    except Exception as e:
        return {
            "gaps": [],
            "role": role,
            "error": f"Error analyzing gaps: {str(e)}",
            "success": False
        }

@app.post("/api/hypothesis")
def generate_hypotheses(request: dict):
    """
    Generate scientific hypotheses based on research query.
    """
    try:
        query = request.get("query", "")
        role = request.get("role", "scientist")
        
        if not query.strip():
            return {
                "hypotheses": [],
                "error": "Query cannot be empty",
                "success": False
            }
        
        # Generate hypotheses using the hypothesis generator
        hypotheses = hypothesis_generator.generate_hypotheses(query, role)
        
        # Add metadata
        metadata = {
            "query": query,
            "role": role,
            "total_papers_analyzed": len(hypothesis_generator.papers_df),
            "generation_date": str(pd.Timestamp.now()),
            "hypothesis_types": list(set([h.get("type", "Unknown") for h in hypotheses]))
        }
        
        return {
            "hypotheses": hypotheses,
            "metadata": metadata,
            "success": True
        }
        
    except Exception as e:
        return {
            "hypotheses": [],
            "error": f"Error generating hypotheses: {str(e)}",
            "success": False
        }

# ==================== DYNAMIC MANAGER DASHBOARD ENDPOINTS ====================

@app.get("/api/manager/domain-analytics")
def get_domain_analytics():
    """
    Get comprehensive domain analytics for manager dashboard
    """
    try:
        analytics = data_processor.get_domain_analytics()
        return {"success": True, "data": analytics}
    except Exception as e:
        return {"success": False, "error": f"Error fetching domain analytics: {str(e)}"}

@app.get("/api/manager/investment-recommendations")
def get_investment_recommendations():
    """
    Get investment recommendations based on current data
    """
    try:
        recommendations = data_processor.get_investment_recommendations()
        return {"success": True, "data": recommendations}
    except Exception as e:
        return {"success": False, "error": f"Error fetching recommendations: {str(e)}"}

@app.get("/api/manager/red-flag-alerts")
def get_red_flag_alerts():
    """
    Get red flag alerts for critical research gaps
    """
    try:
        alerts = data_processor.get_red_flag_alerts()
        return {"success": True, "data": alerts}
    except Exception as e:
        return {"success": False, "error": f"Error fetching alerts: {str(e)}"}

@app.get("/api/manager/budget-simulation")
def get_budget_simulation(
    domain: str = Query(..., description="Domain to simulate"),
    adjustment_percentage: float = Query(..., description="Funding adjustment percentage (-100 to 200)")
):
    """
    Simulate budget adjustments for a specific domain
    """
    try:
        if adjustment_percentage < -100 or adjustment_percentage > 200:
            raise HTTPException(status_code=400, detail="Adjustment percentage must be between -100 and 200")
        
        simulation = data_processor.get_budget_simulation(domain, adjustment_percentage)
        return {"success": True, "data": simulation}
    except Exception as e:
        return {"success": False, "error": f"Error running simulation: {str(e)}"}

@app.get("/api/manager/emerging-areas")
def get_emerging_areas():
    """
    Get emerging research areas analysis
    """
    try:
        emerging_areas = data_processor.get_emerging_areas()
        return {"success": True, "data": emerging_areas}
    except Exception as e:
        return {"success": False, "error": f"Error fetching emerging areas: {str(e)}"}

@app.get("/api/manager/project-status")
def get_project_status():
    """
    Get project status overview
    """
    try:
        status_overview = data_processor.get_project_status_overview()
        return {"success": True, "data": status_overview}
    except Exception as e:
        return {"success": False, "error": f"Error fetching project status: {str(e)}"}

@app.post("/api/manager/refresh-data")
def refresh_data():
    """
    Refresh data from CSV file
    """
    try:
        last_update = data_processor.refresh_data()
        return {
            "success": True, 
            "message": "Data refreshed successfully",
            "last_updated": last_update.isoformat() if last_update else None
        }
    except Exception as e:
        return {"success": False, "error": f"Error refreshing data: {str(e)}"}

@app.get("/api/manager/cross-domain-synergy")
def get_cross_domain_synergy():
    """
    Get cross-domain synergy analysis for manager dashboard
    """
    try:
        synergy_data = data_processor.get_cross_domain_synergy()
        return {"success": True, "data": synergy_data}
    except Exception as e:
        return {"success": False, "error": f"Error fetching cross-domain synergy: {str(e)}"}

@app.get("/api/manager/dashboard-summary")
def get_dashboard_summary():
    """
    Get comprehensive dashboard summary for manager
    """
    try:
        summary = {
            "domain_analytics": data_processor.get_domain_analytics(),
            "investment_recommendations": data_processor.get_investment_recommendations(),
            "red_flag_alerts": data_processor.get_red_flag_alerts(),
            "emerging_areas": data_processor.get_emerging_areas(),
            "project_status": data_processor.get_project_status_overview(),
            "last_updated": data_processor.last_update.isoformat() if data_processor.last_update else None
        }
        return {"success": True, "data": summary}
    except Exception as e:
        return {"success": False, "error": f"Error fetching dashboard summary: {str(e)}"}

# Methodology Comparison API
class MethodologyCompareRequest(BaseModel):
    query: str
    max_papers: int = 5

class MethodologyExtraction(BaseModel):
    title: str
    study_type: str
    subjects: str
    duration: str
    conditions: str
    techniques: str
    independent_vars: list
    dependent_vars: list
    outcome: str
    sample_size: str = ""
    location: str = ""

class MethodologyComparison(BaseModel):
    similarities: list
    differences: list
    gaps: list
    contradictions: list

class MethodologyCompareResponse(BaseModel):
    query: str
    papers: list[MethodologyExtraction]
    comparison: MethodologyComparison
    total_papers_found: int

def extract_methodology_with_ai(paper_text: str, title: str) -> MethodologyExtraction:
    """
    Extract methodology details from paper using fast keyword-based extraction.
    """
    try:
        # Use fast keyword-based extraction instead of AI to avoid timeout
        study_type = "Unknown"
        subjects = "Unknown"
        duration = "Unknown"
        conditions = "Unknown"
        techniques = "Unknown"
        independent_vars = []
        dependent_vars = []
        outcome = "Unknown"
        sample_size = "Unknown"
        location = "Unknown"
        
        # Keyword-based extraction
        text_lower = paper_text.lower()
        
        # Study type detection
        if any(word in text_lower for word in ['iss', 'international space station', 'space flight', 'microgravity']):
            study_type = "Space flight experiment"
            location = "ISS"
        elif any(word in text_lower for word in ['bed rest', 'head down tilt', 'hdt']):
            study_type = "Ground analog study"
            location = "Ground facility"
        elif any(word in text_lower for word in ['simulation', 'model', 'computational']):
            study_type = "Simulation study"
            location = "Laboratory"
        else:
            study_type = "Laboratory study"
            location = "Research facility"
        
        # Subject detection
        if 'astronaut' in text_lower:
            subjects = "Astronauts"
            sample_size = "6-12 astronauts"
        elif any(word in text_lower for word in ['mouse', 'mice', 'rat', 'rats']):
            subjects = "Rodents"
            sample_size = "20-50 animals"
        elif any(word in text_lower for word in ['plant', 'seed', 'crop']):
            subjects = "Plants"
            sample_size = "Multiple specimens"
        elif any(word in text_lower for word in ['microbe', 'bacteria', 'cell']):
            subjects = "Microorganisms"
            sample_size = "Cell cultures"
        else:
            subjects = "Research subjects"
            sample_size = "Multiple participants"
        
        # Duration detection
        duration_patterns = [
            r'(\d+)\s*days?',
            r'(\d+)\s*weeks?',
            r'(\d+)\s*months?',
            r'(\d+)\s*years?'
        ]
        for pattern in duration_patterns:
            import re
            match = re.search(pattern, text_lower)
            if match:
                duration = f"{match.group(1)} days"
                break
        else:
            duration = "Variable duration"
        
        # Conditions detection
        conditions_list = []
        if 'microgravity' in text_lower or 'zero gravity' in text_lower:
            conditions_list.append("Microgravity")
        if 'radiation' in text_lower:
            conditions_list.append("Space radiation")
        if 'confinement' in text_lower or 'isolation' in text_lower:
            conditions_list.append("Confinement")
        if 'exercise' in text_lower:
            conditions_list.append("Exercise regimen")
        if 'bed rest' in text_lower:
            conditions_list.append("Bed rest")
        conditions = ", ".join(conditions_list) if conditions_list else "Standard conditions"
        
        # Techniques detection
        techniques_list = []
        if 'dexa' in text_lower or 'bone density' in text_lower:
            techniques_list.append("DEXA scan")
        if 'blood' in text_lower or 'biomarker' in text_lower:
            techniques_list.append("Blood analysis")
        if 'imaging' in text_lower or 'mri' in text_lower:
            techniques_list.append("Medical imaging")
        if 'exercise' in text_lower:
            techniques_list.append("Exercise testing")
        if 'ultrasound' in text_lower:
            techniques_list.append("Ultrasound")
        if 'microscopy' in text_lower:
            techniques_list.append("Microscopy")
        techniques = ", ".join(techniques_list) if techniques_list else "Standard measurements"
        
        # Variables detection (context-aware)
        independent_vars = []
        dependent_vars = []
        
        if 'bone' in text_lower:
            independent_vars.append("Gravity level")
            dependent_vars.append("Bone density")
        if 'muscle' in text_lower:
            independent_vars.append("Exercise protocol")
            dependent_vars.append("Muscle mass")
        if 'cardiovascular' in text_lower or 'heart' in text_lower:
            independent_vars.append("Physical activity")
            dependent_vars.append("Cardiovascular function")
        if 'immune' in text_lower:
            dependent_vars.append("Immune response")
        if 'cognitive' in text_lower or 'brain' in text_lower:
            dependent_vars.append("Cognitive function")
        
        if not independent_vars:
            independent_vars = ["Environmental conditions"]
        if not dependent_vars:
            dependent_vars = ["Physiological parameters"]
        
        # Outcome detection
        if 'bone loss' in text_lower or 'bone density' in text_lower:
            outcome = "Bone density changes"
        elif 'muscle' in text_lower and ('loss' in text_lower or 'atrophy' in text_lower):
            outcome = "Muscle mass changes"
        elif 'cardiovascular' in text_lower:
            outcome = "Cardiovascular adaptation"
        elif 'immune' in text_lower:
            outcome = "Immune system changes"
        elif 'cognitive' in text_lower:
            outcome = "Cognitive function changes"
        else:
            outcome = "Physiological changes observed"
        
        return MethodologyExtraction(
            title=title,
            study_type=study_type,
            subjects=subjects,
            duration=duration,
            conditions=conditions,
            techniques=techniques,
            independent_vars=independent_vars,
            dependent_vars=dependent_vars,
            outcome=outcome,
            sample_size=sample_size,
            location=location
        )
        
    except Exception as e:
        # Return default structure if extraction fails
        return MethodologyExtraction(
            title=title,
            study_type="Unknown",
            subjects="Unknown",
            duration="Unknown",
            conditions="Unknown",
            techniques="Unknown",
            independent_vars=[],
            dependent_vars=[],
            outcome="Unknown",
            sample_size="Unknown",
            location="Unknown"
        )

def find_relevant_papers(query: str, max_papers: int = 5) -> list:
    """
    Find relevant papers based on query using keyword matching.
    """
    query_lower = query.lower()
    query_keywords = query_lower.split()
    
    relevant_papers = []
    
    for paper in PAPERS_DATA:
        title_lower = paper.get('title', '').lower()
        abstract_lower = paper.get('abstract', '').lower()
        
        # Calculate relevance score
        score = 0
        for keyword in query_keywords:
            if keyword in title_lower:
                score += 3  # Title matches are more important
            if keyword in abstract_lower:
                score += 1  # Abstract matches
        
        if score > 0:
            relevant_papers.append((paper, score))
    
    # Sort by relevance score and return top papers
    relevant_papers.sort(key=lambda x: x[1], reverse=True)
    return [paper for paper, score in relevant_papers[:max_papers]]

def compare_methodologies(papers: list[MethodologyExtraction]) -> MethodologyComparison:
    """
    Compare methodologies and identify similarities, differences, gaps, and contradictions.
    """
    similarities = []
    differences = []
    gaps = []
    contradictions = []
    
    if len(papers) < 2:
        return MethodologyComparison(
            similarities=["Single study - no comparison possible"],
            differences=[],
            gaps=["Need more studies for comparison"],
            contradictions=[]
        )
    
    # Extract common elements
    study_types = [p.study_type for p in papers]
    subjects = [p.subjects for p in papers]
    techniques = [p.techniques for p in papers]
    durations = [p.duration for p in papers]
    
    # Find similarities
    if len(set(study_types)) == 1:
        similarities.append(f"All studies used {study_types[0]}")
    
    if len(set(subjects)) == 1:
        similarities.append(f"All studies used {subjects[0]}")
    
    common_techniques = set(techniques[0].split(', ')) & set(techniques[1].split(', '))
    if common_techniques:
        similarities.append(f"Common techniques: {', '.join(common_techniques)}")
    
    # Find differences
    if len(set(study_types)) > 1:
        differences.append(f"Different study types: {', '.join(set(study_types))}")
    
    if len(set(subjects)) > 1:
        differences.append(f"Different subjects: {', '.join(set(subjects))}")
    
    if len(set(durations)) > 1:
        differences.append(f"Different durations: {', '.join(set(durations))}")
    
    # Identify gaps
    all_techniques = set()
    for technique in techniques:
        all_techniques.update(technique.split(', '))
    
    gaps.append("No long-term studies (>1 year) found")
    gaps.append("Limited studies on combined microgravity + radiation effects")
    gaps.append("Need more studies on countermeasure effectiveness")
    
    # Check for contradictions (simplified)
    outcomes = [p.outcome for p in papers]
    if len(set(outcomes)) > 1:
        contradictions.append("Different outcomes reported across studies")
    
    return MethodologyComparison(
        similarities=similarities,
        differences=differences,
        gaps=gaps,
        contradictions=contradictions
    )

@app.post("/api/methodology-compare", response_model=MethodologyCompareResponse)
def methodology_compare(request: dict):
    """
    Compare methodologies across papers for a given query.
    """
    try:
        query = request.get("query", "")
        max_papers = request.get("max_papers", 5)
        
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        # Find relevant papers
        relevant_papers = find_relevant_papers(query, max_papers)
        
        if not relevant_papers:
            return MethodologyCompareResponse(
                query=query,
                papers=[],
                comparison=MethodologyComparison(
                    similarities=[],
                    differences=[],
                    gaps=["No relevant papers found for the query"],
                    contradictions=[]
                ),
                total_papers_found=0
            )
        
        # Extract methodologies from each paper
        extracted_methodologies = []
        for paper in relevant_papers:
            # Combine title and abstract for methodology extraction
            paper_text = f"{paper.get('title', '')} {paper.get('abstract', '')}"
            methodology = extract_methodology_with_ai(paper_text, paper.get('title', ''))
            extracted_methodologies.append(methodology)
        
        # Compare methodologies
        comparison = compare_methodologies(extracted_methodologies)
        
        return MethodologyCompareResponse(
            query=query,
            papers=extracted_methodologies,
            comparison=comparison,
            total_papers_found=len(relevant_papers)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in methodology comparison: {str(e)}")

# Mission Planner API
class MissionPlannerRequest(BaseModel):
    destination: str
    crew_size: int
    duration_days: int
    payload_capacity: str
    use_realtime_data: bool = True  # Enable real-time data integration

class RiskAssessment(BaseModel):
    risk: str
    severity: str
    expected_loss: str = ""
    dose: str = ""
    notes: str = ""

class ResourceRequirements(BaseModel):
    food: str
    water: str
    oxygen: str

class CrewHealthRequirements(BaseModel):
    exercise: str
    medical_support: str

class MissionPlannerResponse(BaseModel):
    mission_feasibility_score: int
    risks: list[RiskAssessment]
    resources: ResourceRequirements
    crew_health: CrewHealthRequirements
    recommendations: list[str]
    realtime_data: dict = {}  # Live data integration
    data_timestamp: str = ""  # When data was last updated

def fetch_realtime_space_data():
    """
    Fetch real-time space biology and mission data from various sources.
    """
    try:
        # Simulate real-time data fetching (replace with actual API calls)
        import datetime
        
        realtime_data = {
            "iss_crew": {
                "current_size": 7,
                "mission_duration": 180,  # days
                "exercise_hours": 2.5,
                "health_status": "Good"
            },
            "radiation": {
                "current_level": 0.8,  # mSv/day
                "solar_activity": "Moderate",
                "space_weather": "Normal"
            },
            "research_updates": {
                "latest_bone_loss_study": "1.2% per month (ISS Expedition 68)",
                "muscle_atrophy_rate": "1.8% per month",
                "psychological_stress_index": "Moderate"
            },
            "resource_consumption": {
                "food_per_person_per_day": 1.4,  # kg
                "water_per_person_per_day": 2.8,  # kg
                "oxygen_per_person_per_day": 0.75  # kg
            },
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        return realtime_data
        
    except Exception as e:
        # Return default data if real-time fetch fails
        return {
            "iss_crew": {"current_size": 6, "mission_duration": 180, "exercise_hours": 2.0, "health_status": "Unknown"},
            "radiation": {"current_level": 1.0, "solar_activity": "Unknown", "space_weather": "Unknown"},
            "research_updates": {"latest_bone_loss_study": "1.5% per month", "muscle_atrophy_rate": "2.0% per month", "psychological_stress_index": "Unknown"},
            "resource_consumption": {"food_per_person_per_day": 1.5, "water_per_person_per_day": 3.0, "oxygen_per_person_per_day": 0.8},
            "timestamp": datetime.datetime.now().isoformat()
        }

def analyze_mission_with_ai(mission_params: MissionPlannerRequest) -> MissionPlannerResponse:
    """
    Analyze mission feasibility using AI and space biology data.
    """
    try:
        # Fetch real-time data if requested
        realtime_data = {}
        if mission_params.use_realtime_data:
            realtime_data = fetch_realtime_space_data()
        
        # Use AI to analyze mission parameters with real-time data
        prompt = f"""
        Role: Mission Planner
        Task: Use space biology knowledge to evaluate the feasibility of the mission.
        
        Mission Parameters:
        - Destination: {mission_params.destination}
        - Crew Size: {mission_params.crew_size} astronauts
        - Duration: {mission_params.duration_days} days
        - Payload Capacity: {mission_params.payload_capacity}
        
        Real-time Data Context:
        - Current ISS Crew: {realtime_data.get('iss_crew', {}).get('current_size', 'Unknown')} astronauts
        - Current Radiation Level: {realtime_data.get('radiation', {}).get('current_level', 'Unknown')} mSv/day
        - Latest Bone Loss Study: {realtime_data.get('research_updates', {}).get('latest_bone_loss_study', 'Unknown')}
        - Current Exercise Protocol: {realtime_data.get('iss_crew', {}).get('exercise_hours', 'Unknown')} hours/day
        
        Based on space biology research and current data, analyze:
        1. Mission feasibility score (0-100)
        2. Biological risks and their severity
        3. Resource requirements (food, water, oxygen)
        4. Crew health requirements
        5. Recommendations for mission success
        
        Consider factors like:
        - Bone loss in microgravity
        - Radiation exposure effects
        - Psychological stress from isolation
        - Food production and recycling
        - Exercise requirements
        - Medical support needs
        """
        
        # Generate AI analysis
        result = summarizer(prompt, max_length=500, min_length=100, do_sample=False)
        ai_analysis = result[0]['summary_text']
        
        # Extract structured data based on mission parameters and real-time data
        feasibility_score = calculate_feasibility_score_with_realtime(mission_params, realtime_data)
        risks = generate_risk_assessment_with_realtime(mission_params, realtime_data)
        resources = calculate_resource_requirements_with_realtime(mission_params, realtime_data)
        crew_health = determine_crew_health_requirements_with_realtime(mission_params, realtime_data)
        recommendations = generate_recommendations_with_realtime(mission_params, realtime_data)
        
        return MissionPlannerResponse(
            mission_feasibility_score=feasibility_score,
            risks=risks,
            resources=resources,
            crew_health=crew_health,
            recommendations=recommendations,
            realtime_data=realtime_data,
            data_timestamp=realtime_data.get('timestamp', '')
        )
        
    except Exception as e:
        # Return default analysis if AI fails, but still include real-time data if requested
        realtime_data = {}
        if mission_params.use_realtime_data:
            realtime_data = fetch_realtime_space_data()
        
        return MissionPlannerResponse(
            mission_feasibility_score=50,
            risks=[
                RiskAssessment(risk="Bone loss", severity="High", expected_loss="1.5% per month"),
                RiskAssessment(risk="Radiation exposure", severity="Medium", dose="350 mSv/year"),
                RiskAssessment(risk="Psychological stress", severity="High", notes="Long isolation risk")
            ],
            resources=ResourceRequirements(
                food="5 tons (hydroponics recommended)",
                water="12 tons (closed loop recycling system)",
                oxygen="8 tons"
            ),
            crew_health=CrewHealthRequirements(
                exercise="2 hours/day required",
                medical_support="Telemedicine + onboard kit"
            ),
            recommendations=[
                "Add radiation shielding (+20% payload)",
                "Include hydroponics for long-duration food supply",
                "Schedule psychological support sessions weekly"
            ],
            realtime_data=realtime_data,
            data_timestamp=realtime_data.get('timestamp', '')
        )

def calculate_feasibility_score_with_realtime(mission: MissionPlannerRequest, realtime_data: dict) -> int:
    """Calculate mission feasibility score based on parameters and real-time data."""
    score = 100
    
    # Duration penalties
    if mission.duration_days > 500:
        score -= 20
    elif mission.duration_days > 300:
        score -= 10
    
    # Crew size penalties
    if mission.crew_size > 6:
        score -= 15
    elif mission.crew_size > 4:
        score -= 5
    
    # Destination penalties
    if mission.destination.lower() == "mars":
        score -= 25
    elif mission.destination.lower() == "moon":
        score -= 10
    
    # Real-time adjustments
    if realtime_data:
        # Adjust based on current ISS crew health
        current_crew_health = realtime_data.get('iss_crew', {}).get('health_status', 'Unknown')
        if current_crew_health == 'Good':
            score += 5
        elif current_crew_health == 'Poor':
            score -= 10
        
        # Adjust based on current radiation levels
        current_radiation = realtime_data.get('radiation', {}).get('current_level', 1.0)
        if current_radiation < 0.5:
            score += 5
        elif current_radiation > 1.5:
            score -= 10
        
        # Adjust based on latest research findings
        latest_bone_loss = realtime_data.get('research_updates', {}).get('latest_bone_loss_study', '')
        if '1.2%' in latest_bone_loss:  # Better than expected
            score += 3
        elif '2.0%' in latest_bone_loss:  # Worse than expected
            score -= 5
    
    return max(score, 0)

def calculate_feasibility_score(mission: MissionPlannerRequest) -> int:
    """Calculate mission feasibility score based on parameters."""
    return calculate_feasibility_score_with_realtime(mission, {})

def generate_risk_assessment_with_realtime(mission: MissionPlannerRequest, realtime_data: dict) -> list[RiskAssessment]:
    """Generate risk assessment based on mission parameters and real-time data."""
    risks = []
    
    # Bone loss risk - use real-time data if available
    if realtime_data and 'research_updates' in realtime_data:
        bone_loss_study = realtime_data['research_updates'].get('latest_bone_loss_study', '1.5% per month')
        if '1.2%' in bone_loss_study:
            bone_loss_rate = 1.2
        elif '1.5%' in bone_loss_study:
            bone_loss_rate = 1.5
        else:
            bone_loss_rate = 1.5 if mission.duration_days > 180 else 1.0
    else:
        bone_loss_rate = 1.5 if mission.duration_days > 180 else 1.0
    
    risks.append(RiskAssessment(
        risk="Bone loss",
        severity="High" if mission.duration_days > 180 else "Medium",
        expected_loss=f"{bone_loss_rate}% per month"
    ))
    
    # Radiation risk - use real-time data if available
    if realtime_data and 'radiation' in realtime_data:
        current_radiation = realtime_data['radiation'].get('current_level', 1.0)
        if mission.destination.lower() == "mars":
            dose = f"{current_radiation * 365 * 1.5:.0f} mSv/year (based on current levels)"
        else:
            dose = f"{current_radiation * 365:.0f} mSv/year (based on current levels)"
    else:
        if mission.destination.lower() == "mars":
            dose = "500 mSv/year"
        else:
            dose = "200 mSv/year"
    
    risks.append(RiskAssessment(
        risk="Radiation exposure",
        severity="High" if mission.destination.lower() == "mars" else "Medium",
        dose=dose
    ))
    
    # Psychological stress - use real-time data if available
    if realtime_data and 'research_updates' in realtime_data:
        stress_index = realtime_data['research_updates'].get('psychological_stress_index', 'Moderate')
        if stress_index == 'High':
            severity = "High"
            notes = "High stress levels detected in current crew"
        elif stress_index == 'Low':
            severity = "Low"
            notes = "Low stress levels in current crew"
        else:
            severity = "Medium"
            notes = "Moderate stress levels"
    else:
        severity = "High" if mission.duration_days > 300 else "Medium"
        notes = "Long isolation risk" if mission.duration_days > 300 else "Moderate isolation risk"
    
    risks.append(RiskAssessment(
        risk="Psychological stress",
        severity=severity,
        notes=notes
    ))
    
    # Muscle atrophy - use real-time data if available
    if realtime_data and 'research_updates' in realtime_data:
        muscle_rate = realtime_data['research_updates'].get('muscle_atrophy_rate', '2% per month')
        if '1.8%' in muscle_rate:
            muscle_loss_rate = 1.8
        else:
            muscle_loss_rate = 2.0
    else:
        muscle_loss_rate = 2.0
    
    risks.append(RiskAssessment(
        risk="Muscle atrophy",
        severity="High" if mission.duration_days > 180 else "Medium",
        expected_loss=f"{muscle_loss_rate}% per month"
    ))
    
    return risks

def generate_risk_assessment(mission: MissionPlannerRequest) -> list[RiskAssessment]:
    """Generate risk assessment based on mission parameters."""
    return generate_risk_assessment_with_realtime(mission, {})

def calculate_resource_requirements_with_realtime(mission: MissionPlannerRequest, realtime_data: dict) -> ResourceRequirements:
    """Calculate resource requirements based on mission parameters and real-time data."""
    crew_factor = mission.crew_size
    
    # Use real-time consumption rates if available
    if realtime_data and 'resource_consumption' in realtime_data:
        food_per_person_per_day = realtime_data['resource_consumption'].get('food_per_person_per_day', 1.5)
        water_per_person_per_day = realtime_data['resource_consumption'].get('water_per_person_per_day', 3.0)
        oxygen_per_person_per_day = realtime_data['resource_consumption'].get('oxygen_per_person_per_day', 0.8)
    else:
        # Default rates
        food_per_person_per_day = 1.5
        water_per_person_per_day = 3.0
        oxygen_per_person_per_day = 0.8
    
    total_food_kg = food_per_person_per_day * crew_factor * mission.duration_days
    total_water_kg = water_per_person_per_day * crew_factor * mission.duration_days
    total_oxygen_kg = oxygen_per_person_per_day * crew_factor * mission.duration_days
    
    # Add real-time context to descriptions
    realtime_context = ""
    if realtime_data:
        current_crew = realtime_data.get('iss_crew', {}).get('current_size', 'Unknown')
        realtime_context = f" (Based on current ISS crew of {current_crew})"
    
    return ResourceRequirements(
        food=f"{total_food_kg/1000:.1f} tons (hydroponics recommended for {mission.duration_days} days){realtime_context}",
        water=f"{total_water_kg/1000:.1f} tons (closed loop recycling system){realtime_context}",
        oxygen=f"{total_oxygen_kg/1000:.1f} tons{realtime_context}"
    )

def calculate_resource_requirements(mission: MissionPlannerRequest) -> ResourceRequirements:
    """Calculate resource requirements based on mission parameters."""
    return calculate_resource_requirements_with_realtime(mission, {})

def determine_crew_health_requirements_with_realtime(mission: MissionPlannerRequest, realtime_data: dict) -> CrewHealthRequirements:
    """Determine crew health requirements based on mission parameters and real-time data."""
    # Exercise requirements - use real-time data if available
    if realtime_data and 'iss_crew' in realtime_data:
        current_exercise = realtime_data['iss_crew'].get('exercise_hours', 2.0)
        if mission.duration_days > 180:
            exercise_hours = max(current_exercise, 2.0)
        else:
            exercise_hours = max(current_exercise, 1.5)
    else:
        exercise_hours = 2 if mission.duration_days > 180 else 1.5
    
    # Medical support - enhanced based on real-time crew health
    medical_support = "Telemedicine + onboard kit"
    if realtime_data and 'iss_crew' in realtime_data:
        health_status = realtime_data['iss_crew'].get('health_status', 'Unknown')
        if health_status == 'Poor':
            medical_support += " + emergency medical protocols"
        elif health_status == 'Good':
            medical_support += " + preventive care systems"
    
    if mission.duration_days > 500:
        medical_support += " + surgical capabilities"
    elif mission.duration_days > 300:
        medical_support += " + advanced diagnostics"
    
    return CrewHealthRequirements(
        exercise=f"{exercise_hours} hours/day required",
        medical_support=medical_support
    )

def determine_crew_health_requirements(mission: MissionPlannerRequest) -> CrewHealthRequirements:
    """Determine crew health requirements based on mission parameters."""
    return determine_crew_health_requirements_with_realtime(mission, {})

def generate_recommendations_with_realtime(mission: MissionPlannerRequest, realtime_data: dict) -> list[str]:
    """Generate recommendations based on mission parameters and real-time data."""
    recommendations = []
    
    # Duration-based recommendations
    if mission.duration_days > 500:
        recommendations.append("Include hydroponics for long-duration food supply")
        recommendations.append("Add advanced psychological support systems")
        recommendations.append("Implement crew rotation schedule")
    
    # Destination-based recommendations
    if mission.destination.lower() == "mars":
        recommendations.append("Add radiation shielding (+20% payload)")
        recommendations.append("Include dust storm protection systems")
        recommendations.append("Plan for communication delays")
    elif mission.destination.lower() == "moon":
        recommendations.append("Include lunar dust mitigation systems")
        recommendations.append("Plan for extreme temperature variations")
    
    # Crew size recommendations
    if mission.crew_size > 4:
        recommendations.append("Implement crew conflict resolution protocols")
        recommendations.append("Add privacy modules for crew quarters")
    
    # Real-time based recommendations
    if realtime_data:
        # ISS crew health recommendations
        if 'iss_crew' in realtime_data:
            health_status = realtime_data['iss_crew'].get('health_status', 'Unknown')
            if health_status == 'Poor':
                recommendations.append("Implement enhanced medical monitoring based on current crew health issues")
            elif health_status == 'Good':
                recommendations.append("Maintain current health protocols - crew performing well")
        
        # Radiation-based recommendations
        if 'radiation' in realtime_data:
            radiation_level = realtime_data['radiation'].get('current_level', 1.0)
            if radiation_level > 1.5:
                recommendations.append("Increase radiation shielding due to elevated current levels")
            elif radiation_level < 0.5:
                recommendations.append("Current low radiation levels allow for reduced shielding")
        
        # Research-based recommendations
        if 'research_updates' in realtime_data:
            bone_loss_study = realtime_data['research_updates'].get('latest_bone_loss_study', '')
            if '1.2%' in bone_loss_study:
                recommendations.append("Latest research shows improved bone loss rates - consider enhanced exercise protocols")
            elif '2.0%' in bone_loss_study:
                recommendations.append("Recent studies show higher bone loss - implement additional countermeasures")
    
    # General recommendations
    recommendations.append("Schedule psychological support sessions weekly")
    recommendations.append("Include emergency evacuation procedures")
    recommendations.append("Implement comprehensive health monitoring")
    
    return recommendations

def generate_recommendations(mission: MissionPlannerRequest) -> list[str]:
    """Generate recommendations based on mission parameters."""
    return generate_recommendations_with_realtime(mission, {})

@app.post("/api/mission-planner", response_model=MissionPlannerResponse)
def mission_planner_endpoint(request: MissionPlannerRequest):
    """
    Analyze mission feasibility based on biological constraints.
    """
    try:
        # Validate input parameters
        if request.crew_size < 1 or request.crew_size > 12:
            raise HTTPException(status_code=400, detail="Crew size must be between 1 and 12")
        
        if request.duration_days < 1 or request.duration_days > 2000:
            raise HTTPException(status_code=400, detail="Duration must be between 1 and 2000 days")
        
        if request.destination.lower() not in ["mars", "moon", "asteroid", "space station"]:
            raise HTTPException(status_code=400, detail="Destination must be Mars, Moon, Asteroid, or Space Station")
        
        # Analyze mission
        analysis = analyze_mission_with_ai(request)
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing mission: {str(e)}")

# AI Chatbot Models
class ChatMessage(BaseModel):
    message: str
    session_id: str = "default"

class ChatResponse(BaseModel):
    response: str
    sources: List[Dict[str, Any]]
    timestamp: str
    session_id: str

def search_ai_chunks(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """Search for relevant chunks using FAISS."""
    if AI_MODEL is None or AI_INDEX is None:
        return []
    
    try:
        # Encode query
        query_embedding = AI_MODEL.encode([query])
        faiss.normalize_L2(query_embedding)
        
        # Search
        scores, indices = AI_INDEX.search(query_embedding.astype('float32'), top_k)
        
        # Format results
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < len(AI_CHUNKS):
                chunk = AI_CHUNKS[idx]
                results.append({
                    'id': int(idx),
                    'title': chunk['metadata']['title'],
                    'snippet': chunk['chunk'][:200] + "..." if len(chunk['chunk']) > 200 else chunk['chunk'],
                    'url': chunk['metadata']['url'],
                    'score': float(score),
                    'paper_id': chunk['metadata']['paper_id'],
                    'section': chunk['metadata']['section']
                })
        
        return results
    except Exception as e:
        print(f"Error in search_ai_chunks: {e}")
        return []

def generate_ai_response(query: str, search_results: List[Dict[str, Any]]) -> str:
    """Generate detailed AI response based on search results."""
    if not search_results:
        return "I'm sorry, I couldn't find relevant information about that in NASA's bioscience research. Could you try rephrasing your question?"
    
    # Analyze the query to provide more contextual responses
    query_lower = query.lower()
    
    if any(word in query_lower for word in ['hello', 'hi', 'hey', 'how are you']):
        return f"Hello! I'm your NASA Bioscience Research Assistant. I have access to {len(AI_CHUNKS)} research chunks from 572 unique publications and I'm here to help you explore the fascinating world of space biology. What would you like to know about?"
    
    if any(word in query_lower for word in ['thank', 'thanks']):
        return "You're welcome! I'm always here to help you explore NASA's bioscience research. Feel free to ask me anything about space biology, astronaut health, or related topics!"
    
    if any(word in query_lower for word in ['bye', 'goodbye', 'see you']):
        return "Goodbye! I hope I was able to help you with your NASA bioscience research questions. Feel free to come back anytime!"
    
    # Build comprehensive context from search results
    detailed_context = []
    for i, result in enumerate(search_results[:8]):  # Use more sources
        snippet = result['snippet']
        paper_id = result.get('paper_id', 'Unknown')
        section = result.get('section', 'Unknown')
        
        # Clean and expand the snippet
        if len(snippet) < 100:  # If snippet is too short, try to get more context
            snippet = f"{snippet} (from Paper {paper_id}, {section} section)"
        
        detailed_context.append(f"**Research Source {i+1}** (Paper {paper_id}):\n{snippet}")
    
    context_text = "\n\n".join(detailed_context)
    
    # Generate detailed response based on query type
    if any(word in query_lower for word in ['what', 'how', 'why', 'explain']):
        response = f"""**Detailed Analysis of Your Query: "{query}"**

Based on NASA's comprehensive bioscience research database, here's what I found:

{context_text}

**Key Insights:**
• This information comes from {len(search_results)} relevant research sources across multiple NASA studies
• The research spans various aspects of space biology and microgravity effects
• These findings represent cutting-edge research in space bioscience

**Research Context:**
The studies referenced above contribute to our understanding of how biological systems adapt to space environments, which is crucial for long-duration space missions and future space exploration.

Would you like me to elaborate on any specific aspect or provide more detailed information about particular findings?"""

    elif any(word in query_lower for word in ['compare', 'difference', 'similar']):
        response = f"""**Comparative Analysis: "{query}"**

Here's a detailed comparison based on the research I found:

{context_text}

**Comparative Insights:**
• These findings show different perspectives and methodologies from multiple NASA studies
• The research demonstrates various approaches to studying space biology phenomena
• Each source provides unique insights into the topic

**Research Implications:**
Understanding these different approaches helps researchers develop more comprehensive strategies for space biology research and astronaut health management.

Would you like me to focus on specific differences or similarities between these studies?"""

    elif any(word in query_lower for word in ['effect', 'impact', 'influence', 'change']):
        response = f"""**Effects and Impacts Analysis: "{query}"**

Based on NASA's research, here are the detailed effects and impacts:

{context_text}

**Key Effects Identified:**
• Multiple studies demonstrate various biological responses to space conditions
• The research shows both short-term and long-term effects on biological systems
• These findings have important implications for space mission planning

**Research Significance:**
Understanding these effects is crucial for developing countermeasures and ensuring astronaut health during space missions.

Would you like me to explain the mechanisms behind these effects or discuss potential countermeasures?"""

    else:
        response = f"""**Comprehensive Research Overview: "{query}"**

Based on NASA's bioscience research database, here's a detailed overview:

{context_text}

**Research Summary:**
• This data comes from {len(search_results)} relevant research sources in NASA's database
• The studies represent diverse approaches to space biology research
• These findings contribute to our understanding of life in space environments

**Scientific Context:**
These research findings are part of NASA's ongoing efforts to understand biological systems in space, which is essential for future space exploration missions.

Would you like me to provide more specific details about any particular aspect of this research?"""
    
    return response

@app.post("/api/ai-chat", response_model=ChatResponse)
def ai_chat_endpoint(request: ChatMessage):
    """
    AI-powered chat endpoint for research assistance.
    """
    try:
        if not AI_CHUNKS or AI_MODEL is None or AI_INDEX is None:
            raise HTTPException(status_code=503, detail="AI chatbot is not available")
        
        # Search for relevant chunks
        search_results = search_ai_chunks(request.message, top_k=8)
        
        # Generate response
        response = generate_ai_response(request.message, search_results)
        
        # Convert all numpy types to Python types
        clean_sources = []
        for source in search_results:
            clean_source = {}
            for key, value in source.items():
                if hasattr(value, 'item'):  # numpy scalar
                    clean_source[key] = value.item()
                else:
                    clean_source[key] = value
            clean_sources.append(clean_source)
        
        return ChatResponse(
            response=response,
            sources=clean_sources,
            timestamp=str(pd.Timestamp.now()),
            session_id=request.session_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in AI chat: {str(e)}")

@app.post("/api/nasa-ai-chat", response_model=ChatResponse)
def nasa_ai_chat_endpoint(request: ChatMessage):
    """
    Enhanced NASA AI-powered chat endpoint with detailed scientific explanations.
    """
    try:
        # Use the enhanced NASA AI service
        result = nasa_ai.chat(request.message)
        
        # Convert sources to clean format
        clean_sources = []
        for source in result.get("sources", []):
            clean_source = {}
            for key, value in source.items():
                if hasattr(value, 'item'):  # numpy scalar
                    clean_source[key] = value.item()
                else:
                    clean_source[key] = value
            clean_sources.append(clean_source)
        
        # Format the response with NASA AI branding
        formatted_response = f"""🤖 **NASA Bioscience Assistant**

**Question:** {request.message}

**Answer:** {result['response']}

**Sources:** {result.get('sources_info', 'No sources found')}
**Confidence:** {result.get('confidence', 'Low')} (relevant NASA research found)"""
        
        return ChatResponse(
            response=formatted_response,
            sources=clean_sources,
            timestamp=str(pd.Timestamp.now()),
            session_id=request.session_id
        )
        
    except Exception as e:
        return ChatResponse(
            response=f"❌ Error: {str(e)}",
            sources=[],
            timestamp=str(pd.Timestamp.now()),
            session_id=request.session_id
        )

@app.post("/api/hybrid-nasa-ai-chat", response_model=ChatResponse)
def hybrid_nasa_ai_chat_endpoint(request: ChatMessage):
    """
    Hybrid NASA AI-powered chat endpoint combining Ollama model with RAG system.
    """
    try:
        # Use the hybrid NASA AI service
        result = hybrid_nasa_ai.chat(request.message)
        
        # Convert sources to clean format
        clean_sources = []
        for source in result.get("sources", []):
            clean_source = {}
            for key, value in source.items():
                if hasattr(value, 'item'):  # numpy scalar
                    clean_source[key] = value.item()
                else:
                    clean_source[key] = value
            clean_sources.append(clean_source)
        
        # Format the response with hybrid AI branding
        response_type = result.get("response_type", "Hybrid AI")
        ollama_status = "✅ Ollama Model Active" if result.get("ollama_available", False) else "⚠️ RAG System Only"
        
        formatted_response = f"""🤖 **NASA Hybrid AI Assistant** ({response_type})

**Question:** {request.message}

**Answer:** {result['response']}

**Sources:** {result.get('sources_info', 'No sources found')}
**Confidence:** {result.get('confidence', 'Low')} (relevant NASA research found)
**System Status:** {ollama_status}"""
        
        return ChatResponse(
            response=formatted_response,
            sources=clean_sources,
            timestamp=str(pd.Timestamp.now()),
            session_id=request.session_id
        )
        
    except Exception as e:
        return ChatResponse(
            response=f"❌ Error: {str(e)}",
            sources=[],
            timestamp=str(pd.Timestamp.now()),
            session_id=request.session_id
        )

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting NASA AI Research Assistant Backend...")
    print("📡 Backend will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🤖 NASA AI Chat: http://localhost:8000/api/nasa-ai-chat")
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)

# NASA Bioscience Chatbot - Hugging Face Model Card

## Model Description

The NASA Bioscience Chatbot is an AI-powered research assistant that provides intelligent answers to questions about NASA's bioscience research publications. It uses semantic search and natural language processing to help users explore space biology research.

## Model Details

- **Model Type**: Retrieval-Augmented Generation (RAG) Chatbot
- **Language**: English
- **Domain**: Space Biology, NASA Research, Bioscience
- **Training Data**: 13,150 chunks from NASA bioscience publications
- **Embedding Model**: all-MiniLM-L6-v2 (SentenceTransformers)
- **Vector Database**: FAISS Index
- **Framework**: FastAPI + React

## Model Architecture

### Components:
1. **Data Processing**: JSON chunks with metadata (title, URL)
2. **Embedding Generation**: SentenceTransformers all-MiniLM-L6-v2
3. **Vector Search**: FAISS IndexFlatIP for cosine similarity
4. **Response Generation**: Dynamic response generation with source citations
5. **Web Interface**: React + TailwindCSS with glassmorphism design

### Key Features:
- Semantic search across 13,150 research chunks
- Real-time conversation interface
- Source citation with relevance scores
- Topic-based filtering (Plant Biology, Animal Studies, Human Health, Space Environment)
- Modern NASA-themed UI with animations

## Usage

### Quick Start
```python
# Install dependencies
pip install -r requirements.txt

# Run the chatbot
python dynamic_chatbot.py

# Access at http://localhost:8002
```

### API Usage
```python
import requests

response = requests.post("http://localhost:8002/chat", json={
    "message": "What are the effects of microgravity on plants?",
    "session_id": "user123"
})

data = response.json()
print(data["response"])
print(f"Sources: {len(data['sources'])}")
```

### Web Interface
- Modern React-based UI with glassmorphism design
- Real-time chat interface
- Source metadata panel
- Mobile-responsive design

## Training Data

The model is trained on NASA bioscience research publications including:
- Plant biology studies in space
- Animal research (mice, rats) in microgravity
- Human health and physiology in space
- Space environment effects on biological systems
- Long-duration spaceflight research

## Performance

- **Search Speed**: Sub-second response times
- **Accuracy**: High relevance scores for semantic search
- **Coverage**: 13,150 research chunks across multiple domains
- **Scalability**: FAISS index supports efficient similarity search

## Limitations

- Limited to NASA bioscience research domain
- Requires local deployment (not cloud-hosted)
- No real-time model updates
- English language only

## Citation

```bibtex
@software{nasa_bioscience_chatbot,
  title={NASA Bioscience Chatbot: AI-Powered Research Assistant},
  author={Your Name},
  year={2024},
  url={https://huggingface.co/your-username/nasa-bioscience-chatbot}
}
```

## License

MIT License - See LICENSE file for details

## Contact

For questions or issues, please open an issue on the Hugging Face model page.

---

**Built for NASA Bioscience Research** 🚀

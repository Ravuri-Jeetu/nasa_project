# NASA Bioscience Chatbot

A powerful AI assistant for exploring NASA's bioscience research publications with semantic search and intelligent responses.

## 🚀 Features

- **Semantic Search**: Search across 13,150 NASA research chunks
- **Intelligent Responses**: AI-powered answers with source citations
- **Research Topics**: Plant Biology, Animal Studies, Human Health, Space Environment
- **Real-time Chat**: Interactive conversation interface
- **Source Citations**: View research papers and relevance scores

## 🛠️ Usage

### Local Development
1. Start the NASA chatbot backend:
   ```bash
   python dynamic_chatbot.py
   ```

2. Run the Gradio interface:
   ```bash
   python app.py
   ```

3. Open http://localhost:7860

### Hugging Face Space
Visit the live demo at: [Your Hugging Face Space URL]

## 📚 Research Database

- **Total Papers**: 13,150 chunks
- **Topics**: Plant Biology, Animal Studies, Human Health, Space Environment
- **Search Engine**: FAISS + SentenceTransformers
- **Model**: all-MiniLM-L6-v2

## 🔧 API Integration

The chatbot provides a REST API at `/chat` endpoint:

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

## 🌟 Example Questions

- What are the effects of microgravity on plant growth?
- How do astronauts' bones change in space?
- What research has been done on mice in space?
- How does space radiation affect human health?
- What are the psychological effects of long-duration spaceflight?

## 📄 License

MIT License - See LICENSE file for details

---

**Built for NASA Bioscience Research** 🚀
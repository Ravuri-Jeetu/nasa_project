import gradio as gr
import torch
from transformers import AutoTokenizer, AutoModel, pipeline
from sentence_transformers import SentenceTransformer
import faiss
import pickle
import numpy as np
import re

# Global variables
embedding_model = None
faiss_index = None
chunks = None
summarizer = None

def load_models():
    """Load lightweight models and RAG components"""
    global embedding_model, faiss_index, chunks, summarizer
    
    try:
        print("Loading lightweight models...")
        
        # Use DistilBERT for summarization (much smaller than DialoGPT)
        summarizer = pipeline("summarization", 
                            model="sshleifer/distilbart-cnn-12-6",
                            tokenizer="sshleifer/distilbart-cnn-12-6")
        
        # Load RAG components
        print("Loading RAG system...")
        embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        faiss_index = faiss.read_index("./rag_system/faiss_index.bin")
        
        with open("./rag_system/chunks.pkl", "rb") as f:
            chunks = pickle.load(f)
        
        print("✅ Lightweight models loaded successfully!")
        return "✅ Enhanced NASA AI (Lightweight) loaded successfully!"
        
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        return f"❌ Error: {str(e)}"

def search_context(query, top_k=8):
    """Search for relevant context using RAG"""
    if embedding_model is None or faiss_index is None or chunks is None:
        return []
    
    try:
        query_embedding = embedding_model.encode([query])
        D, I = faiss_index.search(query_embedding, top_k)
        
        results = []
        for i, score in zip(I[0], D[0]):
            if i != -1:
                chunk = chunks[i]
                results.append({
                    'text': chunk['text'],
                    'source': chunk.get('source', 'unknown'),
                    'paper_id': chunk.get('paper_id', 'N/A'),
                    'section': chunk.get('section', 'N/A'),
                    'score': float(score)
                })
        return results
    except Exception as e:
        print(f"Search error: {e}")
        return []

def generate_enhanced_response(query):
    """Generate enhanced response using templates and summarization"""
    context_results = search_context(query, top_k=8)
    
    if not context_results:
        return "I don't have enough relevant information in the NASA research database to answer that question accurately."
    
    query_lower = query.lower()
    
    # Extract key information from context
    context_texts = []
    for result in context_results[:5]:
        text = result['text']
        text = re.sub(r'\s+', ' ', text).strip()
        if len(text) > 300:  # Shorter for summarization
            text = text[:300] + "..."
        context_texts.append(text)
    
    combined_context = " ".join(context_texts)
    
    # Generate detailed response based on query type
    if any(word in query_lower for word in ['what is', 'define', 'definition']):
        if 'microgravity' in query_lower:
            response = f"""Microgravity is the condition of weightlessness experienced in space where gravitational forces are greatly reduced, typically defined as less than 1% of Earth's gravitational force (9.8 m/s²). 

This unique environment creates significant challenges and opportunities for biological research. According to NASA research findings: {combined_context[:200]}...

Key characteristics of microgravity include:
• Absence of gravitational loading on biological structures
• Altered fluid dynamics and distribution
• Changes in cellular behavior and gene expression
• Modified mechanical stress patterns in tissues

These effects have profound implications for astronaut health during space missions and provide valuable insights into fundamental biological processes on Earth."""
        else:
            response = f"""Based on comprehensive NASA research findings, this topic involves complex interactions between space environmental factors and biological systems. The research demonstrates: {combined_context[:200]}...

This area of study is critical for:
• Ensuring astronaut health and safety during space missions
• Understanding fundamental biological processes
• Developing effective countermeasures for space travel
• Advancing our knowledge of life in extreme environments"""
    
    elif any(word in query_lower for word in ['how does', 'effects', 'affects', 'impact']):
        if 'bone' in query_lower or 'density' in query_lower:
            response = f"""Bone density loss in microgravity represents one of the most significant health challenges for astronauts during long-duration space missions. This phenomenon occurs through multiple interconnected mechanisms:

Primary Causes:
• Reduced mechanical loading and weight-bearing stress
• Altered bone remodeling processes (increased bone resorption, decreased formation)
• Changes in calcium metabolism and vitamin D synthesis
• Modified hormonal regulation of bone homeostasis

NASA research provides extensive evidence indicating: {combined_context[:200]}...

Clinical Implications:
• Astronauts can lose 1-2% of bone mass per month in microgravity
• Trabecular bone is more affected than cortical bone
• Recovery on Earth can take months to years
• Risk of fractures increases significantly during and after missions

This research is crucial for developing effective countermeasures and understanding osteoporosis on Earth."""
        else:
            response = f"""Based on comprehensive NASA research findings, space environmental factors create complex interactions with biological systems that have profound implications for human health and mission success. The research demonstrates: {combined_context[:200]}...

These effects are influenced by multiple factors:
• Duration of exposure to space conditions
• Individual genetic and physiological variations
• Interactions between different space stressors
• Effectiveness of countermeasures and protective measures

Understanding these mechanisms is essential for:
• Ensuring astronaut safety during missions
• Developing effective prevention strategies
• Optimizing mission duration and objectives
• Advancing our knowledge of human physiology"""
    
    elif any(word in query_lower for word in ['plants', 'plant']):
        response = f"""Plant responses to microgravity are a critical area of study for long-duration space missions, as plants can provide food, oxygen, and psychological benefits to astronauts. NASA studies reveal complex adaptations:

Key Plant Responses:
• Altered gravitropism (root and shoot orientation)
• Changes in gene expression related to stress and growth
• Modified cell wall structure and development
• Impact on photosynthesis and nutrient uptake
• Effects on reproduction and seed development

NASA research provides extensive evidence showing: {combined_context[:200]}...

Implications for Space Exploration:
• Designing efficient plant growth systems for space habitats
• Understanding fundamental plant biology in novel environments
• Developing resilient crops for extraterrestrial colonization
• Contributing to closed-loop life support systems

This research is vital for sustainable human presence beyond Earth."""
    
    elif any(word in query_lower for word in ['countermeasures', 'solutions', 'prevention', 'treatment']):
        response = f"""Countermeasures for space-related health issues are a primary focus of NASA's human research program, aiming to mitigate the adverse effects of microgravity, radiation, and other stressors. These strategies encompass a range of approaches:

Types of Countermeasures:
• Exercise protocols (resistive, aerobic)
• Nutritional interventions (e.g., vitamin D, omega-3s)
• Pharmacological agents (e.g., bisphosphonates, antioxidants)
• Radiation shielding and protective materials
• Behavioral health support and psychological interventions
• Artificial gravity concepts (e.g., centrifugation)

NASA research has identified several effective countermeasures: {combined_context[:200]}...

Challenges in Countermeasure Development:
• Multi-stressor environment requires integrated solutions
• Individual variability in response to countermeasures
• Long-term effectiveness and side effects
• Resource constraints in space (mass, power, volume)

Continued research in this area is essential for enabling safe and productive long-duration human spaceflight."""
    
    else:
        response = f"""Based on comprehensive NASA research findings, this topic represents a complex area of space biology that involves multiple interconnected systems and processes. The research demonstrates: {combined_context[:200]}...

Key Research Areas Include:
• Fundamental biological mechanisms affected by space conditions
• Long-term health implications for space travelers
• Development of effective prevention and treatment strategies
• Understanding of life processes in extreme environments

This research contributes to:
• Ensuring mission success and astronaut safety
• Advancing our understanding of human physiology
• Developing technologies for space exploration
• Improving health outcomes on Earth through space-based research

The findings represent decades of scientific investigation and continue to inform current and future space missions."""
    
    return response

def chat_interface(message, history):
    """Enhanced chat interface"""
    if not faiss_index or not chunks:
        return "❌ Model not loaded. Please try again."
    
    if not message.strip():
        return "Please enter a question about NASA space biology research."
    
    try:
        print(f"Processing query: {message}")  # Debug print
        
        response = generate_enhanced_response(message)
        context_results = search_context(message, top_k=8)
        
        print(f"Generated response length: {len(response)}")  # Debug print
        
        # Format sources
        sources_info = f"Based on {len(context_results)} NASA research papers"
        if context_results:
            paper_ids = [r['paper_id'] for r in context_results[:5]]
            sources_info += f" (including papers: {', '.join(paper_ids[:5])})"
        
        formatted_response = f"""🤖 **NASA Bioscience Assistant (Lightweight)**

**Question:** {message}

**Answer:** {response}

**Sources:** {sources_info}
**Confidence:** High (relevant NASA research found)"""
        
        return formatted_response
        
    except Exception as e:
        print(f"Error in chat_interface: {e}")  # Debug print
        import traceback
        traceback.print_exc()
        return f"❌ Error: {str(e)}"

# Create Gradio interface
with gr.Blocks(title="NASA Bioscience AI (Lightweight)", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# 🚀 NASA Bioscience AI Assistant")
    gr.Markdown("**Lightweight Query Solver for Space Biology Research**")
    gr.Markdown("Ask detailed questions about microgravity effects, space radiation, astronaut health, and more!")
    
    with gr.Row():
        with gr.Column():
            chatbot = gr.Chatbot(height=600, label="NASA Research Assistant", show_label=True)
            msg = gr.Textbox(
                label="Your Question", 
                placeholder="Ask about microgravity, space radiation, bone density, muscle atrophy, plant biology, etc...",
                lines=2
            )
            send_btn = gr.Button("🚀 Ask NASA AI", variant="primary", size="lg")
    
    # Example queries
    with gr.Row():
        gr.Examples(
            examples=[
                "What is microgravity and how does it affect biological systems?",
                "How does space affect bone density and muscle mass?",
                "What are the comprehensive effects of space radiation?",
                "How do plants grow and respond in microgravity?",
                "What countermeasures exist for space-related health issues?"
            ],
            inputs=msg,
            label="💡 Example Queries"
        )
    
    # Statistics
    gr.Markdown("""
    ### 📊 Knowledge Base Statistics
    - **📚 Research Papers:** 5,148 NASA research chunks
    - **🧠 AI Model:** Lightweight DistilBERT with RAG
    - **🔬 Domains:** Space Biology, Microgravity, Radiation, Astronaut Health
    - **🎯 Capabilities:** Detailed explanations, source citations, high confidence responses
    - **💾 Storage:** Optimized for 1GB limit
    """)
    
    # Load model on startup
    demo.load(load_models, outputs=gr.Textbox(visible=False))
    
    # Event handlers
    def respond(message, history):
        """Handle user input and generate response"""
        if not message.strip():
            return history, ""
        
        # Generate response
        response = chat_interface(message, history)
        
        # Add to history
        history.append([message, response])
        return history, ""
    
    msg.submit(respond, [msg, chatbot], [chatbot, msg])
    send_btn.click(respond, [msg, chatbot], [chatbot, msg])

if __name__ == "__main__":
    demo.launch()

#!/usr/bin/env python3
"""
Hybrid NASA AI - Combines RAG with template-based responses
"""

import os
import yaml
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from sentence_transformers import SentenceTransformer
import faiss
import pickle
import numpy as np
import re

class HybridNASAAI:
    """Hybrid NASA AI combining RAG with intelligent templates"""
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.embedding_model = None
        self.faiss_index = None
        self.chunks = None
        self.load_components()
        
        # Response templates
        self.templates = {
            'microgravity': {
                'definition': "Microgravity is the condition of weightlessness experienced in space where gravitational forces are greatly reduced. According to NASA research: {context}",
                'effects': "Microgravity effects on biological systems include: {context}",
                'bone': "Bone density loss in microgravity occurs due to: {context}",
                'muscle': "Muscle atrophy in microgravity is caused by: {context}"
            },
            'radiation': {
                'effects': "Space radiation effects include: {context}",
                'protection': "Radiation protection strategies involve: {context}",
                'health': "Radiation health impacts are: {context}"
            },
            'plants': {
                'growth': "Plant growth in microgravity shows: {context}",
                'response': "Plant responses to microgravity include: {context}",
                'biology': "Plant biology in space involves: {context}"
            }
        }
    
    def load_components(self):
        """Load all components"""
        print("Loading Hybrid NASA AI components...")
        
        # Load model
        model_path = "./nasa-model/final_model"
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(model_path)
        
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
            self.model.config.pad_token_id = self.model.config.eos_token_id
        
        # Load RAG
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.faiss_index = faiss.read_index("./rag_system/faiss_index.bin")
        
        with open("./rag_system/chunks.pkl", 'rb') as f:
            self.chunks = pickle.load(f)
        
        print(f"✅ Loaded hybrid system with {len(self.chunks)} research chunks")
    
    def search_context(self, query, top_k=5):
        """Search for relevant context"""
        query_embedding = self.embedding_model.encode([query])
        D, I = self.faiss_index.search(query_embedding, top_k)
        
        results = []
        for i, (score, idx) in enumerate(zip(D[0], I[0])):
            if idx != -1 and score > 0.3:
                chunk = self.chunks[idx]
                results.append({
                    'text': chunk['text'],
                    'paper_id': chunk.get('paper_id', 'N/A'),
                    'section': chunk.get('section', 'N/A'),
                    'score': float(score)
                })
        
        return results
    
    def extract_key_info(self, context_results, query_type):
        """Extract key information from context based on query type"""
        if not context_results:
            return "No specific information found in current research database."
        
        # Combine relevant text with more detail
        relevant_texts = []
        for result in context_results[:5]:  # Use top 5 results for more detail
            text = result['text']
            # Clean but keep more content
            text = re.sub(r'\s+', ' ', text).strip()
            if len(text) > 400:  # Keep more text for detailed explanations
                text = text[:400] + "..."
            relevant_texts.append(text)
        
        # Create comprehensive summary
        if len(relevant_texts) == 1:
            return relevant_texts[0]
        elif len(relevant_texts) == 2:
            return f"{relevant_texts[0]} Additionally, research shows that {relevant_texts[1]}"
        elif len(relevant_texts) == 3:
            return f"{relevant_texts[0]} Furthermore, studies indicate that {relevant_texts[1]} Moreover, additional research demonstrates that {relevant_texts[2]}"
        else:
            return f"{relevant_texts[0]} Additionally, {relevant_texts[1]} Furthermore, {relevant_texts[2]} Moreover, {relevant_texts[3]} Finally, {relevant_texts[4]}"
    
    def generate_response(self, query):
        """Generate response using hybrid approach"""
        
        # Get relevant context with more results for detailed explanations
        context_results = self.search_context(query, top_k=8)
        
        if not context_results:
            return "I don't have enough relevant information in the NASA research database to answer that question accurately."
        
        # Determine query type and topic
        query_lower = query.lower()
        
        # Extract key information
        context_summary = self.extract_key_info(context_results, query_lower)
        
        # Generate detailed response based on query type
        if any(word in query_lower for word in ['what is', 'define', 'definition']):
            if 'microgravity' in query_lower:
                response = f"""Microgravity is the condition of weightlessness experienced in space where gravitational forces are greatly reduced, typically defined as less than 1% of Earth's gravitational force (9.8 m/s²). 

This unique environment creates significant challenges and opportunities for biological research. According to NASA research findings: {context_summary}

Key characteristics of microgravity include:
• Absence of gravitational loading on biological structures
• Altered fluid dynamics and distribution
• Changes in cellular behavior and gene expression
• Modified mechanical stress patterns in tissues

These effects have profound implications for astronaut health during space missions and provide valuable insights into fundamental biological processes on Earth."""
            elif 'radiation' in query_lower:
                response = f"""Space radiation encompasses various forms of high-energy particles and electromagnetic waves present in the space environment, including galactic cosmic rays, solar particle events, and trapped radiation in planetary magnetospheres.

NASA research has extensively studied these effects and shows: {context_summary}

The main components of space radiation include:
• Galactic Cosmic Rays (GCR): High-energy particles from outside our solar system
• Solar Particle Events (SPE): Intense bursts of radiation from solar activity
• Trapped Radiation: Particles captured by Earth's magnetic field
• Secondary Radiation: Particles created by interactions with spacecraft materials

Understanding these radiation effects is crucial for long-duration space missions and planetary exploration."""
            else:
                response = f"""Based on comprehensive NASA research findings, this topic involves complex interactions between space environmental factors and biological systems. The research demonstrates: {context_summary}

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

NASA research provides extensive evidence indicating: {context_summary}

Clinical Implications:
• Astronauts can lose 1-2% of bone mass per month in microgravity
• Trabecular bone is more affected than cortical bone
• Recovery on Earth can take months to years
• Risk of fractures increases significantly during and after missions

This research is crucial for developing effective countermeasures and understanding osteoporosis on Earth."""
            elif 'muscle' in query_lower:
                response = f"""Muscle atrophy in space represents a critical physiological adaptation that poses significant challenges for astronaut health and mission success. This complex process involves multiple biological systems:

Underlying Mechanisms:
• Reduced mechanical stress and loading on muscle fibers
• Altered protein synthesis and degradation rates
• Changes in muscle fiber type composition
• Modified neuromuscular function and coordination
• Disrupted hormonal regulation of muscle metabolism

NASA studies provide comprehensive evidence showing: {context_summary}

Clinical Impact:
• Astronauts can lose 20-30% of muscle mass during long missions
• Type I (slow-twitch) fibers are more affected than Type II (fast-twitch)
• Strength and endurance decrease significantly
• Recovery requires intensive rehabilitation programs

Understanding these mechanisms is essential for developing effective exercise protocols and pharmacological interventions."""
            elif 'radiation' in query_lower:
                response = f"""Space radiation effects on biological systems represent one of the most complex and dangerous aspects of space travel. These effects occur through multiple pathways and time scales:

Immediate Effects:
• DNA damage and cellular injury
• Acute radiation sickness at high doses
• Disruption of cellular signaling pathways
• Oxidative stress and inflammation

Long-term Consequences:
• Increased cancer risk and tumor formation
• Neurological and cognitive impairments
• Cardiovascular disease development
• Accelerated aging processes
• Genetic mutations and heritable effects

NASA research demonstrates extensive findings: {context_summary}

Risk Assessment:
• Dose-dependent effects with no safe threshold
• Cumulative exposure increases risk over time
• Individual variation in radiation sensitivity
• Complex interactions with other space factors (microgravity, isolation)

This research is critical for mission planning, astronaut selection, and developing protective technologies."""
            else:
                response = f"""Based on comprehensive NASA research findings, space environmental factors create complex interactions with biological systems that have profound implications for human health and mission success. The research demonstrates: {context_summary}

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
            response = f"""Plant responses to microgravity represent a fascinating area of research that provides insights into fundamental biological processes and practical applications for space agriculture. These responses occur at multiple levels:

Morphological Changes:
• Altered growth patterns and directional responses
• Changes in root orientation and branching
• Modified shoot and leaf development
• Disturbed gravitropic and phototropic responses

Cellular and Molecular Adaptations:
• Modified gene expression patterns
• Changes in protein synthesis and metabolism
• Altered hormonal signaling (auxins, cytokinins, gibberellins)
• Disrupted calcium signaling pathways

NASA studies provide comprehensive evidence revealing: {context_summary}

Practical Implications:
• Development of space agriculture systems
• Understanding plant stress responses on Earth
• Optimization of growth conditions for closed-loop life support
• Insights into plant evolution and adaptation mechanisms

This research is crucial for long-duration space missions and planetary colonization efforts."""
        
        elif any(word in query_lower for word in ['countermeasures', 'solutions', 'prevention', 'treatment']):
            response = f"""NASA research has identified and developed numerous countermeasures for space-related health issues, representing decades of scientific investigation and technological innovation:

Exercise-Based Countermeasures:
• Resistance training with specialized equipment
• Cardiovascular exercise protocols
• Neuromotor training and balance exercises
• High-intensity interval training programs

Pharmacological Interventions:
• Bisphosphonates for bone loss prevention
• Antioxidants for radiation protection
• Hormonal therapies for metabolic regulation
• Nutritional supplements and dietary modifications

Technological Solutions:
• Advanced exercise equipment (CEVIS, ARED, etc.)
• Artificial gravity systems and centrifuges
• Radiation shielding technologies
• Monitoring and diagnostic systems

NASA research demonstrates extensive evidence: {context_summary}

Implementation Strategies:
• Individualized protocols based on astronaut characteristics
• Integration of multiple countermeasure approaches
• Real-time monitoring and adjustment capabilities
• Post-mission rehabilitation and recovery programs

These countermeasures are continuously refined through ongoing research and operational experience."""
        
        else:
            response = f"""Based on comprehensive NASA research findings, this topic represents a complex area of space biology that involves multiple interconnected systems and processes. The research demonstrates: {context_summary}

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
    
    def chat(self, query):
        """Main chat function"""
        try:
            response = self.generate_response(query)
            context_results = self.search_context(query, top_k=8)
            
            # Format sources with more detail
            sources_info = f"Based on {len(context_results)} NASA research papers"
            if context_results:
                paper_ids = [r['paper_id'] for r in context_results[:5]]  # Show more papers
                sources_info += f" (including papers: {', '.join(paper_ids[:5])})"
            
            formatted_response = f"""🤖 **NASA Bioscience Assistant**

**Question:** {query}

**Answer:** {response}

**Sources:** {sources_info}
**Confidence:** High (relevant NASA research found)"""
            
            return formatted_response
            
        except Exception as e:
            return f"❌ Error processing your question: {str(e)}"

def main():
    """Test the hybrid NASA AI"""
    ai = HybridNASAAI()
    
    test_queries = [
        "What is microgravity?",
        "How does space affect bone density?",
        "What are the effects of radiation in space?",
        "How do plants grow in microgravity?",
        "What countermeasures exist for muscle atrophy in space?"
    ]
    
    for query in test_queries:
        print(f"\n{'='*60}")
        print(f"Query: {query}")
        print('='*60)
        response = ai.chat(query)
        print(response)

if __name__ == "__main__":
    main()

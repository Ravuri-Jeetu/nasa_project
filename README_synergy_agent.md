# Cross-Domain Synergy Agent for NASA Task Book

A sophisticated AI agent that analyzes NASA Task Book research projects to identify synergies between different research domains using advanced NLP techniques.

## 🎯 Goal

The agent analyzes NASA Task Book research projects and **finds synergies between different research domains** (e.g., Space Biology, Human Research, Physical Sciences). It identifies overlaps between projects in different domains and recommends possible collaborations.

## 🚀 Features

- **Domain Classification**: Automatically categorizes projects into research domains using keyword-based classification
- **Text Preprocessing**: Advanced text cleaning and preprocessing pipeline
- **TF-IDF Vectorization**: Creates high-dimensional embeddings of project content
- **Cosine Similarity Analysis**: Computes similarity scores between all project pairs
- **Cross-Domain Synergy Detection**: Identifies potential collaboration opportunities
- **Network Visualization**: Interactive network graphs showing domain connections
- **Heatmap Analysis**: Visual representation of domain-to-domain synergies
- **Comprehensive Reporting**: Detailed statistics and exportable results

## 📊 Workflow

1. **Load Data**: Import NASA Task Book CSV file
2. **Domain Extraction**: Classify projects into research domains
3. **Text Preprocessing**: Clean and normalize text content
4. **TF-IDF Vectorization**: Create document embeddings
5. **Similarity Computation**: Calculate cosine similarities between projects
6. **Synergy Identification**: Find cross-domain pairs above threshold
7. **Visualization**: Generate network graphs and heatmaps
8. **Export Results**: Save analysis results to files

## 🛠️ Installation

### Prerequisites

- Python 3.8 or higher
- pip or conda package manager

### Install Dependencies

```bash
pip install -r requirements_synergy.txt
```

Or install individually:

```bash
pip install pandas numpy scikit-learn matplotlib seaborn networkx
```

## 📁 Project Structure

```
├── cross_domain_synergy_agent.py    # Main agent class
├── run_synergy_analysis.py         # Execution script
├── requirements_synergy.txt         # Dependencies
├── README.md                        # This file
├── Taskbook_cleaned_for_NLP.csv    # NASA Task Book dataset
└── synergy_results/                # Output directory (created after analysis)
    ├── synergy_pairs.csv           # Synergy pairs results
    ├── domain_statistics.csv       # Domain statistics
    └── domain_network.graphml      # Network graph data
```

## 🚀 Quick Start

### Basic Usage

```python
from cross_domain_synergy_agent import CrossDomainSynergyAgent

# Initialize the agent
agent = CrossDomainSynergyAgent(
    similarity_threshold=0.3,  # Minimum similarity score
    min_domain_size=5          # Minimum projects per domain
)

# Run complete analysis
synergies = agent.run_full_analysis("Taskbook_cleaned_for_NLP.csv")
```

### Command Line Usage

```bash
# Run basic analysis
python run_synergy_analysis.py

# Run with custom parameters
python run_synergy_analysis.py --custom
```

## 📈 Expected Output

### 1. Synergy Pairs DataFrame

| Project_A_Title | Domain_A | Project_B_Title | Domain_B | Similarity_Score |
|----------------|----------|----------------|----------|------------------|
| Microgravity Effects on... | Space Biology | Artificial Gravity in... | Physical Sciences | 0.456 |
| ... | ... | ... | ... | ... |

### 2. Top Synergies Console Output

```
=== TOP 10 CROSS-DOMAIN SYNERGIES ===
================================================================================

Synergy #1 (Score: 0.456)
Domain A: Space Biology
Project A: Microgravity Effects on Vascular Stem Cells
Domain B: Physical Sciences
Project B: Artificial Gravity in Tissue Regeneration
--------------------------------------------------------------------------------
```

### 3. Network Graph Visualization

Interactive network showing:
- **Nodes**: Research domains (size = number of projects)
- **Edges**: Cross-domain connections (thickness = similarity strength)
- **Labels**: Similarity scores between domains

### 4. Domain Statistics

| Domain | Project_Count | Synergy_Count | Avg_Similarity | Max_Similarity |
|--------|---------------|---------------|----------------|----------------|
| Space Biology | 45 | 23 | 0.342 | 0.456 |
| Human Research | 32 | 18 | 0.298 | 0.423 |
| ... | ... | ... | ... | ... |

## ⚙️ Configuration

### Agent Parameters

```python
agent = CrossDomainSynergyAgent(
    similarity_threshold=0.3,  # Adjust to find more/fewer synergies
    min_domain_size=5          # Minimum projects per domain
)
```

### Domain Keywords

The agent uses predefined keyword sets for domain classification:

- **Space Biology**: biology, cell, tissue, muscle, bone, immune, etc.
- **Human Research**: human, astronaut, behavior, psychology, cognitive, etc.
- **Physical Sciences**: physics, fluid, combustion, crystal, material, etc.
- **Technology Development**: technology, engineering, system, instrument, etc.
- **Earth Science**: earth, climate, atmosphere, ocean, ecosystem, etc.
- **Planetary Science**: planet, mars, moon, asteroid, exploration, etc.

## 🔧 Advanced Usage

### Custom Domain Analysis

```python
# Analyze specific domain pairs
domain_stats = agent.get_domain_statistics()
print(domain_stats)

# Get top synergies for specific domains
top_synergies = agent.get_top_synergies(10)
space_bio_synergies = top_synergies[
    (top_synergies['Domain_A'] == 'Space Biology') | 
    (top_synergies['Domain_B'] == 'Space Biology')
]
```

### Custom Visualizations

```python
# Create custom network visualization
G = agent.create_domain_network(top_n=15)
agent.visualize_network(top_n=15, figsize=(14, 10))

# Create custom heatmap
agent.create_synergy_heatmap(figsize=(12, 10))
```

### Export Results

```python
# Save all results
agent.save_results("custom_output_dir")

# Access individual components
synergies_df = agent.synergy_pairs
similarity_matrix = agent.similarity_matrix
domain_mapping = agent.domain_mapping
```

## 🎨 Visualization Examples

### Network Graph
- **Node Size**: Proportional to number of projects in domain
- **Edge Thickness**: Proportional to average similarity score
- **Edge Labels**: Show similarity scores between domains

### Heatmap
- **Color Intensity**: Represents average similarity between domains
- **Annotations**: Show exact similarity scores
- **Diagonal**: Set to 0 (same domain comparisons excluded)

## 🔮 Future Enhancements

### LLM-Powered Explanation Layer

The codebase is designed to easily integrate an LLM-powered explanation layer:

```python
class LLMExplanationLayer:
    def explain_synergy(self, project_a, project_b, similarity_score):
        """Generate human-readable explanation of why two projects are synergistic."""
        prompt = f"""
        Explain why these NASA research projects are synergistic:
        Project A: {project_a}
        Project B: {project_b}
        Similarity Score: {similarity_score}
        """
        # Integrate with OpenAI, Anthropic, or local LLM
        return llm_response
```

### Additional Features

1. **Temporal Analysis**: Track synergy trends over time
2. **Collaboration Recommendations**: Suggest specific collaboration opportunities
3. **Impact Prediction**: Predict potential impact of collaborations
4. **Interactive Dashboard**: Web-based interface for exploration
5. **API Integration**: REST API for programmatic access

## 📊 Performance Considerations

- **Memory Usage**: TF-IDF matrix scales with vocabulary size
- **Processing Time**: Cosine similarity computation is O(n²)
- **Scalability**: Optimized for datasets up to ~10,000 projects
- **Threshold Tuning**: Lower thresholds find more synergies but may include noise

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- NASA Task Book dataset
- Scikit-learn for ML algorithms
- NetworkX for graph analysis
- Matplotlib/Seaborn for visualizations

## 📞 Support

For questions or issues:
1. Check the documentation above
2. Review the example code
3. Open an issue on GitHub
4. Contact the development team

---

**Built with ❤️ for NASA research collaboration**

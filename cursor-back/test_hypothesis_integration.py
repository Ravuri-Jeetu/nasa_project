from hypothesis_generator import HypothesisGenerator

# Test the updated hypothesis generator
hg = HypothesisGenerator()

# Test queries
queries = [
    "space radiation effects on astronauts",
    "microgravity bone density",
    "plant growth in space",
    "immune system spaceflight"
]

for query in queries:
    print(f"\n🔬 Testing: {query}")
    print("=" * 50)
    
    result = hg.generate_hypotheses(query)
    print(f"Generated {len(result)} hypotheses")
    
    for i, h in enumerate(result):
        print(f"\n{i+1}. {h['hypothesis'][:150]}...")
        print(f"   Type: {h['type']}")
        print(f"   Confidence: {h['confidence']}%")
        print(f"   Evidence: {h['supporting_evidence'][:100]}...")
        if h['related_papers']:
            print(f"   Related: {h['related_papers'][0]['title'][:80]}...")

#!/usr/bin/env python3
"""
Main execution script for the Cross-Domain Synergy Agent

This script demonstrates how to use the CrossDomainSynergyAgent to analyze
NASA Task Book research projects and identify cross-domain synergies.
"""

import sys
import os
from cross_domain_synergy_agent import CrossDomainSynergyAgent

def main():
    """
    Main function to run the cross-domain synergy analysis.
    """
    print("NASA Task Book Cross-Domain Synergy Analysis")
    print("=" * 50)
    
    # Check if the data file exists
    data_file = "Taskbook_cleaned_for_NLP.csv"
    if not os.path.exists(data_file):
        print(f"Error: Data file '{data_file}' not found!")
        print("Please ensure the NASA Task Book CSV file is in the current directory.")
        return
    
    # Initialize the agent with custom parameters
    print("\nInitializing Cross-Domain Synergy Agent...")
    agent = CrossDomainSynergyAgent(
        similarity_threshold=0.3,  # Adjust this to find more/fewer synergies
        min_domain_size=5          # Minimum projects per domain
    )
    
    # Run the complete analysis
    try:
        synergies = agent.run_full_analysis(
            file_path=data_file,
            output_dir="synergy_results"
        )
        
        # Additional analysis examples
        print("\n" + "=" * 80)
        print("ADDITIONAL ANALYSIS EXAMPLES")
        print("=" * 80)
        
        # Example 1: Get top 5 synergies
        print("\n1. Top 5 Cross-Domain Synergies:")
        top_5 = agent.get_top_synergies(5)
        if len(top_5) > 0:
            for idx, row in top_5.iterrows():
                print(f"   {idx+1}. {row['Domain_A']} ↔ {row['Domain_B']} (Score: {row['Similarity_Score']:.3f})")
        else:
            print("   No synergies found with current threshold.")
        
        # Example 2: Domain statistics
        print("\n2. Domain Statistics:")
        domain_stats = agent.get_domain_statistics()
        print(domain_stats.to_string(index=False))
        
        # Example 3: Analyze specific domain pairs
        print("\n3. Analyzing specific domain combinations...")
        if len(synergies) > 0:
            # Find most common domain pairs
            domain_pairs = synergies.groupby(['Domain_A', 'Domain_B']).size().reset_index(name='Count')
            domain_pairs = domain_pairs.sort_values('Count', ascending=False)
            
            print("   Most common cross-domain synergies:")
            for _, row in domain_pairs.head(3).iterrows():
                print(f"   - {row['Domain_A']} ↔ {row['Domain_B']}: {row['Count']} synergies")
        
        print("\n" + "=" * 80)
        print("ANALYSIS COMPLETE!")
        print("=" * 80)
        print(f"Results saved to: synergy_results/")
        print(f"Total synergies found: {len(synergies)}")
        
        # Suggestions for further analysis
        print("\nSuggestions for further analysis:")
        print("1. Adjust similarity_threshold to find more/fewer synergies")
        print("2. Modify min_domain_size to include/exclude smaller domains")
        print("3. Add custom domain keywords for better classification")
        print("4. Implement LLM-powered explanation layer for synergy reasoning")
        
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        print("Please check your data file and dependencies.")
        return 1
    
    return 0

def run_custom_analysis():
    """
    Example of running custom analysis with different parameters.
    """
    print("\n" + "=" * 80)
    print("CUSTOM ANALYSIS EXAMPLE")
    print("=" * 80)
    
    # Create agent with different parameters
    agent = CrossDomainSynergyAgent(
        similarity_threshold=0.25,  # Lower threshold for more synergies
        min_domain_size=3           # Include smaller domains
    )
    
    # Load and process data
    agent.load_data("Taskbook_cleaned_for_NLP.csv")
    agent.extract_domains()
    agent.preprocess_text()
    agent.compute_similarities()
    
    # Find synergies
    synergies = agent.find_cross_domain_synergies()
    
    # Show results
    agent.print_top_synergies(5)
    
    return synergies

if __name__ == "__main__":
    # Run main analysis
    exit_code = main()
    
    # Optionally run custom analysis
    if len(sys.argv) > 1 and sys.argv[1] == "--custom":
        print("\nRunning custom analysis...")
        run_custom_analysis()
    
    sys.exit(exit_code)

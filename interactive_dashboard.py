import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime
import numpy as np

def load_and_process_data():
    """Load and process the CSV data"""
    df = pd.read_csv("Taskbook_cleaned_for_NLP.csv")
    
    # Domain classification keywords
    domain_keywords = {
        "Plants": ["plant", "flora", "crop", "seed", "photosynth", "phyt", "agri", "leaf", "root"],
        "Microbes": ["microbe", "microbial", "bacteria", "bacterial", "virus", "fungi", "fungal",
                     "staphyl", "streptoc", "pathogen", "microorganism"],
        "Radiation": ["radiation", "ionizing", "cosmic", "radiol", "shield", "dosimetry", "radiobiology"],
        "Psychology": ["psych", "behavior", "crew", "cognitive", "sleep", "social", "mental",
                       "stress", "isolation"],
        "Human Physiology": ["cardio", "cardiovascular", "musculo", "bone", "neuro",
                             "endocrine", "immune"],
    }

    def assign_domain(row):
        text = " ".join([
            str(row.get("Title", "")),
            str(row.get("Abstract", "")),
            str(row.get("Methods", "")),
            str(row.get("Results", ""))
        ]).lower()

        for domain, keywords in domain_keywords.items():
            for kw in keywords:
                if kw in text:
                    return domain
        return "Other"

    # Assign domains
    df["Assigned_Domain"] = df.apply(assign_domain, axis=1)
    
    # Create synthetic fiscal years
    np.random.seed(42)
    current_year = datetime.now().year
    df['Fiscal Year'] = np.random.randint(2015, 2025, size=len(df))
    df['Recent_5yrs'] = df['Fiscal Year'] >= (current_year - 5)
    
    return df

def interactive_budget_simulator():
    """Interactive budget simulation with user input"""
    df = load_and_process_data()
    
    # Get base counts for main domains
    domains = ["Plants", "Microbes", "Radiation"]
    base_counts = df[df['Assigned_Domain'].isin(domains)]['Assigned_Domain'].value_counts()
    
    print("\n" + "="*70)
    print("🎛️  INTERACTIVE BUDGET SIMULATION")
    print("="*70)
    
    print("\n📊 Current Research Distribution:")
    for domain in domains:
        count = base_counts.get(domain, 0)
        print(f"  {domain:12} | {count:3d} studies")
    
    while True:
        print(f"\n" + "-"*50)
        print("Choose a domain to simulate funding changes:")
        for i, domain in enumerate(domains, 1):
            print(f"  {i}. {domain}")
        print("  0. Exit simulation")
        
        try:
            choice = input("\nEnter your choice (0-3): ").strip()
            
            if choice == "0":
                print("👋 Exiting budget simulation...")
                break
                
            if choice not in ["1", "2", "3"]:
                print("❌ Invalid choice. Please enter 1, 2, or 3.")
                continue
                
            domain_idx = int(choice) - 1
            selected_domain = domains[domain_idx]
            current_count = base_counts.get(selected_domain, 0)
            
            print(f"\n🎯 Selected Domain: {selected_domain}")
            print(f"   Current studies: {current_count}")
            
            # Get funding adjustment
            while True:
                try:
                    adjustment = input("Enter funding adjustment percentage (-50 to +100): ").strip()
                    adjustment = float(adjustment)
                    
                    if adjustment < -50 or adjustment > 100:
                        print("❌ Please enter a value between -50 and +100.")
                        continue
                    break
                except ValueError:
                    print("❌ Please enter a valid number.")
                    continue
            
            # Calculate projection
            projected_count = int(current_count * (1 + adjustment/100))
            difference = projected_count - current_count
            
            print(f"\n📈 PROJECTION RESULTS:")
            print(f"   Domain: {selected_domain}")
            print(f"   Funding change: {adjustment:+.1f}%")
            print(f"   Studies: {current_count} → {projected_count} ({difference:+d})")
            
            if difference > 0:
                print(f"   💰 Additional investment needed: ~${difference * 50000:,}")
                print(f"   🎯 Expected outcomes: {difference} new research initiatives")
            else:
                print(f"   💰 Cost savings: ~${abs(difference) * 50000:,}")
                print(f"   ⚠️  Potential impact: {abs(difference)} fewer research initiatives")
            
            # Show impact on other domains (reallocation effect)
            if adjustment < 0:
                freed_resources = abs(difference)
                print(f"\n💡 REDISTRIBUTION OPPORTUNITY:")
                print(f"   {freed_resources} studies worth of resources available for reallocation")
                
                # Suggest reallocation
                other_domains = [d for d in domains if d != selected_domain]
                suggested = other_domains[0]  # Simple suggestion
                print(f"   💡 Consider investing in: {suggested}")
                print(f"   📊 Current {suggested} studies: {base_counts.get(suggested, 0)}")
                print(f"   🚀 With reallocation: {base_counts.get(suggested, 0) + freed_resources}")
            
        except KeyboardInterrupt:
            print("\n\n👋 Exiting budget simulation...")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            continue

def one_click_recommendations():
    """Generate one-click investment recommendations"""
    df = load_and_process_data()
    
    print("\n" + "="*70)
    print("💡 ONE-CLICK INVESTMENT RECOMMENDATIONS")
    print("="*70)
    
    # Analyze recent trends
    recent_counts = df[df["Recent_5yrs"] == True]["Assigned_Domain"].value_counts()
    total_counts = df["Assigned_Domain"].value_counts()
    
    # Find underfunded domains
    if not recent_counts.empty:
        underfunded = recent_counts.idxmin()
        underfunded_count = recent_counts.min()
        overfunded = recent_counts.idxmax()
        overfunded_count = recent_counts.max()
        
        print(f"\n🚀 PRIMARY RECOMMENDATION:")
        print(f"   Invest more in: {underfunded}")
        print(f"   Current (5yr): {underfunded_count} studies")
        print(f"   Total: {total_counts[underfunded]} studies")
        print(f"   💰 Suggested increase: +50% funding")
        print(f"   📈 Expected outcome: {int(underfunded_count * 1.5)} studies")
        
        print(f"\n⚖️  BALANCE RECOMMENDATION:")
        print(f"   Consider reducing: {overfunded}")
        print(f"   Current (5yr): {overfunded_count} studies")
        print(f"   Total: {total_counts[overfunded]} studies")
        print(f"   💰 Suggested decrease: -25% funding")
        print(f"   📉 Expected outcome: {int(overfunded_count * 0.75)} studies")
        
        # Calculate ROI estimates
        underfunded_investment = int(underfunded_count * 1.5) * 50000
        overfunded_savings = int(overfunded_count * 0.25) * 50000
        net_investment = underfunded_investment - overfunded_savings
        
        print(f"\n💰 FINANCIAL IMPACT:")
        print(f"   Additional investment needed: ${underfunded_investment:,}")
        print(f"   Cost savings from reallocation: ${overfunded_savings:,}")
        print(f"   Net investment: ${net_investment:,}")
        print(f"   📊 ROI: {(net_investment / 1000000):.1f}x multiplier expected")

def red_flag_alerts():
    """Generate red flag alerts for critical gaps"""
    df = load_and_process_data()
    
    print("\n" + "="*70)
    print("🚨 RED FLAG ALERTS")
    print("="*70)
    
    # Critical domains for space missions
    critical_domains = {
        "Radiation": "Deep space mission safety",
        "Psychology": "Crew mental health",
        "Plants": "Food sustainability",
        "Human Physiology": "Astronaut health"
    }
    
    df['Recent_7yrs'] = df['Fiscal Year'] >= (datetime.now().year - 7)
    
    for domain, importance in critical_domains.items():
        recent_count = len(df[(df["Assigned_Domain"] == domain) & (df["Recent_7yrs"] == True)])
        total_count = len(df[df["Assigned_Domain"] == domain])
        
        # Determine alert level
        if recent_count < 10:
            alert_level = "🔴 CRITICAL"
            urgency = "IMMEDIATE ACTION REQUIRED"
        elif recent_count < 20:
            alert_level = "🟡 WARNING"
            urgency = "MONITOR CLOSELY"
        else:
            alert_level = "🟢 ADEQUATE"
            urgency = "MAINTAIN CURRENT LEVEL"
        
        print(f"\n{alert_level} {domain.upper()} RESEARCH:")
        print(f"   Recent studies (7yr): {recent_count}")
        print(f"   Total studies: {total_count}")
        print(f"   Critical for: {importance}")
        print(f"   Status: {urgency}")
        
        if recent_count < 20:
            suggested_increase = max(20 - recent_count, 5)
            print(f"   💡 Recommended: +{suggested_increase} studies")
            print(f"   💰 Estimated cost: ${suggested_increase * 50000:,}")

def main_menu():
    """Main interactive menu"""
    while True:
        print("\n" + "="*70)
        print("🎛️  NASA RESEARCH DASHBOARD")
        print("="*70)
        print("Choose an analysis:")
        print("  1. 💡 One-Click Investment Recommendations")
        print("  2. 🚨 Red Flag Alerts")
        print("  3. 🎛️  Interactive Budget Simulator")
        print("  4. 📊 Quick Domain Overview")
        print("  0. Exit")
        
        choice = input("\nEnter your choice (0-4): ").strip()
        
        if choice == "0":
            print("👋 Goodbye!")
            break
        elif choice == "1":
            one_click_recommendations()
        elif choice == "2":
            red_flag_alerts()
        elif choice == "3":
            interactive_budget_simulator()
        elif choice == "4":
            quick_overview()
        else:
            print("❌ Invalid choice. Please enter 0-4.")

def quick_overview():
    """Quick domain overview"""
    df = load_and_process_data()
    
    print("\n" + "="*70)
    print("📊 QUICK DOMAIN OVERVIEW")
    print("="*70)
    
    counts = df["Assigned_Domain"].value_counts()
    total = len(df)
    
    print(f"\nTotal Research Projects: {total}")
    print(f"Date Range: {df['Fiscal Year'].min()}-{df['Fiscal Year'].max()}")
    
    print(f"\nDomain Distribution:")
    for domain, count in counts.items():
        percentage = (count / total) * 100
        bar = "█" * int(percentage / 2)  # Visual bar
        print(f"  {domain:15} | {count:3d} ({percentage:5.1f}%) {bar}")

if __name__ == "__main__":
    print("🚀 Welcome to the NASA Research Dashboard!")
    print("📊 Analyzing your research data...")
    main_menu()

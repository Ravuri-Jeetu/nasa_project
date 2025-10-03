# NASA Cross-Domain Synergy Investment Report Generator

## Overview
This system generates professional investment reports for NASA Cross-Domain Synergy Analysis with proper PDF formatting, missing value handling, and manager-friendly content.

## Features

### ✅ Fixed Issues
1. **Missing Values Handling**: Skips undefined/null/empty/zero values entirely
2. **Improved Content**: Rounded percentages (91% instead of 0.908), distinct project pairs, natural language summaries
3. **PDF Export**: Professional PDF generation with ReportLab
4. **Professional Formatting**: Clean sections, headers, bullet points, consistent fonts

### 📊 Report Sections
- **Title Page**: Professional header with report details
- **Financial Summary**: Budget utilization, ROI projections
- **Top Synergies**: Detailed project information with natural language summaries
- **Risk Mitigation**: Tailored strategies based on risk tolerance
- **Timeline Recommendations**: Phased implementation plan
- **Success Metrics**: Short, medium, and long-term goals

## Setup Instructions

### 1. Install Python Dependencies
```bash
pip install -r requirements_pdf.txt
```

### 2. Start PDF API Server
```bash
python pdf_api.py
```
The API will run on `http://localhost:5001`

### 3. Start Frontend (if not already running)
```bash
cd cursor-front
pnpm run dev
```

## Usage

### Frontend Integration
1. Navigate to the Synergy Analysis page
2. Click "Generate Investment Report"
3. Fill in investment preferences:
   - Budget ($M)
   - Timeline (months)
   - Risk Tolerance (Low/Medium/High)
   - Focus Areas
   - Objectives
4. Choose report format:
   - **Generate Text Report**: Downloads a formatted text file
   - **Generate PDF Report**: Downloads a professional PDF (requires API server)

### Direct Python Usage
```python
from investment_report_generator import generate_investment_report

# Your investment data
data = {
    "budget": "5",
    "timeline": "24",
    "riskTolerance": "Medium",
    # ... other data
}

# Generate PDF
output_file = generate_investment_report(data, "my_report.pdf")
print(f"Report generated: {output_file}")
```

## File Structure
```
├── investment_report_generator.py  # Main PDF generator class
├── pdf_api.py                     # Flask API for frontend integration
├── requirements_pdf.txt           # Python dependencies
├── cursor-front/                  # Next.js frontend
│   └── src/app/synergy/page.tsx  # Updated with PDF generation
└── README.md                      # This file
```

## API Endpoints

### POST /generate-pdf
Generates PDF investment report from JSON data.

**Request Body:**
```json
{
  "budget": "5",
  "timeline": "24",
  "riskTolerance": "Medium",
  "focusAreas": "Human Research, Space Biology",
  "objectives": "Develop comprehensive solutions",
  "recommendedSynergies": [...],
  "riskMitigationStrategies": [...],
  "timelineRecommendations": {...},
  "successMetrics": {...}
}
```

**Response:** PDF file download

### GET /health
Health check endpoint.

## Key Improvements

### Missing Value Handling
- `formatValue()` function skips undefined/null/empty/zero values
- Only shows fields that have actual data
- Graceful degradation when data is missing

### Content Improvements
- Similarity scores shown as percentages (91% vs 0.908)
- Natural language summaries for each synergy
- Distinct project pairs (no duplicates)
- Clear, concise bullet-point formatting

### PDF Formatting
- Professional title page with report metadata
- Consistent fonts and spacing
- Section headers with visual separation
- Bullet points for easy reading
- Proper margins and page breaks

## Demo Ready Features
- ✅ Professional PDF output
- ✅ Clean, readable formatting
- ✅ Missing value handling
- ✅ Natural language summaries
- ✅ Manager-friendly content
- ✅ Consistent styling
- ✅ Error handling

## Troubleshooting

### PDF Generation Fails
1. Ensure Python API server is running on port 5001
2. Check that all dependencies are installed
3. Verify the data format matches expected structure

### Missing Data
- The system gracefully handles missing values
- Empty sections are replaced with "No data available" messages
- Only fields with actual data are displayed

## Example Output
The generated PDF includes:
- Professional title page
- Financial summary with ROI projections
- Top synergies with project details and summaries
- Risk mitigation strategies
- Timeline recommendations
- Success metrics for different timeframes

All sections adapt dynamically based on available data, ensuring a clean, professional report regardless of data completeness.

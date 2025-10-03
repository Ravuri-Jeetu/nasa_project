#!/usr/bin/env python3
"""
Simple Flask API to generate PDF investment reports
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import os
import tempfile
from investment_report_generator import generate_investment_report

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

@app.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    """Generate PDF investment report from frontend data."""
    try:
        # Get data from request
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Create temporary file for PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            output_path = tmp_file.name
        
        # Generate PDF
        generated_path = generate_investment_report(data, output_path)
        
        # Return file
        return send_file(
            generated_path,
            as_attachment=True,
            download_name=f"NASA_Investment_Report_{data.get('budget', 'Unknown')}M.pdf",
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    finally:
        # Clean up temporary file
        if 'output_path' in locals() and os.path.exists(output_path):
            try:
                os.unlink(output_path)
            except:
                pass

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'service': 'PDF Generator'})

if __name__ == '__main__':
    print("Starting PDF Generator API...")
    print("Install dependencies with: pip install -r requirements_pdf.txt")
    app.run(debug=True, host='0.0.0.0', port=5001)

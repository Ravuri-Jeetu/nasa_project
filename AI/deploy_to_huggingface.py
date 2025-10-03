#!/usr/bin/env python3
"""
NASA Bioscience Chatbot - Hugging Face Deployment Script
"""

import os
import subprocess
import sys

def check_huggingface_cli():
    """Check if huggingface-cli is installed"""
    try:
        subprocess.run(["huggingface-cli", "--version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def install_huggingface_cli():
    """Install huggingface-cli if not present"""
    print("Installing huggingface-cli...")
    subprocess.run([sys.executable, "-m", "pip", "install", "huggingface_hub"], check=True)

def login_to_huggingface():
    """Login to Hugging Face"""
    print("Please login to Hugging Face...")
    subprocess.run(["huggingface-cli", "login"], check=True)

def create_space(space_name):
    """Create a new Hugging Face Space"""
    print(f"Creating Hugging Face Space: {space_name}")
    subprocess.run([
        "huggingface-cli", "repo", "create", space_name, 
        "--type", "space", "--sdk", "gradio"
    ], check=True)

def upload_files(space_name):
    """Upload files to the Hugging Face Space"""
    files_to_upload = [
        "app.py",
        "requirements.txt", 
        "README.md",
        "dynamic_chatbot.py",
        "MODEL_CARD.md",
        "LICENSE"
    ]
    
    for file in files_to_upload:
        if os.path.exists(file):
            print(f"Uploading {file}...")
            subprocess.run([
                "huggingface-cli", "upload", f"{space_name}", file
            ], check=True)
        else:
            print(f"Warning: {file} not found, skipping...")

def main():
    """Main deployment function"""
    print("🚀 NASA Bioscience Chatbot - Hugging Face Deployment")
    print("=" * 50)
    
    # Get space name from user
    space_name = input("Enter your Hugging Face username/space-name (e.g., 'username/nasa-bioscience-chatbot'): ").strip()
    
    if not space_name:
        print("Error: Space name is required!")
        return
    
    try:
        # Check and install huggingface-cli
        if not check_huggingface_cli():
            install_huggingface_cli()
        
        # Login to Hugging Face
        login_to_huggingface()
        
        # Create space
        create_space(space_name)
        
        # Upload files
        upload_files(space_name)
        
        print("\n🎉 Deployment successful!")
        print(f"Your NASA Bioscience Chatbot is now live at:")
        print(f"https://huggingface.co/spaces/{space_name}")
        
    except subprocess.CalledProcessError as e:
        print(f"Error during deployment: {e}")
    except KeyboardInterrupt:
        print("\nDeployment cancelled by user.")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()

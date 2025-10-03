#!/usr/bin/env python3
"""
Model training for NASA AI
"""

import torch
import yaml
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    TrainingArguments, 
    Trainer,
    DataCollatorForLanguageModeling
)
from datasets import Dataset
from data_loader import NASADataLoader
import os
from typing import List, Dict, Any

class NASAModelTrainer:
    def __init__(self, config_path: str = "config.yaml"):
        """Initialize model trainer"""
        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)
        
        self.tokenizer = None
        self.model = None
        self.trainer = None
        self.dataset = None
    
    def load_model_and_tokenizer(self):
        """Load base model and tokenizer"""
        print("Loading model and tokenizer...")
        
        model_name = self.config['model']['base_model']
        
        # Load tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        
        # Load model
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        )
        
        # Resize token embeddings if needed
        self.model.resize_token_embeddings(len(self.tokenizer))
        
        print(f"Loaded model: {model_name}")
        print(f"Tokenizer vocab size: {len(self.tokenizer)}")
        print(f"Model parameters: {self.model.num_parameters():,}")
    
    def prepare_dataset(self):
        """Prepare training dataset"""
        print("Preparing training dataset...")
        
        # Load data
        data_loader = NASADataLoader()
        data_loader.load_papers_data()
        data_loader.load_taskbook_data()
        data_loader.combine_datasets()
        
        # Get training prompts
        prompts = data_loader.get_training_prompts()
        
        # Create dataset
        dataset_dict = {"text": prompts}
        self.dataset = Dataset.from_dict(dataset_dict)
        
        print(f"Created dataset with {len(self.dataset)} samples")
        
        # Tokenize dataset
        def tokenize_function(examples):
            return self.tokenizer(
                examples["text"],
                truncation=True,
                padding=True,
                max_length=self.config['model']['max_length']
            )
        
        self.dataset = self.dataset.map(
            tokenize_function, 
            batched=True, 
            remove_columns=self.dataset.column_names
        )
        
        print("Dataset tokenized successfully")
    
    def setup_training_args(self):
        """Setup training arguments"""
        print("Setting up training arguments...")
        
        training_config = self.config['training']
        output_dir = self.config['model']['output_dir']
        
        self.training_args = TrainingArguments(
            output_dir=output_dir,
            overwrite_output_dir=True,
            num_train_epochs=training_config['num_epochs'],
            per_device_train_batch_size=training_config['batch_size'],
            learning_rate=training_config['learning_rate'],
            warmup_steps=training_config['warmup_steps'],
            weight_decay=training_config['weight_decay'],
            max_steps=training_config['max_steps'],
            save_steps=training_config['save_steps'],
            logging_steps=training_config['logging_steps'],
            logging_dir='./logs',
            report_to="none",
            dataloader_pin_memory=False,
            save_total_limit=2,
        )
        
        print("Training arguments configured")
    
    def create_trainer(self):
        """Create trainer instance"""
        print("Creating trainer...")
        
        # Data collator for language modeling
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False,  # We're doing causal LM, not masked LM
        )
        
        self.trainer = Trainer(
            model=self.model,
            args=self.training_args,
            train_dataset=self.dataset,
            data_collator=data_collator,
            tokenizer=self.tokenizer,
        )
        
        print("Trainer created successfully")
    
    def train(self):
        """Train the model"""
        print("Starting training...")
        
        try:
            # Start training
            train_result = self.trainer.train()
            
            # Save model
            self.trainer.save_model()
            self.tokenizer.save_pretrained(self.config['model']['output_dir'])
            
            print(f"Training completed successfully!")
            print(f"Final training loss: {train_result.training_loss:.4f}")
            
            return True
            
        except Exception as e:
            print(f"Training failed: {e}")
            return False
    
    def evaluate_model(self, test_prompts: List[str] = None):
        """Evaluate the trained model"""
        print("Evaluating model...")
        
        if test_prompts is None:
            test_prompts = [
                "What is microgravity?",
                "How does space affect bone density?",
                "What are the effects of radiation on astronauts?",
                "Explain muscle atrophy in space",
                "What countermeasures exist for space health issues?"
            ]
        
        self.model.eval()
        
        print("\n=== Model Evaluation ===")
        for i, prompt in enumerate(test_prompts, 1):
            print(f"\n{i}. User: {prompt}")
            
            # Tokenize input
            inputs = self.tokenizer.encode(prompt, return_tensors="pt")
            
            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_length=200,
                    num_return_sequences=1,
                    temperature=self.config['model']['temperature'],
                    top_k=self.config['model']['top_k'],
                    top_p=self.config['model']['top_p'],
                    repetition_penalty=self.config['model']['repetition_penalty'],
                    pad_token_id=self.tokenizer.eos_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    do_sample=True
                )
            
            # Decode response
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Clean response
            if prompt in response:
                response = response.replace(prompt, "").strip()
            
            print(f"   Assistant: {response}")
        
        print("\nModel evaluation completed")

def main():
    """Main training function"""
    print("=== NASA AI Model Training ===")
    
    # Initialize trainer
    trainer = NASAModelTrainer()
    
    # Load model and tokenizer
    trainer.load_model_and_tokenizer()
    
    # Prepare dataset
    trainer.prepare_dataset()
    
    # Setup training arguments
    trainer.setup_training_args()
    
    # Create trainer
    trainer.create_trainer()
    
    # Train model
    success = trainer.train()
    
    if success:
        # Evaluate model
        trainer.evaluate_model()
        print("\n🎉 NASA AI model training completed successfully!")
    else:
        print("\n❌ Training failed. Please check the logs.")

if __name__ == "__main__":
    main()

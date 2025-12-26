import pandas as pd
import os

# Adjust path relative to where main.py runs (project root/Backend)
DATA_PATH = os.path.join(os.getcwd(), "data/Actual_Dataset.csv")

def load_data():
    try:
        # Resolve absolute path to ensure reliability
        abs_path = os.path.abspath(DATA_PATH)
        if not os.path.exists(abs_path):
            raise FileNotFoundError(f"Dataset not found at: {abs_path}")
            
        df = pd.read_csv(abs_path)
        return df
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        # Return empty dataframe as fallback, or re-raise
        raise e

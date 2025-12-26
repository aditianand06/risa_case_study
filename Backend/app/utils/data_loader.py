import pandas as pd
import os
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# Adjust path purely for local fallback or reference
csv_path = os.path.join(os.getcwd(), "data/Actual_Dataset.csv")
# Path to service account key
creds_path = os.path.join(os.getcwd(), "service_account.json")
# Sheet Name (could be in env, default to "Actual_Dataset")
SHEET_NAME = os.getenv("GOOGLE_SHEET_NAME", "Actual_Dataset")

def load_data():
    """
    Loads patient data.
    Priority 1: Google Sheets (if service_account.json exists)
    Priority 2: Local CSV (data/Actual_Dataset.csv)
    """
    # 1. Try Google Sheets
    if os.path.exists(creds_path):
        try:
            scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
            creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
            client = gspread.authorize(creds)
            
            # Open Sheet
            # Note: This requires the sheet to be shared with the client_email in json
            sheet = client.open(SHEET_NAME).sheet1
            
            # Get all records
            data = sheet.get_all_records()
            df = pd.DataFrame(data)
            print(f"Successfully loaded data from Google Sheet: {SHEET_NAME}")
            return df
        except Exception as e:
            print(f"Google Sheet load failed (falling back to CSV): {e}")

    # 2. Fallback to Local CSV
    try:
        abs_path = os.path.abspath(csv_path)
        if not os.path.exists(abs_path):
            raise FileNotFoundError(f"Dataset not found at: {abs_path}")
            
        df = pd.read_csv(abs_path)
        print("Loaded data from local CSV.")
        return df
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        raise e

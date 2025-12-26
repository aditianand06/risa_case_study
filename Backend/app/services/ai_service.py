import os
from google import genai
import asyncio

class AIService:
    @staticmethod
    def generate_clinical_alerts(patient_data):
        """
        Rule-based detection (NOT AI).
        Alerts are triggered ONLY from existing structured fields.
        """
        alerts = []
        
        # 1. Disease-related
        if str(patient_data.get('Metastatic_Status', '')).lower() == 'yes':
            alerts.append({"category": "Disease", "message": "Metastatic disease present", "level": "high"})
        
        if str(patient_data.get('New_Lesions', '')).lower() == 'yes':
            alerts.append({"category": "Disease", "message": "New lesions identified", "level": "high"})
            
        if str(patient_data.get('Response', '')).upper() == 'PD' or str(patient_data.get('RECIST', '')).upper() == 'PD':
            alerts.append({"category": "Disease", "message": "Radiographic progression", "level": "high"})

        # 2. Functional / Safety
        try:
            ecog_str = str(patient_data.get('Performance_Status', ''))
            # simple extract digit
            ecog_val = int(''.join(filter(str.isdigit, ecog_str))) if any(c.isdigit() for c in ecog_str) else 0
            if ecog_val >= 2:
                alerts.append({"category": "Functional", "message": "Reduced functional reserve", "level": "medium"})
        except:
            pass # Fallback if parsing fails

        if str(patient_data.get('Liver_Flag', '')).lower() == 'yes':
             alerts.append({"category": "Safety", "message": "Hepatic dysfunction", "level": "medium"})
             
        if str(patient_data.get('Renal_Flag', '')).lower() == 'yes':
             alerts.append({"category": "Safety", "message": "Renal impairment", "level": "medium"})

        # 3. Treatment Tolerance
        toxicities = str(patient_data.get('Toxicities', ''))
        if toxicities and toxicities.lower() != 'nan' and toxicities.lower() != 'none':
             alerts.append({"category": "Tolerance", "message": "Treatment-related toxicities documented", "level": "medium"})

        # 4. Data Quality
        if str(patient_data.get('Ambiguous_Pathology', '')).lower() == 'yes':
             alerts.append({"category": "Data", "message": "Pathology uncertainty", "level": "low"})

        return alerts

    @staticmethod
    def generate_ai_summary(alerts, patient_data):
        """
        Mock AI Summary for Section 1 (Header Alert Summary).
        Keeping as string template for speed, or could also be AI.
        For now, standardizing on the detailed Insight as the main AI feature.
        """
        return "Clinical signals under review. Refer to Comprehensive AI Insights below for detailed analysis."

    @staticmethod
    def generate_cross_domain_insight(raw_patient_data):
        """
        Generates cross-domain clinical insights using Google Gemini Models.
        Strategy: Try superior models first, fallback to faster/cheaper ones.
        """
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("WARNING: GEMINI_API_KEY not found in environment.")
            return AIService._get_fallback_insight()

        client = genai.Client(api_key=api_key)

        # Prompt Construction
        prompt = f"""
        You are an assistive clinical reasoning system for oncology.

        Here is the structured clinical data for a single patient, covering pathology, molecular findings, treatment history, imaging response, biomarkers, functional status, and organ function.

        Data: 
        {raw_patient_data}

        Your task is to generate EXACTLY 5 bullet points that provide cross-domain clinical insights.

        Each bullet point MUST:
        Connect findings across domains (e.g., pathology → therapy, therapy → response, response → functional tolerance)
        Highlight alignment or discordance between tumor biology, treatment choice, and observed outcomes
        Surface clinically relevant patterns or monitoring considerations WITHOUT giving instructions
        Use concise, neutral, factual, clinician-appropriate language

        You MUST:
        Output ONLY bullet points (no headings, no paragraphs, no numbering, no extra text)
        Output EXACTLY 5 bullet points
        Keep each bullet to a maximum of 1-2 sentences

        You MUST NOT:
        Repeat raw data values, dates, or measurements
        Summarize the patient record section by section
        Flag abnormalities or generate alerts
        Recommend treatments or changes in management
        Predict outcomes or prognosis
        Introduce external guidelines, reference ranges, or medical knowledge
        Override clinician judgment in any way

        Use language patterns such as:
        “Findings are concordant with…”
        “There is alignment between…”
        “Clinical signals collectively suggest…”
        “These findings indicate coherence between…”

        Assume this output is assistive only and intended to help a clinician reflect on how the available information fits together clinically.
        """

        # Model Chain: Pro -> Flash -> Pro 1.0
        # "gemini 3 pro" request mapped to current best (1.5-pro)
        models_to_try = [
            "gemini-3-pro-preview",
            "gemini-3-flash-preview",
            "gemini-2.5-pro",
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite"
        ]

        for model_name in models_to_try:
            try:
                # print(f"Attempting generation with {model_name}...")
                # Run sync in thread if needed, but google sdk might be blocking
                # Using to_thread for non-blocking in async endpoint
                response = client.models.generate_content(model = model_name, contents = prompt)
                
                if response.text:
                    # Parse into list of strings (bullets)
                    # Expecting raw text like "* Point 1\n* Point 2" or "- Point 1"
                    print(response.text)
                    lines = [line.strip().lstrip('*-• ').strip() for line in response.text.split('\n') if line.strip()]
                    
                    # Ensure we have about 5. If strictly 5 requested, just take top 5.
                    return lines[:5]
            except Exception as e:
                print(f"Model {model_name} failed: {str(e)}")
                continue # Try next model

        print("All models failed. Returning fallback.")
        return AIService._get_fallback_insight()

    @staticmethod
    def generate_clinical_alert_insights(raw_patient_data):
        """
        Generates strict rule-based clinical alerts using AI.
        Replaces the Python rule engine with an LLM prompt.
        """
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return ["Missing API Key - Cannot generate alerts."]

        client = genai.Client(api_key=api_key)

        prompt = f"""You are an assistive clinical summarization system.
        Here's the structured data for a single oncology patient containing the following fields:
        Abnormal_Labs, Renal_Flag, Liver_Flag, Lab_Flag_Trend, Biomarker_Trend,
        Radiology_Trend, Response, New_Lesions, Performance_Status,
        Toxicities, Ambiguous_Pathology.

        Data:
        { {k: raw_patient_data.get(k) for k in ["Abnormal_Labs", "Renal_Flag", "Liver_Flag", "Lab_Flag_Trend", "Biomarker_Trend", "Radiology_Trend", "Response", "New_Lesions", "Performance_Status", "Toxicities", "Ambiguous_Pathology"]} }

        –––––––––––––––––––––––––
        ALERT DETECTION LOGIC (STRICT, RULE-BASED)
        You must internally apply the following logic to decide what constitutes an alert.
        Do NOT invent or infer anything beyond this logic.

        Trigger an alert ONLY if the condition below is met:

        1. Abnormal_Labs
        - If value exists AND value != "None"
        → Alert: "Laboratory abnormalities: <value>"

        2. Renal_Flag
        - If value == "Yes"
        → Alert: "Renal function abnormality present"

        3. Liver_Flag
        - If value == "Yes"
        → Alert: "Hepatic function abnormality present"

        4. Lab_Flag_Trend
        - If value contains "Progressive" OR "Worsening"
        → Alert: "Worsening laboratory trend: <value>"

        5. Biomarker_Trend
        - If value contains "rising" OR "increasing"
        → Alert: "Rising tumor biomarker trend: <value>"

        6. Radiology_Trend
        - If value == "Worsening"
        → Alert: "Worsening radiographic disease trend"

        7. Response
        - If value == "PD"
        → Alert: "Radiographic progression by Response"

        8. New_Lesions
        - If value == "Yes"
        → Alert: "New lesions identified on imaging"

        9. Performance_Status
        - If value is ECOG 2, ECOG 3, or ECOG 4
        → Alert: "Reduced functional reserve (ECOG <value>)"

        10. Toxicities
        - If value exists AND value != "None"
        → Alert: "Treatment-related toxicities: <value>"

        11. Ambiguous_Pathology
        - If value == "Yes"
        → Alert: "Pathology findings are ambiguous"

        –––––––––––––––––––––––––
        MISSING CRITICAL DATA LOGIC
        If any of the above fields are missing or empty,
        they must be treated as missing critical data and explicitly mentioned.

        –––––––––––––––––––––––––
        OUTPUT RULES (MANDATORY)

        Your output MUST:
        - Contain ONLY bullet points
        - Contain a MINIMUM of 3 and a MAXIMUM of 4 bullet points
        - Mention ONLY alerts that were triggered by the rules above
        - Include the actual values or findings from the data
        - Use direct, plain, clinician-friendly language

        Language constraints:
        - Do NOT use phrases like "is reported as", "indicating", "reflecting", "documented", or "assessment"
        - State findings clearly and concretely
        - One clinical idea per bullet
        - One sentence per bullet

        You MUST NOT:
        - Mention absence of findings or absence of progression
        - Introduce new alerts or interpretations
        - Recommend actions, treatments, or investigations
        - Predict outcomes or prognosis
        - Introduce external medical knowledge or guidelines

        If missing critical data exists, include ONE bullet in the format:
        "Missing critical data: <field names>"
        Collect only triggered alerts

        Collect missing critical data items
        Cap total items to max 4

        Priority order:

        Disease activity (RECIST, New_Lesions, Radiology_Trend)
        Organ safety (Liver_Flag, Renal_Flag)
        Functional / tolerance (ECOG, Toxicities)
        Data quality (Ambiguous / Missing)

        DO NOT MENTION ANYTHING OTHER THAN THE BULLETED INSIGHTS IN YOUR RESPONSE.
"""
        models_to_try = [
            "gemini-3-pro-preview",
            "gemini-3-flash-preview",
            "gemini-2.5-pro",
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-1.5-pro",
            "gemini-1.5-flash"
        ]

        for model_name in models_to_try:
            try:
                response = client.models.generate_content(model = model_name, contents = prompt)

                if response.text:
                    print(response.text)
                    lines = [line.strip().lstrip('*-• ').strip() for line in response.text.split('\n') if line.strip()]
                    if lines: return lines
            except Exception as e:
                print(f"Model {model_name} failed: {str(e)}")
                continue # Try next model

        return generate_clinical_alerts(raw_patient_data)

    @staticmethod
    def _get_fallback_insight():
        return [
            "Clinical data signals indicate alignment between current therapy and partial response status.",
            "Biomarker trends support the favorable radiographic findings observed.",
            "Functional status appears preserved despite noted toxicities, suggesting adequate tolerance.",
            "Pathology and genomic drivers are consistent with the selected targeted regimen.",
            "(AI Service unavailable - displaying cached/fallback insights)"
        ]

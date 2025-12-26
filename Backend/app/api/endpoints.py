from fastapi import APIRouter, HTTPException
from app.services.patient_service import PatientService
from app.services.ai_service import AIService
import asyncio

router = APIRouter()
patient_service = PatientService()

@APIRouter.get(router, "/getMinimalPatientInfo")
async def get_minimal_patient_info():
    # Reuse old logic slightly modified or just load data and return minimal
    # For now, let's keep it simple as user focused on Page 2
    from app.utils.data_loader import load_data
    df = load_data()
    # Minimal fields for list
    patients = []
    for _, row in df.iterrows():
        # Quick logic matching old format
        patients.append({
            "uid": str(row.get('Patient_ID', '')),
            "name": str(row.get('Name', '')),
            "age": int(row.get('Age', 0)),
            "sex": str(row.get('Sex', '')),
            "primary_cancer_type": str(row.get('Primary_Diagnosis', '')),
            "disease_status": str(row.get('Response', 'unknown')) # Simplified
        })
    return patients

@router.get("/getMinimalPatientInfo")
async def get_minimal_info():
    # Redundant definition fix
    from app.utils.data_loader import load_data
    df = load_data()
    patients = []
    for _, row in df.iterrows():
        patients.append({
            "uid": str(row.get('Patient_ID', '')),
            "name": str(row.get('Name', '')),
            "age": int(row.get('Age', 0)),
            "sex": str(row.get('Sex', '')),
            "primary_cancer_type": str(row.get('Primary_Diagnosis', '')),
            "disease_status": str(row.get('Response', 'Unknown'))
        })
    return patients

@router.get("/getFullPatientDetails")
async def get_full_patient_details(name: str):
    data = patient_service.get_patient_details(name)
    if not data:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Extract Raw Data for AI
    raw_data = data.pop('raw_data', {})
    
    # Generate Cross-Domain Insights (real call)
    ai_insights_task = AIService.generate_cross_domain_insight(raw_data)
    ai_alerts_task = AIService.generate_clinical_alert_insights(raw_data)
    
    ai_insights = ai_insights_task
    ai_alerts = ai_alerts_task
    
    # Attach to response
    data['cross_domain_insights'] = ai_insights
    if 'header' in data:
        data['header']['ai_generated_alerts'] = ai_alerts
        # Clear old rule-based alerts to prioritize AI ones if frontend uses them
        # Or let frontend decide. I'll add the new field.
    
    return data

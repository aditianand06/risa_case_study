import pandas as pd
from app.utils.data_loader import load_data
from app.services.ai_service import AIService

class PatientService:
    def _parse_pipe_list(self, value):
        if pd.isna(value) or str(value).lower() == 'nan' or not value:
            return []
        # Split by pipe and strip whitespace
        return [item.strip() for item in str(value).split('|') if item.strip()]

    def _parse_lab_data(self, text_data):
        # Parses strings like "Hb10.8 WBC3.4 Plt165" or "Sodium: 140|Potassium: 4.2"
        # Returns list of { label, value, is_abnormal }
        if not text_data or str(text_data).lower() == 'nan':
            return []
        
        # Try splitting by pipe first if structure exists
        items = []
        parts = str(text_data).replace(';', '|').replace(',', '|').split('|')
        
        # If no pipes, maybe it's space separated like "Hb10.8 WBC3.4"
        if len(parts) == 1 and ' ' in text_data:
             parts = text_data.split()

        for p in parts:
            p = p.strip()
            if not p: continue
            
            # heuristic to separate LabelValue e.g. Hb10.8 -> Hb: 10.8
            # or Label: Value
            if ':' in p:
                label, val = p.split(':', 1)
                items.append({"label": label.strip(), "value": val.strip(), "is_abnormal": False})
            else:
                # Try to find where number starts
                import re
                match = re.search(r'\d', p)
                if match:
                    idx = match.start()
                    label = p[:idx].strip()
                    val = p[idx:].strip()
                    items.append({"label": label, "value": val, "is_abnormal": False})
                else:
                    items.append({"label": p, "value": "", "is_abnormal": False})
        return items

    def get_patient_details(self, name: str):
        df = load_data()
        # Case insensitive search
        patient_row = df[df['Name'].str.lower() == name.lower()]
        
        if patient_row.empty:
            return None
            
        row = patient_row.iloc[0]
        
        # --- Section 1: Header & Alerts ---
        alerts = AIService.generate_clinical_alerts(row)
        header_data = {
            "name": str(row.get('Name', '')),
            "age": int(row['Age']) if pd.notna(row['Age']) else 0,
            "sex": str(row.get('Sex', '')),
            "performance_status": str(row.get('Performance_Status', '')),
            "primary_diagnosis": str(row.get('Primary_Diagnosis', '')),
            "histology": str(row.get('Histologic_Type', '')),
            "last_visit": str(row.get('Last_Encounter_Date', '')),
            "stage_progression": f"{row.get('Initial_TNM_Stage', '')} -> {row.get('Current_TNM_Stage', '')}",
            "clinical_alerts": alerts,
            "ai_alert_summary": AIService.generate_ai_summary(alerts, row)
        }

        # --- Section 2: Disease Status ---
        disease_status = {
            "treatment_response": str(row.get('Response', '')) or str(row.get('RECIST', '')),
            "recurrence_status": str(row.get('Recurrence_Status', '')),
            "current_trend": str(row.get('Radiology_Trend', '')),
            "longitudinal_trend": str(row.get('Radiology_Trends_Longitudinal', '')),
            "metastatic_status": str(row.get('Metastatic_Status', '')),
            "metastatic_sites": self._parse_pipe_list(row.get('Metastatic_Sites', '')),
            "new_lesions": str(row.get('New_Lesions', '')),
            "lesion_count_size": str(row.get('Lesion_Count_Size', '')),
            "radiology_findings": self._parse_pipe_list(row.get('Radiology_Keywords', '')), 
            "radiology_report_link": str(row.get('Radiology_Links', ''))
        }

        # --- Section 3: Timeline ---
        # "These 9 have dates, want them all to be arranged in ascending order"
        # Diagnosis, Biopsy, Brain MRI, PET CT, CT Chest, Surgery, Radiation, Treatment Dates
        
        events = []
        def add_event(date_key, label, desc_key=None, extra_desc=None, prefix_label=False):
            date_val = str(row.get(date_key, ''))
            
            # Custom handling for specific DD-MM-YYYY fields
            if date_key in ['Diagnosis_Date', 'Biopsy_Date'] and date_val and date_val.lower() != 'nan':
                try:
                    # Expecting DD-MM-YYYY, sanitize first
                    clean_d = date_val.strip().split(' ')[0] # Remove potential time/text
                    # Use pandas to parse with dayfirst=True
                    dt = pd.to_datetime(clean_d, dayfirst=True, errors='coerce')
                    if pd.notna(dt):
                        date_val = dt.strftime('%Y-%m-%d')
                except Exception:
                    pass # Fallback to original string if parse fails

            if date_val and date_val.lower() != 'nan':
                # Heuristic: split by space to get date if it looks like "2024-01-01 Desc"
                # But CSV fields vary. Let's try to extract date.
                # Assuming YYYY-MM-DD is at start
                d = date_val.split(' ')[0]
                
                desc = extra_desc if extra_desc else label
                if desc_key:
                    val = str(row.get(desc_key, ''))
                    if val and val.lower() != 'nan':
                        desc = f"{label}: {val}"
                
                # Check for "Result" style combination in source fields
                # e.g Latest_Brain_MRI (Date & Result both)
                if desc_key is None and len(date_val) > 10: 
                     # If the field itself contains text after date
                     desc = date_val[10:].strip(' -:')
                     if not desc: desc = label
                
                if prefix_label and label.lower() not in desc.lower():
                     desc = f"{label} - {desc}"

                events.append({"date": d, "label": label, "description": desc, "original_field": date_key})

        add_event('Diagnosis_Date', 'Diagnosis', extra_desc=f"{row.get('Primary_Diagnosis', '')}")
        add_event('Biopsy_Date', 'Biopsy', extra_desc=f"Site: {row.get('Biopsy_Site', '')}")
        add_event('Latest_Brain_MRI', 'Brain MRI', prefix_label=True)
        add_event('Latest_PET_CT', 'PET/CT', prefix_label=True)
        add_event('Latest_CT_Chest', 'CT Chest', prefix_label=True)
        # add_event('Surgery', 'Surgery') # OLD

        # Surgery Custom Parsing
        sx_val = str(row.get('Surgery', ''))
        if sx_val and sx_val.lower() != 'nan':
            # Check if it ends with year "Text 2023"
            parts = sx_val.strip().split(' ')
            if len(parts) > 0:
                possible_year = parts[-1]
                if len(possible_year) == 4 and possible_year.isdigit():
                    # Format: "RUL lobectomy 2023"
                    date = possible_year
                    desc = " ".join(parts[:-1])
                    events.append({"date": date, "label": "Surgery", "description": desc, "original_field": "Surgery"})
                else:
                    # Fallback
                    events.append({"date": "", "label": "Surgery", "description": sx_val, "original_field": "Surgery"})

        # Treatment Start Event
        tx_date_str = str(row.get('Treatment_Dates', ''))
        if tx_date_str and tx_date_str.lower() != 'nan':
            # Extract start date (first 10 chars assuming YYYY-MM-DD)
            start_date = tx_date_str.split(' ')[0]
            if len(start_date) >= 10:
                # Helper to clean text
                def clean(txt):
                    val = str(txt).strip()
                    if not val or val.lower() == 'nan': return ''
                    return val

                regimen = clean(row.get('Regimen', ''))
                line = clean(row.get('Current_Line', ''))
                
                parts = []
                if regimen: parts.append(regimen)
                if line: parts.append(f"(Line {line})")
                
                desc = " ".join(parts)
                
                # Append Treatment Response Timeline if available
                response_timeline = str(row.get('Treatment_Response_Timeline', ''))
                if response_timeline and response_timeline.lower() != 'nan':
                     desc += f"\n{response_timeline}"

                events.append({
                    "date": start_date, 
                    "label": "Treatment start", 
                    "description": desc, 
                    "original_field": "Treatment_Dates"
                })

        treatment_dates = tx_date_str
        
        # Sort events custom key
        def event_sort_key(e):
            d_str = e['date']
            if not d_str: return (0, 0, 0)
            
            # If "YYYY" -> Treat as End of Year (Year, 13, 32) so it comes after any specific date in that year
            if len(d_str) == 4 and d_str.isdigit():
                return (int(d_str), 13, 32)
                
            # If "YYYY-MM-DD"
            try:
                parts = d_str.split('-')
                if len(parts) >= 3:
                     # YYYY, MM, DD
                     return (int(parts[0]), int(parts[1]), int(parts[2]))
                elif len(parts) == 2:
                     # YYYY-MM (treat as start or end? assuming start usually)
                     return (int(parts[0]), int(parts[1]), 0)
            except:
                pass
            
            return (0, 0, 0)

        events.sort(key=event_sort_key)

        # Treatment Context (Post Timeline)
        tx_context = {
            "current_line": str(row.get('Current_Line', '')),
            "prior_therapies": str(row.get('Prior_Therapies', '')),
            "reason_for_change": str(row.get('Reason_For_Change', '')),
            "regimen": str(row.get('Regimen', '')),
            "response_timeline": str(row.get('Treatment_Response_Timeline', '')),
            "plan_summary": str(row.get('Treatment_Plan_Summary', '')),
            "disease_course_summary": str(row.get('Disease_Course_Summary', ''))
        }

        # --- Section 4: Organ Function & Lab Risk ---
        organ_risk = {
            "renal_function": "Abnormal" if str(row.get('Renal_Flag', '')).lower() == 'yes' else "Preserved",
            "hepatic_function": "Abnormal" if str(row.get('Liver_Flag', '')).lower() == 'yes' else "Preserved",
            "lab_abnormalities": self._parse_pipe_list(str(row.get('Abnormal_Labs', ''))),
            "lab_trend": str(row.get('Lab_Flag_Trend', 'Stable')),
            "toxicities": self._parse_pipe_list(str(row.get('Toxicities', ''))),
            "pathology_uncertainty": str(row.get('Ambiguous_Pathology', 'No'))
        }
        # --- Section 5: Comorbidities ---
        active_comorbidities = []
        
        def is_present(val):
            return val and str(val).lower() not in ['nan', 'no', 'none']

        # 1. Diabetes: content
        val = str(row.get('Diabetes', '')).strip()
        if is_present(val):
            active_comorbidities.append('Diabetes ' + val)

        # 2. Hypertension: label "Hypertension"
        val = str(row.get('Hypertension', '')).strip()
        if is_present(val):
            active_comorbidities.append('Hypertension')

        # 3. Heart Disease: label "Heart Disease"
        val = str(row.get('Heart_Disease', '')).strip()
        if is_present(val):
            active_comorbidities.append('Heart Disease')
            
        # 4. COPD_Asthma: content
        val = str(row.get('COPD_Asthma', '')).strip()
        if is_present(val):
            active_comorbidities.append(val)

        # 5. Other Comorbidities: content
        val = str(row.get('Other_Comorbidities', '')).strip()
        if is_present(val):
            active_comorbidities.append(val)
        
        comorbidities = {
            "active_conditions": active_comorbidities,
            "smoking_history": str(row.get('Smoking_Status', ''))
        }



        # --- Section 6: Detailed Evidence ---
        evidence = {
            "pathology": {
                "summary": str(row.get('Pathology_Diagnosis_Text', '')),
                "grade": str(row.get('Tumor_Grade', '')),
                "margins": str(row.get('Margin_Status', '')),
                "features": self._parse_pipe_list(str(row.get('Histopathologic_Features', ''))),
                "keywords": str(row.get('Pathology_Keywords', '')),
                "ihc": str(row.get('IHC_Markers', '')),
                "num_reports": str(row.get('Num_Pathology_Reports', ''))
            },
            "genomics": {
                "mutations": {
                    k: str(row.get(k, '')) for k in ['EGFR', 'ALK', 'ROS1', 'KRAS', 'BRAF', 'MET_Exon14', 'RET', 'HER2', 'NTRK']
                },
                "pdl1": str(row.get('PDL1_Percent', '')),
                "tmb": str(row.get('TMB', '')),
                "msi": str(row.get('MSI', '')),
                "ctdna": str(row.get('ctDNA_Findings', '')),
                "actionable": str(row.get('Actionable_Mutation_Summary', '')),
                "new_mutations": str(row.get('New_Mutations', ''))
            },
            "biomarkers": {
                "trend": str(row.get('Biomarker_Trend', '')),
                "longitudinal": str(row.get('Biomarker_Trends_Longitudinal', '')),
                "markers": {
                    "CEA": str(row.get('CEA', '')),
                    "CA19-9": str(row.get('CA19_9', '')),
                    "Other": str(row.get('Other_Tumor_Markers', ''))
                }
            },
            "labs": {
                "cbc": self._parse_lab_data(str(row.get('CBC', ''))),
                "cmp": self._parse_lab_data(str(row.get('CMP', ''))),
                "electrolytes": self._parse_lab_data(str(row.get('Electrolytes', '')))
            },
            "docs": {
                "pathology_links": str(row.get('Pathology_Links', '')),
                "radiology_links": str(row.get('Radiology_Links', '')),
                "genomic_links": str(row.get('Genomic_Links', '')),
                "notes": str(row.get('Provider_Notes', ''))
            }
        }

        return {
            "header": header_data,
            "disease_status": disease_status,
            "timeline": {
                "events": events,
                "treatment_dates": treatment_dates,
                "context": tx_context
            },
            "organ_risk": organ_risk,
            "comorbidities": comorbidities,
            "evidence": evidence,
            "raw_data": row.to_dict()
        }

"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../utils/api';
import { ChevronLeft } from 'lucide-react';

// Components
import PatientHeader from '../../../components/PatientHeader';
import DiseaseStatus from '../../../components/DiseaseStatus';
import Timeline from '../../../components/Timeline';
import TreatmentContext from '../../../components/TreatmentContext';
import OrganRisk from '../../../components/OrganRisk';
import Comorbidities from '../../../components/Comorbidities';
import ClinicalEvidence from '../../../components/ClinicalEvidence';
import AIInsights from '../../../components/AIInsights';

export default function PatientDashboard() {
    const params = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!params.id) return;

        const fetchPatient = async () => {
            try {
                // The URL param is the patient's name because the list links to /dashboard/[name]
                // We need to decode it to handle spaces (e.g., "Jane%20Doe" -> "Jane Doe")
                const nameToFetch = decodeURIComponent(params.id);

                const response = await api.get(`/getFullPatientDetails?name=${nameToFetch}`);
                setPatient(response.data);
            } catch (err) {
                console.error("Error fetching patient:", err);
                setError("Failed to load patient data or AI service timeout.");
            } finally {
                setLoading(false);
            }
        };

        fetchPatient();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold text-slate-700">Synthesizing Clinical Data...</h2>
                <p className="text-slate-500">Generating Cross-Domain Analysis (This may take a moment)</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                    <h2 className="text-red-600 font-bold text-xl mb-2">Error Loading Dashboard</h2>
                    <p className="text-slate-600 mb-4">{error}</p>
                    <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">Return to Patient List</button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            {/* 1. Header (Basic Info + Clinical Alerts) - Sticky & Full Width */}
            <PatientHeader header={patient.header} />

            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* 2. Cross-Domain AI Synthesizer (Placed High as requested "High Value") */}
                {/* User Prompt order: Section 1..6 then AI. 
                    But typically AI summary is top or bottom. 
                    Prompt said "Add Cross-Domain Clinical Insights... This is the highest-value use".
                    I will place it AFTER Section 2 or at the very bottom? 
                    "Section 6... Add Cross-Domain...". 
                    Okay, I will put it at the end or right after Header if it's "highest value".
                    Let's put it as a standout section at the top of content or bottom.
                    The prompt lists it under "Section 6 ... Add Cross-Domain".
                    I'll stick to bottom but make it huge.
                */}

                {/* 2. Disease Status */}
                <DiseaseStatus data={patient.disease_status} />

                {/* 3. Timeline */}
                <Timeline timeline={patient.timeline} />

                {/* 4. Treatment Context */}
                <TreatmentContext context={patient.timeline.context} />

                {/* 5. Organ Risk */}
                <OrganRisk data={patient.organ_risk} />

                {/* 6. Comorbidities */}
                <Comorbidities data={patient.comorbidities} />

                {/* 7. Clinical Evidence */}
                <ClinicalEvidence data={patient.evidence} />

                {/* 8. AI Insights */}
                <AIInsights insights={patient.cross_domain_insights} />
            </div>
        </main>
    );
}

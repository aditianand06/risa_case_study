"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, User, Calendar, Activity, ChevronRight, ChevronLeft } from 'lucide-react';

export default function PatientHeader({ header }) {
    const router = useRouter();
    if (!header) return null;

    const formatValue = (val) => (!val || val.toString().toLowerCase() === 'nan') ? 'Data Insufficient' : val;

    return (
        <>
            {/* 1. Sticky Top Bar - Frozen in position */}
            <div className="sticky top-0 z-50 bg-[#00796b] shadow-md text-white">
                {/* Full Width Container for Relative Positioning */}
                <div className="relative w-full">

                    {/* Absolute Back Button - Far Left of Viewport */}
                    <button
                        onClick={() => router.push('/')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-teal-100 hover:text-white font-medium text-sm transition-colors z-20"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Back to Patients</span>
                    </button>

                    {/* Centered Content Container */}
                    <div className="max-w-7xl mx-auto px-6 py-3 relative z-10">
                        {/* Upper Row */}
                        <div className="flex justify-between items-center mb-2">
                            {/* Left: Identity (Name & Icon) */}
                            <div className="flex items-center gap-3">
                                <div className="bg-teal-800/40 p-1.5 rounded">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <h1 className="text-lg font-bold tracking-tight">{formatValue(header.name)}</h1>
                            </div>

                            {/* Middle: Diagnosis */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-teal-200 font-medium">Diagnosis:</span>
                                <span className="font-semibold">{formatValue(header.primary_diagnosis)}</span>
                            </div>

                            {/* Right: Last Visit */}
                            <div className="flex items-center gap-2 text-sm">
                                <div className="bg-teal-800/40 p-1 rounded">
                                    <Calendar className="w-3 h-3 text-teal-100" />
                                </div>
                                <span className="text-teal-200">Last Visit:</span>
                                <span className="font-semibold">{formatValue(header.last_visit)}</span>
                            </div>
                        </div>

                        {/* Lower Row */}
                        <div className="flex justify-between items-center text-sm">
                            {/* Left: Demographics Badges */}
                            <div className="flex items-center gap-2">
                                <span className="bg-teal-900/40 px-3 py-0.5 rounded-full text-xs font-medium text-teal-50 border border-teal-700/50">
                                    {formatValue(header.age)} years
                                </span>
                                <span className="bg-teal-900/40 px-3 py-0.5 rounded-full text-xs font-medium text-teal-50 border border-teal-700/50">
                                    {formatValue(header.sex)}
                                </span>
                                <span className="bg-teal-900/40 px-3 py-0.5 rounded-full text-xs font-medium text-teal-50 border border-teal-700/50 flex items-center gap-1">
                                    <Activity className="w-3 h-3" /> {formatValue(header.performance_status)}
                                </span>
                            </div>

                            {/* Middle: Histology */}
                            <div className="flex items-center gap-2">
                                <span className="text-teal-200 font-medium">Histology:</span>
                                <span className="font-semibold">{formatValue(header.histology)}</span>
                            </div>

                            {/* Right: Stage Evolution */}
                            <div className="flex items-center gap-2">
                                <span className="text-teal-200 font-medium">Stage:</span>
                                {header.stage_progression && !header.stage_progression.toString().toLowerCase().includes('nan') && header.stage_progression.includes('->') ? (
                                    <div className="flex items-center gap-2">
                                        <span className="bg-teal-900/40 px-2 py-0.5 rounded text-xs text-teal-100 border border-teal-700/50">
                                            {header.stage_progression.split('->')[0].trim()}
                                        </span>
                                        <ChevronRight className="w-3 h-3 text-teal-400" />
                                        <span className="bg-yellow-600/90 px-2 py-0.5 rounded text-xs text-white font-bold border border-yellow-500/50 shadow-sm">
                                            {header.stage_progression.split('->')[1].trim()}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="font-semibold">{formatValue(header.stage_progression)}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Clinical Alerts - Scrollable Content */}
            <div className="max-w-7xl mx-auto px-6 mt-6 mb-8">
                {
                    (header.ai_generated_alerts && header.ai_generated_alerts.length > 0) || (header.clinical_alerts && header.clinical_alerts.length > 0) ? (
                        <div className="bg-[#fff1f2] border border-red-100 rounded-xl p-6 shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="bg-red-100 p-2 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-red-900 font-bold text-lg">Clinical Alerts & Signals</h3>
                                </div>
                            </div>

                            {/* Bullet List */}
                            <ul className="space-y-2 mb-6 pl-12">
                                {/* Prefer AI Alerts if available */}
                                {header.ai_generated_alerts && header.ai_generated_alerts.length > 0 ? (
                                    header.ai_generated_alerts.map((alert, idx) => (
                                        <li key={idx} className="list-disc text-red-800 text-sm font-medium marker:text-red-400">
                                            {alert}
                                        </li>
                                    ))
                                ) : (
                                    // Fallback to Rule-Based
                                    header.clinical_alerts.map((alert, idx) => (
                                        <li key={idx} className="list-disc text-red-800 text-sm font-medium marker:text-red-400">
                                            {alert.message}
                                            {alert.level === 'high' && <span className="ml-2 text-xs bg-red-200 text-red-800 px-1.5 rounded">High</span>}
                                        </li>
                                    ))
                                )}
                            </ul>

                            {/* AI Summary Footnote */}
                            {(header.ai_generated_alerts || header.ai_alert_summary) && (
                                <div className="ml-12 text-sm text-red-800/70 italic border-t border-red-200/50 pt-3">
                                    {header.ai_generated_alerts && header.ai_generated_alerts.length > 0
                                        ? "AI-generated summary for clinical context only."
                                        : header.ai_alert_summary}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-4">No active clinical alerts.</div>
                    )}
            </div>
        </>
    );
}

import React from 'react';
import { Activity, Syringe, TrendingUp } from 'lucide-react';

export default function TreatmentContext({ context }) {
    if (!context) return null;

    // Helper
    const formatValue = (val) => (!val || val.toString().toLowerCase() === 'nan') ? 'Data Insufficient' : val;

    return (
        <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Card 1: Treatment Context (Slate/Blue border) */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-l-4 border-l-slate-400 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-slate-700" />
                        <h3 className="font-bold text-slate-900">Treatment Context</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-start">
                            <span className="text-slate-500">Current Line:</span>
                            <span className="font-bold text-slate-800">{formatValue(context.current_line)}</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-slate-500">Prior Therapies:</span>
                            <span className="font-medium text-slate-800 text-right">{formatValue(context.prior_therapies)}</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-slate-500">Reason:</span>
                            <span className="font-medium text-slate-800 text-right">{formatValue(context.reason_for_change)}</span>
                        </div>
                    </div>
                </div>

                {/* Card 2: Current Plan (Teal theme) */}
                <div className="bg-teal-50 rounded-lg shadow-sm border border-teal-100 border-l-4 border-l-teal-500 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Syringe className="w-4 h-4 text-teal-700" />
                        <h3 className="font-bold text-slate-900">Current Treatment Plan</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        <p className="text-slate-600">{formatValue(context.plan_summary)}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Regimen:</span>
                            <span className="font-bold text-slate-900">{formatValue(context.regimen)}</span>
                        </div>
                    </div>
                </div>

                {/* Card 3: Disease Course (Green theme) */}
                <div className="bg-emerald-50 rounded-lg shadow-sm border border-emerald-100 border-l-4 border-l-emerald-500 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-emerald-700" />
                        <h3 className="font-bold text-slate-900">Disease Course Summary</h3>
                    </div>
                    <p className="text-emerald-700 font-medium text-sm">
                        {formatValue(context.disease_course_summary)}
                    </p>
                </div>

            </div>
        </div>
    );
}

import React from 'react';
import { Activity, Heart, Wind } from 'lucide-react';
import clsx from 'clsx';

export default function Comorbidities({ data }) {
    if (!data) return null;

    return (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            {/* Main Header */}
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-[#00695c] p-1.5 rounded text-white">
                    <Activity className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Comorbidities & Risk Factors</h2>
            </div>

            <div className="space-y-6">
                {/* Active Comorbidities Section */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-4 h-4 text-slate-400" />
                        <h3 className="font-bold text-slate-900">Active Comorbidities</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.active_conditions && data.active_conditions.length > 0 ? (
                            data.active_conditions.map((cond, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 shadow-sm bg-white">
                                    <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                                    <span className="text-slate-700 font-medium">{cond}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-500 italic text-sm">No active comorbidities</div>
                        )}
                    </div>
                </div>

                {/* Smoking History Section */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        {/* Using Wind icon as generic risk/air icon, or Cigarette if available (Cigarette is in lucide but might check version. Using Wind or Cigarette) */}
                        <Wind className="w-4 h-4 text-slate-600" />
                        <h3 className="font-bold text-slate-900">Smoking History</h3>
                    </div>

                    <div className={clsx(
                        "p-4 rounded-lg border border-l-4 shadow-sm",
                        "bg-emerald-50 border-emerald-100 border-l-emerald-500" // Always green style for now as per image or dynamic? Image shows "Never smoker" as green. 
                        // Logic: if 'Never' -> green, else maybe yellow/red?
                        // For now sticking to the design image style which shows green.
                    )}>
                        <span className="font-bold text-emerald-900">{data.smoking_history}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

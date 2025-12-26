import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

export default function AIInsights({ insights }) {
    if (!insights) return null;

    // Handle array (from new backend) or string (fallback/mock)
    let points = [];
    if (Array.isArray(insights)) {
        points = insights;
    } else if (typeof insights === 'string') {
        points = insights.split('. ').filter(p => p.length > 5);
    }

    return (
        <section className="bg-[#eff6ff] rounded-xl shadow-sm border border-blue-100 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                    <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Cross-Domain Clinical Insights</h2>
                    <p className="text-xs text-blue-600 font-medium">AI-assisted synthesis for clinical context only. Not medical advice.</p>
                </div>
            </div>

            <div className="bg-[#dbeafe] rounded-xl p-6 border border-blue-200">
                <ul className="space-y-4">
                    {points.map((point, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <div className="mt-1 bg-blue-600 p-1 rounded-sm text-white">
                                <Sparkles className="w-3 h-3" />
                            </div>
                            <span className="text-slate-800 text-sm font-medium leading-relaxed">
                                {point.trim()}.
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

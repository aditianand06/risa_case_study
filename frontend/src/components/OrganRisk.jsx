import React from 'react';
import { Activity, FlaskConical, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

export default function OrganRisk({ data }) {
    if (!data) return null;

    // Helper for List Rendering
    const renderList = (items, emptyText = 'None') => {
        if (!items || (Array.isArray(items) && items.length === 0)) {
            return <div className="text-sm font-medium opacity-70">{emptyText}</div>;
        }
        if (Array.isArray(items)) {
            return (
                <ul className="list-disc list-inside space-y-1 text-sm font-medium">
                    {items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                    ))}
                </ul>
            );
        }
        return <div className="text-sm font-medium">{items}</div>;
    };

    return (
        <div className="space-y-6 mb-8">

            {/* 1. Organ Function & Lab Risk */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-[#00695c] p-1.5 rounded text-white">
                        <FlaskConical className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Organ Function & Lab Risk</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Renal */}
                    <div className={clsx(
                        "p-4 rounded-lg border border-l-4",
                        data.renal_function === 'Preserved'
                            ? "bg-emerald-50 border-emerald-100 border-l-emerald-500"
                            : "bg-yellow-50 border-yellow-100 border-l-yellow-500"
                    )}>
                        <div className="flex items-center gap-2 mb-2">
                            <FlaskConical className={clsx("w-4 h-4", data.renal_function === 'Preserved' ? "text-emerald-700" : "text-yellow-700")} />
                            <h3 className={clsx("text-sm font-bold uppercase", data.renal_function === 'Preserved' ? "text-emerald-800" : "text-yellow-800")}>
                                Renal Function
                            </h3>
                        </div>
                        <div className={clsx("text-lg font-bold", data.renal_function === 'Preserved' ? "text-emerald-900" : "text-yellow-900")}>
                            {data.renal_function}
                        </div>
                    </div>

                    {/* Hepatic */}
                    <div className={clsx(
                        "p-4 rounded-lg border border-l-4",
                        data.hepatic_function === 'Preserved'
                            ? "bg-emerald-50 border-emerald-100 border-l-emerald-500"
                            : "bg-yellow-50 border-yellow-100 border-l-yellow-500"
                    )}>
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className={clsx("w-4 h-4", data.hepatic_function === 'Preserved' ? "text-emerald-700" : "text-yellow-700")} />
                            <h3 className={clsx("text-sm font-bold uppercase", data.hepatic_function === 'Preserved' ? "text-emerald-800" : "text-yellow-800")}>
                                Hepatic Function
                            </h3>
                        </div>
                        <div className={clsx("text-lg font-bold", data.hepatic_function === 'Preserved' ? "text-emerald-900" : "text-yellow-900")}>
                            {data.hepatic_function}
                        </div>
                    </div>

                    {/* Laboratory Abnormalities */}
                    <div className="p-4 rounded-lg border border-slate-200 border-l-4 border-l-slate-400 bg-slate-50">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-slate-600" />
                            <h3 className="text-sm font-bold uppercase text-slate-700">Laboratory Abnormalities</h3>
                        </div>
                        <div className="text-slate-900">
                            {renderList(data.lab_abnormalities)}
                        </div>
                    </div>

                    {/* Lab Trend */}
                    <div className="p-4 rounded-lg border border-slate-200 border-l-4 border-l-slate-400 bg-slate-50">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-slate-600" />
                            <h3 className="text-sm font-bold uppercase text-slate-700">Lab Trend</h3>
                        </div>
                        <div className="text-lg font-bold text-slate-900">
                            {data.lab_trend}
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Treatment Tolerance & Risk */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-rose-500 p-1.5 rounded text-white">
                        <AlertTriangle className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Treatment Tolerance & Uncertainty</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Toxicities */}
                    <div className="p-4 rounded-lg border border-rose-100 border-l-4 border-l-rose-500 bg-rose-50">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <h3 className="text-sm font-bold uppercase text-rose-700">Documented Toxicities</h3>
                        </div>
                        <div className="text-rose-900">
                            {renderList(data.toxicities, 'None reported')}
                        </div>
                    </div>

                    {/* Pathology Uncertainty */}
                    <div className={clsx(
                        "p-4 rounded-lg border border-l-4",
                        data.pathology_uncertainty === 'No'
                            ? "bg-emerald-50 border-emerald-100 border-l-emerald-500"
                            : "bg-yellow-50 border-yellow-100 border-l-yellow-500"
                    )}>
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className={clsx("w-4 h-4", data.pathology_uncertainty === 'No' ? "text-emerald-700" : "text-yellow-700")} />
                            <h3 className={clsx("text-sm font-bold uppercase", data.pathology_uncertainty === 'No' ? "text-emerald-800" : "text-yellow-800")}>
                                Pathology Uncertainty
                            </h3>
                        </div>
                        <div className={clsx("text-lg font-bold", data.pathology_uncertainty === 'No' ? "text-emerald-900" : "text-yellow-900")}>
                            {data.pathology_uncertainty}
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}

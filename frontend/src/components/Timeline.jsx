import React from 'react';
import { Clock, Stethoscope, Scissors, FileText, Syringe, Activity, Microscope } from 'lucide-react';
import clsx from 'clsx';

export default function Timeline({ timeline }) {
    if (!timeline) return null;

    // Helper: Date Formatter "Mar 12, 2023"
    const formatDate = (dateString) => {
        if (!dateString) return { date: '', year: '' };

        // Check for Year Only (YYYY)
        if (/^\d{4}$/.test(dateString.trim())) {
            return { date: dateString, year: '' };
        }

        const date = new Date(dateString);
        // Check invalid
        if (isNaN(date.getTime())) return { date: dateString, year: '' };

        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            year: date.getFullYear()
        };
    };

    // Helper: Styles mapping
    const getEventConfig = (label) => {
        const l = label.toLowerCase();

        if (l.includes('diagnosis')) return {
            id: 'diagnosis',
            color: 'rose',
            icon: <Stethoscope className="w-3.5 h-3.5" />,
            borderColor: 'border-rose-400',
            bgColor: 'bg-rose-50',
            textColor: 'text-rose-900',
            pillColor: 'text-rose-600',
            pillBg: 'bg-rose-100/50'
        };
        if (l.includes('surgery')) return {
            id: 'surgery',
            color: 'orange',
            icon: <Scissors className="w-3.5 h-3.5" />,
            borderColor: 'border-orange-400',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-900',
            pillColor: 'text-orange-600',
            pillBg: 'bg-orange-100/50'
        };
        if (l.includes('biopsy')) return {
            id: 'biopsy',
            color: 'amber',
            icon: <FileText className="w-3.5 h-3.5" />, // Or Microscope
            borderColor: 'border-amber-400',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-900',
            pillColor: 'text-amber-700',
            pillBg: 'bg-amber-100/50'
        };
        if (l.includes('treatment')) return {
            id: 'treatment start',
            color: 'teal',
            icon: <Syringe className="w-3.5 h-3.5" />,
            borderColor: 'border-teal-400',
            bgColor: 'bg-teal-50',
            textColor: 'text-teal-900',
            pillColor: 'text-teal-700',
            pillBg: 'bg-teal-100/50'
        };
        if (l.includes('scan') || l.includes('mri') || l.includes('ct')) return {
            id: 'scan',
            color: 'violet',
            icon: <Activity className="w-3.5 h-3.5" />,
            borderColor: 'border-violet-400',
            bgColor: 'bg-violet-50',
            textColor: 'text-violet-900',
            pillColor: 'text-violet-600',
            pillBg: 'bg-violet-100/50'
        };

        // Default
        return {
            id: 'event',
            color: 'slate',
            icon: <Clock className="w-3.5 h-3.5" />,
            borderColor: 'border-slate-300',
            bgColor: 'bg-slate-50',
            textColor: 'text-slate-700',
            pillColor: 'text-slate-500',
            pillBg: 'bg-slate-100'
        };
    };

    return (
        <section className="bg-white rounded-xl p-2 mb-8">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-[#00695c] p-1.5 rounded text-white">
                    <Clock className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Disease & Treatment Timeline</h2>
            </div>

            <div className="relative">
                {/* Continuous Vertical Line (Behind) */}
                <div className="absolute left-[110px] top-4 bottom-4 w-0.5 bg-slate-200 -translate-x-1/2" />

                <div className="space-y-6">
                    {timeline.events.map((event, idx) => {
                        const style = getEventConfig(event.label);
                        const { date, year } = formatDate(event.date);

                        // Dot color mapping
                        const dotColorClasses = {
                            rose: 'bg-rose-400 ring-rose-200',
                            orange: 'bg-orange-400 ring-orange-200',
                            amber: 'bg-amber-400 ring-amber-200',
                            teal: 'bg-teal-400 ring-teal-200',
                            violet: 'bg-violet-400 ring-violet-200',
                            slate: 'bg-slate-400 ring-slate-200',
                        };

                        return (
                            <div key={idx} className="flex gap-6 relative">
                                {/* Date Column */}
                                <div className="w-[80px] text-right pt-2 flex-shrink-0">
                                    <div className="text-sm font-semibold text-slate-700">{date}</div>
                                    <div className="text-xs text-slate-400 font-medium">{year}</div>
                                </div>

                                {/* Timeline Marker */}
                                <div className="flex flex-col items-center pt-3 flex-shrink-0 z-10 w-3">
                                    <div className={clsx(
                                        "w-3 h-3 rounded-full ring-4 bg-white",
                                        dotColorClasses[style.color]
                                    )} />
                                </div>

                                {/* Event Card */}
                                <div className={clsx(
                                    "flex-1 rounded-lg border-l-4 p-4 shadow-sm transition-all hover:shadow-md",
                                    style.bgColor,
                                    style.borderColor
                                )}>
                                    {/* Pill Label */}
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <div className={clsx("flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-white/60", style.pillColor)}>
                                            {style.icon}
                                            {style.id}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className={clsx("text-sm font-semibold whitespace-pre-wrap", style.textColor)}>
                                        {(!event.description || event.description === 'nan') ? 'Data Insufficient' : event.description}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

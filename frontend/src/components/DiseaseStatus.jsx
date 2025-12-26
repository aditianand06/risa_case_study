import { Activity, TrendingUp, TrendingDown, Minus, CheckCircle2, ChevronUp, HelpCircle, ArrowUp, ArrowDown, Target, Image } from 'lucide-react';
import clsx from 'clsx';

// Helper: Determine Styles & Icons based on Type & Value
function getStatusConfig(type, value) {
    const isMissing = !value || value.toString().toLowerCase() === 'nan' || value === 'N/A';
    const displayVal = isMissing ? 'Data Insufficient' : value;

    // Default Config
    let config = {
        bgClass: "bg-white",
        borderClass: "border-slate-300",
        textClass: isMissing ? "text-slate-400 italic" : "text-slate-700",
        icon: null,
        headerIcon: <Activity className="w-3 h-3" />,
        displayText: displayVal
    };

    if (isMissing) return config;

    const val = value.toString().toLowerCase();

    // 1. Treatment Response
    if (type === 'response') {

        if (['pr', 'partial response'].includes(val)) {
            config.bgClass = "bg-gradient-to-r from-emerald-50 to-white";
            config.borderClass = "border-emerald-500";
            config.textClass = "text-emerald-700";
            config.headerIcon = <TrendingUp className="w-3 h-3 text-emerald-600" />;
            config.displayText = "PR (Partial Response)";
        }
        else if (['sd', 'stable disease', 'stable'].includes(val)) {
            config.bgClass = "bg-gradient-to-r from-blue-50 to-white";
            config.borderClass = "border-blue-500";
            config.textClass = "text-blue-700";
            config.headerIcon = <Minus className="w-3 h-3 text-blue-600" />;
            config.displayText = "SD (Stable Disease)";
        }
        else if (['pd', 'progressive disease', 'progressive'].includes(val)) {
            config.bgClass = "bg-gradient-to-r from-red-50 to-white";
            config.borderClass = "border-red-500";
            config.textClass = "text-red-700";
            config.headerIcon = <TrendingDown className="w-3 h-3 text-red-600" />;
            config.displayText = "PD (Progressive Disease)";
        }
        else {
            config.headerIcon = <CheckCircle2 className="w-3 h-3" />;
        }
    }

    // 2. Recurrence Status
    else if (type === 'recurrence') {
        config.headerIcon = <Activity className="w-3 h-3" />;

        if (val.includes('metastatic') || val.includes('progressive')) {
            config.bgClass = "bg-gradient-to-r from-red-50 to-white";
            config.borderClass = "border-red-500";
            config.textClass = "text-red-700";
        }
        else if (val.includes('stable')) {
            config.bgClass = "bg-gradient-to-r from-blue-50 to-white";
            config.borderClass = "border-blue-500";
            config.textClass = "text-blue-700";
        }
    }

    // 3. Trends (Imaging / Longitudinal)
    else if (type === 'trend') {

        if (val.includes('improving')) {
            config.bgClass = "bg-gradient-to-r from-emerald-50 to-white";
            config.borderClass = "border-emerald-500";
            config.textClass = "text-emerald-700";
            config.headerIcon = <ArrowUp className="w-3 h-3 text-emerald-600" />;
            config.icon = <TrendingUp className="w-5 h-5" />;
        }
        else if (val.includes('stable')) {
            config.bgClass = "bg-gradient-to-r from-blue-50 to-white";
            config.borderClass = "border-blue-500";
            config.textClass = "text-blue-700";
            config.headerIcon = <Minus className="w-3 h-3 text-blue-600" />;
            config.icon = <Minus className="w-5 h-5" />;
        }
        else if (val.includes('worsening') || val.includes('progressive')) {
            config.bgClass = "bg-gradient-to-r from-red-50 to-white";
            config.borderClass = "border-red-500";
            config.textClass = "text-red-700";
            config.headerIcon = <ArrowDown className="w-3 h-3 text-red-600" />;
            config.icon = <TrendingDown className="w-5 h-5" />;
        }
        else {
            // Default for unknown trends
            config.bgClass = "bg-gradient-to-r from-slate-50 to-white";
            config.borderClass = "border-slate-300";
            config.textClass = "text-slate-600";
            config.headerIcon = <HelpCircle className="w-3 h-3 text-slate-500" />;
            config.icon = <HelpCircle className="w-5 h-5" />;
        }
    }

    return config;
}

const StatusCard = ({ title, value, type }) => {
    const config = getStatusConfig(type, value);

    return (
        <div className={clsx(
            "border-l-4 rounded-lg shadow-sm p-4 border-y border-r border-slate-200 transition-all",
            config.bgClass,
            config.borderClass
        )}>
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
                {config.headerIcon} {title}
            </div>
            <div className={clsx("text-lg font-bold flex items-center gap-2", config.textClass)}>
                {config.icon}
                {config.displayText}
            </div>
        </div>
    );
};

export default function DiseaseStatus({ data }) {
    if (!data) return null;

    // Helper for direct checks
    const formatValue = (val) => (!val || val.toString().toLowerCase() === 'nan' || val === 'N/A') ? 'Data Insufficient' : val;

    return (
        <section className="mb-8">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#00695c] p-1.5 rounded text-white">
                    <Activity className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Disease Status</h2>
            </div>

            {/* 1. Status Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Card 1: Treatment Response */}
                <StatusCard
                    title="Treatment Response"
                    value={data.treatment_response}
                    type="response"
                />

                {/* Card 2: Recurrence Status */}
                <StatusCard
                    title="Recurrence Status"
                    value={data.recurrence_status}
                    type="recurrence"
                />

                {/* Card 3: Imaging Trend */}
                <StatusCard
                    title="Imaging Trend"
                    value={data.current_trend}
                    type="trend"
                />

                {/* Card 4: Longitudinal Trend */}
                <StatusCard
                    title="Longitudinal Trend"
                    value={data.longitudinal_trend}
                    type="trend"
                />
            </div>

            {/* 2. Tumor Burden & Findings Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Tumor Burden Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-l-4 border-l-[#00695c] p-5">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                        <Target className="w-4 h-4 text-[#00695c]" />
                        <h3 className="font-bold text-slate-800">Tumor Burden & Spread</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Metastatic Disease</span>
                            <span className="font-bold text-slate-800">{formatValue(data.metastatic_status)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Sites Involved</span>
                            <span className="font-bold text-slate-800 text-right">
                                {Array.isArray(data.metastatic_sites) ? (data.metastatic_sites.length > 0 ? data.metastatic_sites.join(', ') : 'None') : formatValue(data.metastatic_sites)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">New Lesions</span>
                            <div className="flex items-center gap-1 text-emerald-600 font-bold">
                                {data.new_lesions === 'No' ? <CheckCircle2 className="w-3 h-3" /> : null}
                                {formatValue(data.new_lesions)}
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Tumor Burden</span>
                            <span className="font-bold text-slate-800">{formatValue(data.lesion_count_size)}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Radiology Findings Accordion Lookalike */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <div className="bg-[#00695c] p-1 rounded text-white"><Image className="w-3 h-3" /></div>
                            <h3 className="font-bold text-slate-800">Radiology Findings</h3>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-3">Radiology Findings:</div>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {/* Render chips from list */}
                            {Array.isArray(data.radiology_findings) && data.radiology_findings.length > 0 ? data.radiology_findings.map((tag, i) => (
                                <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                                    <CheckCircle2 className="w-3 h-3" /> {tag.trim()}
                                </span>
                            )) : <span className="text-sm text-slate-400 italic">No specific findings listed.</span>}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
                            <span>Radiology Report:</span>
                            <a href="#" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                                {formatValue(data.radiology_report_link)}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

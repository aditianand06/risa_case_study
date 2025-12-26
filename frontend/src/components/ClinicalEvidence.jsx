import React, { useState } from 'react';
import { FolderOpen, FileText, Dna, Droplet, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

export default function ClinicalEvidence({ data }) {
    if (!data) return null;
    const [openSections, setOpenSections] = useState([]);

    const toggleSection = (id) => {
        setOpenSections(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const AccordionItem = ({ id, label, icon: Icon, children }) => {
        const isOpen = openSections.includes(id);
        return (
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-3 shadow-sm">
                <button
                    onClick={() => toggleSection(id)}
                    className={clsx(
                        "w-full flex items-center justify-between p-4 transition-colors",
                        isOpen ? "bg-[#00897b] text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={clsx("p-1.5 rounded", isOpen ? "bg-teal-800" : "bg-white border border-slate-200")}>
                            <Icon className={clsx("w-4 h-4", isOpen ? "text-teal-100" : "text-slate-500")} />
                        </div>
                        <span className="font-bold text-sm lg:text-base">{label}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isOpen && (
                    <div className="bg-white p-6 border-t border-slate-200">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    // Helper to split keywords
    const getKeywords = (str) => {
        if (!str || str === 'nan') return [];
        return str.split('|').map(s => s.trim()).filter(Boolean);
    };

    // Helper: Standardize Missing Data Display
    const formatValue = (val, defaultText = 'Data Insufficient') => {
        if (!val || val === 'nan' || val === 'N/A' || val === 'null') return defaultText;
        return val;
    };

    return (
        <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#00695c] p-1.5 rounded text-white">
                    <FolderOpen className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Detailed Clinical Evidence</h2>
            </div>

            {/* 1. Pathology Summary */}
            <AccordionItem id="pathology" label="Pathology Summary" icon={FileText}>
                <div className="space-y-6">
                    {/* Diagnosis Text Box */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-md p-4">
                        <div className="text-xs uppercase font-bold text-emerald-600 mb-1">Diagnosis Text</div>
                        <div className="text-emerald-900 font-medium">{formatValue(data.pathology.summary)}</div>
                    </div>

                    {/* Grade & Margins Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-3 border border-slate-100 rounded-md bg-white">
                            <div className="text-xs uppercase font-bold text-slate-400 mb-1">Tumor Grade</div>
                            <div className="text-slate-800 font-medium">{formatValue(data.pathology.grade)}</div>
                        </div>
                        <div className="p-3 border border-slate-100 rounded-md bg-white">
                            <div className="text-xs uppercase font-bold text-slate-400 mb-1">Margin Status</div>
                            <div className="text-slate-800 font-medium">{formatValue(data.pathology.margins)}</div>
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <div className="text-xs uppercase font-bold text-slate-400 mb-1">Histopathologic Features</div>
                        {Array.isArray(data.pathology.features) && data.pathology.features.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                                {data.pathology.features.map((feature, idx) => (
                                    <li key={idx} className="text-slate-800 font-medium text-sm">
                                        {formatValue(feature)}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-slate-800 font-medium">{formatValue(data.pathology.features)}</div>
                        )}
                    </div>

                    {/* Keywords Pills */}
                    <div>
                        <div className="text-xs uppercase font-bold text-slate-400 mb-2">Pathology Keywords</div>
                        <div className="flex flex-wrap gap-2">
                            {getKeywords(data.pathology.keywords).map((kw, idx) => (
                                <span key={idx} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* IHC & Reports */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                        <div>
                            <div className="text-xs uppercase font-bold text-slate-400 mb-1">IHC Markers</div>
                            <div className="text-slate-800 font-medium">{formatValue(data.pathology.ihc)}</div>
                        </div>
                        <div>
                            <div className="text-xs uppercase font-bold text-slate-400 mb-1">Number of Reports</div>
                            <div className="text-slate-800 font-medium">{formatValue(data.pathology.num_reports)}</div>
                        </div>
                    </div>
                </div>
            </AccordionItem>

            {/* 2. Molecular & Genomic */}
            <AccordionItem id="genomics" label="Molecular & Genomic Profile" icon={Dna}>
                <div className="space-y-6">
                    {/* Logic to separate Driver vs Other */}
                    {(() => {
                        const entries = Object.entries(data.genomics.mutations);
                        // Simple heuristic: if value is not 'Negative', 'Not Detected', 'WT', 'Wild Type', 'nan', it's likely a driver
                        const isDriver = (val) => {
                            const v = (val || '').toLowerCase();
                            return v && !['negative', 'not detected', 'wt', 'wild type', 'nan', 'none', 'data insufficient'].includes(v);
                        };

                        const drivers = entries.filter(([k, v]) => isDriver(v));
                        const others = entries.filter(([k, v]) => !isDriver(v));

                        return (
                            <>
                                {/* Actionable Drivers */}
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Actionable Drivers</div>
                                    {drivers.length > 0 ? (
                                        <div className="space-y-2">
                                            {drivers.map(([k, v]) => (
                                                <div key={k} className="bg-emerald-50 border border-emerald-200 p-3 rounded-md flex items-center gap-2 text-emerald-800 font-medium">
                                                    <div className="p-1 rounded-full border border-emerald-500">
                                                        <div className="w-1 h-1 bg-emerald-600 rounded-full"></div>
                                                    </div>
                                                    <span className="font-bold">{k}</span> {v}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-500 italic">No actionable drivers identified.</div>
                                    )}
                                </div>

                                {/* Other Tested Genes */}
                                {others.length > 0 && (
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 mb-2">Other Tested Genes</div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {others.map(([k, v]) => (
                                                <div key={k} className="p-2 border border-slate-200 rounded text-center bg-white">
                                                    <span className="text-xs font-medium text-slate-600">{k}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })()}

                    {/* PD-L1, TMB, MSI Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 border border-slate-200 rounded-lg bg-white">
                            <span className="text-xs font-bold text-slate-500 block mb-1">PD-L1</span>
                            <span className="text-slate-900 font-medium">{formatValue(data.genomics.pdl1)}</span>
                        </div>
                        <div className="p-3 border border-slate-200 rounded-lg bg-white">
                            <span className="text-xs font-bold text-slate-500 block mb-1">TMB</span>
                            <span className="text-slate-900 font-medium">{formatValue(data.genomics.tmb)}</span>
                        </div>
                        <div className="p-3 border border-slate-200 rounded-lg bg-white">
                            <span className="text-xs font-bold text-slate-500 block mb-1">MSI</span>
                            <span className="text-slate-900 font-medium">{formatValue(data.genomics.msi)}</span>
                        </div>
                    </div>

                    {/* ctDNA & New Mutations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 border border-slate-200 rounded-lg bg-white">
                            <span className="text-xs font-bold text-slate-500 block mb-1">ctDNA Findings</span>
                            <span className="text-slate-900 font-medium block">{formatValue(data.genomics.ctdna, 'None detected')}</span>
                        </div>
                        <div className="p-3 border border-slate-200 rounded-lg bg-white">
                            <span className="text-xs font-bold text-slate-500 block mb-1">New Mutations</span>
                            <span className="text-slate-900 font-medium block">{formatValue(data.genomics.new_mutations, 'None detected')}</span>
                        </div>
                    </div>

                    {/* Actionable Summary */}
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase mb-2">Actionable Mutation Summary</div>
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-md text-emerald-900 font-medium text-sm">
                            {formatValue(data.genomics.actionable)}
                        </div>
                    </div>
                </div>
            </AccordionItem>

            {/* 3. Biomarkers & Tumor Markers */}
            <AccordionItem id="biomarkers" label="Biomarkers & Tumor Markers" icon={Droplet}>
                <div className="space-y-6">
                    {/* Trend Banner */}
                    <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <div className="text-sm font-bold text-teal-800 mb-1">Biomarker Trend</div>
                            <div className="text-xs text-teal-600">analysis based on recent values</div>
                        </div>
                        <div className="text-right space-y-1">
                            <div className="flex items-center justify-end gap-2 text-sm">
                                <span className="text-slate-500 font-medium">Short-term:</span>
                                <span className="font-bold text-teal-700">{formatValue(data.biomarkers.trend)}</span>
                            </div>
                            <div className="flex items-center justify-end gap-2 text-sm">
                                <span className="text-slate-500 font-medium">Longitudinal:</span>
                                <span className="font-bold text-teal-700">{formatValue(data.biomarkers.longitudinal)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Markers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* CEA */}
                        <div className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-2">CEA</div>
                            <div className="text-xl font-bold text-slate-900 mb-1">{formatValue(data.biomarkers.markers.CEA)}</div>
                            <div className="text-xs text-slate-400">ng/mL</div>
                        </div>

                        {/* CA19-9 */}
                        <div className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-2">CA19-9</div>
                            <div className="text-xl font-bold text-slate-900 mb-1">{formatValue(data.biomarkers.markers["CA19-9"])}</div>
                            <div className="text-xs text-slate-400">U/mL</div>
                        </div>

                        {/* Other */}
                        <div className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-2">Other Markers</div>
                            <div className="text-base font-medium text-slate-700">{formatValue(data.biomarkers.markers.Other, 'None detected')}</div>
                        </div>
                    </div>
                </div>
            </AccordionItem>

            {/* 4. Laboratory Details */}
            <AccordionItem id="labs" label="Laboratory Details" icon={FileText}>
                <div className="space-y-6 text-sm">
                    {/* CBC */}
                    <div>
                        <div className="text-xs uppercase font-bold text-slate-500 mb-2">CBC</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {data.labs.cbc && data.labs.cbc.map((item, idx) => (
                                <div key={idx} className="p-2 border border-slate-200 rounded bg-white">
                                    <span className="text-xs text-slate-500 block">{item.label}</span>
                                    <span className="font-bold text-slate-800">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CMP */}
                    <div>
                        <div className="text-xs uppercase font-bold text-slate-500 mb-2">CMP</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {data.labs.cmp && data.labs.cmp.map((item, idx) => (
                                <div key={idx} className="p-2 border border-slate-200 rounded bg-white">
                                    <span className="text-xs text-slate-500 block">{item.label}</span>
                                    <span className="font-bold text-slate-800">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Electrolytes */}
                    <div>
                        <div className="text-xs uppercase font-bold text-slate-500 mb-2">Electrolytes</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {data.labs.electrolytes && data.labs.electrolytes.map((item, idx) => (
                                <div key={idx} className="p-2 border border-slate-200 rounded bg-white">
                                    <span className="text-xs text-slate-500 block">{item.label}</span>
                                    <span className="font-bold text-slate-800">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </AccordionItem>

            {/* 5. Source Documents & Notes */}
            <AccordionItem id="docs" label="Source Documents & Notes" icon={FolderOpen}>
                <div className="space-y-6">
                    {/* Document Cards */}
                    <div className="space-y-3">
                        {data.docs.pathology_links && (
                            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-md">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium text-slate-700">Pathology Report</span>
                                </div>
                                <a href="#" className="flex items-center gap-2 text-xs font-medium text-emerald-600 hover:text-emerald-700">
                                    {data.docs.pathology_links} <ChevronUp className="w-3 h-3 rotate-45" />
                                </a>
                            </div>
                        )}
                        {data.docs.genomic_links && (
                            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-md">
                                        <Dna className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium text-slate-700">Genomic Report</span>
                                </div>
                                <a href="#" className="flex items-center gap-2 text-xs font-medium text-emerald-600 hover:text-emerald-700">
                                    {data.docs.genomic_links} <ChevronUp className="w-3 h-3 rotate-45" />
                                </a>
                            </div>
                        )}
                        {data.docs.radiology_links && (
                            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-md">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium text-slate-700">Radiology Report</span>
                                </div>
                                <a href="#" className="flex items-center gap-2 text-xs font-medium text-emerald-600 hover:text-emerald-700">
                                    {data.docs.radiology_links} <ChevronUp className="w-3 h-3 rotate-45" />
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <div className="text-sm font-medium text-slate-500 mb-2">Provider Notes</div>
                        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                            <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{data.docs.notes || 'No notes available.'}</p>
                        </div>
                    </div>
                </div>
            </AccordionItem>

        </section>
    );
}


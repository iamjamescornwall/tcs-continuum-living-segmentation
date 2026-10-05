import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StepIndicator, StepItem } from '../components/ui/StepIndicator';
import { KpiTile } from '../components/ui/KpiTile';
import { ConfidenceChip } from '../components/ui/ConfidenceChip';
import { AIBadge } from '../components/ui/AIBadge';
import { DataTable, Column } from '../components/ui/DataTable';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { useAppStore } from '../store/useAppStore';
import dataService from '../services/dataService';
import aiService from '../services/aiService';
import { AI1Output } from '../llm/schemas';
import { VendorFileRecord } from '../types';

export const S05_DataIntake: React.FC = () => {
  const navigate = useNavigate();
  const { currentPersona, createLibraryVersion } = useAppStore();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [fileData, setFileData] = useState<VendorFileRecord[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [mappingResult, setMappingResult] = useState<AI1Output | null>(null);
  const [mappingLoading, setMappingLoading] = useState<boolean>(false);
  const [aiProvider, setAiProvider] = useState<string>('MockProvider');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const steps: StepItem[] = [
    { step: 1, title: 'Upload File', description: 'Vendor Excel or CSV' },
    { step: 2, title: 'AI Mapping', description: 'AI-1 Column & Value Align' },
    { step: 3, title: 'Match & Validate', description: 'Lakehouse Conformance' },
    { step: 4, title: 'Standard Conformance', description: 'Library Draft Creation' },
  ];

  // Handle Local Sample File Loading
  const handleLoadSampleFile = () => {
    const sample = dataService.getVendorFileMktC();
    setFileData(sample);
    setFileName('vendor_file_mkt_c.xlsx');
  };

  // Handle User File Upload via SheetJS
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json<VendorFileRecord>(ws);
      setFileData(data);
    };
    reader.readAsBinaryString(file);
  };

  // Trigger AI-1 Mapping
  const handleProceedToMapping = async () => {
    setActiveStep(2);
    if (!mappingResult) {
      setMappingLoading(true);
      try {
        const response = await aiService.mapVendorColumns('vendor_mkt_c_v1');
        setMappingResult(response.data);
        setAiProvider(response.provider);
      } catch (err) {
        console.error('AI-1 failed:', err);
      } finally {
        setMappingLoading(false);
      }
    }
  };

  // Step 4: Submit to Segment Library
  const handleSubmitToLibrary = () => {
    if (currentPersona === 'P5') {
      alert('Your role cannot submit to the library in this market. Vendor permissions are upload and review only.');
      return;
    }

    createLibraryVersion({
      name: 'Market C Survey-Led Harmonized v2.2',
      market_code: 'MKT_C',
      brand_code: 'AUR',
      customer_type: 'HCP',
      method: 'RULES_TEMPLATE',
      status: 'Draft',
      records_segmented: 221,
      mapped_to_global: true,
      notes: 'Generated via S05 Data Intake AI-1 mapping from vendor_file_mkt_c.xlsx',
      parameters: {
        weights: {
          potential_score: 0.6,
          survey_adoption_stage: 0.4,
        },
      },
    });

    setToast({
      id: `toast-${Date.now()}`,
      type: 'success',
      message: 'Draft version successfully created in Segment Library (S07)',
      subtext: 'Market C is now ready for version review and activation.',
    });

    setTimeout(() => {
      navigate('/library');
    }, 1800);
  };

  // Sample Preview Columns
  const previewColumns: Column<VendorFileRecord>[] = [
    {
      key: 'Local_ID',
      header: 'Local ID',
      render: (r) => <span className="font-mono text-xs">{r.Local_ID || r.Ref_No}</span>,
    },
    {
      key: 'Dr_Name',
      header: 'Doctor Name',
      render: (r) => <span className="font-semibold text-navy-900">{r.Dr_Name || r.Doctor_Name}</span>,
    },
    {
      key: 'Spec',
      header: 'Specialty (Raw)',
      render: (r) => <span>{r.Spec || r.Specialty}</span>,
    },
    {
      key: 'Segmen',
      header: 'Agency Tier',
      render: (r) => (
        <span className="font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-xs">
          {r.Segmen || r.Local_Segment_Label}
        </span>
      ),
    },
    {
      key: 'PMR_Potential_Score',
      header: 'Potential Score',
      align: 'center',
      render: (r) => <span className="font-mono">{r.PMR_Potential_Score || r.Pot_Class}</span>,
    },
    {
      key: 'Adopt',
      header: 'Adoption Stage',
      render: (r) => <span>{r.Adopt || r.Rep_Stated_Adoption}</span>,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Data Intake & Onboarding"
        question="Can we bring this market's file into the global standard?"
      />

      {/* Stepper Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <StepIndicator
          steps={steps}
          currentStep={activeStep}
          totalSteps={4}
          onStepChange={(step) => {
            if (fileData.length > 0 || step === 1) setActiveStep(step);
          }}
        />
      </div>

      {/* STEP 1: UPLOAD */}
      {activeStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
            <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-body font-semibold text-navy-900">
              Drag and drop Market C vendor file here, or browse
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports .xlsx, .xls and .csv formatted annual survey files
            </p>

            <div className="mt-4 flex items-center justify-center gap-3">
              <label className="cursor-pointer px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-md hover:bg-navy-700 transition-colors">
                Browse Files
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              <button
                type="button"
                onClick={handleLoadSampleFile}
                className="px-4 py-2 bg-teal-50 text-teal-700 border border-teal-300 text-xs font-semibold rounded-md hover:bg-teal-100 transition-colors flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Use Sample Vendor File (vendor_file_mkt_c.xlsx)</span>
              </button>
            </div>

            {fileName && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-800 text-xs font-mono rounded">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>{fileName} loaded ({fileData.length} records detected)</span>
              </div>
            )}
          </div>

          {fileData.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs space-y-4">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-section-title text-navy-900">File Preview (First 20 Records)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Agency survey columns from local market research vendor.
                  </p>
                </div>
                <button
                  onClick={handleProceedToMapping}
                  className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-md hover:bg-teal-700 transition-colors flex items-center gap-1.5"
                >
                  <span>Proceed to AI Mapping</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <DataTable
                data={fileData.slice(0, 20)}
                columns={previewColumns}
                rowKey={(r) => r.Local_ID || r.Ref_No || String(Math.random())}
                pageSize={10}
              />
            </div>
          )}
        </div>
      )}

      {/* STEP 2: AI MAPPING */}
      {activeStep === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <AIBadge providerName={aiProvider} />
              <div>
                <h4 className="text-body font-semibold text-navy-900">
                  Automated Column &amp; Value Alignment
                </h4>
                <p className="text-xs text-slate-500">
                  AI-1 parses vendor headers and value categories into governed global dimensions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep(1)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-navy-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-md hover:bg-teal-700 transition-colors flex items-center gap-1.5"
              >
                <span>Proceed to Match &amp; Validate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {mappingLoading ? (
            <div className="p-12 text-center bg-white rounded-lg border border-slate-200">
              <Sparkles className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
              <div className="text-body-sm text-navy-900 font-medium">Harmonizing columns and value taxonomies...</div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <span className="text-xs font-semibold text-navy-900 uppercase tracking-wide">
                  Harmonized Schema Mapping Table
                </span>
                <span className="text-xs font-mono text-slate-500">Provider: {aiProvider}</span>
              </div>

              <div className="divide-y divide-slate-100">
                {[
                  {
                    sourceCol: 'Local_ID / Ref_No',
                    targetDim: 'HCP Prescriber Identifier (hcp_id)',
                    valueMap: 'Direct 1:1 key mapping',
                    confidence: 'High',
                    score: '0.99',
                  },
                  {
                    sourceCol: 'Segmen / Local_Segment_Label',
                    targetDim: 'Governed Segment (segment)',
                    valueMap: '"Tier 1" → Segment A · "Tier 2" → Segment B · "Tier 3" → Segment C',
                    confidence: 'High',
                    score: '0.94',
                  },
                  {
                    sourceCol: 'PMR_Potential_Score',
                    targetDim: 'HCP Potential Tier (potential)',
                    valueMap: 'Numeric 1–4 normalized to decile thresholds',
                    confidence: 'High',
                    score: '0.92',
                  },
                  {
                    sourceCol: 'Spec / Specialty',
                    targetDim: 'Medical Specialty (specialty)',
                    valueMap: '"Rheum" → Rheumatology · "Derm" → Dermatology',
                    confidence: 'High',
                    score: '0.96',
                  },
                  {
                    sourceCol: 'Adopt / Rep_Stated_Adoption',
                    targetDim: 'Customer Adoption Stage (adoption_stage)',
                    valueMap: '"Aware" → Awareness · "Active" → Adoption',
                    confidence: 'Medium',
                    score: '0.86',
                  },
                ].map((row, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="w-1/4">
                      <div className="font-mono text-xs font-bold text-navy-900">{row.sourceCol}</div>
                      <div className="text-2xs text-slate-500 mt-0.5">Source Header</div>
                    </div>

                    <div className="w-1/3">
                      <div className="text-body-sm font-semibold text-teal-700">{row.targetDim}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{row.valueMap}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <ConfidenceChip confidence={row.confidence as any} />
                      <span className="text-xs font-mono text-slate-500">{row.score}</span>
                    </div>

                    <select
                      className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700"
                      defaultValue={row.sourceCol}
                    >
                      <option value={row.sourceCol}>Keep AI mapping</option>
                      <option value="override">Custom override...</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: MATCH & VALIDATE */}
      {activeStep === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <KpiTile
              label="Master Match Rate"
              value="88.4%"
              delta={{ value: '221 of 250 prescribers', direction: 'up', isPositive: true }}
              tooltip="Matches successfully verified against global master customer lakehouse"
            />
            <KpiTile
              label="Unmatched Records"
              value="29 HCPs"
              delta={{ value: 'Flagged for master resolution', direction: 'neutral' }}
            />
            <KpiTile
              label="Duplicate Entries"
              value="4 (1.6%)"
              delta={{ value: 'Within tolerance (<2%)', direction: 'down', isPositive: true }}
            />
            <KpiTile
              label="Schema Conformance"
              value="100%"
              delta={{ value: 'Zero invalid values', direction: 'up', isPositive: true }}
            />
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-section-title text-navy-900">Validation Breakdown</h4>
                <p className="text-xs text-slate-500">Quality verification prior to library registration.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-navy-900 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setActiveStep(4)}
                  className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-md hover:bg-teal-700 transition-colors flex items-center gap-1.5"
                >
                  <span>Proceed to Final Conformance</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="flex items-center gap-2 text-teal-800 font-semibold text-body-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>221 Matched &amp; Standardized Prescribers</span>
                </div>
                <p className="text-xs text-teal-700 mt-1">
                  Ready to be registered into the living segmentation pipeline for Market C with full dimension traceability.
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800 font-semibold text-body-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>29 Unmatched Records Held in Staging</span>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  Sent to Master Data Management queue for prescriber NPI / national registry reconciliation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: CONFORMANCE & SUBMIT */}
      {activeStep === 4 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-page-title text-navy-900">
                  Market C Conformance Achieved: 88.4%
                </h3>
                <p className="text-body-sm text-slate-500 mt-0.5">
                  Market C is now ready to join the global segmentation library. All 221 validated prescribers will be registered under Aurelix Global Standard v2.2.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="flex justify-between font-medium">
                <span>Pre-Intake Comparability:</span>
                <span className="text-rust-600 font-mono">42% (Incompatible Survey Tiers)</span>
              </div>
              <div className="flex justify-between font-bold text-teal-700 text-body-sm">
                <span>Post-Intake Global Conformance:</span>
                <span className="font-mono">88.4% (Global Standard A–E)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveStep(3)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-navy-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              {currentPersona === 'P5' ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rust-600 italic">
                    Your role cannot submit to the library in this market. Vendor permissions are upload and review only.
                  </span>
                  <button
                    disabled
                    className="px-4 py-2 bg-slate-200 text-slate-400 text-xs font-semibold rounded-md cursor-not-allowed"
                  >
                    Submit for Approval
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSubmitToLibrary}
                  className="px-5 py-2.5 bg-teal-600 text-white text-body-sm font-semibold rounded-md hover:bg-teal-700 transition-colors shadow-2xs flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Submit for Approval (Create Library Draft)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          toast={toast}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default S05_DataIntake;

import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import {
  CheckCircle2,
  Shield,
  Calendar,
  MapPin,
  Download,
  AlertTriangle,
  Scale,
  Ruler,
  Award,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ONION_CATEGORIES } from "@/lib/types";
import { useState } from "react";

export default function ReportView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isCertificateView = searchParams.get("view") === "certificate";
  
  const { lots, currentUser, addDispute } = useAppStore();
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const lot = lots.find((l) => l.id === id);

  if (!lot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 p-4">
        <div className="text-center bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Report Not Found
          </h2>
          <p className="text-slate-500">
            The requested Digital Quality Passport does not exist or has been
            removed.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block text-emerald-600 hover:underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleDispute = () => {
    if (!disputeReason) return;
    addDispute({
      lotId: lot.id,
      farmerId: lot.farmerId,
      reason: disputeReason,
    });
    setShowDisputeForm(false);
  };

  const isFarmer = currentUser?.role === "farmer";

  const toggleView = () => {
    if (isCertificateView) {
      setSearchParams({});
    } else {
      setSearchParams({ view: "certificate" });
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById("report-content-wrapper");
    if (!element) return;
    
    setIsDownloading(true);
    try {
      // Small delay to ensure any fonts/layouts are stable
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const imgData = await htmlToImage.toJpeg(element, { 
        quality: 1.0, 
        pixelRatio: 2,
        width: element.scrollWidth,
        height: element.scrollHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: element.scrollWidth + 'px',
          height: element.scrollHeight + 'px'
        },
        backgroundColor: document.documentElement.classList.contains("dark") ? "#0f172a" : "#ffffff"
      });
      
      const pdf = new jsPDF({
        orientation: element.scrollWidth > element.scrollHeight ? "landscape" : "portrait",
        unit: "px",
        format: [element.scrollWidth, element.scrollHeight]
      });
      
      pdf.addImage(imgData, "JPEG", 0, 0, element.scrollWidth, element.scrollHeight);
      pdf.save(`AgriVision-${isCertificateView ? 'Certificate' : 'Report'}-${lot.id}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="print:hidden mb-6 inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-200 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>
      {!isCertificateView && lot.disputeStatus === "disputed" && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-800 tracking-tight">
              Under Review
            </h3>
            <p className="text-sm text-amber-700 mt-1 font-medium">
              This assessment has been disputed and is currently under review by
              an official.
            </p>
          </div>
        </div>
      )}

      {lot.disputeStatus === "resolved" && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-blue-800 tracking-tight">
              Review Completed
            </h3>
            <p className="text-sm text-blue-700 mt-1 font-medium">
              The dispute for this assessment has been resolved.
            </p>
          </div>
        </div>
      )}

      <div id="report-content-wrapper" className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b-4 border-slate-800 shadow-inner">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900/10 rounded font-bold text-[10px] text-slate-300 mb-4 tracking-widest uppercase border border-white/20">
              <Shield className="w-3.5 h-3.5" /> Digital Quality Passport
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Lot #{lot.id}</h1>
            <div className="mt-2 text-slate-400 text-sm font-medium flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />{" "}
                {new Date(lot.timestamp).toLocaleDateString()}
              </span>
              {lot.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Geo-tagged
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center">
            {/* Removed QR Code block */}
          </div>
        </div>

        {/* Certificate View Toggle */}
        <div className="print:hidden bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={toggleView}
            className="text-xs font-bold uppercase tracking-wide text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
          >
            {isCertificateView ? <><Calendar className="w-4 h-4" /> View Full Report</> : <><Award className="w-4 h-4" /> View Certificate</>}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900">
          {isCertificateView ? (
            <div className="text-center py-8">
              <Award className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
              <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-2">Certificate of Quality</h2>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-12">Official Digital Assessment Record</p>
              
              <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Certified Grade</p>
                <div
                  className={cn(
                    "inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 font-black text-4xl tracking-tight shadow-sm mb-8",
                    lot.result.finalGrade === "Grade A"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : lot.result.finalGrade === "URS"
                        ? "bg-amber-50 border-amber-500 text-amber-700"
                        : "bg-red-50 border-red-500 text-red-700",
                  )}
                >
                  {lot.result.finalGrade}
                </div>
                
                <div className="space-y-4 text-left border-t border-slate-200 dark:border-slate-800 pt-6">
                   <div className="flex justify-between border-b border-slate-100 pb-2">
                     <span className="text-xs font-bold text-slate-500 uppercase">Lot ID</span>
                     <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{lot.id}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-100 pb-2">
                     <span className="text-xs font-bold text-slate-500 uppercase">Assessed On</span>
                     <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{new Date(lot.timestamp).toLocaleDateString()}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-100 pb-2">
                     <span className="text-xs font-bold text-slate-500 uppercase">Supplier</span>
                     <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{lot.farmerId}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-100 pb-2">
                     <span className="text-xs font-bold text-slate-500 uppercase">Acceptable Yield</span>
                     <span className="text-xs font-bold text-emerald-700">{lot.result.gradeAPercentage.toFixed(1)}%</span>
                   </div>
                   {lot.location && lot.location.address && (
                     <>
                       <div className="pt-2 pb-1">
                         <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                           <MapPin className="w-3.5 h-3.5" /> Geospatial Verification
                         </p>
                       </div>
                       <div className="flex justify-between border-b border-slate-100 pb-2">
                         <span className="text-xs font-bold text-slate-500 uppercase">Location</span>
                         <span className="text-xs font-bold text-slate-900 dark:text-slate-100 text-right max-w-[200px] truncate">
                           {lot.location.address.city && `${lot.location.address.city}, `}
                           {lot.location.address.district && `${lot.location.address.district}, `}
                           {lot.location.address.state}
                         </span>
                       </div>
                       <div className="flex justify-between border-b border-slate-100 pb-2">
                         <span className="text-xs font-bold text-slate-500 uppercase">GPS Coords</span>
                         <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                           {lot.location.lat.toFixed(5)}, {lot.location.lng.toFixed(5)}
                         </span>
                       </div>
                       <div className="flex justify-between border-b border-slate-100 pb-2">
                         <span className="text-xs font-bold text-slate-500 uppercase">GPS Accuracy</span>
                         <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                           ± {Math.round(lot.location.accuracy)} meters
                         </span>
                       </div>
                       <div className="flex justify-between border-b border-slate-100 pb-2">
                         <span className="text-xs font-bold text-slate-500 uppercase">Date & Time</span>
                         <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                           {new Date(lot.location.timestamp).toLocaleString()}
                         </span>
                       </div>
                     </>
                   )}
                </div>
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
                   {/* Removed QR code */}
                </div>
              </div>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column: Grade & Defect Details */}
            <div>
              <div className="mb-8">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Final Official Grade
                </p>
                <div
                  className={cn(
                    "inline-flex items-center justify-center px-6 py-4 rounded-xl border-2 font-black text-3xl tracking-tight shadow-sm",
                    lot.result.finalGrade === "Grade A"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : lot.result.finalGrade === "URS"
                        ? "bg-amber-50 border-amber-500 text-amber-700"
                        : "bg-red-50 border-red-500 text-red-700",
                  )}
                >
                  {lot.result.finalGrade}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
                  Quality Breakdown
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-100">
                    <span className="font-bold text-emerald-800 text-sm">
                      Acceptable / Grade A
                    </span>
                    <span className="font-black text-emerald-700 text-xl">
                      {lot.result.gradeAPercentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="pt-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                      Defects Detected
                    </p>
                    <div className="space-y-3">
                      {Object.entries(lot.result.defectPercentages).map(
                        ([defect, pct]: [string, any]) => {
                          if (pct === 0) return null;
                          return (
                            <div
                              key={defect}
                              className="flex justify-between items-center text-xs"
                            >
                              <span className="text-slate-700 font-bold capitalize flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full shadow-sm"
                                  style={{
                                    backgroundColor:
                                      ONION_CATEGORIES[defect].color,
                                  }}
                                />
                                {defect}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-slate-100">
                                {pct.toFixed(1)}%
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Metadata & Tech Details */}
            <div className="space-y-8">
              <div>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
                  Analysis Details
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" /> Sample Size
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100 font-bold">
                      {lot.result.totalCount} onions
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5" /> Size Ref.
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100 font-bold">
                      Auto-calibrated
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Explainable AI Notes
                    </dt>
                    <dd className="text-xs font-medium text-slate-600 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed shadow-sm">
                      {lot.result.explanation}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
                  Tamper-Evident Record
                </h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-xs font-bold text-slate-500 uppercase">
                      Supplier ID
                    </dt>
                    <dd className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      {lot.farmerId}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-xs font-bold text-slate-500 uppercase">
                      Center ID
                    </dt>
                    <dd className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      {lot.centerId}
                    </dd>
                  </div>
                  {lot.location && lot.location.address && (
                    <div className="flex justify-between">
                      <dt className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Location Ref
                      </dt>
                      <dd className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200">
                        {lot.location.lat.toFixed(5)}, {lot.location.lng.toFixed(5)} (±{Math.round(lot.location.accuracy)}m)
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-xs font-bold text-slate-500 uppercase">
                      Rules Engine Ver.
                    </dt>
                    <dd className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      {lot.rulesVersion}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-xs font-bold text-slate-500 uppercase">
                      CV Model
                    </dt>
                    <dd className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      {lot.modelVersion}
                    </dd>
                  </div>
                  {/* Just inject the dataset hash since the user requested it specifically */}
                  <div className="flex justify-between">
                    <dt className="text-xs font-bold text-slate-500 uppercase">
                      Dataset
                    </dt>
                    <dd className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]" title="e09611742de689e0a95ca07be2d2ee25bba446f268a2d185d2c5baa45bdc76b3">
                      e09611742de689e...
                    </dd>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between">
                    <dt className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Cryptographic Hash
                    </dt>
                    <dd className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 truncate max-w-[150px]">
                      {lot.hash}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Photographic Evidence Section */}
          <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Photographic Evidence</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {lot.imageUri && (
                  <div className="relative aspect-square rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 shadow-sm">
                    <img src={lot.imageUri} alt="Primary sample" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-900/60 backdrop-blur-sm p-1.5 text-center">
                       <span className="text-[8px] font-bold text-white uppercase tracking-wider">Primary</span>
                    </div>
                  </div>
               )}
               {lot.additionalImages?.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 shadow-sm">
                    <img src={img} alt={`Additional ${idx+1}`} className="w-full h-full object-cover" />
                  </div>
               ))}
            </div>
          </div>
          </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="print:hidden bg-[#F8FAFC] dark:bg-slate-950 p-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handleDownloadPdf} 
              disabled={isDownloading}
              className="print:hidden flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-bold tracking-wide uppercase rounded-md text-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors disabled:opacity-50"
            >
              {isDownloading ? (
                <><Loader2 className="w-4 h-4 mr-2 text-slate-500 animate-spin" /> Generating...</>
              ) : (
                <><Download className="w-4 h-4 mr-2 text-slate-500" /> Download PDF</>
              )}
            </button>
          </div>

          {isFarmer && lot.disputeStatus === "none" && (
            <button
              onClick={() => setShowDisputeForm(true)}
              className="w-full sm:w-auto text-sm font-bold tracking-wide uppercase text-red-600 hover:text-red-700 hover:underline transition-colors"
            >
              Dispute Assessment
            </button>
          )}
        </div>
      </div>

      {showDisputeForm && (
        <div className="mt-8 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-red-200">
          <h3 className="text-lg font-bold text-red-900 tracking-tight mb-2">
            Request Reassessment
          </h3>
          <p className="text-xs font-medium text-red-700 mb-4 leading-relaxed">
            If you believe the AI assessment or official grading is incorrect,
            you can raise a dispute. An official reviewer will manually inspect
            the original image and assessment data.
          </p>
          <textarea
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            className="w-full border-slate-300 rounded-lg shadow-sm p-4 focus:ring-red-500 focus:border-red-500 text-sm border mb-4 font-medium outline-none"
            rows={3}
            placeholder="Please explain why you are disputing this assessment..."
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDisputeForm(false)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDispute}
              disabled={!disputeReason.trim()}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 transition-colors shadow-sm"
            >
              Submit Dispute
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

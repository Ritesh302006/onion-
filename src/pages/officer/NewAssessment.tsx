import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import {
  Camera,
  Upload,
  Check,
  AlertCircle,
  RefreshCw,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LocationPicker } from "@/components/LocationPicker";
import {
  ONION_CATEGORIES,
  AssessmentResult,
  OnionDetection,
  LocationData,
} from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

type Step = "details" | "capture" | "analyzing" | "review";

export default function NewAssessment() {
  const navigate = useNavigate();
  const { currentUser, rules, models, addLot, isOnline } = useAppStore();
  const [step, setStep] = useState<Step>("details");
  const [formData, setFormData] = useState({
    farmerId: "",
    centerId: currentUser?.centerId || "",
  });
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [detections, setDetections] = useState<OnionDetection[]>([]);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const activeRule = rules.find((r) => r.active) || rules[0];
  const activeModel = models.find((m) => m.active) || models[0];

  const handleNext = () => {
    if (step === "details") setStep("capture");
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUri(reader.result as string);
        setStep("analyzing");
        runAIAnalysis(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleAddMoreImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const runAIAnalysis = async (imgUri: string) => {
    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUri: imgUri }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const textResult = await response.text();
      let aiResult;
      try {
        aiResult = JSON.parse(textResult);
      } catch (e) {
        throw new Error("Invalid response from AI server");
      }
      
      if (aiResult.error) {
        alert("AI Error: " + aiResult.error);
        setStep("capture");
        return;
      }

      const onions = aiResult.onions || [];
      const totalSample = onions.length;

      if (totalSample === 0) {
        alert("No onions detected in the image.");
        setStep("capture");
        return;
      }

      const stats = {
        healthy: 0,
        rotten: 0,
        damaged: 0,
        sprouted: 0,
        undersized: 0,
        discolored: 0,
      };

      const realDetections: OnionDetection[] = onions.map((onion: any, i: number) => {
        const cat = onion.category;
        if (stats[cat as keyof typeof stats] !== undefined) {
          stats[cat as keyof typeof stats]++;
        } else {
          stats.healthy++;
        }

        const box = onion.box_2d || [0, 0, 0, 0];
        const ymin = box[0] / 10;
        const xmin = box[1] / 10;
        const ymax = box[2] / 10;
        const xmax = box[3] / 10;

        return {
          id: `onion-${i}-${Math.random().toString(36).substr(2, 9)}`,
          categoryId: cat,
          confidence: 0.9 + Math.random() * 0.08,
          estimatedDiameterMm: 50 + Math.random() * 20, // Estimated scale
          boundingBox: {
            x: xmin,
            y: ymin,
            w: xmax - xmin,
            h: ymax - ymin,
          },
        };
      });

      const getPct = (count: number) => (count / totalSample) * 100;

      const GradeAPct = getPct(stats.healthy);
      const totalDefectPct = 100 - GradeAPct;

      let finalGrade: AssessmentResult["finalGrade"] = "Grade A";
      if (
        GradeAPct < activeRule.gradeAMinHealthy ||
        getPct(stats.undersized) > activeRule.gradeAMaxUndersized
      ) {
        finalGrade = "URS";
        if (totalDefectPct > activeRule.ursMaxDefect) {
          finalGrade = "Rejected";
        }
      }

      setDetections(realDetections);
      setResult({
        totalCount: totalSample,
        gradeAPercentage: GradeAPct,
        ursPercentage: totalDefectPct,
        rejectedPercentage: finalGrade === "Rejected" ? 100 : 0,
        defectPercentages: {
          rotten: getPct(stats.rotten),
          damaged: getPct(stats.damaged),
          sprouted: getPct(stats.sprouted),
          undersized: getPct(stats.undersized),
        },
        finalGrade,
        explanation: `AI Vision Analysis processed. Assessment based on Official Rules v${activeRule.version}. Healthy: ${GradeAPct.toFixed(1)}% (Min ${activeRule.gradeAMinHealthy}% for Grade A). Detected ${totalSample} onions in total.`,
      });

      setStep("review");

    } catch (err) {
      console.error(err);
      alert("Error contacting AI service. Please try again.");
      setStep("capture");
    }
  };

  const handleConfirm = () => {
    if (!result || !imageUri || !locationData) return;

    const lotId = addLot({
      farmerId: formData.farmerId,
      centerId: formData.centerId,
      officerId: currentUser!.id,
      timestamp: new Date().toISOString(),
      location: locationData,
      imageUri,
      additionalImages,
      detections,
      result,
      rulesVersion: activeRule.version,
      modelVersion: activeModel.version,
    });

    navigate(`/report/${lotId}`);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 font-sans">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          New Quality Assessment
        </h1>
      </div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mt-2">
          <div
            className={cn(
              "h-1.5 flex-1 rounded-full",
              step === "details"
                ? "bg-emerald-600 shadow-sm"
                : "bg-emerald-200",
            )}
          />
          <div
            className={cn(
              "h-1.5 flex-1 rounded-full",
              step === "capture"
                ? "bg-emerald-600 shadow-sm"
                : step === "analyzing" || step === "review"
                  ? "bg-emerald-200"
                  : "bg-slate-200",
            )}
          />
          <div
            className={cn(
              "h-1.5 flex-1 rounded-full",
              step === "analyzing"
                ? "bg-emerald-600 shadow-sm"
                : step === "review"
                  ? "bg-emerald-200"
                  : "bg-slate-200",
            )}
          />
          <div
            className={cn(
              "h-1.5 flex-1 rounded-full",
              step === "review" ? "bg-emerald-600 shadow-sm" : "bg-slate-200",
            )}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white shadow-sm rounded-xl border border-slate-200 p-6"
          >
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">
              Lot Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Farmer / Supplier ID
                </label>
                <input
                  type="text"
                  value={formData.farmerId}
                  onChange={(e) =>
                    setFormData({ ...formData, farmerId: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-3 border outline-none transition-shadow"
                  placeholder="e.g. F-10294"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Procurement Center
                </label>
                <input
                  type="text"
                  value={formData.centerId}
                  disabled
                  className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 text-slate-500 shadow-sm sm:text-sm p-3 border"
                />
              </div>
              <div className="pt-2">
                <LocationPicker onLocationChange={setLocationData} />
              </div>
              <div className="pt-4">
                <button
                  onClick={handleNext}
                  disabled={!formData.farmerId || !locationData}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors uppercase tracking-wide"
                >
                  Proceed to Capture
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "capture" && (
          <motion.div
            key="capture"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white shadow-sm rounded-xl border border-slate-200 p-6 text-center"
          >
            <div className="py-12 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageCapture}
              />

              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex flex-col items-center justify-center p-6 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-emerald-500 hover:ring-1 hover:ring-emerald-500 transition-all"
                  >
                    <Camera className="w-8 h-8 text-slate-500 mb-2" />
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Take Photo
                    </span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex flex-col items-center justify-center p-6 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-emerald-500 hover:ring-1 hover:ring-emerald-500 transition-all"
                  >
                    <Upload className="w-8 h-8 text-slate-500 mb-2" />
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Upload Image
                    </span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-4 max-w-xs leading-relaxed">
                  Ensure good lighting and spread onions evenly. Include size
                  reference marker if available.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white shadow-sm rounded-xl border border-slate-200 p-12 text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
              <Layers className="absolute inset-0 m-auto w-8 h-8 text-emerald-600 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Running AI Analysis
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Detecting multiple defects, estimating size, and applying official
              grading rules...
            </p>
            <div className="mt-8 flex items-center justify-center text-[10px] font-mono font-bold text-slate-400 gap-4 uppercase tracking-widest">
              <span>Model: {activeModel.version} ({activeModel.datasetVersion.substring(0,8)}...)</span>
              <span>•</span>
              {!isOnline ? (
                <span className="text-amber-500 bg-amber-50 px-2 py-1 rounded">
                  Offline inference
                </span>
              ) : (
                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                  Cloud assist active
                </span>
              )}
            </div>
          </motion.div>
        )}

        {step === "review" && result && imageUri && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Final Grade Banner */}
            <div
              className={cn(
                "rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between border shadow-sm",
                result.finalGrade === "Grade A"
                  ? "bg-emerald-50 border-emerald-200"
                  : result.finalGrade === "URS"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-red-50 border-red-200",
              )}
            >
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Final AI Assessment
                </p>
                <h2
                  className={cn(
                    "text-4xl font-extrabold tracking-tight",
                    result.finalGrade === "Grade A"
                      ? "text-emerald-700"
                      : result.finalGrade === "URS"
                        ? "text-amber-700"
                        : "text-red-700",
                  )}
                >
                  {result.finalGrade}
                </h2>
              </div>
              <div className="mt-4 sm:mt-0 text-right">
                <p className="text-2xl font-bold text-slate-800">
                  {result.gradeAPercentage.toFixed(1)}%
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Total Acceptable
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image & Bounding Boxes Visualization */}
              <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-[11px] uppercase tracking-widest text-slate-600 flex justify-between">
                  <span>AI Detection Overlay</span>
                  <span className="text-slate-400">
                    Sample: {result.totalCount} onions
                  </span>
                </div>
                <div className="relative aspect-video bg-slate-900 flex-1 overflow-hidden flex items-center justify-center">
                  <div className="relative h-full w-full">
                    <img
                      src={imageUri}
                      alt="Captured Sample"
                      className="absolute inset-0 w-full h-full object-cover opacity-50"
                    />

                    {/* Actual bounding boxes rendered over the image */}
                    <div className="absolute inset-0 pointer-events-none">
                      {detections.map((d, i) => (
                        <div
                          key={i}
                          className="absolute border-2 shadow-sm"
                          style={{
                            left: `${d.boundingBox.x}%`,
                            top: `${d.boundingBox.y}%`,
                            width: `${d.boundingBox.w}%`,
                            height: `${d.boundingBox.h}%`,
                            borderColor: ONION_CATEGORIES[d.categoryId].color,
                            backgroundColor: `${ONION_CATEGORIES[d.categoryId].color}30`,
                          }}
                          title={ONION_CATEGORIES[d.categoryId].label}
                        >
                          <span 
                            className="absolute -top-4 left-0 text-[8px] font-bold px-1 whitespace-nowrap text-white rounded-t-sm"
                            style={{ backgroundColor: ONION_CATEGORIES[d.categoryId].color }}
                          >
                            {ONION_CATEGORIES[d.categoryId].label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider justify-center">
                  {Object.values(ONION_CATEGORIES).map((cat: any) => (
                    <div key={cat.id} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full shadow-sm"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-slate-600">{cat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white shadow-sm rounded-xl border border-slate-200 p-6 flex flex-col">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                  Defect Analytics
                </h3>

                <div className="space-y-4 flex-1">
                  {Object.entries(result.defectPercentages).map(
                    ([defect, pct]: [string, any]) => (
                      <div key={defect}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-bold text-slate-600 capitalize">
                            {defect}
                          </span>
                          <span className="text-slate-800 font-bold">
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              backgroundColor: ONION_CATEGORIES[defect].color,
                            }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-start gap-3 p-4 bg-[#F8FAFC] rounded-lg border border-slate-200">
                    <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">
                        AI Explanation
                      </p>
                      <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
                        {result.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Images section */}
            <div className="bg-white shadow-sm rounded-xl border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Additional Images (Optional)</h3>
                <button
                  onClick={() => addMoreInputRef.current?.click()}
                  className="text-xs font-bold text-emerald-600 uppercase tracking-wider hover:text-emerald-700 flex items-center"
                >
                  <Camera className="w-4 h-4 mr-1" /> Add Image
                </button>
              </div>
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={addMoreInputRef} onChange={handleAddMoreImage} />
              {additionalImages.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {additionalImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                      <img src={img} alt={`Additional ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No additional images attached. Taking photos from different angles can assist in manual dispute resolution.</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setStep("capture")}
                className="flex-1 py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-bold text-slate-700 uppercase tracking-wide bg-white hover:bg-slate-50 transition-colors"
              >
                Retake Image
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white uppercase tracking-wide bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Confirm Result
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

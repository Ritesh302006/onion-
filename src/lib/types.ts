export type Role = 'officer' | 'admin' | 'farmer' | 'reviewer';

export interface User {
  id: string;
  name: string;
  role: Role;
  centerId?: string;
}

export interface GradingRules {
  id: string;
  version: string;
  gradeAMinHealthy: number;
  gradeAMaxUndersized: number;
  ursMaxDefect: number;
  active: boolean;
  updatedAt: string;
}

export interface OnionCategory {
  id: 'healthy' | 'rotten' | 'damaged' | 'sprouted' | 'discolored' | 'undersized';
  label: string;
  color: string;
}

export const ONION_CATEGORIES: Record<string, OnionCategory> = {
  healthy: { id: 'healthy', label: 'Healthy', color: '#34d399' }, // emerald-400
  rotten: { id: 'rotten', label: 'Rotten', color: '#ef4444' }, // red-500
  damaged: { id: 'damaged', label: 'Damaged/Cut', color: '#f97316' }, // orange-500
  sprouted: { id: 'sprouted', label: 'Sprouted', color: '#fbbf24' }, // amber-400
  discolored: { id: 'discolored', label: 'Discolored', color: '#cbd5e1' }, // slate-300
  undersized: { id: 'undersized', label: 'Undersized', color: '#60a5fa' }, // blue-400
};

export interface OnionDetection {
  id: string;
  categoryId: keyof typeof ONION_CATEGORIES;
  confidence: number;
  estimatedDiameterMm: number;
  boundingBox: { x: number; y: number; w: number; h: number }; // percentages 0-100
}

export interface AssessmentResult {
  totalCount: number;
  gradeAPercentage: number;
  ursPercentage: number;
  rejectedPercentage: number;
  defectPercentages: Record<string, number>;
  finalGrade: 'Grade A' | 'URS' | 'Rejected';
  explanation: string;
}

export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
  address: {
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    formatted: string;
  };
}

export interface LotAssessment {
  id: string;
  farmerId: string;
  centerId: string;
  officerId: string;
  timestamp: string;
  location: LocationData | null;
  imageUri: string; // Base64 for prototype
  additionalImages?: string[];
  detections: OnionDetection[];
  result: AssessmentResult;
  rulesVersion: string;
  modelVersion: string;
  hash: string;
  status: 'pending_sync' | 'synced';
  disputeStatus: 'none' | 'disputed' | 'resolved';
}

export interface Dispute {
  id: string;
  lotId: string;
  farmerId: string;
  reason: string;
  timestamp: string;
  status: 'open' | 'reviewed';
  reassessmentResult?: AssessmentResult;
  reviewerId?: string;
  reviewerNotes?: string;
}

export interface AIModel {
  id: string;
  version: string;
  datasetVersion: string;
  classes: string[];
  mAP: number;
  deploymentDate: string;
  active: boolean;
}

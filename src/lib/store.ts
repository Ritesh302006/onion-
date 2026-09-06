import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LotAssessment, GradingRules, Dispute, User, AIModel } from './types';
import { generateId, generateHash } from './utils';

// Default initial data for prototype
const DEFAULT_RULES: GradingRules = {
  id: 'rule-v1',
  version: '1.0',
  gradeAMinHealthy: 70,
  gradeAMaxUndersized: 15,
  ursMaxDefect: 25,
  active: true,
  updatedAt: new Date().toISOString(),
};

const DEFAULT_MODEL: AIModel = {
  id: 'model-v2',
  version: 'YOLO-v8-Onion-2.1',
  datasetVersion: 'e09611742de689e0a95ca07be2d2ee25bba446f268a2d185d2c5baa45bdc76b3',
  classes: ['healthy', 'rotten', 'damaged', 'sprouted', 'discolored', 'undersized'],
  mAP: 94.2,
  deploymentDate: new Date().toISOString(),
  active: true,
};

const DEMO_USERS: User[] = [
  { id: 'u-officer-1', name: 'Ravi Kumar', role: 'officer', centerId: 'PC-Maha-01' },
  { id: 'u-admin-1', name: 'Admin Priya', role: 'admin' },
  { id: 'u-farmer-1', name: 'Kisan Ramesh', role: 'farmer' },
  { id: 'u-reviewer-1', name: 'Inspector Singh', role: 'reviewer' },
];

interface AppState {
  currentUser: User | null;
  users: User[];
  rules: GradingRules[];
  models: AIModel[];
  lots: LotAssessment[];
  disputes: Dispute[];
  isOnline: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  
  setCurrentUser: (user: User | null) => void;
  setOnlineStatus: (status: boolean) => void;
  
  addLot: (lot: Omit<LotAssessment, 'hash' | 'status' | 'id' | 'disputeStatus'>) => string;
  syncLots: () => Promise<void>;
  
  updateRules: (rules: Partial<GradingRules>) => void;
  
  addDispute: (dispute: Omit<Dispute, 'id' | 'status' | 'timestamp'>) => void;
  resolveDispute: (disputeId: string, reviewerId: string, notes: string, reassessment?: any) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: DEMO_USERS[0],
      users: DEMO_USERS,
      rules: [DEFAULT_RULES],
      models: [DEFAULT_MODEL],
      lots: [],
      disputes: [],
      isOnline: navigator.onLine,
  darkMode: false,
  toggleDarkMode: () => set((state) => {
    const newMode = !state.darkMode;
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    return { darkMode: newMode };
  }),
      
      setCurrentUser: (user) => set({ currentUser: user }),
      setOnlineStatus: (status) => set({ isOnline: status }),
      
      addLot: (lotData) => {
        const id = `LOT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        
        // Anti-tampering hash
        const dataToHash = id + lotData.farmerId + lotData.timestamp + JSON.stringify(lotData.result);
        const hash = generateHash(dataToHash);
        
        const newLot: LotAssessment = {
          ...lotData,
          id,
          hash,
          status: get().isOnline ? 'synced' : 'pending_sync',
          disputeStatus: 'none',
        };
        
        set((state) => ({ lots: [newLot, ...state.lots] }));
        return id;
      },
      
      syncLots: async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        set((state) => ({
          lots: state.lots.map(lot => ({ ...lot, status: 'synced' }))
        }));
      },
      
      updateRules: (newRules) => {
        const currentActive = get().rules.find(r => r.active) || DEFAULT_RULES;
        const updated: GradingRules = {
          ...currentActive,
          ...newRules,
          id: generateId(),
          version: (parseFloat(currentActive.version) + 0.1).toFixed(1),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          rules: [updated, ...state.rules.map(r => ({ ...r, active: false }))]
        }));
      },
      
      addDispute: (disputeData) => {
        const id = generateId();
        const newDispute: Dispute = {
          ...disputeData,
          id,
          status: 'open',
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          disputes: [newDispute, ...state.disputes],
          lots: state.lots.map(l => l.id === disputeData.lotId ? { ...l, disputeStatus: 'disputed' } : l)
        }));
      },
      
      resolveDispute: (id, reviewerId, notes, reassessment) => {
        set((state) => {
          const dispute = state.disputes.find(d => d.id === id);
          if (!dispute) return state;
          
          const updatedDispute: Dispute = {
             ...dispute,
             status: 'reviewed',
             reviewerId,
             reviewerNotes: notes,
             reassessmentResult: reassessment || dispute.reassessmentResult,
          };
          
          return {
            disputes: state.disputes.map(d => d.id === id ? updatedDispute : d),
            lots: state.lots.map(l => l.id === dispute.lotId ? { ...l, disputeStatus: 'resolved' } : l)
          };
        });
      },
    }),
    {
      name: 'sih-onion-storage',
    }
  )
);

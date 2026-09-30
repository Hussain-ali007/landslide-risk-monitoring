import React from 'react';
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  X,
  LogIn,
  LayoutDashboard,
  Map,
  MapPin,
  Send,
  AlertTriangle,
  FolderGit2,
} from 'lucide-react';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      id: 'login',
      name: '1. Role Login',
      desc: 'Select authority, field officer, or public reporter persona.',
      icon: LogIn,
    },
    {
      id: 'dashboard',
      name: '2. Authority Dashboard',
      desc: 'Review KPIs, risk breakdowns, active alerts & telemetry.',
      icon: LayoutDashboard,
    },
    {
      id: 'map',
      name: '3. Interactive NER Map',
      desc: 'Explore Green, Yellow, Orange, Red & Grey risk markers across NER.',
      icon: Map,
    },
    {
      id: 'location-detail',
      name: '4. Location Details',
      desc: 'Inspect deep geotechnical parameters: slope, 72h rain, pore pressure.',
      icon: MapPin,
    },
    {
      id: 'report',
      name: '5. Citizen Report',
      desc: 'Submit ground observations (cracks, seepage) and get a unique Report ID.',
      icon: Send,
    },
    {
      id: 'alerts',
      name: '6. Alerts Engine',
      desc: 'Review critical triggers, acknowledge, or elevate to incidents.',
      icon: AlertTriangle,
    },
    {
      id: 'incidents',
      name: '7. Incident Management',
      desc: 'Track operational lifecycle: New → Acknowledged → Investigating → Resolved.',
      icon: FolderGit2,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-base font-bold uppercase tracking-wider">
            SIH Phase 1 Verification Workflow
          </h2>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Test the end-to-end decision-support pipeline specified for SIH Phase 1. Click any step below to navigate directly to it:
        </p>

        <div className="space-y-2 mb-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = activeTab === step.id;
            return (
              <div
                key={step.id}
                onClick={() => {
                  onSelectTab(step.id);
                  onClose();
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isCurrent ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs sm:text-sm text-slate-100 flex items-center gap-2">
                      <span>{step.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/40">
                          Active Screen
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{step.desc}</div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-400">
            Pipeline: Login → Dashboard → Map → Details → Report → Alerts → Incidents
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

import { motion } from "motion/react";
import { SwotResult } from "../types";
import { Compass, Lightbulb, Focus, AlertTriangle, ShieldAlert } from "lucide-react";

interface Props {
  result: SwotResult;
}

export default function SwotView({ result }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
      id="swot-container"
    >
      {/* Head section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xl transition-all duration-300">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full uppercase tracking-wider">
            <Compass className="w-3 h-3" /> Analyse Stratégique SWOT
          </span>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {result.title}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            {result.summary}
          </p>
        </div>
      </div>

      {/* 2x2 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Forces / Strengths (Interne / Positif) */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-50 text-emerald-800">
            <h4 className="font-bold flex items-center gap-2 text-md uppercase tracking-wider">
              <span className="p-1 bg-emerald-100 text-emerald-800 rounded-lg">
                <Lightbulb className="w-4 h-4" />
              </span>
              Forces (Strengths)
            </h4>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded uppercase">
              Facteurs Internes
            </span>
          </div>
          <div className="space-y-4">
            {result.strengths.map((item, idx) => (
              <div key={idx} className="bg-emerald-50/20 p-3 rounded-xl border border-emerald-50/60 hover:bg-emerald-50/40 transition-colors">
                <span className="font-bold text-slate-800 text-sm block mb-1">
                  {idx + 1}. {item.text}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.details}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Faiblesses / Weaknesses (Interne / Négatif) */}
        <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-50 text-rose-800">
            <h4 className="font-bold flex items-center gap-2 text-md uppercase tracking-wider">
              <span className="p-1 bg-rose-100 text-rose-800 rounded-lg">
                <ShieldAlert className="w-4 h-4" />
              </span>
              Faiblesses (Weaknesses)
            </h4>
            <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded uppercase">
              Facteurs Internes
            </span>
          </div>
          <div className="space-y-4">
            {result.weaknesses.map((item, idx) => (
              <div key={idx} className="bg-rose-50/20 p-3 rounded-xl border border-rose-50/60 hover:bg-rose-50/40 transition-colors">
                <span className="font-bold text-slate-800 text-sm block mb-1">
                  {idx + 1}. {item.text}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.details}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunités / Opportunities (Externe / Positif) */}
        <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sky-50 text-sky-800">
            <h4 className="font-bold flex items-center gap-2 text-md uppercase tracking-wider">
              <span className="p-1 bg-sky-100 text-sky-800 rounded-lg">
                <Focus className="w-4 h-4" />
              </span>
              Opportunités (Opportunities)
            </h4>
            <span className="text-[10px] text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded uppercase">
              Environnement Externe
            </span>
          </div>
          <div className="space-y-4">
            {result.opportunities.map((item, idx) => (
              <div key={idx} className="bg-sky-50/20 p-3 rounded-xl border border-sky-50/60 hover:bg-sky-50/40 transition-colors">
                <span className="font-bold text-slate-800 text-sm block mb-1">
                  {idx + 1}. {item.text}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.details}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Menaces / Threats (Externe / Négatif) */}
        <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-50 text-amber-800">
            <h4 className="font-bold flex items-center gap-2 text-md uppercase tracking-wider">
              <span className="p-1 bg-amber-100 text-amber-800 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </span>
              Menaces (Threats)
            </h4>
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded uppercase">
              Environnement Externe
            </span>
          </div>
          <div className="space-y-4">
            {result.threats.map((item, idx) => (
              <div key={idx} className="bg-amber-50/20 p-3 rounded-xl border border-amber-50/60 hover:bg-amber-50/40 transition-colors">
                <span className="font-bold text-slate-800 text-sm block mb-1">
                  {idx + 1}. {item.text}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.details}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Strategic Roadmap advice */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-2xl p-6 shadow-xl border border-teal-500/20 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-5 scale-150 rotate-12 select-none pointer-events-none">
          <Compass className="w-72 h-72 text-teal-400" />
        </div>
        <div className="flex gap-4 relative z-10">
          <div className="shrink-0 rounded-xl bg-teal-500/20 p-3 h-12 w-12 flex items-center justify-center border border-teal-400/30">
            <Compass className="w-6 h-6 text-teal-300" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-teal-300 tracking-wider uppercase">
              Orientation Stratégique de l'Arbitre
            </h4>
            <p className="text-sm font-medium text-slate-200 leading-relaxed pt-1">
              {result.strategicPath}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

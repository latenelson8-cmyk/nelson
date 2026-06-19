import { motion } from "motion/react";
import { CompareResult } from "../types";
import { ShieldCheck, TrendingUp, HelpCircle, Star, Sparkles } from "lucide-react";

interface Props {
  result: CompareResult;
}

export default function CompareView({ result }: Props) {
  // Option names
  const options = result.options || [];

  // Calculate dynamic average scores per option
  const optionAverages = options.map((opt) => {
    let sum = 0;
    let count = 0;
    result.criteria.forEach((criterion) => {
      const optionScore = criterion.scores.find(
        (s) => s.option.toLowerCase() === opt.toLowerCase()
      );
      if (optionScore) {
        sum += optionScore.score;
        count++;
      }
    });
    return {
      option: opt,
      average: count > 0 ? Number((sum / count).toFixed(1)) : 0,
    };
  });

  // Find the highest-scoring option based on calculations
  const calculatedWinner = [...optionAverages].sort((a, b) => b.average - a.average)[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
      id="compare-container"
    >
      {/* Overview Head & Summary */}
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xl transition-all duration-300">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-semibold rounded-full uppercase tracking-wider">
            <TrendingUp className="w-3 h-3" /> Arbitrage Comparatif
          </span>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {result.title}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            {result.summary}
          </p>
        </div>
      </div>

      {/* Comparison Grid & Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider w-[240px]">
                  Critères d'évaluation
                </th>
                {options.map((opt, i) => (
                  <th key={opt} className="p-4 font-extrabold text-sm text-slate-800 border-l border-slate-200 text-center">
                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                        Option {i + 1}
                      </span>
                      <div className="text-slate-900">{opt}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {result.criteria.map((criterion, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                  <td className="p-4 space-y-1">
                    <span className="font-semibold text-slate-800 text-sm block">
                      {criterion.name}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {criterion.description}
                    </span>
                  </td>

                  {options.map((opt) => {
                    const mathScore = criterion.scores.find(
                      (s) => s.option.toLowerCase() === opt.toLowerCase()
                    );
                    const val = mathScore ? mathScore.score : 0;

                    return (
                      <td key={opt} className="p-4 border-l border-slate-200 text-center min-w-[150px]">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= val
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            {val}/5
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Criterion detailed commentaries */}
              <tr className="bg-slate-50/30">
                <td colSpan={options.length + 1} className="p-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Commentaires sur les critères :
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.criteria.map((criterion, idx) => (
                      <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm space-y-1">
                        <span className="font-semibold text-slate-700 text-xs">
                          {criterion.name}
                        </span>
                        <p className="text-xs text-slate-600 italic">
                          "{criterion.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Average Summary Row */}
              <tr className="bg-indigo-50/20 font-bold border-t border-slate-200">
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-indigo-950 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Note Moyenne Calculée
                  </div>
                </td>
                {optionAverages.map((avgOpt) => (
                  <td key={avgOpt.option} className="p-4 border-l border-slate-200 text-center">
                    <div className="space-y-0.5">
                      <span className="text-xl font-black text-slate-800">
                        {avgOpt.average} / 5
                      </span>
                      <div className="w-24 bg-slate-200 h-1.5 rounded-full mx-auto overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full"
                          style={{ width: `${(avgOpt.average / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Winner Spotlight Card */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-violet-500/20 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-5 scale-150 rotate-12 select-none pointer-events-none">
          <ShieldCheck className="w-72 h-72 text-violet-400" />
        </div>
        <div className="flex gap-4 relative z-10">
          <div className="shrink-0 rounded-xl bg-violet-500/20 p-3 h-12 w-12 flex items-center justify-center border border-violet-400/30">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-violet-300 tracking-wider uppercase">
              Recommandation Arbitre-late (Option Gagnante)
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black bg-gradient-to-r from-amber-200 to-yellow-400 text-transparent bg-clip-text">
                {result.recommendation.winner}
              </span>
              <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full text-slate-300">
                Score calculé : {calculatedWinner.average}/5
              </span>
            </div>
            <p className="text-sm font-medium text-slate-200 leading-relaxed pt-1">
              {result.recommendation.why}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

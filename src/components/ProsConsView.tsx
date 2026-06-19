import { motion } from "motion/react";
import { ProsConsResult } from "../types";
import { Check, AlertTriangle, Scale, ShieldAlert, Award, Zap } from "lucide-react";

interface Props {
  result: ProsConsResult;
}

export default function ProsConsView({ result }: Props) {
  // Normalize final score for slider UI. Final score is -100 to +100.
  const scorePercent = ((result.finalScore + 100) / 200) * 100;

  // Determine score colors & descriptors
  let scoreColor = "bg-slate-400";
  let scoreText = "Neutre";
  let bgGlow = "shadow-slate-100";

  if (result.finalScore > 15) {
    scoreColor = "bg-emerald-500";
    scoreText = result.finalScore > 50 ? "Favorable résolu" : "Plutôt Favorable";
    bgGlow = "shadow-emerald-100 border-emerald-100";
  } else if (result.finalScore < -15) {
    scoreColor = "bg-rose-500";
    scoreText = result.finalScore < -50 ? "Défavorable résolu" : "Plutôt Défavorable";
    bgGlow = "shadow-rose-100 border-rose-100";
  }

  // Group elements by category
  const categoriesMap = new Map<string, number>();
  [...result.pros, ...result.cons].forEach((item) => {
    categoriesMap.set(item.category, (categoriesMap.get(item.category) || 0) + 1);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
      id="pros-cons-container"
    >
      {/* Overview Head & Score Card */}
      <div className={`p-6 rounded-2xl bg-white border border-slate-100 shadow-xl ${bgGlow} transition-all duration-300`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full uppercase tracking-wider">
              <Scale className="w-3 px-0 h-3" /> Arbitrage Balance
            </span>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight" id="analysis-title">
              {result.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed" id="analysis-summary">
              {result.summary}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl min-w-[200px] text-center border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
              Indice Décisionnel
            </span>
            <span className={`text-4xl font-extrabold my-2 ${result.finalScore > 0 ? "text-emerald-600" : result.finalScore < 0 ? "text-rose-600" : "text-slate-600"}`}>
              {result.finalScore > 0 ? `+${result.finalScore}` : result.finalScore}
            </span>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full ${scoreColor} transition-all duration-500`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {scoreText}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Pros vs Cons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PROS (Avantages) */}
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-50 text-emerald-800">
            <h4 className="font-bold flex items-center gap-2 text-lg">
              <span className="p-1 px-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-black">
                PROS
              </span>
              Avantages ({result.pros.length})
            </h4>
            <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
              Favorise le "Oui"
            </span>
          </div>

          {result.pros.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center">Aucun avantage significatif détecté.</p>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
              {result.pros.map((pro, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={index}
                  className="p-3.5 bg-emerald-50/40 border border-emerald-50/60 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/60 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-emerald-500 text-white rounded-full p-0.5 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-800 text-sm">
                          {pro.text}
                        </span>
                        <span className="inline-block text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-medium">
                          {pro.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {pro.explanation}
                      </p>

                      {/* Impact meter */}
                      <div className="flex items-center gap-2 pt-1.5">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Impact : {pro.impact}/5
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span
                              key={s}
                              className={`w-3.5 h-1.5 rounded-sm transition-all ${
                                s <= pro.impact ? "bg-emerald-500 scale-y-110" : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* CONS (Inconvénients) */}
        <div className="bg-white border border-rose-100 rounded-2xl shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-50 text-rose-800">
            <h4 className="font-bold flex items-center gap-2 text-lg">
              <span className="p-1 px-1.5 bg-rose-100 text-rose-800 rounded-lg text-sm font-black">
                CONS
              </span>
              Inconvénients ({result.cons.length})
            </h4>
            <span className="text-xs text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded-full">
              Favorise le "Non"
            </span>
          </div>

          {result.cons.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center">Aucun inconvénient significatif détecté.</p>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
              {result.cons.map((con, index) => (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={index}
                  className="p-3.5 bg-rose-50/40 border border-rose-50/60 rounded-xl hover:border-rose-200 hover:bg-rose-50/60 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-rose-500 text-white rounded-full p-0.5 shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-800 text-sm">
                          {con.text}
                        </span>
                        <span className="inline-block text-[10px] px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-medium">
                          {con.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {con.explanation}
                      </p>

                      {/* Impact meter */}
                      <div className="flex items-center gap-2 pt-1.5">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Impact : {con.impact}/5
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span
                              key={s}
                              className={`w-3.5 h-1.5 rounded-sm transition-all ${
                                s <= con.impact ? "bg-rose-500 scale-y-110" : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Major Category Distribution Insights */}
      {categoriesMap.size > 0 && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Dimensions d'Analyse :
          </span>
          <div className="flex flex-wrap gap-2">
            {Array.from(categoriesMap.entries()).map(([cat, count]) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 text-xs bg-white text-slate-700 px-3 py-1 rounded-full border border-slate-200/80 font-medium"
              >
                <Zap className="w-3 h-3 text-indigo-500" />
                {cat}
                <span className="px-1 text-[10px] bg-slate-100 text-slate-600 rounded">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* final Arbitre-late verdict */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-5 scale-150 rotate-12 select-none pointer-events-none">
          <Award className="w-72 h-72 text-indigo-400" />
        </div>
        <div className="flex gap-4 relative z-10">
          <div className="shrink-0 rounded-xl bg-indigo-500/20 p-3 h-12 w-12 flex items-center justify-center border border-indigo-400/30">
            {result.finalScore > 0 ? (
              <Award className="w-6 h-6 text-emerald-400" />
            ) : result.finalScore < 0 ? (
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            ) : (
              <Scale className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div className="space-y-2">
            <h4 className="text-md font-bold text-white tracking-wide uppercase">
              Verdict de l'Arbitre :
            </h4>
            <p className="text-base font-medium text-slate-200 italic leading-relaxed">
              &ldquo;{result.verdict}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

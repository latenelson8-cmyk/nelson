import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SavedDecision } from "../types";
import { Search, Trash2, Calendar, FileText, Download, Scale, TrendingUp, Compass, AlertCircle } from "lucide-react";

interface Props {
  decisions: SavedDecision[];
  onSelect: (decision: SavedDecision) => void;
  onDelete: (id: string) => void;
}

export default function DecisionHistory({ decisions, onSelect, onDelete }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = decisions.filter((d) => {
    const matchesSearch = d.situation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (d.result?.title && d.result.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === "all" || d.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getBadge = (type: string) => {
    switch (type) {
      case "proscons":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
            <Scale className="w-3 h-3" /> Pour & Contre
          </span>
        );
      case "compare":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-100">
            <TrendingUp className="w-3 h-3" /> Comparatif
          </span>
        );
      case "swot":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">
            <Compass className="w-3 h-3" /> SWOT
          </span>
        );
      default:
        return null;
    }
  };

  const downloadJson = (decision: SavedDecision, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering details card select
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(decision, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `arbitre_late_${decision.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6" id="history-container">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une décision arbitrée..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
          />
        </div>

        <div className="flex gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterType === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterType("proscons")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterType === "proscons"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Pour/Contre
          </button>
          <button
            onClick={() => setFilterType("compare")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterType === "compare"
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Comparatif
          </button>
          <button
            onClick={() => setFilterType("swot")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterType === "swot"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            SWOT
          </button>
        </div>
      </div>

      {/* Grid of Decisions */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/60 p-6">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-slate-700 font-bold mb-1">Aucune analyse trouvée</h4>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            {searchTerm || filterType !== "all"
              ? "Essayez de modifier vos filtres ou termes de recherche."
              : "Vous n'avez pas encore demandé d'arbitrage. Commencez dès maintenant !"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((decision) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={decision.id}
                onClick={() => onSelect(decision)}
                className="bg-white border border-slate-200/80 rounded-xl hover:border-indigo-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group h-full relative"
                id={`history-${decision.id}`}
              >
                {/* Header card info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    {getBadge(decision.type)}
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formatDate(decision.createdAt)}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                    {decision.situation}
                  </h4>

                  {decision.context && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic">
                      Contexte: {decision.context}
                    </p>
                  )}
                </div>

                {/* Footer buttons / stats */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-4">
                  <span className="text-xs text-indigo-500 font-bold flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 mt-0.5" /> Voir les détails
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => downloadJson(decision, e)}
                      title="Télécharger le rapport JSON"
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(decision.id);
                      }}
                      title="Supprimer la décision"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

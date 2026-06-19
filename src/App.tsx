import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Scale, TrendingUp, Compass, Plus, Minus, HelpCircle, History, Sparkles, BookOpen, Clock, Heart, ArrowLeft, RefreshCw, Layers } from "lucide-react";
import { AnalysisType, SavedDecision } from "./types";
import ProsConsView from "./components/ProsConsView";
import CompareView from "./components/CompareView";
import SwotView from "./components/SwotView";
import DecisionHistory from "./components/DecisionHistory";

const LOADING_STEPS = [
  "Arbitre-late enfile sa toge noire d'audience...",
  "Clarification des faits et du contexte de votre situation...",
  "Analyse rigoureuse de la jurisprudence cognitive...",
  "Calcul minutieux des coefficients d'impact (échelle de 1 à 5)...",
  "Pondération des forces externes et des dangers potentiels...",
  "L'arbitre pèse le pour et le contre sur sa balance...",
  "Rdaction de la sentence finale sage et éclairée..."
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [situation, setSituation] = useState("");
  const [type, setType] = useState<AnalysisType>("proscons");
  const [context, setContext] = useState("");
  const [options, setOptions] = useState<string[]>(["Acheter du neuf", "Réparer l'existant"]);
  const [loading, setLoading] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Saved analyses state
  const [savedDecisions, setSavedDecisions] = useState<SavedDecision[]>([]);
  // The decision either currently analyzed or viewed
  const [currentDecision, setCurrentDecision] = useState<SavedDecision | null>(null);

  // Load saved decisions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("arbitre_late_decisions");
      if (stored) {
        setSavedDecisions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load decisions from localStorage:", e);
    }
  }, []);

  // Interval for changing loading steps
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingMessageIdx(0);
      interval = setInterval(() => {
        setLoadingMessageIdx((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Persist decisions helper
  const saveDecisionList = (newList: SavedDecision[]) => {
    setSavedDecisions(newList);
    try {
      localStorage.setItem("arbitre_late_decisions", JSON.stringify(newList));
    } catch (e) {
      console.error("Failed to save decisions to localStorage:", e);
    }
  };

  // Add an option for compare
  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, ""]);
    }
  };

  // Remove an option
  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const copy = [...options];
      copy.splice(index, 1);
      setOptions(copy);
    }
  };

  // Option text change
  const handleOptionChange = (index: number, val: string) => {
    const copy = [...options];
    copy[index] = val;
    setOptions(copy);
  };

  // Call the server-side GenAI endpoint
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim()) {
      setError("Veuillez formuler la situation dont l'Arbitre doit juger.");
      return;
    }

    // Double check comparison options
    if (type === "compare") {
      const filledOptions = options.map((o) => o.trim()).filter(Boolean);
      if (filledOptions.length < 2) {
        setError("Veuillez spécifier au moins 2 options valides à comparer.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    setCurrentDecision(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: situation.trim(),
          type,
          context: context.trim() || undefined,
          options: type === "compare" ? options.map((o) => o.trim()).filter(Boolean) : undefined,
        }),
      });

      if (!res.ok) {
        const errResult = await res.json().catch(() => ({}));
        throw new Error(errResult.error || "Une erreur est survenue lors de l'appel au serveur.");
      }

      const parsedResult = await res.json();

      // Create saved decision item
      const newDecision: SavedDecision = {
        id: "dec_" + Date.now(),
        createdAt: new Date().toISOString(),
        situation: situation.trim(),
        type,
        context: context.trim() || undefined,
        options: type === "compare" ? options.map((o) => o.trim()).filter(Boolean) : undefined,
        result: parsedResult,
      };

      // Add to state and save
      const updatedList = [newDecision, ...savedDecisions];
      saveDecisionList(updatedList);
      setCurrentDecision(newDecision);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Impossible de joindre le serveur de décision. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill fields with popular templates for faster user onboarding
  const applyTemplate = (situationText: string, analysisType: AnalysisType, extraContext: string, templateOptions?: string[]) => {
    setSituation(situationText);
    setType(analysisType);
    setContext(extraContext);
    if (templateOptions) {
      setOptions(templateOptions);
    }
    setCurrentDecision(null);
    setError(null);
    setActiveTab("new");
  };

  // Delete decision
  const handleDeleteDecision = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet arbitrage historique ?")) {
      const filtered = savedDecisions.filter((d) => d.id !== id);
      saveDecisionList(filtered);
      if (currentDecision && currentDecision.id === id) {
        setCurrentDecision(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans tracking-tight antialiased">
      {/* Visual Navigation Header bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & title Pair */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg shadow-black/10 flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                  Arbitre-late
                </h1>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                  AI DECISION
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Prenez de meilleures décisions éclairées grâce à la sagesse de l'IA
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab("new");
                setCurrentDecision(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "new"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Nouvelle Analyse
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all relative ${
                activeTab === "history"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <History className="w-3.5 h-3.5" /> Historique d'Arbitrage
              {savedDecisions.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {savedDecisions.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main body viewport */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          
          {/* Loading display screen */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-lg flex flex-col items-center justify-center text-center p-6 text-white"
            >
              <div className="space-y-8 max-w-sm">
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                  <Scale className="w-10 h-10 text-indigo-400 absolute animate-pulse" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-white">L'Arbitre délibère</h3>
                  <div className="h-10 flex items-center justify-center">
                    <p className="text-slate-300 text-sm leading-relaxed antialiased font-medium animate-pulse">
                      {LOADING_STEPS[loadingMessageIdx]}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 text-[11px] text-slate-400 italic">
                  Note: L'intelligence artificielle d'Arbitre-late pèse des dizaines de biais et de critères complexes de façon à minimiser l'influence du regret futur.
                </div>
              </div>
            </motion.div>
          )}

          {/* ACTIVE TAB: NEW ANALYSIS PANEL */}
          {activeTab === "new" && !currentDecision && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              id="analysis-form-panel"
            >
              
              {/* Left Side: Parameters input form */}
              <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <div className="p-1 px-2.5 bg-indigo-50 text-indigo-700 font-bold rounded text-xs select-none">
                    NOUVEAU JUGEMENT
                  </div>
                  <h2 className="text-lg font-black text-slate-900">
                    Proposer une situation à arbitrer
                  </h2>
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleAnalyze} className="space-y-6">
                  
                  {/* Dilemma/Situation main prompt */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center justify-between">
                      <span>La Situation ou Dilemme :<span className="text-rose-500 ml-0.5">*</span></span>
                      <span className="text-[10px] text-slate-400 font-medium normal-case">Ex: Décision importante, choix matériel, cap de vie...</span>
                    </label>
                    <textarea
                      rows={3}
                      value={situation}
                      onChange={(e) => setSituation(e.target.value)}
                      placeholder="Ex: Est-ce une bonne idée de quitter mon emploi actuel pour me lancer en tant que consultant freelance ?"
                      className="w-full p-4 border border-slate-200 rounded-xl text-sm font-medium bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400 leading-relaxed"
                    />
                  </div>

                  {/* Analysis Strategy Selector */}
                  <div className="space-y-3">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                      Format d'Analyse requis :
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      
                      {/* Pros & Cons Button */}
                      <button
                        type="button"
                        onClick={() => setType("proscons")}
                        className={`p-4 rounded-xl border text-left transition-all flex flex-col items-start gap-2 group relative overflow-hidden ${
                          type === "proscons"
                            ? "bg-indigo-50/40 border-indigo-500 ring-2 ring-indigo-500/15"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/30"
                        }`}
                      >
                        <Scale className={`w-5 h-5 ${type === "proscons" ? "text-indigo-600 animate-pulse" : "text-slate-400 group-hover:text-slate-600"}`} />
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">Pour & Contre</span>
                          <span className="text-xs text-slate-500 leading-normal block mt-0.5 font-normal">
                            Analyse binaire balancée avec coefficients d'impact (1 à 5) et verdict d'Arbitre-late.
                          </span>
                        </div>
                      </button>

                      {/* Comparative Table Button */}
                      <button
                        type="button"
                        onClick={() => setType("compare")}
                        className={`p-4 rounded-xl border text-left transition-all flex flex-col items-start gap-2 group relative overflow-hidden ${
                          type === "compare"
                            ? "bg-violet-50/40 border-violet-500 ring-2 ring-violet-500/15"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/30"
                        }`}
                      >
                        <TrendingUp className={`w-5 h-5 ${type === "compare" ? "text-violet-600 animate-pulse" : "text-slate-400 group-hover:text-slate-600"}`} />
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">Tableau Comparatif</span>
                          <span className="text-xs text-slate-500 leading-normal block mt-0.5 font-normal">
                            Comparez plusieurs options (ex: Choisir A vs B) sur des critères d'évaluation notationnels.
                          </span>
                        </div>
                      </button>

                      {/* SWOT Button */}
                      <button
                        type="button"
                        onClick={() => setType("swot")}
                        className={`p-4 rounded-xl border text-left transition-all flex flex-col items-start gap-2 group relative overflow-hidden ${
                          type === "swot"
                            ? "bg-teal-50/40 border-teal-500 ring-2 ring-teal-500/15"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/30"
                        }`}
                      >
                        <Compass className={`w-5 h-5 ${type === "swot" ? "text-teal-600 animate-pulse" : "text-slate-400 group-hover:text-slate-600"}`} />
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">Grille SWOT</span>
                          <span className="text-xs text-slate-500 leading-normal block mt-0.5 font-normal">
                            Forces (Strengths), Faiblesses, Opportunités, Menaces. Idéal pour décisions stratégiques.
                          </span>
                        </div>
                      </button>

                    </div>
                  </div>

                  {/* Comparisons Panel: Only rendered when type is 'compare' */}
                  {type === "compare" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 bg-violet-50/25 border border-violet-100 p-4 rounded-xl"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-violet-50">
                        <span className="text-xs font-extrabold text-violet-950 uppercase tracking-widest flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-violet-500" /> Options à comparer ({options.length})
                        </span>
                        {options.length < 5 && (
                          <button
                            type="button"
                            onClick={handleAddOption}
                            className="text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Ajouter un choix
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleOptionChange(i, e.target.value)}
                                placeholder={`Ex: Option ${String.fromCharCode(65 + i)}`}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800"
                              />
                              {options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(i)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Optional Context Field */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center justify-between">
                      <span>Contexte et Préférences personnels (Optionnel) :</span>
                      <span className="text-[10px] text-indigo-500 font-bold uppercase">Optionnel</span>
                    </label>
                    <textarea
                      rows={2}
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Ex: J'ai un crédit en cours pour encore un an. Ma famille privilégie la sécurité financière, mais je me sens usé professionnellement."
                      className="w-full p-4 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400 leading-relaxed"
                    />
                  </div>

                  {/* Submit Judgment Button */}
                  <button
                    type="submit"
                    className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Scale className="w-5 h-5 text-indigo-400 animate-pulse" />
                    Trancher la situation avec l'Arbitre-late
                  </button>
                </form>
              </div>

              {/* Right Side: Quick Templates / Guidance */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Onboarding block / Guidance */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden border border-slate-800">
                  <div className="space-y-3 relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-bold rounded-md uppercase tracking-wide">
                      <BookOpen className="w-3 h-3 text-indigo-400" /> Guide d'Arbitrage
                    </span>
                    <h3 className="text-base font-bold text-white">
                      Comment formuler ?
                    </h3>
                    <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed font-normal">
                      <li className="flex gap-2">
                        <span className="text-indigo-400 font-bold">1.</span>
                        <span>Présentez un réel choix à accomplir, s'excluant de simples questions d'opinion générale.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-400 font-bold">2.</span>
                        <span>Détaillez vos craintes et aspirations réelles dans l'onglet **Contexte** pour des prédictions sur-mesure.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-400 font-bold">3.</span>
                        <span>L'Arbitre-late éliminera de manière algorithmique les biais habituels de dissonance.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Quick Scenarios Launcher Templates */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block pb-2 border-b border-slate-100">
                    Scénarios d'Exemple
                  </span>
                  <div className="space-y-3">
                    
                    {/* Template 1 */}
                    <button
                      onClick={() =>
                        applyTemplate(
                          "Est-ce que je devrais installer des panneaux solaires photovoltaïques sur le toit de ma maison ?",
                          "proscons",
                          "J'habite dans le sud, ma toiture est orientée sud-ouest, j'ai un budget disponible mais je ne vais peut-être pas garder cette maison plus de 10 ans."
                        )
                      }
                      className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-150 transition-all text-xs space-y-1 block group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          Énergie & Écologie
                        </span>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                          Pour/Contre
                        </span>
                      </div>
                      <p className="text-slate-500 line-clamp-2 leading-relaxed font-normal">
                        Installer des panneaux solaires face aux coûts et bénéfices réels.
                      </p>
                    </button>

                    {/* Template 2 */}
                    <button
                      onClick={() =>
                        applyTemplate(
                          "Quel choix matériel faire pour mon nouvel ordinateur de travail en tant que designer freelance ?",
                          "compare",
                          "Je fais beaucoup de retouches photo et d'illustrations 3D occasionnelles. Mon budget maximal est de 1800 euros et j'apprécie la portabilité.",
                          ["MacBook Air M3 Pro (16Go RAM)", "PC Portable Asus Zenbook OLED 16", "PC Fixe de bureau assemblé sur mesure"]
                        )
                      }
                      className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-150 transition-all text-xs space-y-1 block group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          Achat Informatique
                        </span>
                        <span className="text-[9px] bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded font-bold">
                          Comparatif
                        </span>
                      </div>
                      <p className="text-slate-500 line-clamp-2 leading-relaxed font-normal">
                        Comparer des ordinateurs professionnels sur des critères complexes de CAO.
                      </p>
                    </button>

                    {/* Template 3 */}
                    <button
                      onClick={() =>
                        applyTemplate(
                          "Accepter une offre d'association pour monter une startup dans la LegalTech de documents automatisés",
                          "swot",
                          "J'ai 12 ans d'expérience comme juriste en cabinet. L'associé propose 35% des parts sociales. Je dois démissionner sans chômage immédiat."
                        )
                      }
                      className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-150 transition-all text-xs space-y-1 block group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          Création d'Entreprise
                        </span>
                        <span className="text-[9px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-bold">
                          SWOT
                        </span>
                      </div>
                      <p className="text-slate-500 line-clamp-2 leading-relaxed font-normal">
                        Analyser son profil face à l'opportunité entrepreneuriale d'un projet LegalTech.
                      </p>
                    </button>

                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ACTIVE TAB: HISTORY LIST */}
          {activeTab === "history" && !currentDecision && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Arbitrages passés
                  </h2>
                  <p className="text-xs text-slate-500">
                    Parcourez vos précédentes requêtes archivées localement sur ce navigateur.
                  </p>
                </div>
                {savedDecisions.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("Voulez-vous réinitialiser l'intégralité de votre historique ? Cette opération est irréversible.")) {
                        saveDecisionList([]);
                      }
                    }}
                    className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/60 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Effacer Tout
                  </button>
                )}
              </div>

              <DecisionHistory
                decisions={savedDecisions}
                onSelect={(d) => setCurrentDecision(d)}
                onDelete={handleDeleteDecision}
              />
            </motion.div>
          )}

          {/* RESULT SPECIFIC VIEW */}
          {currentDecision && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
              id="results-panel"
            >
              {/* Back controls navigation */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <button
                  onClick={() => {
                    setCurrentDecision(null);
                    // Stay on current high-level list
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Retour à la liste
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold italic flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Rapport du {new Date(currentDecision.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  
                  <button
                    onClick={() => {
                      // Apply current decision attributes as raw template to re-evaluate or edit
                      setSituation(currentDecision.situation);
                      setType(currentDecision.type);
                      setContext(currentDecision.context || "");
                      if (currentDecision.options) {
                        setOptions(currentDecision.options);
                      }
                      setCurrentDecision(null);
                      setActiveTab("new");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors"
                    title="Ajuster la situation ou relancer l'arbitrage"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Ajuster & Re-lancer
                  </button>
                </div>
              </div>

              {/* Specific custom viewer switcher based on response type */}
              {currentDecision.type === "proscons" && (
                <ProsConsView result={currentDecision.result as any} />
              )}
              {currentDecision.type === "compare" && (
                <CompareView result={currentDecision.result as any} />
              )}
              {currentDecision.type === "swot" && (
                <SwotView result={currentDecision.result as any} />
              )}

              {/* Actions/Reassurance disclaimer */}
              <div className="p-4 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-xs font-normal leading-relaxed text-center">
                Attention : Cet arbitrage de l'IA est purement analytique et fourni à titre indicatif selon les données que vous formulez. Vous demeurez l'exclusif propriétaire et souverain décideur de votre vie.
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Subtle minimalist Footer */}
      <footer className="mt-20 border-t border-slate-200/60 bg-white py-8 px-4 text-center">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400 font-bold">
            <span>Arbitre-late</span> · <span>Version 1.1.0</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Propulsé par le modèle Gemini 3.5-flash pour des arbitrages impartiaux et des synthèses rigoureuses.
          </p>
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
            Fait avec <Heart className="w-3 h-3 text-rose-500 fill-rose-500 hover:scale-110 transition-all" /> par LateNelson.
          </div>
        </div>
      </footer>
    </div>
  );
}

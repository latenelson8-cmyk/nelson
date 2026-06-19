import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Google GenAI safe from the client.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

// API route for decision analysis
app.post("/api/analyze", async (req, res) => {
  const { situation, type, context, options } = req.body;

  if (!situation || typeof situation !== "string" || situation.trim() === "") {
    return res.status(400).json({ error: "La situation à analyser est requise." });
  }

  try {
    let prompt = "";
    let schema: any = {};

    if (type === "proscons") {
      prompt = `Analyse la situation suivante en identifiant de façon objective les avantages (Pros) et les inconvénients (Cons) :
Situation : "${situation}"
${context ? `Contexte supplémentaire : "${context}"` : ""}

Tu dois évaluer chaque élément avec un niveau d'impact de 1 à 5 (1 l'impact le plus faible, 5 l'impact le plus fort) et attribuer une catégorie (ex: Sante, Budget, Carriere, Personnel, etc.).
Calcule également un score final net ("finalScore" entre -100 et +100) où un score positif penche pour faire cette action/prendre cette décision, et négatif penche pour s'abstenir ou dire non.
Donne un verdict clair et tranché.`;

      schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Le titre court de la situation analysée" },
          summary: { type: Type.STRING, description: "Un résumé global rapide de l'analyse" },
          pros: {
            type: Type.ARRAY,
            description: "Liste des avantages",
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "Avantage formulé de façon claire" },
                impact: { type: Type.INTEGER, description: "Niveau d'impact de 1 à 5" },
                category: { type: Type.STRING, description: "Catégorie de cet impact" },
                explanation: { type: Type.STRING, description: "Explication rapide de pourquoi c'est un avantage" }
              },
              required: ["text", "impact", "category", "explanation"]
            }
          },
          cons: {
            type: Type.ARRAY,
            description: "Liste des inconvénients",
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "Inconvénient formulé de façon claire" },
                impact: { type: Type.INTEGER, description: "Niveau d'impact de 1 à 5" },
                category: { type: Type.STRING, description: "Catégorie de cet impact" },
                explanation: { type: Type.STRING, description: "Explication rapide de pourquoi c'est un inconvénient" }
              },
              required: ["text", "impact", "category", "explanation"]
            }
          },
          finalScore: { type: Type.INTEGER, description: "Le score final calculé entre -100 et +100" },
          verdict: { type: Type.STRING, description: "Le verdict tranché de l'arbitre (recommandation finale)" }
        },
        required: ["title", "summary", "pros", "cons", "finalScore", "verdict"]
      };

    } else if (type === "compare") {
      const parsedOptions = options && Array.isArray(options) && options.length > 0
        ? options
        : ["Option A", "Option B"];

      prompt = `Compare les options suivantes pour la situation donnée :
Situation : "${situation}"
Options à comparer : ${JSON.stringify(parsedOptions)}
${context ? `Contexte supplémentaire : "${context}"` : ""}

Détermine de 4 à 6 critères de comparaison pertinents (ex : Coût, Temps, Risque, Épanouissement, etc.).
Pour chaque critère, attribue une note de 1 à 5 pour chaque option comparée, et ajoute un commentaire court expliquant les notes.
Donne également une synthèse globale et désigne le vainqueur clairement dans la recommandation.`;

      // Define schema dynamically tailored for standard structures
      schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Le titre court de la comparaison" },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Liste exacte des options comparées"
          },
          criteria: {
            type: Type.ARRAY,
            description: "Liste des critères évalués",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Nom du critère (ex: Budget, Facilité, Risque...)" },
                description: { type: Type.STRING, description: "Description rapide de ce critère" },
                scores: {
                  type: Type.ARRAY,
                  description: "Les scores pour chaque option dans l'ordre de la liste 'options', chaque élément doit avoir l'option et la note",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      option: { type: Type.STRING, description: "Le nom exact du choix/option" },
                      score: { type: Type.INTEGER, description: "Note sur 5 (1 à 5)" }
                    },
                    required: ["option", "score"]
                  }
                },
                comment: { type: Type.STRING, description: "Commentaire explicatif de la notation" }
              },
              required: ["name", "description", "scores", "comment"]
            }
          },
          summary: { type: Type.STRING, description: "Synthèse générale de la comparaison" },
          recommendation: {
            type: Type.OBJECT,
            properties: {
              winner: { type: Type.STRING, description: "L'option gagnante recommandée" },
              why: { type: Type.STRING, description: "Justification claire de cette recommandation" }
            },
            required: ["winner", "why"]
          }
        },
        required: ["title", "options", "criteria", "summary", "recommendation"]
      };

    } else { // swot (Forces, Faiblesses, Opportunités, Menaces)
      prompt = `Effectue une analyse SWOT (Strengths / Forces, Weaknesses / Faiblesses, Opportunities / Opportunités, Threats / Menaces) complète pour la situation suivante :
Situation : "${situation}"
${context ? `Contexte supplémentaire : "${context}"` : ""}

Tu dois lister au moins 3 à 5 éléments pertinents dans chaque quadrant (forces, faiblesses, opportunités, menaces), avec à chaque fois un titre court d'élément et son explication détaillée ("details").
Fournis également une synthèse ("summary") et un conseil stratégique ("strategicPath") pour tirer parti de la situation ou contourner les risques.`;

      schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Le titre de l'analyse SWOT (Forces, Faiblesses, Opportunités, Menaces)" },
          summary: { type: Type.STRING, description: "Synthèse rapide de l'analyse" },
          strengths: {
            type: Type.ARRAY,
            description: "Forces (Points forts internes)",
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "Titre de la force" },
                details: { type: Type.STRING, description: "Détails explicatifs" }
              },
              required: ["text", "details"]
            }
          },
          weaknesses: {
            type: Type.ARRAY,
            description: "Faiblesses (Points faibles internes)",
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "Titre de la faiblesse" },
                details: { type: Type.STRING, description: "Détails explicatifs" }
              },
              required: ["text", "details"]
            }
          },
          opportunities: {
            type: Type.ARRAY,
            description: "Opportunités (Facteurs externes favorables)",
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "Titre de l'opportunité" },
                details: { type: Type.STRING, description: "Détails explicatifs" }
              },
              required: ["text", "details"]
            }
          },
          threats: {
            type: Type.ARRAY,
            description: "Menaces (Facteurs externes de risque)",
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "Titre de la menace" },
                details: { type: Type.STRING, description: "Détails explicatifs" }
              },
              required: ["text", "details"]
            }
          },
          strategicPath: { type: Type.STRING, description: "La voie/conseil stratégique d'Arbitre-late recommandé" }
        },
        required: ["title", "summary", "strengths", "weaknesses", "opportunities", "threats", "strategicPath"]
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Tu es 'Arbitre-late', un arbitre de décision neutre, sage, rigoureux mais doté d'une touche d'esprit. Tu réponds toujours en français professionnel, fluide et structuré en fournissant un format JSON valide conforme au schéma demandé. Ne retourne aucun texte ou markdown avant ou après le JSON.",
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.9,
      },
    });

    const textResult = response.text || "{}";
    const data = JSON.parse(textResult.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    return res.status(500).json({
      error: "Une erreur est survenue lors de l'analyse avec l'IA.",
      details: error.message || error
    });
  }
});

// Configure Vite middleware in development or static folder in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Arbitre-late] Server running on port ${PORT}`);
  });
}

startServer();

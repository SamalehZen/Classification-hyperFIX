
import { GoogleGenAI, Type } from "@google/genai";
import type { Product, ClassifiedProduct, ClassificationNode, GeminiResponse, ClassificationPath } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        secteur_code: { type: Type.STRING },
        secteur_name: { type: Type.STRING },
        rayon_code: { type: Type.STRING },
        rayon_name: { type: Type.STRING },
        famille_code: { type: Type.STRING },
        famille_name: { type: Type.STRING },
        sous_famille_code: { type: Type.STRING },
        sous_famille_name: { type: Type.STRING },
    },
    required: ["secteur_code", "secteur_name", "rayon_code", "rayon_name", "famille_code", "famille_name", "sous_famille_code", "sous_famille_name"]
};

const UNCLASSIFIED_CATEGORY = { code: "N/A", name: "NON CLASSIFIÉ" };
const UNCLASSIFIED_RESULT: ClassificationPath = {
    secteur: UNCLASSIFIED_CATEGORY,
    rayon: UNCLASSIFIED_CATEGORY,
    famille: UNCLASSIFIED_CATEGORY,
    sousFamille: UNCLASSIFIED_CATEGORY,
};


const buildPrompt = (productDescription: string, hierarchyText: string): string => {
    return `
    You are an expert product classifier for a supermarket. Your task is to classify a given product description into a predefined hierarchical structure.

    This is the complete classification hierarchy:
    --- HIERARCHY START ---
    ${hierarchyText}
    --- HIERARCHY END ---

    Rules:
    1. Analyze the product description: "${productDescription}".
    2. Find the most appropriate complete path from the hierarchy: Secteur > Rayon > Famille > Sous-famille.
    3. You MUST return the full path, including codes and names for all four levels.
    4. If no suitable classification can be found with high confidence, you MUST return "NON CLASSIFIÉ" for all names and "N/A" for all codes.
    5. Respond ONLY with the JSON object matching the provided schema. Do not add any extra text or explanations.
    `;
};

const getHierarchyAsText = (hierarchy: ClassificationNode[]): string => {
    const lines: string[] = [];
    const path: string[] = [];

    hierarchy.forEach(node => {
        // node.level: 1=Secteur, 2=Rayon, 3=Famille, 4=Sous-famille
        const indent = "  ".repeat(node.level - 1); // No indent for Secteur
        path[node.level - 1] = `${node.code} ${node.name}`;
        lines.push(`${indent}- ${path.slice(0, node.level).join(' > ')}`);
    });
    return lines.join('\n');
};


export const classifyProducts = async (products: Product[], hierarchy: ClassificationNode[]): Promise<ClassifiedProduct[]> => {
    const hierarchyText = getHierarchyAsText(hierarchy);
    const classifiedProducts: ClassifiedProduct[] = [];

    for (const product of products) {
        try {
            const prompt = buildPrompt(product.description, hierarchyText);
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                }
            });

            const jsonText = response.text.trim();
            const result = JSON.parse(jsonText) as GeminiResponse;
            
            classifiedProducts.push({
                description: product.description,
                classification: {
                    secteur: { code: result.secteur_code, name: result.secteur_name },
                    rayon: { code: result.rayon_code, name: result.rayon_name },
                    famille: { code: result.famille_code, name: result.famille_name },
                    sousFamille: { code: result.sous_famille_code, name: result.sous_famille_name },
                },
            });

        } catch (error) {
            console.error(`Failed to classify product: "${product.description}"`, error);
            classifiedProducts.push({
                description: product.description,
                classification: UNCLASSIFIED_RESULT,
            });
        }
    }

    return classifiedProducts;
};
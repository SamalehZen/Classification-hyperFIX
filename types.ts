
export interface Product {
    description: string;
}

export interface ClassificationNode {
    level: number;
    code: string;
    name: string;
    parentCode: string | null;
}

export interface ClassificationPath {
    secteur: { code: string; name: string };
    rayon: { code: string; name: string };
    famille: { code: string; name: string };
    sousFamille: { code: string; name: string };
}

export interface ClassifiedProduct extends Product {
    classification: ClassificationPath;
}

export interface GeminiResponse {
    secteur_code: string;
    secteur_name: string;
    rayon_code: string;
    rayon_name: string;
    famille_code: string;
    famille_name: string;
    sous_famille_code: string;
    sous_famille_name: string;
}

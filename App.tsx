
import React, { useState, useEffect, useCallback } from 'react';
import { FileUploader } from './components/FileUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Spinner } from './components/Spinner';
import { CLASSIFICATION_HIERARCHY } from './constants';
import { classifyProducts } from './services/geminiService';
import { parseHierarchy }from './utils/classificationParser';
import type { Product, ClassifiedProduct, ClassificationNode } from './types';

// Declare xlsx library from CDN
declare const XLSX: any;

const findDescriptionKey = (row: any): string | undefined => {
    const keys = Object.keys(row);
    const possibleNames = ['description', 'libellé', 'produit', 'article', 'designation'];
    
    // Prioritize partial matches from a list of common names
    for (const name of possibleNames) {
        const partialMatch = keys.find(k => k.toLowerCase().includes(name));
        if (partialMatch) return partialMatch;
    }
    
    // Fallback to the first column if no match is found
    if(keys.length > 0) {
      return keys[0];
    }

    return undefined;
};


export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [classifiedProducts, setClassifiedProducts] = useState<ClassifiedProduct[]>([]);
  const [hierarchy, setHierarchy] = useState<ClassificationNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    setHierarchy(parseHierarchy(CLASSIFICATION_HIERARCHY));
  }, []);

  const handleFileProcess = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setProducts([]);
    setClassifiedProducts([]);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const productsToClassify = json
          .map((row) => {
            const descriptionKey = findDescriptionKey(row);
            return descriptionKey ? { description: String(row[descriptionKey]) } : null;
          })
          .filter((p): p is Product => p !== null && p.description.trim() !== '');

        if (productsToClassify.length === 0) {
          throw new Error("No product descriptions found in the Excel file. Please ensure the file has a column with product descriptions.");
        }
        
        setProducts(productsToClassify);

        const results = await classifyProducts(productsToClassify, hierarchy);
        setClassifiedProducts(results);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An unknown error occurred during file processing.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setError("Failed to read the file.");
        setIsLoading(false);
    }
    reader.readAsBinaryString(file);
  };
  
  const handleDownload = useCallback(() => {
    if (classifiedProducts.length === 0) return;

    const dataToExport = classifiedProducts.map(p => ({
        'Description': p.description,
        'Secteur Code': p.classification.secteur.code,
        'Secteur Nom': p.classification.secteur.name,
        'Rayon Code': p.classification.rayon.code,
        'Rayon Nom': p.classification.rayon.name,
        'Famille Code': p.classification.famille.code,
        'Famille Nom': p.classification.famille.name,
        'Sous-Famille Code': p.classification.sousFamille.code,
        'Sous-Famille Nom': p.classification.sousFamille.name,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Classifications");
    XLSX.writeFile(workbook, `classified_${fileName}`);
  }, [classifiedProducts, fileName]);

  const resetState = () => {
    setProducts([]);
    setClassifiedProducts([]);
    setError(null);
    setIsLoading(false);
    setFileName('');
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
                ClassifyBot
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Upload an Excel file with product descriptions, and let AI provide a detailed hierarchical classification instantly.
            </p>
        </header>

        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200 dark:border-slate-700">
          {!isLoading && classifiedProducts.length === 0 && (
            <FileUploader onFileProcess={handleFileProcess} disabled={isLoading} />
          )}

          {isLoading && <Spinner />}

          {error && (
             <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg">
                <p className="font-semibold text-red-600 dark:text-red-400">An Error Occurred</p>
                <p className="mt-2 text-sm text-red-500 dark:text-red-400/80">{error}</p>
                 <button 
                    onClick={resetState} 
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm">
                    Try Again
                </button>
            </div>
          )}

          {!isLoading && classifiedProducts.length > 0 && (
            <ResultsDisplay 
              results={classifiedProducts} 
              onDownload={handleDownload}
              onReset={resetState}
              fileName={fileName}
            />
          )}
        </div>
        <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-400">
            <p>Powered by React, Tailwind CSS, and Google Gemini</p>
        </footer>
      </main>
    </div>
  );
}

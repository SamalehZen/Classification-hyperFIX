
import React from 'react';
import type { ClassifiedProduct } from '../types';

interface ResultsDisplayProps {
  results: ClassifiedProduct[];
  onDownload: () => void;
  onReset: () => void;
  fileName: string;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onDownload, onReset, fileName }) => {
  return (
    <div className="animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Classification Results</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Found and classified <span className="font-semibold text-blue-500">{results.length}</span> products from <span className="font-semibold italic">{fileName}</span>.
                </p>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <button
                    onClick={onReset}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 dark:bg-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                    <i className="fa-solid fa-arrow-left mr-2"></i>
                    New File
                </button>
                <button
                    onClick={onDownload}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                >
                    <i className="fa-solid fa-download mr-2"></i>
                    Download Excel
                </button>
            </div>
        </div>
      
      <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Product Description</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Secteur</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Rayon</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Famille</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Sous-Famille</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {results.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{item.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.classification.secteur.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.classification.rayon.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.classification.famille.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.classification.sousFamille.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

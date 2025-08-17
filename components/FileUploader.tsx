
import React, { useState, useCallback } from 'react';

interface FileUploaderProps {
  onFileProcess: (file: File) => void;
  disabled: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileProcess, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileProcess(file);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileProcess(file);
    }
  }, [onFileProcess]);

  const dropzoneClasses = `relative block w-full border-2 border-dashed rounded-lg p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600'}`;

  return (
    <div 
        onDragEnter={handleDragEnter} 
        onDragLeave={handleDragLeave} 
        onDragOver={handleDragOver} 
        onDrop={handleDrop}
    >
      <div className={dropzoneClasses}>
        <div className="flex flex-col items-center">
            <i className="fa-solid fa-file-excel text-5xl text-green-500 mb-4"></i>
            <span className="block text-slate-600 dark:text-slate-400 font-semibold">Drag and drop your Excel file here</span>
            <span className="my-2 text-slate-500 dark:text-slate-500">or</span>
            <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                <i className="fa-solid fa-upload mr-2"></i>
                <span>Choose a file</span>
            </label>
        </div>
        <input 
            id="file-upload" 
            name="file-upload" 
            type="file" 
            className="sr-only" 
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            disabled={disabled}
        />
      </div>
       <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
        Supported file types: .xlsx, .xls. Ensure your file contains a column named 'description'.
      </p>
    </div>
  );
};

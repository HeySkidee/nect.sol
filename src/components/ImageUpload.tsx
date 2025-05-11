'use client';

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon, ImageIcon, Upload, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";

interface ImageUploadProps {
  onChange: (url: string) => void;
  value: string;
  endpoint: "imageUploader";
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

function ImageUpload({ endpoint, onChange, value }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const uploadDropzoneRef = useRef<HTMLDivElement>(null);

  const resetUpload = () => {
    onChange("");
    setOriginalFileName("");
    setIsUploading(false);
    setUploadProgress(0);
    setCurrentFileName("");
  };

  const handleClick = () => {
    const input = uploadDropzoneRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  // Add client-side file size validation
  const validateFileSize = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      alert(`File is too large (${sizeMB}MB). Maximum size is 100MB.`);
      return false;
    }
    return true;
  };

  if (value) {
    return (
      <div className="flex flex-col gap-4">
        <div className="relative w-full">
          <div className="relative w-full max-h-[400px] overflow-hidden rounded-md">
            <img 
              src={value} 
              alt={originalFileName || 'Uploaded image'} 
              className="w-full h-full object-contain" 
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm truncate">
              {originalFileName || value.split('/').pop() || ''}
            </div>
          </div>
          <button
            type="button"
            onClick={resetUpload}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className="w-full space-y-4 bg-white border-[5px] border-black rounded-[22px] p-6">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading {currentFileName}...</span>
          </div>
          <span>{Math.round(uploadProgress)}%</span>
        </div>
        <Progress value={uploadProgress} className="h-1" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="hidden" ref={uploadDropzoneRef}>
        <UploadDropzone
          endpoint={endpoint}
          onUploadBegin={(fileName) => {
            setIsUploading(true);
            setCurrentFileName(fileName);    
            setOriginalFileName(fileName);
          }}
          onUploadProgress={(progress) => {
            setUploadProgress(progress);
          }}
          onClientUploadComplete={(res) => {
            setIsUploading(false);
            if (res?.[0]) {
              onChange(res[0].ufsUrl);
            }
          }}
          onUploadError={(error: Error) => {
            setIsUploading(false);
            console.error('Upload error:', error);
          }}
          config={{ 
            mode: "auto"
          }}
          appearance={{
            allowedContent: "Image files only",
          }}
          content={{
            allowedContent: "Images (.jpg, .jpeg, .png, .gif, .webp)",
          }}
        />
      </div>

      <div 
        onClick={handleClick}
        className="min-h-[300px] bg-white border-[5px] border-black rounded-[30px] p-8 flex flex-col items-center justify-center transition-all relative cursor-pointer hover:bg-gray-50"
      >
        <div className="size-24 rounded-full bg-[#EE2B69] flex items-center justify-center mb-5 mt-2">
          <Upload className="size-12 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-black mb-2">
          Drop your image here
        </h3>
        <p className="text-xl text-gray-600 mb-5">
          or click to browse from your computer
        </p>
        {/* <div className="flex gap-3 flex-wrap justify-center mb-8">
          <FileType icon={ImageIcon} text="Images" />
        </div> */}
      </div>
    </div>
  );
}

function FileType({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700">
      <Icon className="size-5" />
      <span className="font-medium">{text}</span>
    </div>
  );
}

export default ImageUpload; 
'use client';

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon, FileIcon, ImageIcon, VideoIcon, AudioWaveformIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { FileCategory, UploadType } from '@/types';

interface FileUploadProps {
  onChange: (url: string, fileType: string, fileName?: string) => void;
  value: string;
  endpoint: "mediaUploader";
  category?: FileCategory;
  uploadType?: UploadType;
  onBeginUpload?: () => void;
}

function FileUpload({ endpoint, onChange, value, category, uploadType = 'CENTRALIZED', onBeginUpload }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [originalFileName, setOriginalFileName] = useState<string>("");

  const resetUpload = () => {
    onChange("", "", "");
    setOriginalFileName("");
    setIsUploading(false);
    setUploadProgress(0);
    setCurrentFileName("");
  };

  const getFileType = (url: string) => {
    if (category === 'IMAGE') return 'image';
    if (url.startsWith('data:image')) return 'image';
    
    const extension = originalFileName 
      ? originalFileName.split('.').pop()?.toLowerCase()
      : url.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(extension || '')) return 'image';
    if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(extension || '')) return 'video';
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(extension || '')) return 'audio';
    return 'file';
  };

  const renderPreview = () => {
    const fileType = getFileType(value);
    const displayName = originalFileName || value.split('/').pop() || '';

    if (fileType === 'image') {
      return (
        <div className="relative w-full">
          <div className="relative w-full max-h-[400px] overflow-hidden rounded-md">
            <img 
              src={value} 
              alt={displayName} 
              className="w-full h-full object-contain" 
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm truncate">
              {displayName}
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
      );
    }

    return (
      <div className="flex items-center gap-3 p-4 rounded-lg border bg-gray-50 relative">
        <FileIcon className="h-8 w-8 text-gray-400" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">File uploaded</span>
          <span className="text-xs text-gray-500">{displayName}</span>
        </div>
        <button
          type="button"
          onClick={resetUpload}
          className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    );
  };

  if (value) {
    return (
      <div className="flex flex-col gap-4">
        {renderPreview()}
      </div>
    );
  }

  return (
    <div>
      <UploadDropzone
        endpoint={endpoint}
        onUploadBegin={(fileName) => {
          setIsUploading(true);
          setCurrentFileName(fileName);    
          setOriginalFileName(fileName);
          onBeginUpload?.();
        }}
        onUploadProgress={(progress) => {
          setUploadProgress(progress);
        }}
        onClientUploadComplete={(res) => {
          setIsUploading(false);
          if (res?.[0]) {
            const fileName = res[0].name;
            const fileType = fileName.split('.').pop() || '';
            onChange(res[0].url, fileType, fileName);
          }
        }}
        onUploadError={(error: Error) => {
          setIsUploading(false);
          console.error('Upload error:', error);
        }}
        appearance={{
          label: "text-sm text-gray-600",
          allowedContent: "text-xs text-gray-500",
          button: isUploading ? "hidden" : "ut-uploading:hidden ut-button:bg-blue-500 ut-button:hover:bg-blue-600",
        }}
        config={{ mode: "auto" }}
      />

      {isUploading && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading {currentFileName}...</span>
            </div>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1" />
        </div>
      )}
    </div>
  );
}

export default FileUpload; 
'use client';

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon, FileIcon, ImageIcon, VideoIcon, AudioWaveformIcon, Upload, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { FileCategory, UploadType } from '@/types';
import { CodeIcon, ArchiveIcon } from "lucide-react";

interface CreatePageFileUploadProps {
  onChange: (url: string, fileType: string, fileName?: string) => void;
  value: string;
  endpoint: "mediaUploader";
  category?: FileCategory;
  uploadType?: UploadType;
  onBeginUpload?: () => void;
  onUploadError?: (error: Error) => void;
  onClientUploadComplete?: () => void;
}

function CreatePageFileUpload({ endpoint, onChange, value, category, uploadType = 'CENTRALIZED', onBeginUpload, onUploadError, onClientUploadComplete }: CreatePageFileUploadProps) {
  // TODO: Implement decentralized file upload using IPFS/Arweave
  // - Add IPFS/Arweave SDK integration
  // - Implement file encryption before upload
  // - Store file metadata on-chain
  // - Add progress tracking for decentralized uploads
  // - Handle upload failures and retries
  // - Implement file verification after upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const uploadDropzoneRef = useRef<HTMLDivElement>(null);

  const resetUpload = () => {
    onChange("", "", "");
    setOriginalFileName("");
    setIsUploading(false);
    setUploadProgress(0);
    setCurrentFileName("");
  };

  const handleClick = () => {
    // Find and click the hidden input
    const input = uploadDropzoneRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      input.click();
    }
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
              onChange(res[0].ufsUrl, fileType, fileName);
              onClientUploadComplete?.();
            }
          }}
          onUploadError={(error: Error) => {
            setIsUploading(false);
            console.error('Upload error:', error);
            if (error.message.includes('FileSizeMismatch')) {
              onUploadError?.(new Error('File size limit is 100MB'));
            } else {
              onUploadError?.(error);
            }
          }}
          config={{ 
            mode: "auto",
            ...(category === 'IMAGE' ? {
              accept: {
                'image/png': ['.png'],
                'image/jpeg': ['.jpg', '.jpeg'],
                'image/gif': ['.gif'],
                'image/webp': ['.webp']
              }
            } : {})
          }}
        />
      </div>

      <div 
        onClick={handleClick}
        className="min-h-[300px] bg-white border-[5px] border-black rounded-[30px] p-8 flex flex-col items-center justify-center transition-all relative cursor-pointer hover:bg-gray-50"
      >
        <div className="size-24 rounded-full bg-[#EE2B69] flex items-center justify-center mb-6">
          <Upload className="size-12 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-black mb-2">
          Drop your {category === 'IMAGE' ? 'image' : 'files'} here
        </h3>
        <p className="text-xl text-gray-600 mb-6">
          or click to browse from your computer
        </p>
        <div className="flex gap-3 flex-wrap justify-center mb-8">
          {category === 'IMAGE' ? (
            <FileType icon={ImageIcon} text="Images" />
          ) : (
            <>
              <FileType icon={ImageIcon} text="Images" />
              <FileType icon={VideoIcon} text="Videos" />
              <FileType icon={AudioWaveformIcon} text="Audio" />
              <FileType icon={FileIcon} text="Documents" />
              <FileType icon={CodeIcon} text="Software" />
              <FileType icon={ArchiveIcon} text="Archives" />
            </>
          )}
        </div>
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

export default CreatePageFileUpload; 
import { FileIcon, ImageIcon, VideoIcon, AudioWaveformIcon, ArchiveIcon, CodeIcon, FileTextIcon, XIcon, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface DownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    downloadToken: string;
    fileName: string;
    fileType: string;
}

const CategoryIcons = {
    IMAGE: ImageIcon,
    VIDEO: VideoIcon,
    AUDIO: AudioWaveformIcon,
    DOCUMENT: FileTextIcon,
    SOFTWARE: CodeIcon,
    ARCHIVE: ArchiveIcon,
    OTHER: FileIcon,
};

export default function DownloadModal({ isOpen, onClose, downloadToken, fileName, fileType }: DownloadModalProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    if (!isOpen) return null;

    const IconComponent = CategoryIcons[fileType as keyof typeof CategoryIcons] || FileIcon;

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = `/api/download/stream/${downloadToken}`;
            link.download = fileName; // This might be overridden by Content-Disposition
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Show success state briefly before closing
            setIsComplete(true);
            setTimeout(() => {
                onClose();
                setIsDownloading(false);
                setIsComplete(false);
            }, 1500);
        } catch (error) {
            console.error('Download error:', error);
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[22px] border-[5px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-3xl mx-4">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-3xl font-bold">Your Purchase</h2>
                    <button 
                        onClick={onClose}
                        className="text-black hover:text-gray-700 transition-colors"
                        disabled={isDownloading}
                    >
                        <XIcon className="w-6 h-6 cursor-pointer" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-gradient-to-br from-[#f7fa3e] to-[#dbfa51] p-8 rounded-2xl">
                            <IconComponent className="w-24 h-24 text-black/80" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h3 className="text-3xl font-bold mb-6">{fileName}</h3>
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
                            <p className="text-red-600 font-medium text-2xl">
                                ⚠️ This is a one-time download link. 
                                <br />
                                Save the file after downloading.
                            </p>
                        </div>
                        <p className="text-gray-600 text-lg">
                            Your file will be downloaded automatically when you click the button below.
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading || isComplete}
                            className={`relative w-full py-4 rounded-lg text-xl font-bold transition-all duration-300 ${
                                isComplete 
                                    ? 'bg-[#3ffd7e] text-black cursor-default'
                                    : isDownloading
                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        : 'bg-black text-white hover:bg-fuchsia-300 hover:text-black cursor-pointer'
                            }`}
                        >
                            <span className={`flex items-center justify-center gap-2 ${isComplete ? 'text-black' : ''}`}>
                                {isComplete ? (
                                    <>
                                        <CheckCircle2 className="w-6 h-6" />
                                        Download Complete
                                    </>
                                ) : isDownloading ? (
                                    <>
                                        <div className="w-6 h-6 border-3 border-t-gray-600 border-gray-400 rounded-full animate-spin" />
                                        Downloading...
                                    </>
                                ) : (
                                    'Download File'
                                )}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 
import { FileIcon, ImageIcon, VideoIcon, AudioWaveformIcon, ArchiveIcon, CodeIcon, FileTextIcon, XIcon } from 'lucide-react';
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

            // Give a small delay before closing the modal
            setTimeout(() => {
                onClose();
                setIsDownloading(false);
            }, 1000);
        } catch (error) {
            console.error('Download error:', error);
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">Download Your Purchase</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={isDownloading}
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center justify-center py-6">
                    <IconComponent className="w-16 h-16 text-blue-500" />
                </div>

                <div className="text-center mb-6">
                    <h3 className="font-medium text-lg mb-2">{fileName}</h3>
                    <p className="text-red-500 text-sm mb-4">
                        ⚠️ This is a one-time download link. It will expire after use.
                    </p>
                    <p className="text-gray-600 text-sm">
                        Make sure to save the file in a secure location after downloading.
                    </p>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
                    >
                        {isDownloading ? 'Downloading...' : 'Download File'}
                    </button>
                </div>
            </div>
        </div>
    );
} 
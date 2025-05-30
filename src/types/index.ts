export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sales: number;
  revenue: number;
  releaseDate: string;
  imageUrl?: string;
  isPublic: boolean;
  fileType?: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  category: string;
  bannerUrl?: string;
}

export interface AnalyticsData {
  revenue: {
    total: number;
    today: number;
  };
  sales: {
    total: number;
    today: number;
  };
  products: {
    total: number;
    topSelling: Product[];
    allProducts: Product[];
  };
  customers: {
    total: number;
    returning: number;
  };
  downloads: {
    total: number;
    pending: number;
  };
}

export type UploadType = 'CENTRALIZED' | 'DECENTRALIZED';
export type Visibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
export type FileCategory = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'SOFTWARE' | 'ARCHIVE' | 'OTHER';

export interface CreateProductFormData {
  name: string;
  description: string;
  price: string;
  isUnlimitedStock: boolean;
  stockQuantity: number | null;
  fileType: string;
  category: FileCategory;
  visibility: Visibility;
  oneTimeDownload: boolean;
  uploadType: UploadType;
  fileUrl: string;
  bannerUrl: string;
} 
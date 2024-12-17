export interface BusinessInfo {
  name: string;
  type: string;
  country: string;
  description: string;
}

export type ContentType = 
  | 'Listicle'
  | 'Product reviews'
  | 'Informational'
  | 'History of'
  | "Pro's and Con's"
  | 'Comparisons'
  | 'How to\'s'
  | 'Versus'
  | 'Best for articles'
  | 'Brand roundup';

export interface GeneratorState {
  websiteUrl: string;
  selectedUrls: string[];
  mainKeyword: string;
  research: string;
  businessInfo: BusinessInfo;
  contentType: string;
  toneOfVoice: string;
  currentStep: 'website' | 'keyword' | 'business' | 'tone' | 'content';
  generatedContent?: string;
}
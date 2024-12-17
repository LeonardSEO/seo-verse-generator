export interface BusinessInfo {
  name: string;
  type: string;
  country: string;
  description: string;
}

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
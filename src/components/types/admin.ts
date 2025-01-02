export interface Model {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isFree: boolean;
}

export interface SystemPrompts {
  keywordResearch: string;
  toneAnalysis: string;
  contentGeneration: string;
}

export interface Settings {
  models: Model[];
  systemPrompts: SystemPrompts;
  defaultFreeModel: string;
  defaultPremiumModel: string;
}
export interface Model {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isFree: boolean;
}

export interface Settings {
  models: Model[];
  defaultFreeModel: string;
  defaultPremiumModel: string;
}
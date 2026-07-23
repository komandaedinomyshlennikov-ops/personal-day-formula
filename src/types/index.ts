// Типы данных для Астронавигатора

export interface UserData {
  birthDate: string; // YYYY-MM-DD
  subscriptionEndDate: string | null;
  isTrialActive: boolean;
  theme: 'light' | 'dark' | 'auto';
  highContrast: boolean;
  notificationsEnabled: boolean;
  language: Language;
  activatedPlan?: string;
  activationCode?: string;
}

export type Language = 'ru' | 'en' | 'es' | 'de' | 'fr' | 'pt' | 'it' | 'hi' | 'zh' | 'ja' | 'ar';
export type LanguageCode = Language;

export interface EnergyInfo {
  number: number;
  planet: string;
  name: string;
  description: string;
  positive: string[];
  negative: string[];
  warnings: string[];
  icon: string;
  color: string;
}

export interface DayInfo {
  date: Date;
  generalNumber: number;
  personalNumber: number;
  generalPlanet: string;
  personalPlanet: string;
  isFavorable: boolean;
  isNeutral: boolean;
  isUnfavorable: boolean;
}

export interface MonthInfo {
  year: number;
  month: number;
  generalMonthNumber: number;
  personalMonthNumber: number;
  days: DayInfo[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  popular?: boolean;
}

export interface Note {
  id: string;
  date: string;
  text: string;
  aiRecommendation?: string;
}

export type ViewState =
  | 'onboarding'
  | 'landing'
  | 'calendar'
  | 'day-detail'
  | 'subscription'
  | 'activation'
  | 'month-year-detail'
  | 'notes'
  | 'ai-notes' // legacy alias
  | 'share'
  | 'settings'
  | 'privacy'
  | 'terms';

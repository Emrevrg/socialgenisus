export enum Platform {
  LINKEDIN = 'LinkedIn',
  TWITTER = 'Twitter/X',
  INSTAGRAM = 'Instagram'
}

export enum Tone {
  PROFESSIONAL = 'Professional',
  WITTY = 'Witty',
  URGENT = 'Urgent',
  INSPIRATIONAL = 'Inspirational',
  CASUAL = 'Casual'
}

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K'
}

export enum AspectRatio {
  AUTO = 'Auto',
  RATIO_1_1 = '1:1',
  RATIO_3_4 = '3:4',
  RATIO_4_3 = '4:3',
  RATIO_9_16 = '9:16',
  RATIO_16_9 = '16:9',
  RATIO_2_3 = '2:3',
  RATIO_3_2 = '3:2',
  RATIO_21_9 = '21:9'
}

export interface GeneratedContent {
  platform: Platform;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
  isImageLoading: boolean;
}

export interface GenerationResult {
  linkedin: GeneratedContent;
  twitter: GeneratedContent;
  instagram: GeneratedContent;
}

// Helper type for the JSON response from the text model
export interface TextModelResponse {
  linkedin: { content: string; imagePrompt: string };
  twitter: { content: string; imagePrompt: string };
  instagram: { content: string; imagePrompt: string };
}

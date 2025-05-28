export interface ContentFile {
  file: File
  name: string
  size: number
  type: string
  preview: string | null
}

export interface ContentMetadata {
  title: string
  description?: string
  type: string
  author?: string
  language: string
  category?: string
  tags: string[]
}

export interface AiProcessingOptions {
  generateSummary: boolean
  createTranscription: boolean
  enableAiCategorization: boolean
  extractAudio: boolean
  createThumbnail: boolean
}

export interface ContentSummary {
  id: string
  title: string
  type: string
  status: string
  created_at: string
  updated_at: string
}

export interface UploadResult {
  success: boolean
  contentId?: string
  error?: string
}

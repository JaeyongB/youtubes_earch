export interface VideoSearchResult {
  videoId: string
  title: string
  description: string
  thumbnailUrl: string
  publishedAt: string
  channelId: string
  channelTitle: string
  channelLink: string
  views: number
  likes: number
  channelSubscribers: number
  channelVideoCount: number
  tags: string[]
  durationSeconds?: number
}

export interface ChannelDetail {
  channelId: string
  title: string
  description: string
  customUrl?: string
  subscribers: number
  videoCount: number
  viewCount: number
  country?: string
  publishedAt: string
  thumbnails: {
    default?: string
    medium?: string
    high?: string
  }
  email?: string
}

export interface ChannelInsights {
  topVideos: Array<{
    id: string
    title: string
    thumbnailUrl: string
    viewCount: number
  }>
  featuredVideos: Array<{
    id: string
    title: string
    thumbnailUrl: string
    description: string
    viewCount: number
  }>
  contactEmail?: string
}

export type VideoDurationFilter = 'any' | 'short' | 'long'



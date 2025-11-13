import axios, { AxiosError } from 'axios'
import type {
  ChannelDetail,
  ChannelInsights,
  VideoDurationFilter,
  VideoSearchResult,
} from '../types/youtube'

const BASE_URL = 'https://www.googleapis.com/youtube/v3'

const youtubeClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept-Encoding': 'gzip',
  },
  timeout: 15_000,
})

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const CACHE_TTL_MS = 1000 * 60 * 5

const searchCache = new Map<string, CacheEntry<VideoSearchResult[]>>()
const channelDetailCache = new Map<string, CacheEntry<ChannelDetail>>()
const channelInsightsCache = new Map<string, CacheEntry<ChannelInsights>>()

function getCacheValue<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.value
}

function setCacheValue<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })
}

function createCacheKey(prefix: string, payload: Record<string, unknown>) {
  const sanitizedPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null),
  )
  return `${prefix}:${JSON.stringify(sanitizedPayload)}`
}

const DURATION_FILTER: Record<VideoDurationFilter, string | undefined> = {
  any: undefined,
  short: 'short',
  long: 'long',
}

interface YouTubeThumbnail {
  url: string
  width?: number
  height?: number
}

interface YouTubeThumbnails {
  default?: YouTubeThumbnail
  medium?: YouTubeThumbnail
  high?: YouTubeThumbnail
  standard?: YouTubeThumbnail
  maxres?: YouTubeThumbnail
}

interface YouTubeSearchItem {
  id: {
    videoId: string
  }
  snippet: {
    title: string
    description: string
    channelId: string
    channelTitle: string
    publishedAt: string
    thumbnails: YouTubeThumbnails
    tags?: string[]
  }
}

interface YouTubeVideo {
  id: string
  snippet: {
    title: string
    description: string
    channelId: string
    channelTitle: string
    publishedAt: string
    thumbnails: YouTubeThumbnails
    tags?: string[]
  }
  statistics?: {
    viewCount?: string
    likeCount?: string
  }
  contentDetails?: {
    duration?: string
    dimension?: string
    definition?: string
  }
}

interface YouTubeChannel {
  id: string
  snippet: {
    title: string
    description: string
    customUrl?: string
    country?: string
    publishedAt: string
    thumbnails: YouTubeThumbnails
  }
  statistics?: {
    subscriberCount?: string
    videoCount?: string
    viewCount?: string
  }
  brandingSettings?: {
    channel?: {
      description?: string
      keywords?: string
    }
  }
}

interface SearchResponse {
  items: YouTubeSearchItem[]
  nextPageToken?: string
}

interface VideosResponse {
  items: YouTubeVideo[]
}

interface ChannelsResponse {
  items: YouTubeChannel[]
}

interface YouTubeErrorResponse {
  error?: {
    message?: string
  }
}

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i

function extractEmailFromText(text?: string | null): string | undefined {
  if (!text) return undefined
  const match = text.match(EMAIL_REGEX)
  return match?.[0]
}

function ensureThumbnailUrl(thumbnails?: YouTubeThumbnails): string {
  return (
    thumbnails?.maxres?.url ||
    thumbnails?.standard?.url ||
    thumbnails?.high?.url ||
    thumbnails?.medium?.url ||
    thumbnails?.default?.url ||
    ''
  )
}

function getThumbnailDimensions(
  thumbnails?: YouTubeThumbnails,
): { width: number; height: number } | null {
  const candidates = [
    thumbnails?.maxres,
    thumbnails?.standard,
    thumbnails?.high,
    thumbnails?.medium,
    thumbnails?.default,
  ]
  for (const candidate of candidates) {
    if (candidate?.width && candidate?.height) {
      return { width: candidate.width, height: candidate.height }
    }
  }
  return null
}

function parseISODurationToSeconds(duration?: string): number | undefined {
  if (!duration) return undefined
  const match = duration.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/,
  )
  if (!match) return undefined
  const hours = Number(match[1] ?? 0)
  const minutes = Number(match[2] ?? 0)
  const seconds = Number(match[3] ?? 0)
  return hours * 3600 + minutes * 60 + seconds
}

function isVerticalShort(
  durationSeconds: number | undefined,
  thumbnails?: YouTubeThumbnails,
  tags?: string[],
): boolean {
  if (typeof durationSeconds !== 'number') return false
  // YouTube Shorts: 최대 60초 (공식), 하지만 검색 결과에서는 더 관대하게 처리 (최대 600초)
  // 왜냐하면 API 응답에서 정확한 지속 시간이 항상 반영되지 않을 수 있기 때문
  if (durationSeconds > 600) return false

  const dims = getThumbnailDimensions(thumbnails)
  if (dims) {
    const ratio = dims.width / dims.height
    if (!Number.isFinite(ratio) || ratio === 0) return false
    // 9:16 (0.5625) 세로 종횡비 확인
    const target = 9 / 16
    // ±15% 오차 허용 (더 관대한 범위)
    if (Math.abs(ratio - target) <= 0.15) {
      return true
    }
    // 매우 세로형 영상 (width < 75% of height)
    if (ratio < 0.75) {
      return true
    }
  }

  // "shorts", "short video", "vertical" 등의 태그 확인
  if (tags && tags.some((tag) => {
    const lowerTag = tag.toLowerCase()
    return lowerTag.includes('short') || lowerTag.includes('vertical')
  })) {
    return true
  }

  return false
}

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const result: T[][] = []
  for (let index = 0; index < items.length; index += chunkSize) {
    result.push(items.slice(index, index + chunkSize))
  }
  return result
}

function createApiError(error: unknown, fallbackMessage: string): Error {
  if (axios.isAxiosError<YouTubeErrorResponse>(error)) {
    const axiosError = error as AxiosError<YouTubeErrorResponse>

    if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {
      return new Error('YouTube API에 연결하지 못했습니다. 인터넷 연결 또는 VPN 상태를 확인해주세요.')
    }

    const status = axiosError.response?.status
    const apiMessage = axiosError.response?.data?.error?.message

    if (apiMessage?.toLowerCase().includes('requests to this api youtube method')) {
      return new Error(
        '현재 프로젝트에서 YouTube Data API v3 사용이 차단되었습니다. Google Cloud Console에서 해당 API를 활성화하고, API 키에 적용된 애플리케이션/도메인 제한을 확인한 뒤 다시 시도해주세요.',
      )
    }

    if (status === 401) {
      return new Error('API 키가 올바르지 않습니다. 키 값을 확인한 뒤 다시 시도해주세요.')
    }

    if (status === 403) {
      return new Error(
        apiMessage || 'YouTube API 할당량을 초과했습니다. 잠시 후 다시 시도하거나 다른 키를 사용해주세요.',
      )
    }

    if (status === 404) {
      return new Error('요청한 데이터를 찾을 수 없습니다.')
    }

    return new Error(apiMessage || fallbackMessage)
  }

  return error instanceof Error ? error : new Error(fallbackMessage)
}

export interface SearchParams {
  query: string
  apiKey: string
  duration?: VideoDurationFilter
  maxResults?: number
  year?: number
  regionCode?: 'US' | 'JP' | 'ES'
}

export async function searchVideos({
  query,
  apiKey,
  duration = 'any',
  maxResults = 20,
  year,
  regionCode,
}: SearchParams): Promise<VideoSearchResult[]> {
  const trimmedApiKey = apiKey.trim()
  if (!trimmedApiKey) {
    throw new Error('YouTube API 키를 입력해주세요.')
  }

  const sanitizedResultCount = Math.min(Math.max(Math.floor(maxResults), 1), 100)

  const sanitizedYear = typeof year === 'number' && Number.isFinite(year) ? year : undefined
  const publishedAfter = sanitizedYear
    ? new Date(Date.UTC(sanitizedYear, 0, 1, 0, 0, 0)).toISOString()
    : undefined
  const publishedBefore = sanitizedYear
    ? new Date(Date.UTC(sanitizedYear, 11, 31, 23, 59, 59)).toISOString()
    : undefined

  const cacheKey = createCacheKey('search', {
    query,
    duration,
    maxResults: sanitizedResultCount,
    publishedAfter,
    publishedBefore,
    regionCode,
  })

  const cached = getCacheValue(searchCache, cacheKey)
  if (cached) {
    return cached
  }

  try {
    const searchItems: YouTubeSearchItem[] = []
    let nextPageToken: string | undefined

    while (searchItems.length < sanitizedResultCount) {
      const remaining = sanitizedResultCount - searchItems.length
      const requestCount = Math.min(remaining, 50)

      // Shorts 검색에서는 YouTube API의 videoDuration 필터를 사용하지 않음
      // (API의 'short' 필터는 YouTube Shorts를 감지하지 않기 때문)
      // 대신 isVerticalShort() 함수로 필터링함
      const videoDurationParam = duration === 'short' ? undefined : DURATION_FILTER[duration]

      const { data } = await youtubeClient.get<SearchResponse>('/search', {
        params: {
          key: trimmedApiKey,
          q: query,
          part: 'snippet',
          type: 'video',
          maxResults: requestCount,
          videoDuration: videoDurationParam,
          pageToken: nextPageToken,
          publishedAfter,
          publishedBefore,
          regionCode,
        },
      })

      searchItems.push(...(data.items || []))
      nextPageToken = data.nextPageToken

      if (!nextPageToken) {
        break
      }
    }

    if (searchItems.length === 0) {
      return []
    }

    const limitedSearchItems = searchItems.slice(0, sanitizedResultCount)

    const videoIds = limitedSearchItems
      .map((item) => item.id.videoId)
      .filter((id): id is string => Boolean(id))

    if (videoIds.length === 0) {
      return []
    }

    const videoChunks = chunkArray(videoIds, 50)
    const videoResponses = await Promise.all(
      videoChunks.map((ids) =>
        youtubeClient.get<VideosResponse>('/videos', {
          params: {
            key: trimmedApiKey,
            id: ids.join(','),
            part: 'snippet,statistics,contentDetails',
          },
        }),
      ),
    )

    const videoItems = videoResponses.flatMap((response) => response.data.items || [])
    const videoMap = new Map(videoItems.map((video) => [video.id, video] as const))

    const channelIds = Array.from(
      new Set(
        videoItems.map((video) => video.snippet.channelId).filter((id): id is string => Boolean(id)),
      ),
    )

    let channelMap = new Map<string, YouTubeChannel>()

    if (channelIds.length > 0) {
      const channelChunks = chunkArray(channelIds, 50)
      const channelResponses = await Promise.all(
        channelChunks.map((ids) =>
          youtubeClient.get<ChannelsResponse>('/channels', {
            params: {
              key: trimmedApiKey,
              id: ids.join(','),
              part: 'snippet,statistics,brandingSettings',
            },
          }),
        ),
      )

      channelMap = new Map(
        channelResponses.flatMap((response) =>
          (response.data.items || []).map((channel) => [channel.id, channel] as const),
        ),
      )
    }

    const results: VideoSearchResult[] = []
    const isShortQuery = duration === 'short'

    limitedSearchItems.forEach((item) => {
      const video = videoMap.get(item.id.videoId)
      if (!video) {
        return
      }

      const channel = channelMap.get(video.snippet.channelId)
      const thumbnailUrl =
        ensureThumbnailUrl(video.snippet.thumbnails) ||
        ensureThumbnailUrl(item.snippet.thumbnails)

      const durationSeconds = parseISODurationToSeconds(video.contentDetails?.duration)

      if (isShortQuery) {
        const combinedTags = [
          ...(video.snippet.tags ?? []),
          ...(item.snippet.tags ?? []),
        ]
        if (!isVerticalShort(durationSeconds, video.snippet.thumbnails, combinedTags)) {
          return
        }
      }

      results.push({
        videoId: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnailUrl,
        publishedAt: video.snippet.publishedAt,
        channelId: video.snippet.channelId,
        channelTitle: video.snippet.channelTitle,
        channelLink: `https://www.youtube.com/channel/${video.snippet.channelId}`,
        views: Number(video.statistics?.viewCount ?? 0),
        likes: Number(video.statistics?.likeCount ?? 0),
        channelSubscribers: Number(channel?.statistics?.subscriberCount ?? 0),
        channelVideoCount: Number(channel?.statistics?.videoCount ?? 0),
        tags: video.snippet.tags ?? item.snippet.tags ?? [],
        durationSeconds,
      })
    })

    setCacheValue(searchCache, cacheKey, results)
    return results
  } catch (error) {
    throw createApiError(error, '동영상 검색 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
  }
}

export async function fetchChannelDetail(
  channelId: string,
  apiKey: string,
): Promise<ChannelDetail> {
  const trimmedApiKey = apiKey.trim()
  if (!trimmedApiKey) {
    throw new Error('YouTube API 키를 입력해주세요.')
  }

  const cacheKey = createCacheKey('channel-detail', { channelId })
  const cached = getCacheValue(channelDetailCache, cacheKey)
  if (cached) {
    return cached
  }

  try {
    const { data } = await youtubeClient.get<ChannelsResponse>('/channels', {
      params: {
        key: trimmedApiKey,
        id: channelId,
        part: 'snippet,statistics,brandingSettings',
      },
    })

    const channel = data.items?.[0]
    if (!channel) {
      throw new Error('채널 정보를 찾을 수 없습니다.')
    }

    const emailSources = [
      channel.snippet.description,
      channel.brandingSettings?.channel?.description,
      channel.brandingSettings?.channel?.keywords,
    ]

    const email = emailSources.reduce<string | undefined>((found, source) => {
      return found ?? extractEmailFromText(source)
    }, undefined)

    const detail: ChannelDetail = {
      channelId: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      customUrl: channel.snippet.customUrl,
      subscribers: Number(channel.statistics?.subscriberCount ?? 0),
      videoCount: Number(channel.statistics?.videoCount ?? 0),
      viewCount: Number(channel.statistics?.viewCount ?? 0),
      country: channel.snippet.country,
      publishedAt: channel.snippet.publishedAt,
      thumbnails: {
        default: channel.snippet.thumbnails.default?.url,
        medium: channel.snippet.thumbnails.medium?.url,
        high: channel.snippet.thumbnails.high?.url,
      },
      email,
    }
    setCacheValue(channelDetailCache, cacheKey, detail)
    return detail
  } catch (error) {
    throw createApiError(error, '채널 정보를 불러오는 중 문제가 발생했습니다.')
  }
}

export async function fetchChannelInsights(
  channelId: string,
  apiKey: string,
): Promise<ChannelInsights> {
  const trimmedApiKey = apiKey.trim()
  if (!trimmedApiKey) {
    throw new Error('YouTube API 키를 입력해주세요.')
  }

  const cacheKey = createCacheKey('channel-insights', { channelId })
  const cached = getCacheValue(channelInsightsCache, cacheKey)
  if (cached) {
    return cached
  }

  try {
    const searchResponse = await youtubeClient.get<SearchResponse>('/search', {
      params: {
        key: trimmedApiKey,
        channelId,
        part: 'snippet',
        order: 'viewCount',
        maxResults: 5,
        type: 'video',
      },
    })

    const searchItems = searchResponse.data.items || []
    const videoIds = searchItems
      .map((item) => item.id.videoId)
      .filter((id): id is string => Boolean(id))

    if (videoIds.length === 0) {
      return {
        topVideos: [],
        featuredVideos: [],
        contactEmail: undefined,
      }
    }

    const videosResponse = await youtubeClient.get<VideosResponse>('/videos', {
      params: {
        key: trimmedApiKey,
        id: videoIds.join(','),
        part: 'snippet,statistics',
      },
    })

    const videoMap = new Map<string, YouTubeVideo>(
      (videosResponse.data.items || []).map((video) => [video.id, video] as const),
    )

    const topVideos = searchItems.map((item) => {
      const detail = videoMap.get(item.id.videoId)
      const thumbnails = detail?.snippet.thumbnails ?? item.snippet.thumbnails

      return {
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnailUrl: ensureThumbnailUrl(thumbnails),
        viewCount: Number(detail?.statistics?.viewCount ?? 0),
      }
    })

    const featuredVideos = topVideos.slice(0, 3).map((video) => {
      const detail = videoMap.get(video.id)
      return {
        id: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        description: detail?.snippet.description ?? '',
        viewCount: video.viewCount,
      }
    })

    const contactEmail = searchItems
      .map((item) => extractEmailFromText(item.snippet.description))
      .find((value): value is string => Boolean(value))

    const insights: ChannelInsights = {
      topVideos,
      featuredVideos,
      contactEmail,
    }
    setCacheValue(channelInsightsCache, cacheKey, insights)
    return insights
  } catch (error) {
    throw createApiError(error, '채널 데이터를 분석하는 중 문제가 발생했습니다.')
  }
}


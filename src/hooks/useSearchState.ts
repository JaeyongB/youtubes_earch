import { useCallback, useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { searchVideos } from '../services/youtubeApi'
import type { VideoDurationFilter, VideoSearchResult } from '../types/youtube'
import { useDebounce } from './useDebounce'

export type SortField = 'title' | 'views' | 'likes' | 'channelSubscribers'
export type SortOrder = 'asc' | 'desc'

const API_KEY_STORAGE_KEY = 'youtube-search-api-key'

interface UseSearchStateReturn {
  keyword: string
  setKeyword: (value: string) => void
  apiKey: string
  duration: VideoDurationFilter
  setDuration: (value: VideoDurationFilter) => void
  maxResults: number
  setMaxResults: (value: number) => void
  year: number
  handleYearInputChange: (value: number) => void
  regionCode: 'US' | 'JP' | 'ES' | 'ALL'
  setRegionCode: (value: 'US' | 'JP' | 'ES' | 'ALL') => void
  ratioThreshold: number
  setRatioThreshold: (value: number) => void
  sortField: SortField | null
  sortOrder: SortOrder
  handleSort: (field: SortField, order: SortOrder) => void
  handleSortReset: () => void
  displayedVideos: VideoSearchResult[]
  isLoading: boolean
  error: string | null
  setError: (value: string | null) => void
  canSearch: boolean
  handleSearch: () => Promise<void>
  handleExportExcel: () => void
  openApiKeyModal: (message?: string) => void
  isApiModalOpen: boolean
  apiModalMessage: string | null
  handleApiKeySave: (value: string) => void
  handleApiKeyClear: () => void
  closeApiModal: () => void
  hasPersistedApiKey: boolean
}

export function useSearchState(): UseSearchStateReturn {
  const [keyword, setKeyword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [duration, setDuration] = useState<VideoDurationFilter>('any')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videos, setVideos] = useState<VideoSearchResult[]>([])
  const [maxResults, setMaxResults] = useState(20)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [ratioThreshold, setRatioThreshold] = useState(0)
  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const [year, setYear] = useState(currentYear)
  const [regionCode, setRegionCode] = useState<'US' | 'JP' | 'ES' | 'ALL'>('ALL')
  const [isApiModalOpen, setIsApiModalOpen] = useState(true)
  const [apiModalMessage, setApiModalMessage] = useState<string | null>(null)
  const [hasPersistedApiKey, setHasPersistedApiKey] = useState(false)

  const debouncedKeyword = useDebounce(keyword, 300)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(API_KEY_STORAGE_KEY)
      if (stored) {
        setApiKey(stored)
        setHasPersistedApiKey(true)
        setIsApiModalOpen(false)
      }
    } catch (error) {
      console.warn('API 키를 불러오는 중 문제가 발생했습니다.', error)
    }
  }, [])

  const openApiKeyModal = useCallback((message?: string) => {
    setApiModalMessage(message ?? null)
    setIsApiModalOpen(true)
  }, [])

  const closeApiModal = useCallback(() => {
    setIsApiModalOpen(false)
    setApiModalMessage(null)
  }, [])

  const handleApiKeySave = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      setApiKey(trimmed)
      if (!trimmed) {
        setHasPersistedApiKey(false)
      } else if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(API_KEY_STORAGE_KEY, trimmed)
          setHasPersistedApiKey(true)
        } catch (error) {
          console.warn('API 키를 저장하는 중 문제가 발생했습니다.', error)
        }
      }
      closeApiModal()
    },
    [closeApiModal],
  )

  const handleApiKeyClear = useCallback(() => {
    setApiKey('')
    setHasPersistedApiKey(false)
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(API_KEY_STORAGE_KEY)
      } catch (error) {
        console.warn('API 키를 삭제하는 중 문제가 발생했습니다.', error)
      }
    }
    openApiKeyModal('YouTube API 키를 입력해주세요.')
  }, [openApiKeyModal])

  const handleYearInputChange = useCallback(
    (value: number) => {
      if (!Number.isFinite(value)) {
        setYear(currentYear)
        return
      }
      const clamped = Math.min(Math.max(Math.floor(value), 2005), currentYear)
      setYear(clamped)
    },
    [currentYear],
  )

  const handleSort = useCallback((field: SortField, order: SortOrder) => {
    setSortField(field)
    setSortOrder(order)
  }, [])

  const handleSortReset = useCallback(() => {
    setSortField(null)
    setSortOrder('desc')
  }, [])

  const handleSearch = useCallback(async () => {
    if (!debouncedKeyword.trim()) {
      setError('검색어를 입력해주세요.')
      return
    }

    if (!apiKey.trim()) {
      setError(null)
      openApiKeyModal('YouTube API 키를 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const results = await searchVideos({
        query: debouncedKeyword,
        apiKey,
        duration,
        maxResults,
        year,
        regionCode: regionCode === 'ALL' ? undefined : regionCode,
      })
      setVideos(results)
    } catch (err) {
      console.error(err)
      const message =
        err instanceof Error ? err.message : '검색 중 알 수 없는 오류가 발생했습니다.'
      setError(message)
      if (
        err instanceof Error &&
        (err.message.includes('API 키') ||
          err.message.includes('할당량') ||
          err.message.toLowerCase().includes('quota'))
      ) {
        openApiKeyModal(message)
      }
    } finally {
      setIsLoading(false)
    }
  }, [
    apiKey,
    debouncedKeyword,
    duration,
    maxResults,
    openApiKeyModal,
    regionCode,
    year,
  ])

  useEffect(() => {
    if (!apiKey.trim()) {
      setIsApiModalOpen(true)
    }
  }, [apiKey])

  const displayedVideos = useMemo(() => {
    const filtered = videos.filter((video) => {
      if (ratioThreshold === 0) return true
      const subscribers = video.channelSubscribers
      const ratio =
        subscribers > 0 ? video.views / subscribers : Number.POSITIVE_INFINITY
      return ratio >= ratioThreshold
    })

    if (!sortField) return filtered

    const sorted = [...filtered]
    sorted.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title, 'ko')
          break
        case 'views':
          comparison = a.views - b.views
          break
        case 'likes':
          comparison = a.likes - b.likes
          break
        case 'channelSubscribers':
          comparison = a.channelSubscribers - b.channelSubscribers
          break
        default:
          comparison = 0
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [videos, sortField, sortOrder, ratioThreshold])

  const canSearch = useMemo(
    () => Boolean(debouncedKeyword.trim()) && Boolean(apiKey.trim()),
    [debouncedKeyword, apiKey],
  )

  const handleExportExcel = useCallback(() => {
    if (displayedVideos.length === 0) {
      setError('내보낼 검색 결과가 없습니다.')
      return
    }

    const worksheetData = displayedVideos.map((video) => ({
      제목: video.title,
      '채널 명': video.channelTitle,
      '영상 링크': `https://www.youtube.com/watch?v=${video.videoId}`,
      조회수: video.views,
      좋아요: video.likes,
      구독자: video.channelSubscribers,
      '총 영상수': video.channelVideoCount,
      게시일: video.publishedAt,
      태그: video.tags.join(', '),
    }))

    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'YouTube 검색 결과')
    const date = new Date().toISOString().split('T')[0]
    XLSX.writeFile(workbook, `youtube-search-results-${date}.xlsx`)
  }, [displayedVideos, setError])

  return {
    keyword,
    setKeyword,
    apiKey,
    duration,
    setDuration,
    maxResults,
    setMaxResults,
    year,
    handleYearInputChange,
    regionCode,
    setRegionCode,
    ratioThreshold,
    setRatioThreshold,
    sortField,
    sortOrder,
    handleSort,
    handleSortReset,
    displayedVideos,
    isLoading,
    error,
    setError,
    canSearch,
    handleSearch,
    handleExportExcel,
    openApiKeyModal,
    isApiModalOpen,
    apiModalMessage,
    handleApiKeySave,
    handleApiKeyClear,
    closeApiModal,
    hasPersistedApiKey,
  }
}


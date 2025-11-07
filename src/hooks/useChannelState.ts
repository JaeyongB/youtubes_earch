import { useCallback, useState } from 'react'
import { fetchChannelDetail, fetchChannelInsights } from '../services/youtubeApi'
import type { ChannelDetail, ChannelInsights } from '../types/youtube'

interface UseChannelStateOptions {
  onError: (message: string | null) => void
  onRequireApiKey: (message: string) => void
}

interface UseChannelStateReturn {
  channelDetail: ChannelDetail | null
  channelInsights: ChannelInsights | null
  isChannelModalOpen: boolean
  channelLoading: boolean
  openChannel: (channelId: string, apiKey: string) => Promise<void>
  closeChannel: () => void
}

export function useChannelState({
  onError,
  onRequireApiKey,
}: UseChannelStateOptions): UseChannelStateReturn {
  const [channelDetail, setChannelDetail] = useState<ChannelDetail | null>(null)
  const [channelInsights, setChannelInsights] = useState<ChannelInsights | null>(null)
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false)
  const [channelLoading, setChannelLoading] = useState(false)

  const closeChannel = useCallback(() => {
    setIsChannelModalOpen(false)
  }, [])

  const openChannel = useCallback(
    async (channelId: string, apiKey: string) => {
      if (!apiKey.trim()) {
        onError('채널 정보를 보기 위해서는 API 키가 필요합니다.')
        onRequireApiKey('채널 정보를 보려면 YouTube API 키가 필요합니다.')
        return
      }

      setChannelLoading(true)
      try {
        const [detail, insights] = await Promise.all([
          fetchChannelDetail(channelId, apiKey),
          fetchChannelInsights(channelId, apiKey),
        ])
        setChannelDetail(detail)
        setChannelInsights(insights)
        setIsChannelModalOpen(true)
        onError(null)
      } catch (err) {
        console.error(err)
        const message =
          err instanceof Error
            ? err.message
            : '채널 정보를 불러오는 중 오류가 발생했습니다.'
        onError(message)
        if (
          err instanceof Error &&
          (err.message.includes('API 키') ||
            err.message.includes('할당량') ||
            err.message.toLowerCase().includes('quota'))
        ) {
          onRequireApiKey(message)
        }
      } finally {
        setChannelLoading(false)
      }
    },
    [onError, onRequireApiKey],
  )

  return {
    channelDetail,
    channelInsights,
    isChannelModalOpen,
    channelLoading,
    openChannel,
    closeChannel,
  }
}


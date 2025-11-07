import type { ReactNode } from 'react'
import type { VideoSearchResult } from '../types/youtube'
import { VideoCard } from './VideoCard'

interface VideoGridProps {
  videos: VideoSearchResult[]
  isLoading: boolean
  canSearch: boolean
  error: string | null
  onChannelClick: (channelId: string) => void
}

export function VideoGrid({
  videos,
  isLoading,
  canSearch,
  error,
  onChannelClick,
}: VideoGridProps) {
  const renderState = (title: string, subtitle?: string, extra?: ReactNode) => (
    <section className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/70 bg-white/80 px-10 py-16 text-center text-slate-600 shadow-[0_24px_65px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      {subtitle && <p className="max-w-lg text-sm text-slate-500">{subtitle}</p>}
      {extra}
    </section>
  )

  if (error) {
    return renderState(error, 'YouTube API 키 상태와 네트워크 연결을 다시 확인해주세요.')
  }

  if (!canSearch) {
    return renderState('검색을 시작할 준비가 되었나요?', '검색어와 YouTube API 키를 입력한 후 검색 버튼을 눌러주세요.')
  }

  if (isLoading) {
    return renderState('검색 중입니다...', '최신 데이터를 불러오는 동안 잠시만 기다려주세요.', (
      <div className="mt-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-brand">
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand/80" style={{ animationDelay: '0.1s' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand/60" style={{ animationDelay: '0.2s' }} />
      </div>
    ))
  }

  if (videos.length === 0) {
    return renderState('검색 결과가 없습니다.', '다른 키워드나 필터 조합을 시도해보세요.')
  }

  return (
    <div className="flex flex-col gap-5">
      {videos.map((video) => (
        <VideoCard key={video.videoId} video={video} onChannelClick={onChannelClick} />
      ))}
    </div>
  )
}


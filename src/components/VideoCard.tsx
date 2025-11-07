import type { VideoSearchResult } from '../types/youtube'

function formatKoreanNumber(num: number) {
  if (num >= 1_000) {
    const value = num / 10_000
    if (value >= 10) {
      return `${Math.round(value)}만`
    }
    if (value >= 1) {
      return `${parseFloat(value.toFixed(1))}만`
    }
    return `${parseFloat(value.toFixed(2))}만`
  }
  return num.toLocaleString('ko-KR')
}

function formatDate(isoDate: string) {
  const date = new Date(isoDate)
  return date.toLocaleDateString('ko-KR')
}

interface VideoCardProps {
  video: VideoSearchResult
  onChannelClick: (channelId: string) => void
}

export function VideoCard({ video, onChannelClick }: VideoCardProps) {
  return (
    <article className="group grid gap-0 overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[0_32px_80px_-50px_rgba(15,23,42,0.65)] transition hover:-translate-y-1 hover:shadow-[0_38px_95px_-45px_rgba(79,70,229,0.45)] md:grid-cols-[240px_minmax(0,1fr)]">
      <a
        className="relative block h-full w-full overflow-hidden bg-slate-200"
        href={`https://www.youtube.com/watch?v=${video.videoId}`}
        target="_blank"
        rel="noreferrer"
        aria-label="영상 보기"
      >
        <img
          className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
          src={video.thumbnailUrl}
          alt={video.title}
        />
      </a>
      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-3">
          <h3 className="line-clamp-2 text-xl font-semibold text-slate-900">
            {video.title}
          </h3>
          <p className="line-clamp-3 text-sm text-slate-500">{video.description}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-500">
          <span className="rounded-xl bg-indigo-50 px-3 py-2 text-slate-600">
            조회수 {formatKoreanNumber(video.views)}
          </span>
          <span className="rounded-xl bg-indigo-50 px-3 py-2 text-slate-600">
            좋아요 {formatKoreanNumber(video.likes)}
          </span>
          <span className="rounded-xl bg-indigo-50 px-3 py-2 text-slate-600">
            구독자 {formatKoreanNumber(video.channelSubscribers)}
          </span>
          <span className="rounded-xl bg-indigo-50 px-3 py-2 text-slate-600">
            총 영상수 {formatKoreanNumber(video.channelVideoCount)}
          </span>
          <span className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-600">
            비율{' '}
            {video.channelSubscribers > 0
              ? (video.views / video.channelSubscribers).toFixed(1)
              : '∞'}
            배
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              게시일
            </span>
            <span>{formatDate(video.publishedAt)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              채널명
            </span>
            <button
              type="button"
              className="inline-flex w-fit items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1 text-sm font-semibold text-brand transition hover:bg-indigo-100"
              onClick={() => onChannelClick(video.channelId)}
            >
              {video.channelTitle}
              <span aria-hidden className="text-xs">↗</span>
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              영상 길이
            </span>
            <span>
              {typeof video.durationSeconds === 'number'
                ? `${Math.floor(video.durationSeconds / 60)}분 ${String(
                    Math.floor(video.durationSeconds % 60),
                  ).padStart(2, '0')}초`
                : '정보 없음'}
            </span>
          </div>
        </div>
        {video.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {video.tags.slice(0, 10).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}


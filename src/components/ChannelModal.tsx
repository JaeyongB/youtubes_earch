import type { ChannelDetail, ChannelInsights } from '../types/youtube'

interface ChannelModalProps {
  detail: ChannelDetail
  insights: ChannelInsights
  isOpen: boolean
  onClose: () => void
}

function formatNumber(num: number) {
  return num.toLocaleString('ko-KR')
}

function formatDate(isoDate: string) {
  const date = new Date(isoDate)
  return date.toLocaleDateString('ko-KR')
}

export function ChannelModal({ detail, insights, isOpen, onClose }: ChannelModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-10"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_36px_80px_-40px_rgba(15,23,42,0.65)]">
        <header className="flex items-start justify-between gap-6 border-b border-slate-100 bg-white/70 px-8 py-6 backdrop-blur">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">{detail.title}</h2>
            <p className="text-sm text-slate-500">{detail.description}</p>
          </div>
          <button
            className="rounded-full border border-slate-200 p-2 text-lg text-slate-400 transition hover:border-slate-300 hover:text-slate-600"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        <div className="grid gap-8 px-8 py-10">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[{
              label: '구독자',
              value: formatNumber(detail.subscribers),
            },
            {
              label: '총 영상',
              value: formatNumber(detail.videoCount),
            },
            {
              label: '총 조회수',
              value: formatNumber(detail.viewCount),
            },
            {
              label: '국적 / 개설일',
              value: detail.country ?? '정보 없음',
              sub: formatDate(detail.publishedAt),
            }].map(({ label, value, sub }) => (
              <div
                key={label}
                className="flex flex-col gap-2 rounded-2xl bg-gradient-to-br from-brand to-brand-light/80 p-6 text-white shadow-lg shadow-brand/30"
              >
                <span className="text-sm font-medium uppercase tracking-wide text-white/80">{label}</span>
                <strong className="text-3xl font-semibold">{value}</strong>
                {sub && <span className="text-sm text-white/80">{sub}</span>}
              </div>
            ))}
          </section>

          {insights.contactEmail && (
            <div className="flex flex-col gap-2 rounded-2xl border border-indigo-50 bg-indigo-50/60 px-6 py-5 text-slate-700 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <strong className="text-sm font-semibold text-slate-700">연락처</strong>
                <p className="text-sm text-slate-500">{insights.contactEmail}</p>
              </div>
              <a
                href={`mailto:${insights.contactEmail}`}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
              >
                메일 보내기
              </a>
            </div>
          )}

          <section className="grid gap-4">
            <h3 className="text-lg font-semibold text-slate-800">추천 영상</h3>
            <div className="grid gap-3">
              {insights.featuredVideos.map((video) => (
                <a
                  key={video.id}
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-5 rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
                >
                  <img
                    className="h-24 w-40 rounded-xl object-cover shadow-sm"
                    src={video.thumbnailUrl}
                    alt={video.title}
                  />
                  <div className="grid gap-2">
                    <strong className="text-base text-slate-800 group-hover:text-brand">
                      {video.title}
                    </strong>
                    <span className="text-sm text-slate-500 line-clamp-2">{video.description}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="grid gap-4">
            <h3 className="text-lg font-semibold text-slate-800">최고 조회수 영상</h3>
            <div className="grid gap-3">
              {insights.topVideos.map((video) => (
                <a
                  key={video.id}
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-5 rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
                >
                  <img
                    className="h-24 w-40 rounded-xl object-cover shadow-sm"
                    src={video.thumbnailUrl}
                    alt={video.title}
                  />
                  <div className="grid gap-2">
                    <strong className="text-base text-slate-800 group-hover:text-brand">
                      {video.title}
                    </strong>
                    <span className="text-sm text-slate-500">조회수 {formatNumber(video.viewCount)}회</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}


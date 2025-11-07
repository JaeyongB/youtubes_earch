import type { FormEvent } from 'react'
import type { VideoDurationFilter } from '../types/youtube'

interface SearchBarProps {
  keyword: string
  onKeywordChange: (keyword: string) => void
  onSubmit: () => void
  duration: VideoDurationFilter
  onDurationChange: (value: VideoDurationFilter) => void
  maxResults: number
  onMaxResultsChange: (value: number) => void
  year: number
  onYearChange: (value: number) => void
  regionCode: 'US' | 'JP' | 'ES' | 'ALL'
  onRegionChange: (value: 'US' | 'JP' | 'ES' | 'ALL') => void
  onOpenApiKeyModal: () => void
}

const filterButtonClass = (isActive: boolean) =>
  `inline-flex items-center justify-center rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
    isActive
      ? 'border-transparent bg-gradient-to-r from-brand to-brand-light text-white shadow-brand/30'
      : 'border-indigo-100 bg-white text-brand-dark shadow-sm hover:border-brand hover:text-brand'
  }`

const fieldLabelClass =
  'flex min-w-[140px] flex-col gap-1 text-xs font-semibold text-slate-500'

const fieldControlClass =
  'w-full rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-indigo-100'

export function SearchBar({
  keyword,
  onKeywordChange,
  onSubmit,
  duration,
  onDurationChange,
  maxResults,
  onMaxResultsChange,
  year,
  onYearChange,
  regionCode,
  onRegionChange,
  onOpenApiKeyModal,
}: SearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form
      className="flex flex-col gap-5 rounded-3xl border border-white/70 bg-white p-6 shadow-[0_24px_65px_-45px_rgba(79,70,229,0.45)] backdrop-blur"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-3xl">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
            🔍
          </span>
          <input
            className="w-full rounded-2xl border-2 border-indigo-100 bg-white px-5 py-4 pl-12 text-base font-semibold text-slate-900 shadow-inner shadow-indigo-50 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="찾고 싶은 키워드를 입력하세요"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <label className={`${fieldLabelClass} min-w-[120px]`}>
            <span>결과 수</span>
            <select
              value={maxResults}
              onChange={(event) => onMaxResultsChange(Number(event.target.value))}
              className={fieldControlClass}
            >
              <option value={5}>5개</option>
              <option value={10}>10개</option>
              <option value={20}>20개</option>
              <option value={50}>50개</option>
              <option value={100}>100개</option>
            </select>
          </label>
          <label className={`${fieldLabelClass} min-w-[120px]`}>
            <span>연도</span>
            <input
              type="number"
              value={year}
              onChange={(event) => onYearChange(Number(event.target.value))}
              min={2005}
              max={new Date().getFullYear()}
              className={fieldControlClass}
            />
          </label>
          <label className={`${fieldLabelClass} min-w-[120px]`}>
            <span>국가</span>
            <select
              value={regionCode}
              onChange={(event) =>
                onRegionChange(event.target.value as 'US' | 'JP' | 'ES' | 'ALL')
              }
              className={fieldControlClass}
            >
              <option value="ALL">전체</option>
              <option value="US">미국</option>
              <option value="JP">일본</option>
              <option value="ES">스페인</option>
            </select>
          </label>
          <button
            type="button"
            onClick={onOpenApiKeyModal}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-brand/70 bg-gradient-to-r from-brand to-brand-light px-5 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition hover:from-brand-dark hover:to-brand"
          >
            API 키 설정
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={filterButtonClass(duration === 'any')}
          onClick={() => onDurationChange('any')}
        >
          전체 영상
        </button>
        <button
          type="button"
          className={filterButtonClass(duration === 'long')}
          onClick={() => onDurationChange('long')}
        >
          긴 영상
        </button>
        <button
          type="button"
          className={filterButtonClass(duration === 'short')}
          onClick={() => onDurationChange('short')}
        >
          숏츠 영상
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          검색하기
        </button>
      </div>
    </form>
  )
}


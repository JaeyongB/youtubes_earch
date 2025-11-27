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
  ratioThreshold: number
  onRatioChange: (value: number) => void
  onExportExcel: () => void
}

const filterButtonClass = (isActive: boolean) =>
  `inline-flex items-center justify-center rounded-lg border px-2 py-0.5 text-[10px] font-semibold transition ${
    isActive
      ? 'border-transparent bg-gradient-to-r from-brand to-brand-light text-white shadow-sm shadow-brand/30'
      : 'border-indigo-100 bg-white text-brand-dark hover:border-brand hover:text-brand'
  }`

const fieldLabelClass = 'flex min-w-[70px] flex-col gap-0 text-[9px] font-semibold text-slate-500'

const fieldControlClass =
  'w-full rounded-lg border border-indigo-100 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 shadow-sm transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-indigo-100'

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
  ratioThreshold,
  onRatioChange,
  onExportExcel,
}: SearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  const presets = [5, 10, 15]

  return (
    <form
      className="flex flex-col gap-1.5 rounded-xl border border-white/70 bg-white p-2 shadow-[0_10px_30px_-20px_rgba(79,70,229,0.4)] backdrop-blur"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="relative flex-1 min-w-[200px]">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs">🔍</span>
          <input
            className="w-full rounded-lg border border-indigo-100 bg-white px-2.5 py-1.5 pl-7 text-xs font-semibold text-slate-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-indigo-100"
            placeholder="찾고 싶은 키워드를 입력하세요"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-7 min-w-[70px] items-center justify-center rounded-lg bg-emerald-500 px-3 text-[10px] font-bold text-white shadow-md shadow-emerald-500/25 transition hover:bg-emerald-400"
        >
          검색
        </button>
        <div className="flex flex-wrap items-center gap-1.5">
          <label className={fieldLabelClass}>
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
          <label className={fieldLabelClass}>
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
          <label className={fieldLabelClass}>
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
            className="inline-flex h-7 items-center justify-center rounded-lg border border-brand/70 bg-gradient-to-r from-brand to-brand-light px-2 text-[10px] font-bold text-white shadow-sm shadow-brand/20 transition hover:from-brand-dark hover:to-brand"
          >
            API키
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
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
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-indigo-50 bg-indigo-50/40 p-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-semibold text-slate-700">조회수÷구독자</span>
          <div className="flex items-center gap-1">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onRatioChange(preset)}
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold transition ${
                  ratioThreshold === preset
                    ? 'bg-brand text-white shadow-sm'
                    : 'bg-white text-brand hover:bg-indigo-100'
                }`}
              >
                {preset}배
              </button>
            ))}
            <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold text-brand-dark">
              {ratioThreshold === 0 ? '전체' : `${ratioThreshold}배`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            id="ratio-range"
            type="range"
            min={0}
            max={20}
            step={1}
            value={ratioThreshold}
            onChange={(event) => onRatioChange(Number(event.target.value))}
            className="h-1 w-24 appearance-none rounded-full bg-slate-200 accent-brand"
          />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white shadow-md shadow-emerald-500/25 transition hover:bg-emerald-400"
            onClick={onExportExcel}
          >
            엑셀
          </button>
        </div>
      </div>
    </form>
  )
}


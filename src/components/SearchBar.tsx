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
  `inline-flex items-center justify-center rounded-xl border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
    isActive
      ? 'border-transparent bg-gradient-to-r from-brand to-brand-light text-white shadow-sm shadow-brand/30'
      : 'border-indigo-100 bg-white text-brand-dark hover:border-brand hover:text-brand'
  }`

const fieldLabelClass = 'flex min-w-[90px] flex-col gap-0.5 text-[10px] font-semibold text-slate-500'

const fieldControlClass =
  'w-full rounded-xl border border-indigo-100 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-indigo-100'

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
      className="flex flex-col gap-2 rounded-2xl border border-white/70 bg-white p-3 shadow-[0_20px_55px_-40px_rgba(79,70,229,0.45)] backdrop-blur"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
            <input
              className="w-full rounded-xl border border-indigo-100 bg-white px-3 py-2 pl-9 text-sm font-semibold text-slate-900 shadow-inner shadow-indigo-50 transition focus:border-brand focus:outline-none focus:ring-1 focus:ring-indigo-100"
              placeholder="찾고 싶은 키워드를 입력하세요"
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-9 min-w-[90px] items-center justify-center rounded-xl bg-emerald-500 px-4 text-xs font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            검색하기
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
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
            className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-brand/70 bg-gradient-to-r from-brand to-brand-light px-3 text-xs font-semibold text-white shadow-sm shadow-brand/20 transition hover:from-brand-dark hover:to-brand"
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
      </div>

      <div className="flex flex-col gap-1.5 rounded-xl border border-indigo-50 bg-indigo-50/40 p-2">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-700">조회수 ÷ 구독자 필터</span>
            <span className="text-[10px] text-slate-500">효율이 높은 영상을 찾으려면 오른쪽 버튼을 눌러보세요.</span>
          </div>
          <div className="flex items-center gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onRatioChange(preset)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                  ratioThreshold === preset
                    ? 'bg-brand text-white shadow-sm shadow-brand/30'
                    : 'bg-white text-brand hover:bg-indigo-100'
                }`}
              >
                {preset}배 이상
              </button>
            ))}
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-brand-dark">
              {ratioThreshold === 0 ? '전체' : `${ratioThreshold}배 이상`}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 md:flex-row md:items-center">
          <input
            id="ratio-range"
            type="range"
            min={0}
            max={20}
            step={1}
            value={ratioThreshold}
            onChange={(event) => onRatioChange(Number(event.target.value))}
            className="h-1.5 flex-1 appearance-none rounded-full bg-slate-200 accent-brand"
          />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            onClick={onExportExcel}
          >
            다운로드
          </button>
        </div>
      </div>
    </form>
  )
}


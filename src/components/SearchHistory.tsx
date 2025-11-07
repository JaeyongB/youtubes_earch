import { useMemo } from 'react'

interface SearchHistoryProps {
  items: string[]
  onSelect: (keyword: string) => void
  onClear: () => void
}

export function SearchHistory({ items, onSelect, onClear }: SearchHistoryProps) {
  const hasHistory = items.length > 0
  const historyItems = useMemo(() => items.slice(-20).reverse(), [items])

  return (
    <section className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_28px_70px_-50px_rgba(15,23,42,0.6)]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">검색 히스토리</h3>
        {hasHistory && (
          <button
            onClick={onClear}
            type="button"
            className="text-xs font-semibold uppercase tracking-wide text-brand transition hover:text-brand-dark"
          >
            전체 삭제
          </button>
        )}
      </div>
      {hasHistory ? (
        historyItems.map((keyword) => (
          <button
            key={keyword}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:text-brand"
            onClick={() => onSelect(keyword)}
            type="button"
          >
            <span className="truncate text-left">{keyword}</span>
          </button>
        ))
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/40 px-4 py-6 text-center text-sm text-slate-400">
          최근 검색 기록이 없습니다.
        </div>
      )}
    </section>
  )
}



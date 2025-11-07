import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'

interface ApiKeyModalProps {
  isOpen: boolean
  initialKey: string
  message: string | null
  onSubmit: (value: string) => void
  onClear: () => void
  onClose: () => void
  hasPersistedKey: boolean
}

export function ApiKeyModal({
  isOpen,
  initialKey,
  message,
  onSubmit,
  onClear,
  onClose,
  hasPersistedKey,
}: ApiKeyModalProps) {
  const [value, setValue] = useState(initialKey)

  useEffect(() => {
    setValue(initialKey)
  }, [initialKey])

  if (!isOpen) return null

  const modalRoot = typeof document !== 'undefined' ? document.body : null
  if (!modalRoot) return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(value)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-10"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-3xl border border-white/70 bg-white p-8 shadow-[0_32px_80px_-50px_rgba(15,23,42,0.75)]"
      >
        <header className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">API 키 설정</h2>
            <p className="text-sm text-slate-500">
              YouTube Data API 키를 저장하면 브라우저에 안전하게 보관됩니다.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 p-2 text-lg text-slate-400 transition hover:border-slate-300 hover:text-slate-600"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        <div className="space-y-4">
          {message && (
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              {message}
            </p>
          )}
          <p className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-500">
            입력한 API 키는 이 브라우저의 로컬 저장소에만 보관되며, 서버나 Git 저장소에 저장되지 않습니다. 공용 PC에서는 저장 후 반드시 삭제하세요.
          </p>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
            YouTube Data API 키
            <input
              type="text"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="AIza... 형식의 API 키"
              className="w-full rounded-xl border border-indigo-100 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </label>
        </div>

        <footer className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClear}
            disabled={!hasPersistedKey}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            저장된 키 삭제
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            저장
          </button>
        </footer>
      </form>
    </div>,
    modalRoot,
  )
}


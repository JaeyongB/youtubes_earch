import { useCallback } from 'react'
import { SearchBar } from './components/SearchBar'
import { VideoGrid } from './components/VideoGrid'
import { ChannelModal } from './components/ChannelModal'
import { ApiKeyModal } from './components/ApiKeyModal'
import { useSearchState, type SortField, type SortOrder } from './hooks/useSearchState'
import { useChannelState } from './hooks/useChannelState'

function App() {
  const {
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
  } = useSearchState()

  const {
    channelDetail,
    channelInsights,
    isChannelModalOpen,
    channelLoading,
    openChannel,
    closeChannel,
  } = useChannelState({
    onError: setError,
    onRequireApiKey: (message) => openApiKeyModal(message),
  })

  const handleChannelOpen = useCallback(
    (channelId: string) => {
      void openChannel(channelId, apiKey)
    },
    [apiKey, openChannel],
  )

  const sortButtonClass = (field: SortField, order: SortOrder) => {
    const isActive = sortField === field && sortOrder === order
    return `inline-flex items-center justify-center rounded-xl border px-4 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
      isActive
        ? 'border-transparent bg-gradient-to-r from-brand to-brand-light text-white shadow-md shadow-brand/30'
        : 'border-indigo-100 bg-white text-brand-dark hover:border-brand hover:text-brand'
    }`
  }

  const ratioPresets = [5, 10, 15]

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-slate-50/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 md:px-8">
          <SearchBar
            keyword={keyword}
            onKeywordChange={setKeyword}
            onSubmit={handleSearch}
            duration={duration}
            onDurationChange={setDuration}
            maxResults={maxResults}
            onMaxResultsChange={setMaxResults}
            year={year}
            onYearChange={handleYearInputChange}
            regionCode={regionCode}
            onRegionChange={setRegionCode}
            onOpenApiKeyModal={openApiKeyModal}
          />

          <section className="grid gap-4 rounded-2xl border border-indigo-50 bg-white/95 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="ratio-range" className="text-sm font-semibold text-slate-700">
                  조회수 ÷ 구독자 비율 필터
                </label>
                <span className="text-xs text-slate-500">
                  높은 비율일수록 구독자 대비 조회수가 많은 영상입니다. 빠른 탐색을 위해 오른쪽 버튼을 눌러보세요.
                </span>
              </div>
              <div className="flex items-center gap-2">
                {ratioPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRatioThreshold(preset)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      ratioThreshold === preset
                        ? 'bg-brand text-white shadow-sm shadow-brand/30'
                        : 'bg-indigo-50 text-brand hover:bg-indigo-100'
                    }`}
                  >
                    {preset}배 이상
                  </button>
                ))}
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-brand-dark">
                  {ratioThreshold === 0 ? '전체' : `${ratioThreshold}배 이상`}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <input
                id="ratio-range"
                type="range"
                min={0}
                max={20}
                step={1}
                value={ratioThreshold}
                onChange={(event) => setRatioThreshold(Number(event.target.value))}
                className="h-2 flex-1 appearance-none rounded-full bg-slate-200 accent-brand"
              />
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 md:w-auto"
                onClick={handleExportExcel}
              >
                엑셀 다운로드
              </button>
            </div>
          </section>

          <section className="grid gap-4 rounded-2xl border border-indigo-50 bg-white/95 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <strong className="text-sm font-semibold text-slate-700">정렬 옵션</strong>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-indigo-100 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand hover:text-brand"
                onClick={handleSortReset}
              >
                정렬 초기화
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {(
                [
                  { field: 'title', label: '제목' },
                  { field: 'views', label: '조회수' },
                  { field: 'likes', label: '좋아요' },
                  { field: 'channelSubscribers', label: '구독자' },
                  { field: 'engagementRatio', label: '조회수/구독자 비율' },
                ] satisfies Array<{ field: SortField; label: string }>
              ).map(({ field, label }) => (
                <div key={field} className="flex flex-col gap-2 rounded-2xl border border-indigo-100 bg-white p-3 shadow-sm">
                  <span className="text-xs font-semibold text-slate-600">{label}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={sortButtonClass(field, 'asc')}
                      onClick={() => handleSort(field, 'asc')}
                    >
                      오름차순
                    </button>
                    <button
                      type="button"
                      className={sortButtonClass(field, 'desc')}
                      onClick={() => handleSort(field, 'desc')}
                    >
                      내림차순
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 md:px-8 lg:gap-10 lg:py-16">
        <VideoGrid
          videos={displayedVideos}
          isLoading={isLoading}
          canSearch={canSearch}
          error={error}
          onChannelClick={handleChannelOpen}
        />
      </main>
      {channelDetail && channelInsights && (
        <ChannelModal
          detail={channelDetail}
          insights={channelInsights}
          isOpen={isChannelModalOpen}
          onClose={closeChannel}
        />
      )}
      {channelLoading && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
          aria-hidden
        >
          <div className="rounded-3xl bg-white px-12 py-10 text-base font-semibold text-slate-700 shadow-[0_32px_80px_-50px_rgba(15,23,42,0.75)]">
            채널 정보를 불러오는 중...
          </div>
        </div>
      )}
      <ApiKeyModal
        isOpen={isApiModalOpen}
        initialKey={apiKey}
        message={apiModalMessage}
        onSubmit={handleApiKeySave}
        onClear={handleApiKeyClear}
        onClose={closeApiModal}
        hasPersistedKey={hasPersistedApiKey}
      />
    </div>
  )
}

export default App

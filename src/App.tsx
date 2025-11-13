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
    return `inline-flex items-center justify-center rounded-lg border px-2 py-1 text-[10px] font-semibold transition focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-brand ${
      isActive
        ? 'border-transparent bg-gradient-to-r from-brand to-brand-light text-white shadow-sm shadow-brand/30'
        : 'border-indigo-100 bg-white text-brand-dark hover:border-brand hover:text-brand'
    }`
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-slate-50/95 backdrop-blur" style={{ minHeight: '10vh' }}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 md:px-8">
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
            ratioThreshold={ratioThreshold}
            onRatioChange={setRatioThreshold}
            onExportExcel={handleExportExcel}
          />

          <section className="flex flex-col gap-1.5 rounded-xl border border-white/70 bg-white/90 p-2 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.4)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <strong className="text-xs font-semibold text-slate-700">대신 옵션</strong>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-indigo-100 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 transition hover:border-brand hover:text-brand"
                onClick={handleSortReset}
              >
                정렬 초기화
              </button>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {(
                [
                  { field: 'title', label: '제목' },
                  { field: 'views', label: '조회수' },
                  { field: 'likes', label: '좋아요' },
                  { field: 'channelSubscribers', label: '구독자' },
                  { field: 'engagementRatio', label: '조회수/구독자' },
                ] satisfies Array<{ field: SortField; label: string }>
              ).map(({ field, label }) => (
                <div key={field} className="flex min-w-[120px] flex-col gap-1 rounded-xl border border-indigo-100 bg-white p-1.5 shadow-sm">
                  <span className="text-[10px] font-semibold text-slate-600">{label}</span>
                  <div className="flex gap-1">
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

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
    return `inline-flex items-center justify-center rounded border w-4 h-4 text-[11px] font-bold transition ${
      isActive
        ? 'border-transparent bg-gradient-to-r from-brand to-brand-light text-white shadow-sm'
        : 'border-indigo-100 bg-white text-brand-dark hover:border-brand hover:text-brand'
    }`
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-slate-50/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-3 py-2 md:px-6">
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

          <section className="flex items-center gap-1.5 rounded-lg border border-white/70 bg-white/90 p-1.5 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)] backdrop-blur overflow-x-auto">
            <strong className="text-[10px] font-bold text-slate-700 whitespace-nowrap">정렬</strong>
            {(
              [
                { field: 'title', label: '제목' },
                { field: 'views', label: '조회수' },
                { field: 'likes', label: '좋아요' },
                { field: 'channelSubscribers', label: '구독자' },
                { field: 'engagementRatio', label: '비율' },
              ] satisfies Array<{ field: SortField; label: string }>
            ).map(({ field, label }) => (
              <div key={field} className="flex items-center gap-0.5">
                <span className="text-[9px] font-semibold text-slate-600 whitespace-nowrap">{label}</span>
                <button
                  type="button"
                  className={sortButtonClass(field, 'asc')}
                  onClick={() => handleSort(field, 'asc')}
                  title={`${label} 오름차순`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={sortButtonClass(field, 'desc')}
                  onClick={() => handleSort(field, 'desc')}
                  title={`${label} 내림차순`}
                >
                  ↓
                </button>
              </div>
            ))}
            <button
              type="button"
              className="ml-auto inline-flex items-center justify-center rounded-md border border-indigo-100 bg-white px-1.5 py-0.5 text-[9px] font-bold text-slate-600 transition hover:border-brand hover:text-brand whitespace-nowrap"
              onClick={handleSortReset}
            >
              초기화
            </button>
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

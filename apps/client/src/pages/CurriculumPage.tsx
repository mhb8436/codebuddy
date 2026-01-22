import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurriculumContext } from '../contexts/CurriculumContext';
import Header from '../components/Header';
import { useCurriculum, type Track, type TopicListItem } from '../hooks/useCurriculum';

export default function CurriculumPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { selectTopic: selectCurriculumTopic } = useCurriculumContext();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [view, setView] = useState<'tracks' | 'topics' | 'detail'>('tracks');

  const {
    languages,
    tracks,
    currentTrack,
    currentTopic,
    topicNavigation,
    topicList,
    isLoading,
    error,
    fetchLanguages,
    fetchTracks,
    fetchTrack,
    fetchTopicList,
    fetchTopic,
    clearState,
  } = useCurriculum();

  // Load initial data
  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  useEffect(() => {
    if (selectedLanguage) {
      fetchTracks(selectedLanguage);
    }
  }, [selectedLanguage, fetchTracks]);

  // Handle URL params
  useEffect(() => {
    const trackId = searchParams.get('track');
    const topicId = searchParams.get('topic');

    if (trackId) {
      setSelectedTrackId(trackId);
      fetchTrack(selectedLanguage, trackId);
      fetchTopicList(selectedLanguage, trackId);

      if (topicId) {
        setSelectedTopicId(topicId);
        fetchTopic(selectedLanguage, trackId, topicId);
        setView('detail');
      } else {
        setView('topics');
      }
    }
  }, [searchParams, selectedLanguage, fetchTrack, fetchTopicList, fetchTopic]);

  const handleSelectTrack = (track: Track) => {
    setSelectedTrackId(track.id);
    setSearchParams({ track: track.id });
    fetchTrack(selectedLanguage, track.id);
    fetchTopicList(selectedLanguage, track.id);
    setView('topics');
  };

  const handleSelectTopic = (item: TopicListItem) => {
    if (!selectedTrackId) return;
    setSelectedTopicId(item.topicId);
    setSearchParams({ track: selectedTrackId, topic: item.topicId });
    fetchTopic(selectedLanguage, selectedTrackId, item.topicId);
    setView('detail');
  };

  const handleBackToTracks = () => {
    clearState();
    setSelectedTrackId(null);
    setSelectedTopicId(null);
    setSearchParams({});
    setView('tracks');
  };

  const handleBackToTopics = () => {
    if (selectedTrackId) {
      setSelectedTopicId(null);
      setSearchParams({ track: selectedTrackId });
      setView('topics');
    }
  };

  const handleNavigateTopic = (topicId: string) => {
    if (!selectedTrackId) return;
    setSelectedTopicId(topicId);
    setSearchParams({ track: selectedTrackId, topic: topicId });
    fetchTopic(selectedLanguage, selectedTrackId, topicId);
  };

  const handleStartPractice = (topicName: string) => {
    navigate(`/practice?topic=${encodeURIComponent(topicName)}&trackId=${selectedTrackId}&topicId=${selectedTopicId}&language=${selectedLanguage}`);
  };

  const handleStartExam = (topicName: string) => {
    navigate(`/exam?topics=${encodeURIComponent(topicName)}&trackId=${selectedTrackId}&topicIds=${selectedTopicId}&language=${selectedLanguage}`);
  };

  const handleStartLearning = async () => {
    if (!selectedTrackId || !selectedTopicId) return;
    await selectCurriculumTopic(selectedLanguage, selectedTrackId, selectedTopicId);
    navigate('/learn');
  };

  const renderTracks = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">학습 트랙 선택</h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            onClick={() => handleSelectTrack(track)}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{track.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{track.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="px-2 py-1 bg-gray-100 rounded">
                {track.targetLevel === 'beginner_zero' ? '초초보' :
                 track.targetLevel === 'beginner' ? '초보' : '조금아는초보'}
              </span>
              <span>{track.estimatedHours}시간</span>
              <span>{track.stageCount || track.stages?.length || 0}개 스테이지</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTopicList = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBackToTracks}
          className="text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{currentTrack?.name}</h2>
          <p className="text-sm text-gray-600">{currentTrack?.description}</p>
        </div>
      </div>

      {/* Group by stage */}
      {currentTrack?.stages.map((stage) => (
        <div key={stage.id} className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">
            {stage.name}
          </h3>
          <div className="space-y-2">
            {topicList
              .filter((item) => item.stageId === stage.id)
              .map((item) => (
                <div
                  key={item.topicId}
                  onClick={() => handleSelectTopic(item)}
                  className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm hover:border-blue-300 cursor-pointer transition-all"
                >
                  <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    {item.order + 1}
                  </span>
                  <span className="flex-1 text-gray-900">{item.topicName}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTopicDetail = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBackToTopics}
          className="text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{currentTopic?.name}</h2>
          <p className="text-sm text-gray-600">{currentTrack?.name}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleStartLearning}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          학습 시작
        </button>
        <button
          onClick={() => currentTopic && handleStartPractice(currentTopic.name)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          연습문제만
        </button>
        <button
          onClick={() => currentTopic && handleStartExam(currentTopic.name)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          시험만
        </button>
      </div>

      {/* Concepts */}
      <div className="space-y-6">
        {currentTopic?.concepts.map((concept) => (
          <div key={concept.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{concept.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{concept.description}</p>

            {/* Keywords */}
            <div className="flex flex-wrap gap-2 mb-4">
              {concept.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  {keyword}
                </span>
              ))}
            </div>

            {/* Examples */}
            {concept.examples.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">예시 코드</h4>
                {concept.examples.map((example, idx) => (
                  <pre
                    key={idx}
                    className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto"
                  >
                    <code>{example}</code>
                  </pre>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        {topicNavigation?.previous ? (
          <button
            onClick={() => handleNavigateTopic(topicNavigation.previous!.topicId)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            이전: {topicNavigation.previous.name}
          </button>
        ) : (
          <div />
        )}
        {topicNavigation?.next && (
          <button
            onClick={() => handleNavigateTopic(topicNavigation.next!.topicId)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            다음: {topicNavigation.next.name}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        userName={user?.name}
        className={user?.class?.name || undefined}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-4">
              {error}
            </div>
          )}

          {!isLoading && view === 'tracks' && renderTracks()}
          {!isLoading && view === 'topics' && currentTrack && renderTopicList()}
          {!isLoading && view === 'detail' && currentTopic && renderTopicDetail()}
        </div>
      </div>
    </div>
  );
}

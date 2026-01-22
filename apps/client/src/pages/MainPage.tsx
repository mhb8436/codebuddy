import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurriculumContext } from '../contexts/CurriculumContext';
import Header from '../components/Header';
import { useCurriculum, type Track, type TopicListItem } from '../hooks/useCurriculum';

type View = 'languages' | 'tracks' | 'topics';

const LANGUAGE_INFO: Record<string, { name: string; icon: string; description: string }> = {
  javascript: {
    name: 'JavaScript',
    icon: 'JS',
    description: '웹 개발의 기본이 되는 프로그래밍 언어',
  },
  typescript: {
    name: 'TypeScript',
    icon: 'TS',
    description: '타입 안정성을 갖춘 JavaScript의 상위 집합',
  },
  python: {
    name: 'Python',
    icon: 'PY',
    description: '배우기 쉽고 활용도가 높은 범용 언어',
  },
};

export default function MainPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { selectTopic: selectCurriculumTopic, selection } = useCurriculumContext();

  const [view, setView] = useState<View>('languages');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const isInternalNav = useRef(false);

  const {
    languages,
    tracks,
    currentTrack,
    topicList,
    isLoading,
    error,
    fetchLanguages,
    fetchTracks,
    fetchTrack,
    fetchTopicList,
    clearState,
  } = useCurriculum();

  // If already has selection, show option to continue
  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  // Handle URL params for direct navigation (only from external sources)
  useEffect(() => {
    // Skip if this is internal navigation (back button)
    if (isInternalNav.current) {
      isInternalNav.current = false;
      return;
    }

    const lang = searchParams.get('lang');
    const track = searchParams.get('track');

    if (lang && !selectedLanguage) {
      setSelectedLanguage(lang);
      fetchTracks(lang);

      if (track) {
        setSelectedTrackId(track);
        fetchTrack(lang, track);
        fetchTopicList(lang, track);
        setView('topics');
      } else {
        setView('tracks');
      }
    }
  }, [searchParams, selectedLanguage, fetchTracks, fetchTrack, fetchTopicList]);

  const handleSelectLanguage = (langId: string) => {
    setSelectedLanguage(langId);
    fetchTracks(langId);
    setView('tracks');
  };

  const handleSelectTrack = (track: Track) => {
    if (!selectedLanguage) return;
    setSelectedTrackId(track.id);
    fetchTrack(selectedLanguage, track.id);
    fetchTopicList(selectedLanguage, track.id);
    setView('topics');
  };

  const handleSelectTopic = async (item: TopicListItem) => {
    if (!selectedLanguage || !selectedTrackId) return;
    await selectCurriculumTopic(selectedLanguage, selectedTrackId, item.topicId);
    navigate('/learn');
  };

  const handleBack = () => {
    isInternalNav.current = true;
    if (view === 'topics') {
      setSelectedTrackId(null);
      setView('tracks');
      navigate(`/?lang=${selectedLanguage}`, { replace: true });
    } else if (view === 'tracks') {
      setSelectedLanguage(null);
      clearState();
      setView('languages');
      navigate('/', { replace: true });
    }
  };

  const handleContinueLearning = () => {
    navigate('/learn');
  };

  const renderLanguages = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          어떤 언어를 배우고 싶으신가요?
        </h1>
        <p className="text-gray-600">
          학습하고 싶은 프로그래밍 언어를 선택하세요
        </p>
      </div>

      {/* Continue Learning Card */}
      {selection && (
        <div className="mb-8 bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-indigo-600 font-medium">이어서 학습하기</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selection.languageName} · {selection.trackName} · {selection.topicName}
                </p>
              </div>
            </div>
            <button
              onClick={handleContinueLearning}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              계속하기
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {languages.map((lang) => {
          const info = LANGUAGE_INFO[lang.id] || { name: lang.name, icon: lang.id.slice(0, 2).toUpperCase(), description: '' };
          return (
            <button
              key={lang.id}
              onClick={() => handleSelectLanguage(lang.id)}
              className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-blue-500 hover:shadow-lg transition-all text-left group"
            >
              <div className="w-16 h-16 bg-gray-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                <span className="text-2xl font-bold text-gray-700 group-hover:text-blue-600">{info.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{info.name}</h3>
              <p className="text-gray-600 text-sm">{info.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderTracks = () => (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        언어 선택으로 돌아가기
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
          {LANGUAGE_INFO[selectedLanguage!]?.icon || selectedLanguage}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          학습 트랙을 선택하세요
        </h2>
        <p className="text-gray-600">
          본인의 수준에 맞는 트랙을 선택하세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => handleSelectTrack(track)}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">{track.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{track.description}</p>
            <div className="flex items-center gap-3 text-xs">
              <span className={`px-2 py-1 rounded ${
                track.targetLevel === 'beginner_zero' ? 'bg-green-100 text-green-700' :
                track.targetLevel === 'beginner' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {track.targetLevel === 'beginner_zero' ? '초초보' :
                 track.targetLevel === 'beginner' ? '초보' : '조금아는초보'}
              </span>
              <span className="text-gray-500">{track.estimatedHours}시간</span>
              <span className="text-gray-500">{track.stageCount || track.stages?.length || 0}개 스테이지</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTopics = () => (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        트랙 선택으로 돌아가기
      </button>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {currentTrack?.name}
        </h2>
        <p className="text-gray-600">{currentTrack?.description}</p>
      </div>

      <div className="space-y-8">
        {currentTrack?.stages.map((stage) => (
          <div key={stage.id}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              {stage.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topicList
                .filter((item) => item.stageId === stage.id)
                .map((item) => (
                  <button
                    key={item.topicId}
                    onClick={() => handleSelectTopic(item)}
                    className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left"
                  >
                    <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-medium">
                      {item.order + 1}
                    </span>
                    <span className="flex-1 font-medium text-gray-900">{item.topicName}</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        userName={user?.name}
        className={user?.class?.name}
      />

      <div className="flex-1 py-12 px-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
            {error}
          </div>
        ) : (
          <>
            {view === 'languages' && renderLanguages()}
            {view === 'tracks' && renderTracks()}
            {view === 'topics' && renderTopics()}
          </>
        )}
      </div>
    </div>
  );
}

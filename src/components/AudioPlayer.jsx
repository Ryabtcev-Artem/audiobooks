import { useCallback, useEffect, useRef, useState } from 'react';

const SKIP_SECONDS = 10;
const STORAGE_PREFIX = 'audiobooks1:progress:';

/**
 * Форматирование времени для длинных аудиокниг (Ч:ММ:СС)
 */
function formatLongTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00:00';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Форматирование времени для глав (ММ:СС если < 1 часа, иначе Ч:ММ:СС)
 */
function formatTrackTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Находит трек по глобальному времени
 */
function findTrackByTime(tracks, targetTime) {
  if (!tracks || tracks.length === 0) return { index: 0, localTime: 0 };

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    if (targetTime >= track.startTime && targetTime < track.endTime) {
      return { index: i, localTime: targetTime - track.startTime };
    }
  }

  // За пределами — последний трек
  const lastIdx = tracks.length - 1;
  return { index: lastIdx, localTime: tracks[lastIdx].duration };
}

/**
 * Аудиоплеер с поддержкой множественных треков (глав).
 * tracks - массив объектов { index, url, duration, startTime, endTime }
 */
export default function AudioPlayer({ bookId, title, tracks }) {
  const audioRef = useRef(null);
  const trackIndexRef = useRef(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [globalTime, setGlobalTime] = useState(0);
  const [globalDuration, setGlobalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const didRestoreRef = useRef(false);
  const saveTimeoutRef = useRef(null);

  // Есть ли треки (главы)
  const hasTracks = tracks && tracks.length > 0;

  // Вычисляем общую длительность
  useEffect(() => {
    if (hasTracks) {
      const total = tracks[tracks.length - 1].endTime;
      setGlobalDuration(total);
    }
  }, [hasTracks, tracks]);

  // Восстановление позиции из localStorage (один раз на книгу)
  useEffect(() => {
    if (!hasTracks) return;
    if (!bookId) return;
    if (didRestoreRef.current) return;
    if (!Number.isFinite(globalDuration) || globalDuration <= 0) return;

    didRestoreRef.current = true;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${bookId}`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const savedTime = Number(parsed?.time);
      if (!Number.isFinite(savedTime)) return;

      const clamped = Math.max(0, Math.min(savedTime, globalDuration));
      if (clamped > 0) {
        seek(clamped);
      }
    } catch {
      // ignore storage/JSON errors
    }
  }, [hasTracks, bookId, globalDuration]);

  // Сохранение позиции в localStorage (с троттлингом)
  useEffect(() => {
    if (!hasTracks) return;
    if (!bookId) return;
    if (!Number.isFinite(globalTime)) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          `${STORAGE_PREFIX}${bookId}`,
          JSON.stringify({
            time: globalTime,
            updatedAt: Date.now(),
          })
        );
      } catch {
        // ignore storage quota / private mode
      }
    }, 750);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasTracks, bookId, globalTime]);

  // Загрузить трек в audio-элемент
  const loadTrack = useCallback((trackIndex, localTime = 0) => {
    const audio = audioRef.current;
    if (!audio || !hasTracks) return;

    const track = tracks[trackIndex];
    if (!track) return;

    trackIndexRef.current = trackIndex;
    setCurrentTrackIndex(trackIndex);

    // Если уже загружен этот трек
    if (audio.src && audio.src === track.url) {
      audio.currentTime = localTime;
      return;
    }

    setIsLoading(true);
    const wasPlaying = !audio.paused;

    audio.src = track.url;
    audio.currentTime = localTime;

    const onCanPlay = () => {
      setIsLoading(false);
      if (wasPlaying) {
        audio.play().catch(() => {});
      }
      audio.removeEventListener('canplay', onCanPlay);
    };

    audio.addEventListener('canplay', onCanPlay);
  }, [hasTracks, tracks]);

  // Переключить на следующий трек
  const advanceToNextTrack = useCallback(() => {
    const nextIndex = trackIndexRef.current + 1;
    if (hasTracks && nextIndex < tracks.length) {
      loadTrack(nextIndex, 0);
    } else {
      setIsPlaying(false);
    }
  }, [hasTracks, tracks, loadTrack]);

  // Play / Pause
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Playback failed:', err);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  // Перемотка на delta секунд
  const skip = (delta) => {
    if (hasTracks) {
      const target = Math.max(0, Math.min(globalTime + delta, globalDuration));
      const { index, localTime } = findTrackByTime(tracks, target);
      loadTrack(index, localTime);
      setGlobalTime(target);
    }
  };

  // Перемотка на конкретную позицию
  const seek = (time) => {
    if (hasTracks) {
      const clamped = Math.max(0, Math.min(time, globalDuration));
      const { index, localTime } = findTrackByTime(tracks, clamped);
      loadTrack(index, localTime);
      setGlobalTime(clamped);
    }
  };

  // Переход к выбранной главе (части) по её startTime
  const jumpToTrack = useCallback((trackNumberOrIndex) => {
    if (!hasTracks) return;

    // В данных tracks.index может быть 1..N (номер главы), а индекс массива — 0..N-1
    const arrayIndex =
      typeof trackNumberOrIndex === 'number'
        ? tracks.findIndex((t) => t.index === trackNumberOrIndex)
        : -1;

    const idx = arrayIndex >= 0 ? arrayIndex : Math.max(0, Math.min(Number(trackNumberOrIndex) || 0, tracks.length - 1));
    const track = tracks[idx];
    if (!track) return;

    loadTrack(idx, 0);
    setGlobalTime(track.startTime);
  }, [hasTracks, tracks, loadTrack]);

  // Обработчик полосы прогресса
  const handleSeek = (event) => {
    const value = Number(event.target.value);
    seek(value);
  };

  // Обработчик обновления времени
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !hasTracks) return;

    const idx = trackIndexRef.current;
    const track = tracks[idx];
    if (!track) return;

    const localTime = audio.currentTime;
    const newGlobalTime = track.startTime + localTime;
    setGlobalTime(newGlobalTime);

    // Проверяем, не пора ли переключить трек
    if (track.duration > 0 && localTime >= track.duration - 0.5) {
      advanceToNextTrack();
    }
  };

  // Обработчик окончания трека
  const handleEnded = () => {
    if (hasTracks) {
      advanceToNextTrack();
    } else {
      setIsPlaying(false);
    }
  };

  // Клавиатурное управление
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Не перехватываем клавиши внутри интерактивных элементов,
      // иначе ломается управление select/range для клавиатуры и скринридеров
      const target = event.target;
      const tag = target?.tagName?.toLowerCase?.();
      const isEditable = Boolean(target?.isContentEditable);
      if (isEditable || tag === 'input' || tag === 'select' || tag === 'textarea' || tag === 'button') {
        return;
      }

      switch (event.key) {
        case ' ':
        case 'Spacebar':
          event.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          skip(-SKIP_SECONDS);
          break;
        case 'ArrowRight':
          event.preventDefault();
          skip(SKIP_SECONDS);
          break;
        default:
          break;
      }
    };

    const player = document.querySelector('.audio-player');
    if (player) {
      player.addEventListener('keydown', handleKeyDown);
      return () => player.removeEventListener('keydown', handleKeyDown);
    }
  }, [globalTime, globalDuration]);

  // Инициализация первого трека
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (hasTracks && !audio.src) {
      audio.src = tracks[0].url;
    }
  }, [hasTracks, tracks]);

  // Прогресс в процентах
  const progressPercent = globalDuration > 0 ? Math.round((globalTime / globalDuration) * 100) : 0;

  // Текущий трек
  const currentTrack = hasTracks ? tracks[currentTrackIndex] : null;

  return (
    <section
      className="audio-player"
      role="region"
      aria-label={`Аудиоплеер: ${title}`}
    >
      <h2 className="audio-player__title">Плеер: {title}</h2>

      {/* Информация о текущей главе */}
      {hasTracks && currentTrack && (
        <p className="audio-player__chapter" aria-live="polite" aria-atomic="true">
          Часть {currentTrack.index} из {tracks.length}
        </p>
      )}
      <div className="audio-player__track-selector">
  <label htmlFor="track-select" className="visually-hidden">
    Выбор главы или части
  </label>
  <select
    id="track-select"
    className="audio-player__select"
    value={currentTrack?.index ?? (tracks[0]?.index ?? 0)}
    onChange={(e) => {
      const selectedIndex = parseInt(e.target.value, 10);
      jumpToTrack(selectedIndex);
    }}
  >
    {tracks.map((track) => (
      <option 
        key={track.index} 
        value={track.index}
        aria-label={`Часть ${track.index}: начало ${formatLongTime(track.startTime ?? 0)}`}
      >
        Часть {track.index} — с {formatLongTime(track.startTime ?? 0)}
      </option>
    ))}
  </select>
</div>
      {/* Время */}
      <p
        className="audio-player__time"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Текущее время ${formatLongTime(globalTime)} из ${formatLongTime(globalDuration)}`}
      >
        <span aria-hidden="true">
          {formatLongTime(globalTime)} / {formatLongTime(globalDuration)}
        </span>
      </p>

      {/* Аудио элемент */}
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {}}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
      >
        Ваш браузер не поддерживает воспроизведение аудио.
      </audio>

      {/* Кнопки управления */}
      <div className="audio-player__controls" role="group" aria-label="Управление воспроизведением">
        <button
          type="button"
          className="audio-player__btn"
          onClick={() => skip(-SKIP_SECONDS)}
          aria-label={`Перемотать назад на ${SKIP_SECONDS} секунд`}
        >
          −{SKIP_SECONDS} сек
        </button>

        <button
          type="button"
          className="audio-player__btn audio-player__btn--primary"
          onClick={togglePlay}
          aria-label={isLoading ? 'Загрузка' : (isPlaying ? 'Пауза' : 'Воспроизведение')}
          aria-pressed={isPlaying}
        >
          {isLoading ? 'Загрузка…' : (isPlaying ? 'Пауза' : 'Играть')}
        </button>

        <button
          type="button"
          className="audio-player__btn"
          onClick={() => skip(SKIP_SECONDS)}
          aria-label={`Перемотать вперёд на ${SKIP_SECONDS} секунд`}
        >
          +{SKIP_SECONDS} сек
        </button>
      </div>

      {/* Полоса прогресса */}
      <label htmlFor="audio-progress" className="visually-hidden">
        Полоса перемотки, {progressPercent} процентов
      </label>
      <input
        id="audio-progress"
        type="range"
        className="audio-player__progress"
        min={0}
        max={globalDuration || 0}
        step={1}
        value={globalTime}
        onChange={handleSeek}
        aria-valuemin={0}
        aria-valuemax={globalDuration || 0}
        aria-valuenow={globalTime}
        aria-valuetext={`${formatLongTime(globalTime)} из ${formatLongTime(globalDuration)}`}
        aria-label="Позиция воспроизведения"
      />

      {/* Список глав */}
      {hasTracks}


    </section>
  );
}

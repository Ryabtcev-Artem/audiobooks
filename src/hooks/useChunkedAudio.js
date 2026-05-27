import { useCallback, useEffect, useRef, useState } from 'react';

const SWITCH_THRESHOLD = 0.5; // секунды до конца чанка для переключения

export default function useChunkedAudio(chunks) {
  const audioRef = useRef(null);
  const chunkIndexRef = useRef(0);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [globalTime, setGlobalTime] = useState(0);
  const [globalDuration, setGlobalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Вычисляем общую длительность
  useEffect(() => {
    if (!chunks || chunks.length === 0) {
      setGlobalDuration(0);
      return;
    }
    const total = chunks.reduce((sum, ch) => sum + ch.durationSec, 0);
    setGlobalDuration(total);
    setCurrentChunkIndex(0);
    chunkIndexRef.current = 0;
    setGlobalTime(0);
  }, [chunks]);

  // Находим чанок по глобальному времени (линейный поиск — чанков немного)
  const findChunkByTime = useCallback(
    (targetTime) => {
      if (!chunks || chunks.length === 0) return { index: 0, localTime: 0 };

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkEnd = chunk.startTime + chunk.durationSec;
        if (targetTime >= chunk.startTime && targetTime < chunkEnd) {
          return { index: i, localTime: targetTime - chunk.startTime };
        }
      }

      // За пределами — последний чанок
      const lastIdx = chunks.length - 1;
      return { index: lastIdx, localTime: chunks[lastIdx].durationSec };
    },
    [chunks]
  );

  // Загрузить чанок в audio-элемент
  const loadChunk = useCallback((chunkIndex, localTime = 0) => {
    const audio = audioRef.current;
    if (!audio || !chunks || chunks.length === 0) return;

    const chunk = chunks[chunkIndex];
    if (!chunk) return;

    chunkIndexRef.current = chunkIndex;
    setCurrentChunkIndex(chunkIndex);

    // Если уже загружен этот чанок
    if (audio.src && audio.src === chunk.url) {
      audio.currentTime = localTime;
      return;
    }

    setIsLoading(true);
    const wasPlaying = !audio.paused;

    audio.src = chunk.url;
    audio.currentTime = localTime;

    const onCanPlay = () => {
      setIsLoading(false);
      if (wasPlaying) {
        audio.play().catch(() => {});
      }
      audio.removeEventListener('canplay', onCanPlay);
    };

    audio.addEventListener('canplay', onCanPlay);
  }, [chunks]);

  // Переключить на следующий чанок
  const advanceToNextChunk = useCallback(() => {
    const nextIndex = chunkIndexRef.current + 1;
    if (chunks && nextIndex < chunks.length) {
      loadChunk(nextIndex, 0);
    } else {
      setIsPlaying(false);
      setStatusMessage('Воспроизведение завершено');
    }
  }, [chunks, loadChunk]);

  // Обработчик timeupdate
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !chunks) return;

    const idx = chunkIndexRef.current;
    const chunk = chunks[idx];
    if (!chunk) return;

    const localTime = audio.currentTime;
    const newGlobalTime = chunk.startTime + localTime;
    setGlobalTime(newGlobalTime);

    // Проверяем, не пора ли переключить чанок
    if (chunk.durationSec > 0 && localTime >= chunk.durationSec - SWITCH_THRESHOLD) {
      advanceToNextChunk();
    }
  }, [chunks, advanceToNextChunk]);

  // Play / Pause
  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !chunks || chunks.length === 0) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
        setStatusMessage('Воспроизведение');
      } catch {
        setStatusMessage('Не удалось начать воспроизведение');
      }
    } else {
      audio.pause();
      setIsPlaying(false);
      setStatusMessage('Пауза');
    }
  }, [chunks]);

  // Перемотка на delta секунд
  const skip = useCallback(
    (delta) => {
      const target = Math.max(0, Math.min(globalTime + delta, globalDuration));
      const { index, localTime } = findChunkByTime(target);
      loadChunk(index, localTime);
      setGlobalTime(target);
      setStatusMessage(
        delta < 0 ? 'Перемотка назад' : 'Перемотка вперёд'
      );
    },
    [globalTime, globalDuration, findChunkByTime, loadChunk]
  );

  // Перемотка на конкретную позицию
  const seek = useCallback(
    (targetGlobalTime) => {
      const clamped = Math.max(0, Math.min(targetGlobalTime, globalDuration));
      const { index, localTime } = findChunkByTime(clamped);
      loadChunk(index, localTime);
      setGlobalTime(clamped);
    },
    [globalDuration, findChunkByTime, loadChunk]
  );

  // События audio-элемента
  const onLoadedMetadata = useCallback(() => {
    // Метаданные загружены
  }, []);

  const onEnded = useCallback(() => {
    advanceToNextChunk();
  }, [advanceToNextChunk]);

  const onPlay = useCallback(() => setIsPlaying(true), []);
  const onPause = useCallback(() => setIsPlaying(false), []);

  // Инициализация первого чанка
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !chunks || chunks.length === 0) return;
    if (!audio.src) {
      audio.src = chunks[0].url;
    }
  }, [chunks]);

  return {
    audioRef,
    currentChunkIndex,
    currentChunk: chunks?.[currentChunkIndex] || null,
    globalTime,
    globalDuration,
    isPlaying,
    isLoading,
    statusMessage,
    togglePlay,
    skip,
    seek,
    handleTimeUpdate,
    onLoadedMetadata,
    onEnded,
    onPlay,
    onPause,
  };
}

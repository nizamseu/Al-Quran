import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataService from "../services/dataService";

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackMode, setPlaybackMode] = useState("sura"); // 'sura' or 'ayah'
  const [currentReciter, setCurrentReciter] = useState(
    "mishari-rashid-al-afasy"
  );
  const [repeatMode, setRepeatMode] = useState("none"); // 'none', 'one', 'all'
  const [downloadedAudios, setDownloadedAudios] = useState({});
  const [downloadProgress, setDownloadProgress] = useState({});

  const soundRef = useRef(null);
  const positionUpdateRef = useRef(null);

  useEffect(() => {
    loadAudioSettings();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (positionUpdateRef.current) {
        clearInterval(positionUpdateRef.current);
      }
    };
  }, []);

  const loadAudioSettings = async () => {
    try {
      const [savedReciter, savedMode, savedRepeat, savedDownloads] =
        await Promise.all([
          AsyncStorage.getItem("audio_reciter"),
          AsyncStorage.getItem("audio_playback_mode"),
          AsyncStorage.getItem("audio_repeat_mode"),
          AsyncStorage.getItem("downloaded_audios"),
        ]);

      if (savedReciter) setCurrentReciter(savedReciter);
      if (savedMode) setPlaybackMode(savedMode);
      if (savedRepeat) setRepeatMode(savedRepeat);
      if (savedDownloads) setDownloadedAudios(JSON.parse(savedDownloads));
    } catch (error) {
      console.error("Error loading audio settings:", error);
    }
  };

  const saveAudioSettings = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem("audio_reciter", currentReciter),
        AsyncStorage.setItem("audio_playback_mode", playbackMode),
        AsyncStorage.setItem("audio_repeat_mode", repeatMode),
        AsyncStorage.setItem(
          "downloaded_audios",
          JSON.stringify(downloadedAudios)
        ),
      ]);
    } catch (error) {
      console.error("Error saving audio settings:", error);
    }
  };

  const startPositionTracking = () => {
    if (positionUpdateRef.current) {
      clearInterval(positionUpdateRef.current);
    }

    positionUpdateRef.current = setInterval(async () => {
      if (soundRef.current && isPlaying) {
        try {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded) {
            setPosition(status.positionMillis || 0);
            setDuration(status.durationMillis || 0);
          }
        } catch (error) {
          console.error("Error getting playback status:", error);
        }
      }
    }, 1000);
  };

  const stopPositionTracking = () => {
    if (positionUpdateRef.current) {
      clearInterval(positionUpdateRef.current);
      positionUpdateRef.current = null;
    }
  };

  const playSura = async (suraId, suraName) => {
    try {
      setIsLoading(true);

      // Stop current playback
      await stopPlayback();

      // Get recitation data
      const recitationData = await dataService.getSuraRecitation(
        suraId,
        currentReciter
      );
      if (!recitationData) {
        throw new Error("Recitation data not found");
      }

      // Check if audio is downloaded
      const audioKey = `sura_${suraId}_${currentReciter}`;
      const audioUri = downloadedAudios[audioKey] || recitationData.audio_url;

      // Create and load sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true, isLooping: repeatMode === "one" }
      );

      soundRef.current = newSound;
      setSound(newSound);
      setCurrentTrack({
        type: "sura",
        suraId: parseInt(suraId),
        suraName,
        reciter: currentReciter,
        audioUrl: audioUri,
        duration: recitationData.duration * 1000, // Convert to milliseconds
      });

      setIsPlaying(true);
      startPositionTracking();

      // Set up playback status update
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish && !status.isLooping) {
          handlePlaybackFinished();
        }
      });
    } catch (error) {
      console.error("Error playing sura:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const playAyah = async (suraId, ayahNumber, suraName) => {
    try {
      setIsLoading(true);

      // Stop current playback
      await stopPlayback();

      // Get recitation data
      // For ayah-by-ayah, we need to use appropriate reciters
      const ayahReciters = ["abdul-basit", "yasser-al-dosari"];
      const reciterToUse = ayahReciters.includes(currentReciter)
        ? currentReciter
        : "abdul-basit"; // Default to abdul-basit for ayah recitation

      const recitationData = await dataService.getVerseRecitation(
        suraId,
        ayahNumber,
        reciterToUse
      );
      if (!recitationData) {
        throw new Error("Verse recitation data not found");
      }

      // Check if audio is downloaded
      const audioKey = `ayah_${suraId}_${ayahNumber}_${reciterToUse}`;
      const audioUri = downloadedAudios[audioKey] || recitationData.audio_url;

      // Create and load sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true, isLooping: repeatMode === "one" }
      );

      soundRef.current = newSound;
      setSound(newSound);
      setCurrentTrack({
        type: "ayah",
        suraId: parseInt(suraId),
        ayahNumber: parseInt(ayahNumber),
        suraName,
        reciter: reciterToUse,
        audioUrl: audioUri,
        segments: recitationData.segments,
      });

      setIsPlaying(true);
      startPositionTracking();

      // Set up playback status update
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish && !status.isLooping) {
          handlePlaybackFinished();
        }
      });
    } catch (error) {
      console.error("Error playing ayah:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaybackFinished = () => {
    if (repeatMode === "one") {
      // Already handled by isLooping
      return;
    }

    if (repeatMode === "all" && currentTrack) {
      if (currentTrack.type === "sura") {
        // Move to next sura
        const nextSuraId = currentTrack.suraId + 1;
        if (nextSuraId <= 114) {
          playSura(nextSuraId, `Sura ${nextSuraId}`);
          return;
        }
      } else if (currentTrack.type === "ayah") {
        // Move to next ayah (implementation depends on your requirements)
        // For now, stop playback
      }
    }

    // Stop playback
    setIsPlaying(false);
    setCurrentTrack(null);
    stopPositionTracking();
  };

  const pausePlayback = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        stopPositionTracking();
      }
    } catch (error) {
      console.error("Error pausing playback:", error);
    }
  };

  const resumePlayback = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
        startPositionTracking();
      }
    } catch (error) {
      console.error("Error resuming playback:", error);
    }
  };

  const stopPlayback = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setSound(null);
      setIsPlaying(false);
      setCurrentTrack(null);
      setPosition(0);
      setDuration(0);
      stopPositionTracking();
    } catch (error) {
      console.error("Error stopping playback:", error);
    }
  };

  const seekTo = async (positionMillis) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(positionMillis);
        setPosition(positionMillis);
      }
    } catch (error) {
      console.error("Error seeking:", error);
    }
  };

  const downloadAudio = async (
    type,
    suraId,
    ayahNumber = null,
    reciter = currentReciter
  ) => {
    try {
      const audioKey = ayahNumber
        ? `ayah_${suraId}_${ayahNumber}_${reciter}`
        : `sura_${suraId}_${reciter}`;

      if (downloadedAudios[audioKey]) {
        return downloadedAudios[audioKey]; // Already downloaded
      }

      // Get audio URL
      let audioUrl;
      if (type === "sura") {
        const recitationData = await dataService.getSuraRecitation(
          suraId,
          reciter
        );
        audioUrl = recitationData?.audio_url;
      } else {
        const recitationData = await dataService.getVerseRecitation(
          suraId,
          ayahNumber,
          reciter
        );
        audioUrl = recitationData?.audio_url;
      }

      if (!audioUrl) {
        throw new Error("Audio URL not found");
      }

      // Create local file path
      const audioDir = `${FileSystem.documentDirectory}audio/`;
      const localPath = `${audioDir}${audioKey}.mp3`;

      // Ensure audio directory exists
      await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });

      // Check if file already exists locally
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (fileInfo.exists) {
        const newDownloadedAudios = {
          ...downloadedAudios,
          [audioKey]: localPath,
        };

        setDownloadedAudios(newDownloadedAudios);
        await AsyncStorage.setItem(
          "downloaded_audios",
          JSON.stringify(newDownloadedAudios)
        );
        return localPath;
      }

      // Download the file with progress tracking
      setDownloadProgress((prev) => ({ ...prev, [audioKey]: 0 }));

      const downloadResult = await FileSystem.createDownloadResumable(
        audioUrl,
        localPath,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress((prev) => ({ ...prev, [audioKey]: progress }));
        }
      ).downloadAsync();

      if (downloadResult?.uri) {
        const newDownloadedAudios = {
          ...downloadedAudios,
          [audioKey]: downloadResult.uri,
        };

        setDownloadedAudios(newDownloadedAudios);
        await AsyncStorage.setItem(
          "downloaded_audios",
          JSON.stringify(newDownloadedAudios)
        );

        // Clear download progress
        setDownloadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[audioKey];
          return newProgress;
        });

        return downloadResult.uri;
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Error downloading audio:", error);

      // Clear download progress on error
      setDownloadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[audioKey];
        return newProgress;
      });

      throw error;
    }
  };

  const removeDownloadedAudio = async (
    type,
    suraId,
    ayahNumber = null,
    reciter = currentReciter
  ) => {
    try {
      const audioKey = ayahNumber
        ? `ayah_${suraId}_${ayahNumber}_${reciter}`
        : `sura_${suraId}_${reciter}`;

      const localPath = downloadedAudios[audioKey];
      if (localPath && localPath.startsWith(FileSystem.documentDirectory)) {
        // Delete local file
        await FileSystem.deleteAsync(localPath, { idempotent: true });
      }

      // Remove from downloaded audios
      const newDownloadedAudios = { ...downloadedAudios };
      delete newDownloadedAudios[audioKey];

      setDownloadedAudios(newDownloadedAudios);
      await AsyncStorage.setItem(
        "downloaded_audios",
        JSON.stringify(newDownloadedAudios)
      );

      return true;
    } catch (error) {
      console.error("Error removing downloaded audio:", error);
      throw error;
    }
  };

  const changeReciter = async (newReciter) => {
    setCurrentReciter(newReciter);
    await AsyncStorage.setItem("audio_reciter", newReciter);
  };

  const getAvailableReciters = () => {
    const reciterData = dataService.getAvailableReciters();
    // Flatten the reciters from both categories
    const allReciters = [
      ...(reciterData["ayah-by-ayah"] || []),
      ...(reciterData["sura-by-sura"] || []),
    ];
    // Remove duplicates based on id
    const uniqueReciters = allReciters.filter(
      (reciter, index, self) =>
        index === self.findIndex((r) => r.id === reciter.id)
    );
    return uniqueReciters;
  };

  const changePlaybackMode = async (newMode) => {
    setPlaybackMode(newMode);
    await AsyncStorage.setItem("audio_playback_mode", newMode);
  };

  const changeRepeatMode = async (newMode) => {
    setRepeatMode(newMode);
    if (soundRef.current) {
      await soundRef.current.setIsLoopingAsync(newMode === "one");
    }
    await AsyncStorage.setItem("audio_repeat_mode", newMode);
  };

  const value = {
    // State
    isPlaying,
    isLoading,
    currentTrack,
    position,
    duration,
    playbackMode,
    currentReciter,
    repeatMode,
    downloadedAudios,
    downloadProgress,

    // Actions
    playSura,
    playAyah,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    seekTo,
    downloadAudio,
    removeDownloadedAudio,

    // Settings
    changeReciter,
    changePlaybackMode,
    changeRepeatMode,

    // Helpers
    getAvailableReciters,
    formatTime: (milliseconds) => {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    },
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};

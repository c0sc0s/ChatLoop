/**
 * 媒体约束相关配置
 */

export const DefaultVideoConstraints: MediaTrackConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 30 }
};

export const LowQualityVideoConstraints: MediaTrackConstraints = {
  width: { ideal: 640 },
  height: { ideal: 480 },
  frameRate: { ideal: 20 }
};

export const HighQualityVideoConstraints: MediaTrackConstraints = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
  frameRate: { ideal: 30 }
};

export const DefaultAudioConstraints: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true
};

export const HighQualityAudioConstraints: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  channelCount: 2,
  sampleRate: 48000,
  sampleSize: 16
};

export const ScreenShareConstraints = {
  video: {
    cursor: "always",
    displaySurface: "monitor",
    logicalSurface: true,
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { max: 15 }
  } as MediaTrackConstraints,
  audio: false
};

export type QualityPreset = 'low' | 'default' | 'high';

/**
 * 根据预设获取视频约束
 */
export function getVideoConstraintsByPreset(preset: QualityPreset): MediaTrackConstraints {
  switch (preset) {
    case 'low':
      return LowQualityVideoConstraints;
    case 'high':
      return HighQualityVideoConstraints;
    case 'default':
    default:
      return DefaultVideoConstraints;
  }
}

/**
 * 根据预设获取音频约束
 */
export function getAudioConstraintsByPreset(preset: QualityPreset): MediaTrackConstraints {
  switch (preset) {
    case 'high':
      return HighQualityAudioConstraints;
    case 'low':
    case 'default':
    default:
      return DefaultAudioConstraints;
  }
} 
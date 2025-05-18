// 获取用户音视频信息
import {
    ScreenShareConstraints,
    getVideoConstraintsByPreset,
    getAudioConstraintsByPreset
} from './config';
import type { QualityPreset } from './config';

class Gum {
    private videoStream: MediaStream | null = null;
    private audioStream: MediaStream | null = null;
    private combinedStream: MediaStream | null = null;
    private videoDevices: MediaDeviceInfo[] = [];
    private audioInDevices: MediaDeviceInfo[] = [];
    private audioOutDevices: MediaDeviceInfo[] = [];
    private activeVideoDeviceId: string | null = null;
    private activeAudioInDeviceId: string | null = null;
    private activeAudioOutDeviceId: string | null = null;
    private isInitialized: boolean = false;
    private qualityPreset: QualityPreset = 'default';

    constructor() {
        // 监听设备变化
        navigator.mediaDevices.addEventListener('devicechange', this.handleDeviceChange);
    }

    /**
     * 初始化，枚举所有设备
     * 应在应用启动时调用，如在App组件的useEffect中
     * 或在需要使用媒体设备前调用
     */
    async init(force: boolean = false) {
        // 如果已初始化且不是强制刷新，则直接返回
        if (this.isInitialized && !force) {
            return {
                videoDevices: this.videoDevices,
                audioInDevices: this.audioInDevices,
                audioOutDevices: this.audioOutDevices
            };
        }

        try {
            const devices = await this.enumerateDevices();
            this.isInitialized = true;
            return devices;
        } catch (error) {
            console.error("初始化媒体设备失败:", error);
            throw error;
        }
    }

    /**
     * 获取初始化状态
     */
    getInitStatus(): boolean {
        return this.isInitialized;
    }

    /**
     * 设置媒体质量预设
     * @param preset 质量预设：低、默认、高
     */
    setQualityPreset(preset: QualityPreset): void {
        this.qualityPreset = preset;
    }

    /**
     * 获取当前质量预设
     */
    getQualityPreset(): QualityPreset {
        return this.qualityPreset;
    }

    /**
     * 检查媒体权限
     * @returns 权限状态
     */
    async checkPermissions(): Promise<{ video: boolean; audio: boolean }> {
        try {
            // 请求音视频权限
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            // 检查是否成功获取到视频和音频
            const hasVideo = stream.getVideoTracks().length > 0;
            const hasAudio = stream.getAudioTracks().length > 0;

            // 停止所有轨道
            stream.getTracks().forEach(track => track.stop());

            return { video: hasVideo, audio: hasAudio };
        } catch (error) {
            console.error("检查媒体权限失败:", error);
            return { video: false, audio: false };
        }
    }

    /**
     * 枚举所有媒体设备
     */
    async enumerateDevices() {
        try {
            // 首先获取权限，以确保设备ID不是临时的
            await this.checkPermissions();

            // 获取所有设备
            const devices = await navigator.mediaDevices.enumerateDevices();

            // 过滤出不同类型的设备
            this.videoDevices = devices.filter(device => device.kind === 'videoinput');
            this.audioInDevices = devices.filter(device => device.kind === 'audioinput');
            this.audioOutDevices = devices.filter(device => device.kind === 'audiooutput');

            // 如果有设备，默认使用第一个
            if (this.videoDevices.length > 0 && !this.activeVideoDeviceId) {
                this.activeVideoDeviceId = this.videoDevices[0].deviceId;
            }

            if (this.audioInDevices.length > 0 && !this.activeAudioInDeviceId) {
                this.activeAudioInDeviceId = this.audioInDevices[0].deviceId;
            }

            if (this.audioOutDevices.length > 0 && !this.activeAudioOutDeviceId) {
                this.activeAudioOutDeviceId = this.audioOutDevices[0].deviceId;
            }

            return {
                videoDevices: this.videoDevices,
                audioInDevices: this.audioInDevices,
                audioOutDevices: this.audioOutDevices
            };
        } catch (error) {
            console.error("枚举媒体设备失败:", error);
            throw error;
        }
    }

    /**
     * 处理设备变更事件
     */
    private handleDeviceChange = async () => {
        try {
            await this.enumerateDevices();
            // 可以在这里触发回调或事件，通知上层设备列表变更
        } catch (error) {
            console.error("处理设备变更失败:", error);
        }
    }

    /**
     * 获取视频流
     * @param deviceId 指定的视频设备ID，不指定则使用当前活跃设备
     * @param customConstraints 自定义约束，会覆盖预设
     * @returns 视频流
     */
    async getVideoStream(deviceId?: string, customConstraints?: MediaTrackConstraints): Promise<MediaStream> {
        // 如果未初始化，先初始化
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            // 停止之前的视频流
            if (this.videoStream) {
                this.videoStream.getVideoTracks().forEach(track => track.stop());
            }

            // 使用指定的设备ID或当前活跃设备
            const useDeviceId = deviceId || this.activeVideoDeviceId || undefined;

            // 获取当前预设的视频约束
            const presetConstraints = getVideoConstraintsByPreset(this.qualityPreset);

            // 合并预设约束和自定义约束
            const videoConstraints: MediaTrackConstraints = {
                ...presetConstraints,
                ...customConstraints,
                deviceId: useDeviceId ? { exact: useDeviceId } : undefined
            };

            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: videoConstraints,
                audio: false
            });

            // 更新当前活跃视频设备ID
            if (deviceId) {
                this.activeVideoDeviceId = deviceId;
            }

            return this.videoStream;
        } catch (error) {
            console.error("获取视频流失败:", error);
            throw error;
        }
    }

    /**
     * 获取音频流
     * @param deviceId 指定的音频输入设备ID，不指定则使用当前活跃设备
     * @param customConstraints 自定义约束，会覆盖预设
     * @returns 音频流
     */
    async getAudioStream(deviceId?: string, customConstraints?: MediaTrackConstraints): Promise<MediaStream> {
        // 如果未初始化，先初始化
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            // 停止之前的音频流
            if (this.audioStream) {
                this.audioStream.getAudioTracks().forEach(track => track.stop());
            }

            // 使用指定的设备ID或当前活跃设备
            const useDeviceId = deviceId || this.activeAudioInDeviceId || undefined;

            // 获取当前预设的音频约束
            const presetConstraints = getAudioConstraintsByPreset(this.qualityPreset);

            // 合并预设约束和自定义约束
            const audioConstraints: MediaTrackConstraints = {
                ...presetConstraints,
                ...customConstraints,
                deviceId: useDeviceId ? { exact: useDeviceId } : undefined
            };

            this.audioStream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: audioConstraints
            });

            // 更新当前活跃音频输入设备ID
            if (deviceId) {
                this.activeAudioInDeviceId = deviceId;
            }

            return this.audioStream;
        } catch (error) {
            console.error("获取音频流失败:", error);
            throw error;
        }
    }

    /**
     * 获取完整的音视频流
     * @param videoDeviceId 视频设备ID
     * @param audioDeviceId 音频设备ID
     * @param videoConstraints 自定义视频约束
     * @param audioConstraints 自定义音频约束
     * @returns 包含音频和视频轨道的媒体流
     */
    async getUserMedia(
        videoDeviceId?: string,
        audioDeviceId?: string,
        videoConstraints?: MediaTrackConstraints,
        audioConstraints?: MediaTrackConstraints
    ): Promise<MediaStream> {
        // 如果未初始化，先初始化
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            // 停止之前的所有流
            this.stopAllStreams();

            // 使用指定的设备ID或当前活跃设备
            const useVideoDeviceId = videoDeviceId || this.activeVideoDeviceId || undefined;
            const useAudioDeviceId = audioDeviceId || this.activeAudioInDeviceId || undefined;

            // 获取当前预设的约束
            const presetVideoConstraints = getVideoConstraintsByPreset(this.qualityPreset);
            const presetAudioConstraints = getAudioConstraintsByPreset(this.qualityPreset);

            // 创建完整的约束
            const constraints: MediaStreamConstraints = {
                video: {
                    ...presetVideoConstraints,
                    ...videoConstraints,
                    deviceId: useVideoDeviceId ? { exact: useVideoDeviceId } : undefined
                },
                audio: {
                    ...presetAudioConstraints,
                    ...audioConstraints,
                    deviceId: useAudioDeviceId ? { exact: useAudioDeviceId } : undefined
                }
            };

            // 获取完整流
            this.combinedStream = await navigator.mediaDevices.getUserMedia(constraints);

            // 更新当前活跃设备ID
            if (videoDeviceId) {
                this.activeVideoDeviceId = videoDeviceId;
            }

            if (audioDeviceId) {
                this.activeAudioInDeviceId = audioDeviceId;
            }

            return this.combinedStream;
        } catch (error) {
            console.error("获取完整媒体流失败:", error);
            throw error;
        }
    }

    /**
     * 获取屏幕共享流
     * @param withAudio 是否包含音频
     * @param customConstraints 自定义约束条件
     * @returns 屏幕共享流
     */
    async getDisplayMedia(withAudio = false, customConstraints?: any): Promise<MediaStream> {
        try {
            const constraints = {
                ...ScreenShareConstraints,
                ...customConstraints,
                audio: withAudio
            };

            const mediaStream = await navigator.mediaDevices.getDisplayMedia(constraints);

            return mediaStream;
        } catch (error) {
            console.error("获取屏幕共享流失败:", error);
            throw error;
        }
    }

    /**
     * 设置音频输出设备
     * @param element 音频或视频元素
     * @param deviceId 设备ID
     */
    async setAudioOutput(element: HTMLMediaElement, deviceId?: string): Promise<void> {
        // 如果未初始化，先初始化
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            const useDeviceId = deviceId || this.activeAudioOutDeviceId || undefined;

            if (!useDeviceId) {
                throw new Error("没有可用的音频输出设备");
            }

            // 确保浏览器支持setSinkId
            if ('setSinkId' in element) {
                // 类型断言以解决TypeScript中的定义问题
                // @ts-ignore - 某些浏览器类型定义可能不包含此属性
                await element.setSinkId(useDeviceId);

                // 更新当前活跃音频输出设备ID
                if (deviceId) {
                    this.activeAudioOutDeviceId = deviceId;
                }
            } else {
                throw new Error("您的浏览器不支持设置音频输出设备");
            }
        } catch (error) {
            console.error("设置音频输出设备失败:", error);
            throw error;
        }
    }

    /**
     * 获取当前视频流
     */
    getVideoStreamInstance(): MediaStream | null {
        return this.videoStream;
    }

    /**
     * 获取当前音频流
     */
    getAudioStreamInstance(): MediaStream | null {
        return this.audioStream;
    }

    /**
     * 获取当前完整流
     */
    getCombinedStreamInstance(): MediaStream | null {
        return this.combinedStream;
    }

    /**
     * 获取所有视频设备
     */
    getVideoDevices(): MediaDeviceInfo[] {
        return this.videoDevices;
    }

    /**
     * 获取所有音频输入设备
     */
    getAudioInDevices(): MediaDeviceInfo[] {
        return this.audioInDevices;
    }

    /**
     * 获取所有音频输出设备
     */
    getAudioOutDevices(): MediaDeviceInfo[] {
        return this.audioOutDevices;
    }

    /**
     * 获取当前活跃的视频设备ID
     */
    getActiveVideoDeviceId(): string | null {
        return this.activeVideoDeviceId;
    }

    /**
     * 获取当前活跃的音频输入设备ID
     */
    getActiveAudioInDeviceId(): string | null {
        return this.activeAudioInDeviceId;
    }

    /**
     * 获取当前活跃的音频输出设备ID
     */
    getActiveAudioOutDeviceId(): string | null {
        return this.activeAudioOutDeviceId;
    }

    /**
     * 停止所有流
     */
    stopAllStreams(): void {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }

        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }

        if (this.combinedStream) {
            this.combinedStream.getTracks().forEach(track => track.stop());
            this.combinedStream = null;
        }
    }

    /**
     * 暂停视频轨道
     * @param pause 是否暂停
     */
    pauseVideo(pause: boolean): void {
        if (this.videoStream) {
            this.videoStream.getVideoTracks().forEach(track => {
                track.enabled = !pause;
            });
        }

        if (this.combinedStream) {
            this.combinedStream.getVideoTracks().forEach(track => {
                track.enabled = !pause;
            });
        }
    }

    /**
     * 暂停音频轨道
     * @param pause 是否暂停
     */
    pauseAudio(pause: boolean): void {
        if (this.audioStream) {
            this.audioStream.getAudioTracks().forEach(track => {
                track.enabled = !pause;
            });
        }

        if (this.combinedStream) {
            this.combinedStream.getAudioTracks().forEach(track => {
                track.enabled = !pause;
            });
        }
    }

    /**
     * 设置视频约束
     * @param constraints 约束条件
     */
    async applyVideoConstraints(constraints: MediaTrackConstraints): Promise<void> {
        if (this.videoStream) {
            const videoTrack = this.videoStream.getVideoTracks()[0];
            if (videoTrack) {
                await videoTrack.applyConstraints(constraints);
            }
        }

        if (this.combinedStream) {
            const videoTrack = this.combinedStream.getVideoTracks()[0];
            if (videoTrack) {
                await videoTrack.applyConstraints(constraints);
            }
        }
    }

    /**
     * 析构函数，用于清理资源
     */
    destroy(): void {
        this.stopAllStreams();
        navigator.mediaDevices.removeEventListener('devicechange', this.handleDeviceChange);
    }
}

// 导出单例
export default new Gum();

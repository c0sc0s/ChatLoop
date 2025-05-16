// 系统相关的状态
import { create } from "zustand";

export enum WsConnectionStatus {
    CONNECTED = "CONNECTED",
    CONNECTING = "CONNECTING",
    DISCONNECTED = "DISCONNECTED",
}

interface AppState {
    hasInit: boolean;
    hasLogin: boolean;
    wsConnectionStatus: WsConnectionStatus;
}

interface AppActions {
    setHasInit: (hasInit: boolean) => void;
    setHasLogin: (hasLogin: boolean) => void;
    setWsConnectionStatus: (wsConnectionStatus: WsConnectionStatus) => void;
}

const useAppStore = create<AppState & AppActions>((set) => ({
    hasInit: false,
    hasLogin: false,
    wsConnectionStatus: WsConnectionStatus.DISCONNECTED,
    setHasInit: (hasInit: boolean) => set({ hasInit }),
    setHasLogin: (hasLogin: boolean) => set({ hasLogin }),
    setWsConnectionStatus: (wsConnectionStatus: WsConnectionStatus) => set({ wsConnectionStatus }),
}));

export default useAppStore;

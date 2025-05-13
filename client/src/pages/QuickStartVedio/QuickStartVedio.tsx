import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, Video, X } from "lucide-react";
import { toast } from "sonner";
import { InputOTP, InputOTPSlot, InputOTPGroup } from "@/components/ui/input-otp";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import "./style.css";
import gum from "@/lib/gum";

export default function QuickStartVedio() {
    const [roomCode, setRoomCode] = useState<string | null>(null);
    const [inputCode, setInputCode] = useState("");
    const [joined, setJoined] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [roomActive, setRoomActive] = useState(false);
    const [mainIsSelf, setMainIsSelf] = useState(false); // false:主区等待, true:主区自己视频
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (stream) {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        }
    }, [stream, videoRef.current])

    useEffect(() => {
        (async () => {
            const stream = await gum.getUserMedia();
            setStream(stream);
        })()
    }, []);

    // 关闭房间
    const handleCloseRoom = () => {
        setRoomActive(false);
        setRoomCode(null);
        setJoined(false);
        setMainIsSelf(false);
    };

    // 创建房间
    const handleCreateRoom = () => {
        setDialogOpen(true);
    };
    const handleDialogConfirm = () => {
        // mock 生成房间码
        const code = Math.random().toString(36).slice(2, 8).toUpperCase();
        setRoomCode(code);
        setRoomActive(true);
        setJoined(true);
        setDialogOpen(false);
        setMainIsSelf(false);
        toast.success("房间已创建，等待他人加入");
    };

    // 复制房间码
    const handleCopy = () => {
        if (roomCode) {
            navigator.clipboard.writeText(roomCode);
            toast.success("房间码已复制");
        }
    };

    // 画中画切换
    const handleSwap = () => setMainIsSelf((v) => !v);

    // 画中画和主区的布局参数
    const pipStyle = {
        position: "fixed" as const,
        right: 32,
        bottom: 32,
        width: 220,
        height: 140,
        zIndex: 30,
        cursor: "pointer",
        boxShadow: "0 4px 32px 0 rgba(0,0,0,0.18)",
        borderRadius: 16,
        overflow: "hidden",
        background: "#111",
    };
    const mainStyle = {
        width: 520,
        height: 340,
        borderRadius: 20,
        overflow: "hidden",
        background: "#111",
        boxShadow: "0 4px 32px 0 rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative" as const,
    };

    return (
        <div className="w-full h-full flex flex-col">
            <AnimatePresence>
                {!roomActive && (
                    <motion.div
                        key="entry"
                        className="relative flex flex-col flex-1 justify-center items-center gap-4 text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <h1 className="text-2xl font-bold">一串号码，开始一场快速视频 🤞</h1>
                        <div className="relative flex items-center justify-center">
                            <div className="pulse-shadow" />
                            <div className="rounded-lg border-2 border-blue-300 overflow-hidden relative z-10">
                                <video ref={videoRef} autoPlay playsInline muted />
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <Button size='lg' variant='secondary' className="w-32 h-12" onClick={handleCreateRoom}>
                                创建房间
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {roomActive && (
                    <motion.div
                        key="room"
                        className="flex flex-col flex-1 items-center pt-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* 顶部房间号和关闭 */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex items-center bg-muted rounded-lg px-6 py-3 text-lg font-medium">
                                房间号：<span className="font-mono text-xl ml-2">{roomCode}</span>
                                <Button size="icon" variant="ghost" onClick={handleCopy} className="ml-2">
                                    <Copy className="size-4" />
                                </Button>
                            </div>
                            <Button size="icon" variant="destructive" onClick={handleCloseRoom} title="关闭房间">
                                <X className="size-5" />
                            </Button>
                        </div>
                        {/* 主区和画中画 */}
                        <div className="relative w-[600px] h-[400px]">
                            {/* 主区内容 */}
                            <motion.div
                                layout
                                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                style={mainStyle}
                                className="absolute left-0 top-0"
                            >
                                {mainIsSelf ? (
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center w-full h-full">
                                        <Loader2 className="animate-spin size-10 mb-4 text-blue-400" />
                                        <div className="text-lg font-semibold">正在等待其他人加入…</div>
                                    </div>
                                )}
                            </motion.div>
                            {/* 画中画 */}
                            <motion.div
                                layout
                                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                style={pipStyle}
                                onClick={handleSwap}
                                className="group"
                                whileHover={{ scale: 1.05 }}
                            >
                                {mainIsSelf ? (
                                    <div className="flex flex-col items-center justify-center w-full h-full">
                                        <Loader2 className="animate-spin size-6 mb-2 text-blue-400" />
                                        <div className="text-xs">等待其他人加入</div>
                                    </div>
                                ) : (
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                )}
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition" />
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* 创建房间Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>确认创建房间？</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-2">
                        <Button onClick={handleDialogConfirm} className="w-52">确认</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 
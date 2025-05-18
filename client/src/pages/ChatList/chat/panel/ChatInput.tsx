import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Paperclip, Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isSendingMessage: boolean;
}

export function ChatInput({ onSendMessage, isSendingMessage }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      await onSendMessage(input);
      setInput("");
    } catch (error) {
      // 错误处理
      console.error("发送消息失败", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        handleSubmit(e);
      }
    }
  };

  return (
    <div className="h-42 flex-shrink-0 p-4 pt-0 w-full bg-transparent">
      <form
        className="group bg-secondary/30 h-full w-full rounded-3xl p-3 flex flex-col border transition-colors duration-200 focus-within:border-primary/15"
        onSubmit={handleSubmit}
      >
        <Textarea
          className="border-0 flex-1 resize-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 caret-lime-500"
          placeholder="输入消息…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSendingMessage}
          onKeyDown={handleKeyDown}
        />
        <div className="flex flex-shrink-0 items-center gap-1 h-[40px] px-2">
          <div className="flex-1 items-start gap-2 flex">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full border"
              title="发送图片"
            >
              <ImageIcon className="size-5 text-lime-300" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full border"
              title="发送文件"
            >
              <Paperclip className="size-5 text-lime-300" />
            </Button>
          </div>
          <Button
            type="submit"
            size="sm"
            className="bg-lime-500/80 text-white"
            disabled={!input.trim() || isSendingMessage}
          >
            {isSendingMessage ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            发送
          </Button>
        </div>
      </form>
    </div>
  );
}

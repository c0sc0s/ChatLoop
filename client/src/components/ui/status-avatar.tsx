import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatusAvatarProps {
  src?: string;
  alt?: string;
  fallback?: ReactNode;
  status?: "online" | "away" | "busy" | "offline" | string;
  className?: string;
  indicatorClassName?: string;
}

/**
 * 带状态指示点的头像组件
 */
export function StatusAvatar({
  src,
  alt,
  fallback,
  status,
  className,
  indicatorClassName,
}: StatusAvatarProps) {
  // 根据状态获取对应的颜色
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      case "offline":
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="relative inline-block">
      <Avatar className={className}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background w-3 h-3",
            getStatusColor(status),
            indicatorClassName
          )}
        />
      )}
    </div>
  );
}

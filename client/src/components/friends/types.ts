import type { ReactNode } from "react";
import type { FriendData, FriendRequest, SentFriendRequest } from "@/common/types/friends";

/**
 * 好友分组定义
 */
export interface FriendGroup {
  id: string;
  name: string;
  icon?: ReactNode;
  friends: FriendData[];
}

/**
 * 好友状态类型
 */
export type FriendStatus = "online" | "offline" | "away" | "busy";

/**
 * 好友状态徽章属性
 */
export interface FriendStatusBadgeProps {
  status: string;
}

/**
 * 好友列表项属性
 */
export interface FriendItemProps {
  friend: FriendData;
  onDelete: (friendId: number) => void;
  onSendMessage: (friendId: number) => void;
  isDeleting: boolean;
}

/**
 * 好友列表属性
 */
export interface FriendListProps {
  group: FriendGroup | undefined;
  isLoading: boolean;
  onAddFriend: () => void;
  onDeleteFriend: (friendId: number) => void;
  onSendMessage: (friendId: number) => void;
  isDeletingFriend: Record<number, boolean>;
}

/**
 * 好友请求对话框属性
 */
export interface FriendRequestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestsUpdated: () => void;
}

/**
 * 收到的好友请求项属性
 */
export interface ReceivedRequestItemProps {
  request: FriendRequest;
  onAccept: (requestId: number) => void;
  onReject: (requestId: number) => void;
  isAccepting: boolean;
  isRejecting: boolean;
}

/**
 * 发送的好友请求项属性
 */
export interface SentRequestItemProps {
  request: SentFriendRequest;
  onCancel: (requestId: number) => void;
  isCancelling: boolean;
}

/**
 * 好友请求列表属性基础接口
 */
interface BaseRequestListProps {
  isLoading: boolean;
  emptyMessage: string;
}

/**
 * 收到的好友请求列表属性
 */
export interface ReceivedRequestListProps extends BaseRequestListProps {
  requests: FriendRequest[];
  onAccept: (requestId: number) => void;
  onReject: (requestId: number) => void;
  isProcessingRequest: Record<number, { accepting: boolean; rejecting: boolean }>;
}

/**
 * 发送的好友请求列表属性
 */
export interface SentRequestListProps extends BaseRequestListProps {
  requests: SentFriendRequest[];
  onCancel: (requestId: number) => void;
  isCancellingRequest: Record<number, boolean>;
} 
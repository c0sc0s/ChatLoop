import { useState } from "react";
import { createGroup } from "@/api/groups";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { searchUsers } from "@/api/user";
import useChatStore from "@/core/store/chat";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated?: () => void;
}

export default function CreateGroupDialog({
  open,
  onOpenChange,
  onGroupCreated,
}: CreateGroupDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const refreshConversations = useChatStore(
    (state) => state.fetchConversations
  );

  // 重置表单
  const resetForm = () => {
    setName("");
    setDescription("");
    setAvatar("");
    setSearchTerm("");
    setSearchResults([]);
    setSelectedMembers([]);
  };

  // 搜索用户
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const response = await searchUsers({
        keyword: searchTerm,
        page: 1,
        limit: 10,
      });
      setSearchResults(response.users);
    } catch (error) {
      toast.error("搜索用户失败", { description: String(error) });
    } finally {
      setIsSearching(false);
    }
  };

  // 选择或取消选择成员
  const toggleMember = (userId: number) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  // 创建群组
  const handleCreateGroup = async () => {
    if (!name.trim()) {
      toast.error("请输入群组名称");
      return;
    }

    setIsLoading(true);
    try {
      // 创建群组
      await createGroup({
        name,
        description: description || undefined,
        avatar: avatar || undefined,
        initialMemberIds:
          selectedMembers.length > 0 ? selectedMembers : undefined,
      });

      toast.success("群组创建成功");

      // 刷新会话列表
      refreshConversations();

      // 关闭对话框并重置表单
      onOpenChange(false);
      resetForm();

      // 回调函数
      if (onGroupCreated) {
        onGroupCreated();
      }
    } catch (error) {
      toast.error("创建群组失败", { description: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>创建新群组</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              群组名称
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入群组名称"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              群组描述
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入群组描述（可选）"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="avatar" className="text-right">
              群组头像
            </Label>
            <Input
              id="avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="输入头像URL（可选）"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">添加成员</Label>
            <div className="col-span-3 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索用户"
                  className="flex-1"
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchTerm.trim()}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "搜索"
                  )}
                </Button>
              </div>

              {/* 搜索结果 */}
              {searchResults.length > 0 && (
                <div className="border rounded-md p-2 max-h-[150px] overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                      onClick={() => toggleMember(user.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.username}
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            user.username[0]
                          )}
                        </div>
                        <span>{user.username}</span>
                      </div>
                      <div className="w-5 h-5 rounded-sm border flex items-center justify-center">
                        {selectedMembers.includes(user.id) && (
                          <div className="w-3 h-3 bg-primary rounded-sm" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 已选成员 */}
              {selectedMembers.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">
                    已选择 {selectedMembers.length} 名成员
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedMembers.map((userId) => {
                      const user = searchResults.find((u) => u.id === userId);
                      return (
                        user && (
                          <div
                            key={userId}
                            className="px-2 py-1 bg-primary/10 rounded-md text-xs flex items-center gap-1"
                          >
                            {user.username}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMember(userId);
                              }}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              ×
                            </button>
                          </div>
                        )
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleCreateGroup}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            创建群组
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

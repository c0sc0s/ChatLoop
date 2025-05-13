// src/pages/Friends.tsx
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Forward, Plus, Trash, Video } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const mockGroups = [
    {
        id: "org",
        name: "组织内联系人",
        contacts: [
            { id: "1", name: "王伟", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=wangwei", status: "在线", sign: "一起加油！" },
            { id: "2", name: "李娜", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=lina", status: "离线", sign: "" },
            { id: "3", name: "张磊", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=zhanglei", status: "在线", sign: "项目顺利进行中" },
            { id: "4", name: "赵敏", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=zhaomin", status: "在线", sign: "每天进步一点点" },
            { id: "5", name: "孙强", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=sunqiang", status: "离线", sign: "保持微笑" },
        ],
    },
    {
        id: "star",
        name: "星标联系人",
        contacts: [
            { id: "6", name: "周婷", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=zhouting", status: "在线", sign: "" },
            { id: "7", name: "吴昊", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=wuhao", status: "离线", sign: "期待下次见面" },
        ],
    },
    {
        id: "ext",
        name: "外部联系人",
        contacts: [
            { id: "8", name: "郑凯", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=zhengkai", status: "在线", sign: "合作愉快！" },
        ],
    },
];

const mockUsers = [
    { id: "r1", name: "r1", isFriend: true },
    { id: "r10", name: "r10", isFriend: false },
    { id: "r11", name: "r11", isFriend: false },
    { id: "r12", name: "r12", isFriend: false },
    { id: "r13", name: "r13", isFriend: false },
];

function AddFriendDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
    const [tab, setTab] = useState<'friend' | 'group'>('friend');
    const [search, setSearch] = useState('');
    const filtered = mockUsers.filter(u => u.name.includes(search));
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>
                        <div className="flex gap-8 border-b pb-2 mb-2">
                            <button className={cn('font-bold', tab === 'friend' && 'text-primary border-b-2 border-primary')} onClick={() => setTab('friend')}>加好友</button>
                            <button className={cn('font-bold', tab === 'group' && 'text-primary border-b-2 border-primary')} onClick={() => setTab('group')}>加群</button>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex gap-2 mb-4">
                    <Input placeholder="搜索用户" value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
                    <Button>查找</Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {filtered.map(user => (
                        <div key={user.id} className="flex items-center gap-3 bg-muted/50 rounded p-2">
                            <Avatar>
                                <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="font-medium">{user.name}</div>
                                {user.isFriend && <div className="text-xs text-red-500">已是好友</div>}
                            </div>
                            {!user.isFriend && <Button size="sm">加好友</Button>}
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function Friends() {
    const [selectedGroup, setSelectedGroup] = useState(mockGroups[0].id);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const group = mockGroups.find((g) => g.id === selectedGroup);

    return (
        <div className="flex h-full rounded-2xl overflow-hidden shadow-lg">
            {/* 左侧分组栏 */}
            <aside className="w-56 mr-1 rounded-md bg-background/80 flex flex-col py-4">
                <div className="px-6 pb-2 text-lg font-bold">分组</div>
                <nav className="flex-1 flex flex-col gap-3">
                    {mockGroups.map((g) => (
                        <button
                            key={g.id}
                            className="w-full hove h-12 flex items-center p-4 text-left rounded transition font-medium"
                            onClick={() => setSelectedGroup(g.id)}
                        >
                            <div className={cn(
                                "w-full h-12 flex items-center px-4 text-left rounded transition font-medium",
                                selectedGroup === g.id ? "bg-accent text-primary" : "hover:bg-muted text-muted-foreground"
                            )}>
                                {g.name}
                            </div>
                        </button>
                    ))}
                </nav>
                <div className="px-6 pt-4">
                    <Button className="w-full" variant="secondary" onClick={() => setAddDialogOpen(true)}>
                        <Plus className="size-4 mr-2" />添加好友
                    </Button>
                </div>
            </aside>
            {/* 右侧联系人列表 */}
            <main className="flex-1 overflow-y-auto bg-background/60 rounded-md">
                <div className="p-4 border-b text-base font-semibold">
                    {group?.name || "联系人"}
                </div>
                <ul>
                    {group?.contacts.map((friend) => (
                        <div className="p-3">
                            <li key={friend.id} className="flex items-center gap-4 px-4 py-3 last:border-b-0 hover:bg-muted/60 transition rounded-md">
                                <Avatar>
                                    <AvatarImage src={friend.avatar} />
                                    <AvatarFallback>{friend.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="font-medium flex items-center gap-2">
                                        {friend.name}
                                        {friend.status === "在线" && <span className="text-xs text-green-500">●</span>}
                                        {friend.status === "离线" && <span className="text-xs text-gray-400">●</span>}
                                    </div>
                                    {friend.sign && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{friend.sign}</div>}
                                </div>
                                <Button size="sm" variant="outline"><Video /> 视频通话</Button>
                                <Button size="sm" variant="outline"><Forward /> 发消息</Button>
                                <Button size="sm" variant="destructive" ><Trash /> 删除好友</Button>
                            </li>
                        </div>
                    ))}
                </ul>
            </main>
            <AddFriendDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
        </div>
    );
}
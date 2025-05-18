import { useState } from "react";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UserBasic } from "@/common/types/user";
import SearchInput from "./Search";
import SearchRes from "./SearchRes";

interface AddFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFriendDialog({ open, onOpenChange }: AddFriendDialogProps) {
  const [searchResults, setSearchResults] = useState<UserBasic[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            添加好友
          </DialogTitle>
        </DialogHeader>

        <SearchInput
          onSearchStart={() => setIsSearching(true)}
          onSearchSuccess={setSearchResults}
          onSearchFinish={() => {
            setIsSearching(false);
            setHasSearched(true);
          }}
        />

        {hasSearched && (
          <SearchRes searchResults={searchResults} isSearching={isSearching} />
        )}
      </DialogContent>
    </Dialog>
  );
}

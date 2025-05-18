import { Button } from "@/components/ui/button";
import { CornerDownLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { searchUsers } from "@/api/user";

interface ISearchProps {
  onSearchStart: () => void;
  onSearchSuccess: (res: any) => void;
  onSearchFinish: () => void;
}

const SearchInput = ({
  onSearchStart,
  onSearchSuccess,
  onSearchFinish,
}: ISearchProps) => {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = new FormData(e.target as HTMLFormElement);
      const search = formData.get("search") as string;

      if (!search.trim()) {
        toast.error("请输入搜索关键词");
        return;
      }

      onSearchStart();
      setIsSearching(true);

      try {
        const result = await searchUsers({ keyword: search });
        onSearchSuccess(result.users);
      } catch (error) {
        toast.error("搜索失败", { description: String(error) });
      } finally {
        onSearchFinish();
        setIsSearching(false);
      }
    },
    [onSearchFinish]
  );

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full">
      <Input
        required
        name="search"
        className="flex-1"
        prefix={<Search className="w-4 h-4" />}
        placeholder="输入用户名搜索"
      />
      <Button
        disabled={isSearching}
        type="submit"
        size="icon"
        variant="secondary"
      >
        <CornerDownLeft />
      </Button>
    </form>
  );
};

export default SearchInput;

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarHeaderProps {
  title: string;
  onCreateGroup: () => void;
}

export function SidebarHeader({ title, onCreateGroup }: SidebarHeaderProps) {
  return (
    <div className="p-4 font-sans text-lg flex justify-between items-center">
      <span>{title}</span>
    </div>
  );
}

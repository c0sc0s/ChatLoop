import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="flex flex-col gap-2">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                className="h-12"
                isActive={isActive(item.url)}
                asChild
              >
                <NavLink to={item.url}>
                  <div>
                    {item.icon && (
                      <item.icon
                        size={16}
                        className={cn(
                          isActive(item.url)
                            ? "text-lime-500"
                            : "text-muted-foreground"
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "font-mono font-bold",
                      isActive(item.url)
                        ? "text-lime-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.title}
                  </span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

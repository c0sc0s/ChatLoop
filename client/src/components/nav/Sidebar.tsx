import * as React from "react";
import {
  BarChartIcon,
  CherryIcon,
  MessageCircle,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";
import { NavUser } from "./NavUser";
import { NavLink } from "react-router-dom";
import NavAction from "./NavAction";
import WsStatus from "./WsStatus";

const data = {
  navMain: [
    {
      title: "Metrics",
      url: "/home",
      icon: BarChartIcon,
    },
    {
      title: "Chats",
      url: "/chatlist",
      icon: MessageCircle,
    },
    {
      title: "Friends",
      url: "/friends",
      icon: UsersIcon,
    },
    {
      title: "Setting",
      url: "/setting",
      icon: SettingsIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <NavLink to="/home" className="flex items-center gap-2">
                <div className="size-4">
                  <CherryIcon className="text-lime-500 w-full h-full" />
                </div>
                <span className="text-base font-mono font-bold">CHATFOCUS</span>
                <WsStatus />
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavAction />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

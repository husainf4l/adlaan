"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  PenTool,
  Search,
  Cloud,
  Users,
  Building2,
  Bot,
  Bell,
  CreditCard,
  Settings
} from "lucide-react";
import { cn } from "../lib/utils";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: Home,
    href: "/dashboard"
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
    href: "/dashboard/documents"
  },
  {
    id: "generate",
    label: "Generate Contract",
    icon: PenTool,
    href: "/dashboard/generate"
  },
  {
    id: "analyze",
    label: "Analyze Document",
    icon: Search,
    href: "/dashboard/analyze"
  },
  {
    id: "storage",
    label: "Cloud Storage",
    icon: Cloud,
    href: "/dashboard/storage"
  },
  {
    id: "employees",
    label: "Employees",
    icon: Users,
    href: "/dashboard/employees"
  },
  {
    id: "company",
    label: "Company Profile",
    icon: Building2,
    href: "/dashboard/company"
  },
  {
    id: "ai-assistant",
    label: "AI Assistant",
    icon: Bot,
    href: "/dashboard/ai"
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    href: "/dashboard/notifications",
    badge: "3"
  },
  {
    id: "subscription",
    label: "Subscription",
    icon: CreditCard,
    href: "/dashboard/subscription"
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings"
  }
];

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname();

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderSidebarItem = (item: SidebarItem) => {
    const isItemActive = isActive(item.href);

    return (
      <div key={item.id}>
        <Link
          href={item.href || "#"}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-primary/10",
            isItemActive && "bg-primary/20 text-primary font-medium"
          )}
        >
          <item.icon className="h-5 w-5 text-muted-foreground" />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
      </div>
    );
  };

  return (
    <div className={cn("bg-card border-r border-border h-full overflow-y-auto", className)}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Adlaan</h1>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item) => renderSidebarItem(item))}
        </nav>
      </div>
    </div>
  );
}
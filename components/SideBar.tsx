"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
    label: string;
    href: string;
    icon: string;
}

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/", icon: "⊞" },
    { label: "Students", href: "/students", icon: "◎" },
    { label: "Homeworks", href: "/homeworks", icon: "◈" },
    { label: "Exams", href: "/exams", icon: "◉" },
    { label: "Settings", href: "/settings", icon: "◐" },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <aside
            className={`
        relative flex flex-col h-screen bg-gray-900 text-white
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-16" : "w-64"}
      `}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
                <span className="text-2xl shrink-0">🎓</span>
                {!collapsed && (
                    <span className="font-bold text-lg tracking-tight whitespace-nowrap overflow-hidden">
            SchoolApp
          </span>
                )}
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-1 p-2 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-3 py-2 rounded-lg
                transition-colors duration-150 group
                ${isActive
                                ? "bg-blue-600 text-white"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            }
              `}
                        >
                            <span className="text-lg shrink-0">{item.icon}</span>
                            {!collapsed && (
                                <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
                            )}
                            {/* Tooltip when collapsed */}
                            {collapsed && (
                                <div className="
                  absolute left-16 ml-2 px-2 py-1 bg-gray-700 text-white text-xs
                  rounded opacity-0 group-hover:opacity-100 transition-opacity
                  pointer-events-none whitespace-nowrap z-50
                ">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="
          flex items-center justify-center m-2 p-2
          text-gray-400 hover:text-white hover:bg-gray-800
          rounded-lg transition-colors duration-150
        "
                aria-label="Toggle sidebar"
            >
        <span className={`text-lg transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}>
          ◀
        </span>
            </button>
        </aside>
    );
}
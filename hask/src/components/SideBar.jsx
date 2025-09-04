import React from "react";
import { NavLink } from "react-router-dom";
import { RocketLaunchIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

function Item({ to, icon:Icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({isActive}) =>
        `flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ease-out border
         ${isActive 
           ? "bg-gradient-to-r from-[#fb6058]/10 to-[#ff7a6b]/10 text-[#fb6058] border border-[#fb6058]/20" 
           : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent"
         }`
      }
    >
      <Icon className="w-5 h-5" />
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 p-4">
      <nav className="flex flex-col gap-2 w-full">
        <Item to="/launch" icon={RocketLaunchIcon} label="Launch" />
        <Item to="/feed" icon={Squares2X2Icon} label="Feed" />
      </nav>
    </aside>
  );
}

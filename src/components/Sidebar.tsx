
import React from "react";
import AnimatedSidebar from "./AnimatedSidebar";

interface CustomSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setOpenModal?: (open: boolean) => void;
  handleLogout: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const CustomSidebar: React.FC<CustomSidebarProps> = (props) => {
  return <AnimatedSidebar {...props} />;
};

export default CustomSidebar;

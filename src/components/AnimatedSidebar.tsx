
import React from "react";
import GmailStyleSidebar from "./GmailStyleSidebar";

interface AnimatedSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setOpenModal?: (open: boolean) => void;
  handleLogout: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const AnimatedSidebar: React.FC<AnimatedSidebarProps> = (props) => {
  return <GmailStyleSidebar {...props} />;
};

export default AnimatedSidebar;

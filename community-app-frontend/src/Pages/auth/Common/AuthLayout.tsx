import React, { ReactNode } from "react";
import Header from "../../../component/Common/Header";
import AppFooter from "./AppFooter";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  showBackArrow?: boolean;
  className?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  showBackArrow = false,
  className = "",
}) => {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between font-bold overflow-y-hidden">
      <Header
        title={title}
        showBackArrow={showBackArrow}
        className={className}
      />
      <div className="flex flex-col items-center mt-24">{children}</div>
      <AppFooter />
    </div>
  );
};

export default AuthLayout;

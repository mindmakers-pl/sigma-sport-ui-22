import { ReactNode } from "react";
import AppNavbar from "./AppNavbar";

interface SimpleLayoutProps {
  children: ReactNode;
}

const SimpleLayout = ({ children }: SimpleLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default SimpleLayout;

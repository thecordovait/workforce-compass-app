
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Users,
  Building,
  History,
  Home,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
};

const NavItem = ({ to, icon, children, onClick }: NavItemProps) => {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )
        }
        onClick={onClick}
      >
        {icon}
        <span>{children}</span>
      </NavLink>
    </li>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleNavClick = () => {
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile menu toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-background border-b border-border p-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">HR Manager</h1>
        <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Sidebar - desktop always visible, mobile conditionally */}
      <aside
        className={cn(
          "bg-card border-r border-border w-64 transition-all duration-300 ease-in-out",
          isMobile
            ? `fixed inset-y-0 left-0 z-20 transform ${
                showMobileMenu ? "translate-x-0" : "-translate-x-full"
              }`
            : "relative"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-hrm-600">HR Manager</h1>
            {user && (
              <div className="mt-2 text-sm text-muted-foreground">
                {user.email}
              </div>
            )}
          </div>
          
          <nav className="flex-1 px-2 py-4">
            <ul className="space-y-1">
              <NavItem to="/dashboard" icon={<Home size={18} />} onClick={handleNavClick}>
                Dashboard
              </NavItem>
              <NavItem to="/employees" icon={<Users size={18} />} onClick={handleNavClick}>
                Employees
              </NavItem>
              <NavItem to="/departments" icon={<Building size={18} />} onClick={handleNavClick}>
                Departments
              </NavItem>
              <NavItem to="/job-history" icon={<History size={18} />} onClick={handleNavClick}>
                Job History
              </NavItem>
            </ul>
          </nav>
          
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-start gap-3"
              onClick={signOut}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className={cn(
        "flex-1 flex flex-col min-w-0",
        isMobile ? "pt-16" : ""  
      )}>
        <div className="container mx-auto p-4 md:p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CURRENT_USER } from "@/lib/constants";
import { 
  Handshake, 
  ChevronDown, 
  LogOut, 
  Settings, 
  User as UserIcon, 
  Plus 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Header() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleNewDeal = () => {
    // In a real implementation this would navigate to new deal form or show a modal
    toast({
      title: "New Deal",
      description: "This would open the new deal creation form",
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <header className="bg-white border-b border-input shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <div className="text-primary font-bold text-xl flex items-center cursor-pointer">
              <Handshake className="mr-2" size={20} />
              <span>Internal Deal Tracker</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={handleNewDeal} className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            <span>New Deal</span>
          </Button>

          <DropdownMenu open={showUserMenu} onOpenChange={setShowUserMenu}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <img 
                  className="h-8 w-8 rounded-full" 
                  src={CURRENT_USER.avatarUrl} 
                  alt={CURRENT_USER.fullName} 
                />
                <span>{CURRENT_USER.fullName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onSelect={() => setLocation("/profile")}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Your Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLocation("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

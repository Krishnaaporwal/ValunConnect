import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { 
  LayoutDashboard, 
  Map, 
  User, 
  CalendarCheck, 
  LogOut, 
  Menu,
  PlusCircle,
  BarChart3,
  HeartHandshake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isVolunteer = user?.role === "volunteer";

  const volunteerLinks = [
    { href: "/volunteer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/volunteer/rsvps", label: "My RSVPs", icon: CalendarCheck },
    { href: "/volunteer/map-view", label: "Events Map", icon: Map },
    { href: "/volunteer/profile", label: "My Profile", icon: User },
  ];

  const organizerLinks = [
    { href: "/organizer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/organizer/create-event", label: "Create Event", icon: PlusCircle },
    { href: "/organizer/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const links = isVolunteer ? volunteerLinks : organizerLinks;

  const NavContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-xl text-primary">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-display font-bold tracking-tight text-primary">VolunConnect</h2>
      </div>
      
      <div className="flex-1 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20" 
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-sidebar-accent/50">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 h-full flex-shrink-0 z-10">
        <NavContent />
      </aside>

      {/* Mobile Sidebar & Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-border z-20">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-display font-bold text-primary">VolunConnect</h2>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <NavContent />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogin, useSignupVolunteer, useSignupOrganizer } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { HeartHandshake } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"volunteer" | "organizer">("volunteer");

  const loginMutation = useLogin();
  const signupVolMutation = useSignupVolunteer();
  const signupOrgMutation = useSignupOrganizer();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    loginMutation.mutate({
      data: {
        email: fd.get("email") as string,
        password: fd.get("password") as string,
        role: role,
      }
    }, {
      onSuccess: (res) => {
        login(res.token, res.user);
        setLocation(`/${role}/dashboard`);
        toast({ title: "Welcome back!" });
      },
      onError: (err: any) => {
        toast({ title: "Login failed", description: err.message || "Invalid credentials", variant: "destructive" });
      }
    });
  };

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    if (role === "volunteer") {
      signupVolMutation.mutate({
        data: {
          name: fd.get("name") as string,
          email: fd.get("email") as string,
          password: fd.get("password") as string,
          location: fd.get("location") as string,
          skills: (fd.get("skills") as string).split(",").map(s => s.trim()).filter(Boolean),
        }
      }, {
        onSuccess: (res) => {
          login(res.token, res.user);
          setLocation("/volunteer/dashboard");
          toast({ title: "Account created!" });
        },
        onError: (err: any) => toast({ title: "Signup failed", description: err.message, variant: "destructive" })
      });
    } else {
      signupOrgMutation.mutate({
        data: {
          organizationName: fd.get("organizationName") as string,
          email: fd.get("email") as string,
          password: fd.get("password") as string,
          location: fd.get("location") as string,
          organizationType: fd.get("organizationType") as any,
          ngoRegistrationNumber: fd.get("ngoRegistrationNumber") as string,
        }
      }, {
        onSuccess: (res) => {
          login(res.token, res.user);
          setLocation("/organizer/dashboard");
          toast({ title: "Account created!" });
        },
        onError: (err: any) => toast({ title: "Signup failed", description: err.message, variant: "destructive" })
      });
    }
  };

  const isPending = loginMutation.isPending || signupVolMutation.isPending || signupOrgMutation.isPending;

  return (
    <div className="min-h-screen flex">
      {/* Left side Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
          alt="Abstract geometric background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
        <div className="absolute inset-0 p-12 flex flex-col justify-between text-white">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-10 h-10" />
            <span className="text-3xl font-display font-bold">VolunConnect</span>
          </div>
          <div>
            <h1 className="text-5xl font-display font-bold mb-4">Make a difference today.</h1>
            <p className="text-xl text-white/80 max-w-md">Join thousands of volunteers and organizers creating real impact in their local communities.</p>
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold text-foreground">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin ? "Enter your details to access your dashboard" : "Sign up to start making an impact"}
            </p>
          </div>

          <Tabs value={role} onValueChange={(v) => setRole(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary">
              <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
              <TabsTrigger value="organizer">Organizer</TabsTrigger>
            </TabsList>

            <Card className="p-6 border-border shadow-lg shadow-black/5 rounded-2xl">
              <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
                
                {!isLogin && role === "volunteer" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" required placeholder="John Doe" className="bg-secondary/50 focus:bg-background" />
                  </div>
                )}

                {!isLogin && role === "organizer" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Organization Name</Label>
                      <Input id="organizationName" name="organizationName" required placeholder="Community Helpers" className="bg-secondary/50 focus:bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organizationType">Organization Type</Label>
                      <Select name="organizationType" defaultValue="NGO">
                        <SelectTrigger className="bg-secondary/50">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NGO">NGO</SelectItem>
                          <SelectItem value="Government">Government</SelectItem>
                          <SelectItem value="Private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ngoRegistrationNumber">NGO Reg Number (optional)</Label>
                      <Input id="ngoRegistrationNumber" name="ngoRegistrationNumber" placeholder="REG-12345" className="bg-secondary/50 focus:bg-background" />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="john@example.com" className="bg-secondary/50 focus:bg-background" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required className="bg-secondary/50 focus:bg-background" />
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="location">City / Location</Label>
                    <Input id="location" name="location" required placeholder="New York, NY" className="bg-secondary/50 focus:bg-background" />
                  </div>
                )}

                {!isLogin && role === "volunteer" && (
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma separated)</Label>
                    <Input id="skills" name="skills" placeholder="Teaching, Coding, Gardening" className="bg-secondary/50 focus:bg-background" />
                  </div>
                )}

                <Button type="submit" className="w-full mt-6 py-6 text-lg rounded-xl shadow-lg shadow-primary/20" disabled={isPending}>
                  {isPending ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
                </Button>
              </form>
            </Card>
          </Tabs>

          <div className="text-center mt-6">
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-sm font-medium text-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

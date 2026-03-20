import DashboardLayout from "@/components/layout/DashboardLayout";
import { useGetVolunteerProfile, useUpdateVolunteerProfile } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, MapPin, Mail, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function VolunteerProfile() {
  const { data: profile, isLoading } = useGetVolunteerProfile();
  const updateMutation = useUpdateVolunteerProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skillsStr, setSkillsStr] = useState("");
  const [interestsStr, setInterestsStr] = useState("");

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setLocation(profile.location || "");
      setSkillsStr(profile.skills?.join(", ") || "");
      setInterestsStr(profile.interests?.join(", ") || "");
    }
  }, [profile]);

  const handleSave = () => {
    updateMutation.mutate({
      data: {
        bio,
        location,
        skills: skillsStr.split(",").map(s => s.trim()).filter(Boolean),
        interests: interestsStr.split(",").map(s => s.trim()).filter(Boolean),
      }
    }, {
      onSuccess: () => {
        toast({ title: "Profile updated!" });
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: ["/api/volunteers/profile"] });
      }
    });
  };

  if (isLoading) return <DashboardLayout><div className="animate-pulse h-96 bg-secondary/50 rounded-2xl"></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Card */}
        <Card className="overflow-hidden border-none shadow-lg">
          <div className="h-32 bg-gradient-to-r from-primary to-accent relative">
            <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-full border-4 border-background bg-white flex items-center justify-center text-4xl text-primary font-bold shadow-md">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="pt-16 pb-8 px-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-display font-bold">{profile?.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mt-2">
                <span className="flex items-center"><Mail className="w-4 h-4 mr-1"/> {profile?.email}</span>
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {profile?.location || "No location"}</span>
              </div>
            </div>
            <Button variant={isEditing ? "outline" : "default"} onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6 shadow-md border-border/50">
              <h3 className="text-xl font-bold font-display mb-4 flex items-center"><User className="w-5 h-5 mr-2 text-primary"/> About Me</h3>
              {isEditing ? (
                <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell organizers about yourself..." rows={5} className="bg-secondary/20" />
              ) : (
                <p className="text-muted-foreground whitespace-pre-wrap">{profile?.bio || "No bio added yet."}</p>
              )}
            </Card>

            <Card className="p-6 shadow-md border-border/50">
              <h3 className="text-xl font-bold font-display mb-4 flex items-center"><Award className="w-5 h-5 mr-2 text-primary"/> Skills & Interests</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Skills (comma separated)</Label>
                    <Input value={skillsStr} onChange={e => setSkillsStr(e.target.value)} className="bg-secondary/20" />
                  </div>
                  <div className="space-y-2">
                    <Label>Interests (comma separated)</Label>
                    <Input value={interestsStr} onChange={e => setInterestsStr(e.target.value)} className="bg-secondary/20" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2 text-muted-foreground">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {profile?.skills?.map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>) || <span className="text-sm">None added</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 text-muted-foreground">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {profile?.interests?.map((s, i) => <Badge key={i} variant="outline" className="border-primary/20 text-primary">{s}</Badge>) || <span className="text-sm">None added</span>}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {isEditing && (
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={updateMutation.isPending} className="px-8 shadow-lg">
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <h3 className="font-bold font-display mb-2">Impact Summary</h3>
              <div className="space-y-4 mt-6">
                <div>
                  <p className="text-primary-foreground/70 text-sm">Total Volunteering Hours</p>
                  <p className="text-4xl font-bold">{profile?.totalHours || 0}<span className="text-xl font-normal opacity-70">h</span></p>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <p className="text-primary-foreground/70 text-sm">Events Participated</p>
                  <p className="text-2xl font-bold">{profile?.eventsParticipated || 0}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCreateEvent } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

export default function CreateEvent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateEvent();
  
  const [isUrgent, setIsUrgent] = useState(false);
  const [eventType, setEventType] = useState<any>("NGO");
  const [category, setCategory] = useState("Environment");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const rawDate = fd.get("dateTime") as string;
    const parsedDate = new Date(rawDate);
    if (!rawDate || isNaN(parsedDate.getTime())) {
      toast({ title: "Invalid date", description: "Please select a valid date and time.", variant: "destructive" });
      return;
    }
    
    createMutation.mutate({
      data: {
        title: fd.get("title") as string,
        description: fd.get("description") as string,
        eventType: eventType,
        category,
        dateTime: parsedDate.toISOString(),
        location: fd.get("location") as string,
        lat: Number(fd.get("lat")) || undefined,
        lng: Number(fd.get("lng")) || undefined,
        volunteersNeeded: Number(fd.get("volunteersNeeded")),
        isUrgent,
        paymentAmount: Number(fd.get("paymentAmount")) || undefined,
        requiredSkills: (fd.get("skills") as string).split(",").map(s => s.trim()).filter(Boolean),
      }
    }, {
      onSuccess: () => {
        toast({ title: "Event created successfully!" });
        setLocation("/organizer/dashboard");
      },
      onError: (err) => {
        toast({ title: "Error creating event", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Create New Event</h1>
          <p className="text-muted-foreground mt-1">Post a new volunteering opportunity.</p>
        </div>

        <Card className="p-8 shadow-lg border-border/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Event Title</Label>
              <Input name="title" required placeholder="E.g., Community Beach Cleanup" className="text-lg py-6" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea name="description" required rows={4} placeholder="Describe the event and what volunteers will be doing..." />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger>
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
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Environment">Environment</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Disaster Relief">Disaster Relief</SelectItem>
                    <SelectItem value="Animal Welfare">Animal Welfare</SelectItem>
                    <SelectItem value="Civic">Civic</SelectItem>
                    <SelectItem value="Community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Date & Time</Label>
                <Input name="dateTime" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label>Volunteers Needed</Label>
                <Input name="volunteersNeeded" type="number" min="1" required placeholder="10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Required Skills (comma separated)</Label>
              <Input name="skills" placeholder="Heavy lifting, Coordination, Teamwork" />
            </div>

            <div className="p-4 bg-secondary/50 rounded-xl space-y-4 border border-border">
              <div className="space-y-2">
                <Label className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> Location Name</Label>
                <Input name="location" required placeholder="Central Park, NY" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude (for map)</Label>
                  <Input name="lat" type="number" step="any" placeholder="40.7829" />
                </div>
                <div className="space-y-2">
                  <Label>Longitude (for map)</Label>
                  <Input name="lng" type="number" step="any" placeholder="-73.9654" />
                </div>
              </div>
            </div>

            {eventType === "Private" && (
              <div className="space-y-2 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <Label className="text-primary font-bold">Payment Amount ($)</Label>
                <Input name="paymentAmount" type="number" min="0" placeholder="50" />
                <p className="text-xs text-muted-foreground">Since this is a private event, you can specify compensation.</p>
              </div>
            )}

            <div className="flex items-center space-x-2 bg-destructive/5 p-4 rounded-xl border border-destructive/20">
              <Switch id="urgent" checked={isUrgent} onCheckedChange={setIsUrgent} />
              <Label htmlFor="urgent" className="text-destructive font-bold cursor-pointer">Mark as URGENT hiring</Label>
            </div>

            <Button type="submit" className="w-full py-6 text-lg rounded-xl shadow-lg" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Publish Event"}
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}

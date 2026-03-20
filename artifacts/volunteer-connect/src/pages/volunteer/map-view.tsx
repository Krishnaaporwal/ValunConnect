import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EventsMap } from "@/components/Map";
import { useListEvents, useApplyToEvent } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VolunteerMapView() {
  const [search, setSearch] = useState("");
  const { data: events, isLoading } = useListEvents({ search });
  const applyMutation = useApplyToEvent();
  const { toast } = useToast();

  const handleApply = (eventId: number) => {
    applyMutation.mutate({ data: { eventId } }, {
      onSuccess: () => toast({ title: "Application sent!" }),
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Events Map</h1>
            <p className="text-muted-foreground">Find volunteer opportunities near you.</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-96">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search events, cities..." 
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[600px] bg-secondary/50 animate-pulse rounded-2xl flex items-center justify-center">
            <MapPin className="w-12 h-12 text-muted-foreground/30" />
          </div>
        ) : (
          <EventsMap events={events || []} onApply={handleApply} />
        )}
      </div>
    </DashboardLayout>
  );
}

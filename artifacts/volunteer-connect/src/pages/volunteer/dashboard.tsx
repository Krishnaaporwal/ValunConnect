import { useGetVolunteerStats, useGetRecommendedEvents, useApplyToEvent } from "@workspace/api-client-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EventCard } from "@/components/EventCard";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function VolunteerDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetVolunteerStats();
  const { data: recommendedEvents, isLoading: eventsLoading } = useGetRecommendedEvents();
  const applyMutation = useApplyToEvent();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleApply = (eventId: number) => {
    applyMutation.mutate({ data: { eventId } }, {
      onSuccess: () => {
        toast({ title: "Successfully applied!" });
        queryClient.invalidateQueries({ queryKey: ["/api/applications/my"] });
      },
      onError: (err) => {
        toast({ title: "Failed to apply", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">Here's your impact overview and recommended opportunities.</p>
        </div>

        {/* Stats Section */}
        <div className="grid sm:grid-cols-3 gap-6">
          {statsLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          ) : (
            <>
              <Card className="p-6 rounded-2xl border-none shadow-md bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl"><Clock className="w-6 h-6" /></div>
                  <div>
                    <p className="text-primary-foreground/80 font-medium">Total Hours</p>
                    <p className="text-3xl font-bold font-display">{stats?.totalHours || 0}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 rounded-2xl border-none shadow-md bg-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>
                  <div>
                    <p className="text-muted-foreground font-medium">Events Participated</p>
                    <p className="text-3xl font-bold font-display text-foreground">{stats?.eventsParticipated || 0}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 rounded-2xl border-none shadow-md bg-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 text-accent rounded-xl"><TrendingUp className="w-6 h-6" /></div>
                  <div>
                    <p className="text-muted-foreground font-medium">Upcoming RSVPs</p>
                    <p className="text-3xl font-bold font-display text-foreground">{stats?.upcomingEvents || 0}</p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Recommended Events */}
        <div>
          <h2 className="text-2xl font-display font-bold mb-6">Top Matches for You</h2>
          
          {eventsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
            </div>
          ) : recommendedEvents?.length === 0 ? (
            <Card className="p-12 text-center border-dashed bg-secondary/30">
              <p className="text-muted-foreground">No recommendations right now. Try updating your skills in your profile!</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedEvents?.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onApply={handleApply}
                  isApplying={applyMutation.isPending && applyMutation.variables?.data.eventId === event.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

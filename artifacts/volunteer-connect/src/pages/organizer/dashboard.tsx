import DashboardLayout from "@/components/layout/DashboardLayout";
import { useGetOrganizerStats, useGetOrganizerEvents, useGetEventApplications, useUpdateApplicationStatus } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Users, Activity, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

export default function OrganizerDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetOrganizerStats();
  const { data: events, isLoading: eventsLoading } = useGetOrganizerEvents();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Organizer Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your events and review applicants.</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Events", value: stats?.activeEvents, icon: Activity, color: "text-primary", bg: "bg-primary/10" },
            { label: "Total Applications", value: stats?.totalApplications, icon: Users, color: "text-amber-600", bg: "bg-amber-500/10" },
            { label: "Accepted", value: stats?.totalAccepted, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-500/10" },
            { label: "Total Volunteers", value: stats?.totalVolunteers, icon: Users, color: "text-accent", bg: "bg-accent/10" },
          ].map((stat, i) => (
            <Card key={i} className="p-6 border-none shadow-md">
              {statsLoading ? <Skeleton className="h-10 w-20" /> : (
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold font-display">{stat.value || 0}</p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Events List */}
        <div>
          <h2 className="text-2xl font-display font-bold mb-6">Your Events</h2>
          <div className="grid gap-4">
            {eventsLoading ? (
               Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
            ) : events?.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <p className="text-muted-foreground">You haven't created any events yet.</p>
              </Card>
            ) : (
              events?.map(event => (
                <Card key={event.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border/50 hover:border-border transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold font-display">{event.title}</h3>
                      {event.isUrgent && <Badge variant="destructive" className="h-5">Urgent</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> {format(new Date(event.dateTime), "PP")}</span>
                      <span>{event.volunteersAccepted || 0} / {event.volunteersNeeded} spots filled</span>
                    </div>
                  </div>

                  <ApplicantDialog eventId={event.id} eventTitle={event.title} />
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ApplicantDialog({ eventId, eventTitle }: { eventId: number, eventTitle: string }) {
  const { data: applicants, isLoading } = useGetEventApplications(eventId);
  const updateStatus = useUpdateApplicationStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatus = (appId: number, status: 'accepted' | 'rejected') => {
    updateStatus.mutate({ id: appId, data: { status } }, {
      onSuccess: () => {
        toast({ title: `Application ${status}` });
        queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/applications`] });
        queryClient.invalidateQueries({ queryKey: [`/api/organizers/stats`] });
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="shadow-sm">View Applicants</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Applicants for {eventTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex justify-center p-8"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span></div>
          ) : applicants?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No applicants yet.</p>
          ) : (
            applicants?.map(app => (
              <div key={app.id} className="p-4 rounded-xl border border-border bg-secondary/20 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold">{app.volunteer?.name}</h4>
                    <Badge variant="outline" className="text-xs bg-white">{app.matchScore}% Match</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{app.volunteer?.bio || "No bio provided"}</p>
                  <div className="flex flex-wrap gap-1">
                    {app.volunteer?.skills?.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-center gap-2 min-w-[120px]">
                  {app.status === 'pending' ? (
                    <>
                      <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatus(app.id, 'accepted')}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="w-full text-destructive hover:bg-destructive/10" onClick={() => handleStatus(app.id, 'rejected')}>
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </>
                  ) : (
                    <Badge variant="outline" className={`capitalize py-1 px-3 ${app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                      {app.status}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

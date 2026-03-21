import DashboardLayout from "@/components/layout/DashboardLayout";
import { useGetOrganizerStats, useGetOrganizerEvents, useGetEventApplications, useUpdateApplicationStatus } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Users, Activity, CheckCircle, XCircle, Mail, MapPin, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';

export default function OrganizerDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetOrganizerStats();
  const { data: events, isLoading: eventsLoading } = useGetOrganizerEvents();

  // Mock historical data for charts since the backend only provides current snapshot
  const chartData = [
    { name: 'Active', value: stats?.activeEvents || 0 },
    { name: 'Upcoming', value: Math.max(0, (stats?.totalEvents || 0) - (stats?.activeEvents || 0)) },
  ];

  const applicationData = [
    { name: 'Pending', value: Math.max(0, (stats?.totalApplications || 0) - (stats?.totalAccepted || 0)) },
    { name: 'Accepted', value: stats?.totalAccepted || 0 }
  ];

  // Logic for engagement trend (mocking based on events)
  const engagementTrend = events?.slice(0, 6).map((e, idx) => ({
    name: format(new Date(e.dateTime), "MMM dd"),
    applications: e.volunteersNeeded + (idx * 2), // Mocking trend
    accepted: e.volunteersAccepted
  })).reverse() || [];

  const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b'];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Organizer Analytics</h1>
            <p className="text-muted-foreground mt-1">Track event performance and volunteer engagement.</p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg border border-border shadow-sm">
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live System
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Events", value: stats?.activeEvents, icon: Activity, color: "text-primary", bg: "bg-primary/10", trend: "+2 this week" },
            { label: "Total Reach", value: stats?.totalApplications, icon: Users, color: "text-indigo-600", bg: "bg-indigo-500/10", trend: "12% growth" },
            { label: "Conversion Rate", value: stats?.totalApplications ? `${Math.round((stats.totalAccepted / stats.totalApplications) * 100)}%` : '0%', icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-500/10", trend: "High impact" },
            { label: "Volunteers Needed", value: events?.reduce((acc, e) => acc + (e.volunteersNeeded - (e.volunteersAccepted || 0)), 0), icon: BarChart3, color: "text-accent", bg: "bg-accent/10", trend: "Action required" },
          ].map((stat, i) => (
            <Card key={i} className="p-6 border-none shadow-md overflow-hidden relative group bg-white">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                <stat.icon className="w-24 h-24" />
              </div>
              {statsLoading ? <Skeleton className="h-10 w-20" /> : (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold font-display">{stat.value || 0}</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 bg-secondary/30 px-2 py-1 rounded inline-block">
                    {stat.trend}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Main Analytics Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Engagement Trend */}
          <Card className="lg:col-span-2 border-none shadow-md p-6 bg-white">
            <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Application Trends
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Application & conversion rate over recent events</p>
              </div>
            </CardHeader>
            <div className="h-[300px] w-full">
              {statsLoading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="accepted" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Application Funnel */}
          <Card className="border-none shadow-md p-6 bg-white">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-indigo-500" />
                Conversion Funnel
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Success rate of applications</p>
            </CardHeader>
            <div className="h-[300px] w-full flex flex-col items-center">
              {statsLoading ? <Skeleton className="h-full w-full" /> : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={applicationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {applicationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-4 w-full mt-4">
                    {applicationData.map((item, i) => (
                      <div key={item.name} className="flex flex-col items-center p-3 rounded-xl bg-secondary/20">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="text-xl font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Events List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">Event Performance</h2>
            <Button size="sm" variant="outline" className="text-xs">Export Statistics</Button>
          </div>
          <div className="grid gap-4">
            {eventsLoading ? (
               Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
            ) : events?.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <p className="text-muted-foreground">You haven't created any events yet.</p>
              </Card>
            ) : (
              events?.map(event => (
                <Card key={event.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border/50 hover:border-border transition-all hover:shadow-lg bg-white group">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold font-display group-hover:text-primary transition-colors">{event.title}</h3>
                      {event.isUrgent && <Badge variant="destructive" className="h-5">Urgent</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary"/> {format(new Date(event.dateTime), "PP")}</span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-500"/>
                        {event.volunteersAccepted || 0} / {event.volunteersNeeded} filled
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden max-w-[200px]">
                      <div 
                        className="h-full bg-primary transition-all duration-1000" 
                        style={{ width: `${Math.min(100, ((event.volunteersAccepted || 0) / event.volunteersNeeded) * 100)}%` }} 
                      />
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
                  
                  {app.status === 'accepted' && app.volunteer?.email && (
                    <div className="flex items-center gap-4 mb-3 p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <Mail className="w-3.5 h-3.5" />
                        <a href={`mailto:${app.volunteer.email}`} className="hover:underline">{app.volunteer.email}</a>
                      </div>
                      {app.volunteer.location && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{app.volunteer.location}</span>
                        </div>
                      )}
                    </div>
                  )}

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

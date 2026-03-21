import { useGetVolunteerStats, useGetRecommendedEvents, useApplyToEvent } from "@workspace/api-client-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EventCard } from "@/components/EventCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, CheckCircle2, TrendingUp, Heart, Calendar, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

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

  const categoryData = stats?.categoriesWorked?.map(cat => ({
    name: cat,
    value: 1 // Showing distribution
  })) || [];

  const IMPACT_COLORS = ['#fb7185', '#38bdf8', '#fbbf24', '#34d399', '#a78bfa'];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Volunteer Impact</h1>
            <p className="text-muted-foreground mt-1">Track your contribution and growing social footprint.</p>
          </div>
          <div className="px-4 py-2 bg-rose-50 border border-rose-100 rounded-full flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="text-sm font-bold text-rose-700">Level 2 Hero</span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { label: "Total Hours", value: stats?.totalHours, icon: Clock, color: "text-primary", bg: "bg-primary/10", subtitle: "Lifelong contribution" },
            { label: "Events Participated", value: stats?.eventsParticipated, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10", subtitle: "Completed tasks" },
            { label: "Active RSVPs", value: stats?.upcomingEvents, icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-500/10", subtitle: "Upcoming events" },
          ].map((stat, i) => (
            <Card key={i} className="p-6 border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden relative">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold font-display">{stat.value || 0}</p>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 mt-4 bg-secondary/30 w-fit px-2 py-0.5 rounded">
                {stat.subtitle}
              </p>
            </Card>
          ))}
        </div>

        {/* Analytics Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-sm p-6 bg-white">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Your Interest Footprint
              </CardTitle>
              <p className="text-xs text-muted-foreground">Impact area diversity</p>
            </CardHeader>
            <div className="h-[250px]">
              {statsLoading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData.length ? categoryData : [{ name: 'None', value: 0 }]}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis hide />
                    <RechartsTooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card className="border-none shadow-sm p-6 bg-white flex flex-col items-center">
            <CardHeader className="p-0 mb-4 w-full">
              <CardTitle className="text-lg font-display text-center">Skill Mix</CardTitle>
            </CardHeader>
            <div className="h-[200px] w-full">
              {statsLoading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.length ? categoryData : [{ name: 'Empty', value: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={IMPACT_COLORS[index % IMPACT_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {stats?.categoriesWorked?.map((cat, i) => (
                <div key={cat} className="flex items-center gap-1.5 px-2 py-1 bg-secondary/40 rounded-lg">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: IMPACT_COLORS[i % IMPACT_COLORS.length] }} />
                   <span className="text-[10px] font-bold uppercase">{cat}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recommended Events */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">Recommended for You</h2>
            <Button variant="ghost" className="text-sm font-semibold text-primary hover:text-primary/80 group">
              View All <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
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

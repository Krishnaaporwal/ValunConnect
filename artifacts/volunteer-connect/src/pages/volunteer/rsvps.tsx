import DashboardLayout from "@/components/layout/DashboardLayout";
import { useGetMyApplications } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Building } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function VolunteerRSVPs() {
  const { data: applications, isLoading } = useGetMyApplications();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-amber-500/10 text-amber-600 border-amber-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">My RSVPs</h1>
          <p className="text-muted-foreground">Track the status of your event applications.</p>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
          ) : applications?.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <p className="text-muted-foreground">You haven't applied to any events yet.</p>
            </Card>
          ) : (
            applications?.map(app => (
              <Card key={app.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold font-display">{app.event?.title}</h3>
                    <Badge variant="outline" className={`capitalize ${getStatusColor(app.status)}`}>
                      {app.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center"><Building className="w-4 h-4 mr-1"/> {app.event?.organizerName}</span>
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> {app.event?.dateTime && format(new Date(app.event.dateTime), "PPP")}</span>
                    <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {app.event?.location}</span>
                  </div>
                </div>
                
                <div className="text-sm text-right">
                  <p className="text-muted-foreground mb-1">Applied on</p>
                  <p className="font-medium">{app.appliedAt && format(new Date(app.appliedAt), "MMM d, yyyy")}</p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

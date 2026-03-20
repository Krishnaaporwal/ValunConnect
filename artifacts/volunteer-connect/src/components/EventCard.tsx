import { EventWithMatch, Event } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Building, Flame } from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
  event: Event | EventWithMatch;
  onApply?: (eventId: number) => void;
  actionText?: string;
  isApplying?: boolean;
}

export function EventCard({ event, onApply, actionText = "Apply Now", isApplying = false }: EventCardProps) {
  const matchScore = 'matchScore' in event ? event.matchScore : null;
  const matchLabel = 'matchLabel' in event ? event.matchLabel : null;

  const getMatchColor = (label: string | null) => {
    if (label === "High Match") return "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200";
    if (label === "Medium Match") return "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white border-border/50 relative">
      {event.isUrgent && (
        <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground px-3 py-1 rounded-bl-xl font-semibold text-xs flex items-center z-10 shadow-sm">
          <Flame className="w-3 h-3 mr-1" /> URGENT
        </div>
      )}
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <h3 className="text-xl font-display font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Building className="w-4 h-4 mr-1.5" />
              {event.organizerName || "Organization"} 
              <Badge variant="outline" className="ml-2 text-[10px] uppercase">{event.eventType}</Badge>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">
          {event.description}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-foreground">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 flex-shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <span>{format(new Date(event.dateTime), "PPp")}</span>
          </div>
          <div className="flex items-center text-sm text-foreground">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {event.requiredSkills?.map((skill, i) => (
            <Badge key={i} variant="secondary" className="bg-secondary/50 font-normal">
              {skill}
            </Badge>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          {matchLabel ? (
            <Badge variant="outline" className={`px-2.5 py-1 text-xs font-semibold ${getMatchColor(matchLabel)}`}>
              {matchLabel} ({matchScore}%)
            </Badge>
          ) : (
            <div className="text-sm text-muted-foreground">
              {event.volunteersNeeded} spots open
            </div>
          )}

          {onApply && (
            <Button 
              onClick={() => onApply(event.id)} 
              disabled={isApplying}
              className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg transition-all"
            >
              {isApplying ? "Applying..." : actionText}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

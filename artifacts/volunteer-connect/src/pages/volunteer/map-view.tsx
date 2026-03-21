import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EventsMap } from "@/components/Map";
import { useListEvents, useApplyToEvent } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Map of Indian States to Coordinates
const stateCoordinates: Record<string, [number, number]> = {
  "maharashtra": [19.7515, 75.7139],
  "delhi": [28.6139, 77.2090],
  "karnataka": [15.3173, 75.7139],
  "tamil nadu": [11.1271, 78.6569],
  "west bengal": [22.9868, 87.8550],
  "gujarat": [22.2587, 71.1924],
  "telangana": [18.1124, 79.0193],
  "rajasthan": [27.0238, 74.2179],
  "uttar pradesh": [26.8467, 80.9462],
  "kerala": [10.8505, 76.2711],
  "punjab": [31.1471, 75.3412],
  "haryana": [29.0588, 76.0856],
  "bihar": [25.0961, 85.3131],
  "madhya pradesh": [22.9734, 78.6569],
  "andhra pradesh": [15.9129, 79.7400],
  "odisha": [20.9517, 85.0985],
  "assam": [26.2006, 92.9376],
};

export default function VolunteerMapView() {
  const [search, setSearch] = useState("");
  const [mapConfig, setMapConfig] = useState<{ center?: [number, number], zoom?: number }>({});
  const { data: events, isLoading } = useListEvents({ search });
  const applyMutation = useApplyToEvent();
  const { toast } = useToast();

  // Detect state name in search and fly to it
  useEffect(() => {
    const query = search.toLowerCase().trim();
    if (stateCoordinates[query]) {
      setMapConfig({ center: stateCoordinates[query], zoom: 7 });
    } else if (query === "") {
      setMapConfig({}); // reset to default India view
    }
  }, [search]);

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
            <p className="text-muted-foreground">Search by State (e.g. "Maharashtra") to focus the map.</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-96">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search events, cities, states..." 
                className="pl-9 bg-white shadow-sm border-border focus:ring-primary"
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
          <EventsMap 
            events={events || []} 
            onApply={handleApply} 
            center={mapConfig.center}
            zoom={mapConfig.zoom}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

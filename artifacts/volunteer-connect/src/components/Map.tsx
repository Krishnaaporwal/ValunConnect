import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { EventWithMatch, Event } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

// Internal helper component to handle programmatic map movements
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 1
    });
  }, [center, zoom, map]);

  return null;
}

// Fix default icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapProps {
  events: (Event | EventWithMatch)[];
  onApply?: (eventId: number) => void;
  center?: [number, number];
  zoom?: number;
}

export function EventsMap({ events, onApply, center, zoom }: MapProps) {
  // Center roughly on India as requested
  const indiaCenter: [number, number] = [20.5937, 78.9629];
  const activeCenter = center || indiaCenter;
  const activeZoom = zoom || (center ? 8 : 5);

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-lg border border-border relative z-0">
      <MapContainer 
        center={activeCenter} 
        zoom={activeZoom} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
      >
        <MapController center={activeCenter} zoom={activeZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {events.map((event) => {
          if (!event.lat || !event.lng) return null;
          
          return (
            <Marker key={event.id} position={[event.lat, event.lng]}>
              <Popup className="rounded-xl overflow-hidden">
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-lg font-display mb-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{event.location}</p>
                  
                  <div className="text-xs space-y-1 mb-3">
                    <p><strong>Date:</strong> {format(new Date(event.dateTime), "PP")}</p>
                    <p><strong>Needed:</strong> {event.volunteersNeeded} vols</p>
                    {'matchLabel' in event && (
                      <p><strong>Match:</strong> {event.matchLabel}</p>
                    )}
                  </div>
                  
                  {onApply && (
                    <Button 
                      size="sm" 
                      className="w-full" 
                      onClick={() => onApply(event.id)}
                    >
                      View & Apply
                    </Button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

import { Volunteer } from "@workspace/db";

export interface MatchResult {
  matchScore: number;
  matchLabel: "High Match" | "Medium Match" | "Low Match";
  skillsMatch: number;
  locationMatch: number;
  interestMatch: number;
}

export function calculateMatchScore(
  volunteer: Pick<Volunteer, "skills" | "interests" | "lat" | "lng">,
  event: {
    requiredSkills: string[];
    category: string | null;
    lat: number | null;
    lng: number | null;
  }
): MatchResult {
  const skillsMatch = calculateSkillsMatch(volunteer.skills, event.requiredSkills);
  const locationMatch = calculateLocationMatch(volunteer.lat, volunteer.lng, event.lat, event.lng);
  const interestMatch = calculateInterestMatch(volunteer.interests, event.category);
  const availabilityMatch = 0.5;

  const score = Math.round(
    skillsMatch * 50 +
    locationMatch * 20 +
    interestMatch * 20 +
    availabilityMatch * 10
  );

  const clampedScore = Math.min(100, Math.max(0, score));

  let matchLabel: "High Match" | "Medium Match" | "Low Match";
  if (clampedScore >= 75) {
    matchLabel = "High Match";
  } else if (clampedScore >= 40) {
    matchLabel = "Medium Match";
  } else {
    matchLabel = "Low Match";
  }

  return {
    matchScore: clampedScore,
    matchLabel,
    skillsMatch: Math.round(skillsMatch * 100),
    locationMatch: Math.round(locationMatch * 100),
    interestMatch: Math.round(interestMatch * 100),
  };
}

function calculateSkillsMatch(volunteerSkills: string[], requiredSkills: string[]): number {
  if (!requiredSkills || requiredSkills.length === 0) return 1;
  if (!volunteerSkills || volunteerSkills.length === 0) return 0;

  const vSkills = volunteerSkills.map((s) => s.toLowerCase().trim());
  const rSkills = requiredSkills.map((s) => s.toLowerCase().trim());

  const matched = rSkills.filter((rs) =>
    vSkills.some((vs) => vs.includes(rs) || rs.includes(vs))
  ).length;

  return matched / rSkills.length;
}

function calculateLocationMatch(
  vLat: number | null,
  vLng: number | null,
  eLat: number | null,
  eLng: number | null
): number {
  if (!vLat || !vLng || !eLat || !eLng) return 0.5;

  const distKm = haversineDistance(vLat, vLng, eLat, eLng);

  if (distKm <= 10) return 1;
  if (distKm <= 50) return 0.75;
  if (distKm <= 200) return 0.5;
  if (distKm <= 500) return 0.25;
  return 0;
}

function calculateInterestMatch(interests: string[], category: string | null): number {
  if (!category) return 0.5;
  if (!interests || interests.length === 0) return 0;

  const cat = category.toLowerCase();
  const matched = interests.some((i) => {
    const interest = i.toLowerCase();
    return interest.includes(cat) || cat.includes(interest);
  });

  return matched ? 1 : 0;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

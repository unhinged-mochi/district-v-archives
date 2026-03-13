export interface Character {
  agency: string;
  associates: string[];
  body: string;
  faction: string;
  id: string;
  mugshot?: string;
  name: string;
  status:
    | "AT LARGE"
    | "IN CUSTODY"
    | "DECEASED"
    | "ACTIVE DUTY"
    | "DISCHARGED"
    | "EMPLOYED";
  streamer: string;
  threatLevel: number;
  twitch?: string;
  youtube?: string;
}

export interface Sighting {
  author?: string;
  characters: string[];
  date?: string;
  id: string;
  title: string;
  url: string;
}

export interface Day {
  body: string;
  date: string;
  day: number;
  id: string;
  title: string;
}

export interface Faction {
  body: string;
  color: string;
  colorClass: string;
  formerMembers: string[];
  id: string;
  leader: string;
  members: string[];
  name: string;
  type: string;
}

export interface Relationship {
  from: string;
  label: string;
  to: string;
  type: "ally" | "enemy" | "neutral";
}

export interface WindowData {
  closing?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: content shape varies by window type
  content: any;
  id: string;
  minimized?: boolean;
  position?: { x: number; y: number };
  title: string;
  type: "folder" | "dossier" | "casefile" | "faction" | "network" | "readme";
  zIndex: number;
}

export interface Character {
  id: string;
  name: string;
  streamer: string;
  agency: string;
  faction: string;
  status: 'AT LARGE' | 'IN CUSTODY' | 'DECEASED' | 'ACTIVE DUTY' | 'DISCHARGED' | 'EMPLOYED';
  threatLevel: number;
  mugshot?: string;
  youtube?: string;
  twitch?: string;
  associates: string[];
  body: string;
}

export interface Sighting {
  id: string;
  title: string;
  url: string;
  author?: string;
  characters: string[];
  date?: string;
}

export interface Day {
  id: string;
  day: number;
  date: string;
  title: string;
  body: string;
}

export interface Faction {
  id: string;
  name: string;
  color: string;
  colorClass: string;
  leader: string;
  type: string;
  members: string[];
  formerMembers: string[];
  body: string;
}

export interface Relationship {
  from: string;
  to: string;
  type: 'ally' | 'enemy' | 'neutral';
  label: string;
}

export interface WindowData {
  id: string;
  title: string;
  type: 'folder' | 'dossier' | 'casefile' | 'faction' | 'network' | 'readme';
  content: any;
  zIndex: number;
  closing?: boolean;
  minimized?: boolean;
  position?: { x: number; y: number };
}

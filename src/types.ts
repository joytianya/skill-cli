export interface Skill {
  id: string; // {agent}:{name}
  name: string;
  description: string;
  source: {
    agent: string;
    path: string;
    dir: string;
  };
  version?: string;
  tags?: string[];
  raw: Record<string, unknown>;
}

export interface AgentSource {
  name: string;
  paths: string[];
}

export interface ScanResult {
  skills: Skill[];
  errors: { path: string; error: string }[];
  scannedDirs: string[];
}

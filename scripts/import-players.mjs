import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CSV_PATH = '/Users/jepedesu/Downloads/District V player list - 工作表1.csv';
const CHARS_DIR = join(import.meta.dirname, '..', 'src', 'content', 'characters');
const FACTIONS_DIR = join(import.meta.dirname, '..', 'src', 'content', 'factions');

// Parse CSV handling quoted fields with newlines
function parseCSV(text) {
  const lines = [];
  let current = '';
  let inQuotes = false;
  for (const char of text) {
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === '\n' && !inQuotes) {
      lines.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current);

  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = (values[i] || '').trim());
    return obj;
  });
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
}

function slugifyTwitter(twitter) {
  // @handle -> handle slug
  return twitter.replace(/^@/, '').replace(/[^\w-]/g, '').toLowerCase();
}

// Manual slug overrides for characters with existing files or problematic names
const SLUG_OVERRIDES = {
  'Jurard T Rexford': 'jurard-rexford',
  'D.K Graves': 'dk-graves',
  'Yu Q. Wilson': 'yu-q-wilson',
  'Luca Kaneshiro': 'luca-kaneshiro',
  'Vox Akuma': 'vox-akuma',
  'Taiga Chama': 'taiga-chama',
  'Lan Philia': 'lan-philia',
};

// Existing hand-crafted files - skip writing but use their existing faction
const EXISTING_FILES = {
  'luca-kaneshiro': 'el-batchelors',
  'vox-akuma': 'police',
  'jurard-rexford': 'el-batchelors',
  'dk-graves': 'el-batchelors',
  'yu-q-wilson': 'police',
  'taiga-chama': 'vanilla-unicorn',
  'lan-philia': 'vanilla-unicorn',
};

// Determine faction from Job + Role + RP Name + Lore
function getFaction(job, role, rpName, lore) {
  const j = (job || '').toLowerCase();
  const r = (role || '').toLowerCase();
  const rp = (rpName || '').toLowerCase();

  // Criminal takes priority
  if (j.includes('criminal') || r.includes('gangsta') || r.includes('mafia boss')) return 'criminal';

  // Police
  if (j.includes('police') || r.includes('police') || r.includes('cop') ||
      r.includes('officer') || r.includes('detective') || r.includes('chief of police') ||
      r.includes('rookie cop') || r.includes('callsign')) return 'police';

  // EMS
  if (j.includes('ems') || r.includes('paramedic') || r.includes('doctor') ||
      r.includes('emt') || r.includes('head chief doctor')) return 'ems';

  // DOJ
  if (j.includes('doj') || r.includes('judge') || r.includes('lawyer') ||
      r.includes('prosecutor') || r.includes('defender')) return 'doj';

  // Host/Hostess Club = Vanilla Unicorn
  if (j.includes('host') || j.includes('hostess')) return 'vanilla-unicorn';

  // Burger Shot
  if (r.includes('burger shot') || rp.includes('burgerweather')) return 'burger-shot';

  // uwu cafe / cat cafe
  if (r.includes('uwu cafe') || r.includes('cat cafe')) return 'uwu-cafe';

  // Mechanic shop
  if (j.includes('shop') || r.includes('mechanic')) return 'mechanic-shop';

  // Food Service without specific assignment
  if (j.includes('food service')) {
    if (rp.includes('burgerweather')) return 'burger-shot';
    return 'civilian';
  }

  return 'civilian';
}

// Map to status
function getStatus(faction) {
  if (['police', 'ems', 'doj'].includes(faction)) return 'ACTIVE DUTY';
  if (faction === 'criminal') return 'AT LARGE';
  if (['vanilla-unicorn', 'burger-shot', 'uwu-cafe', 'mechanic-shop'].includes(faction)) return 'EMPLOYED';
  return 'AT LARGE';
}

// Assign threat level
function getThreatLevel(role, faction) {
  const r = (role || '').toLowerCase();
  if (faction === 'police') {
    if (r.includes('chief')) return 2;
    if (r.includes('detective') || r.includes('intelligence')) return 3;
    return 3;
  }
  if (faction === 'ems') return 2;
  if (faction === 'doj') return 2;
  if (faction === 'criminal') {
    if (r.includes('mafia boss') || r.includes('gangsta')) return 8;
    return 6;
  }
  if (faction === 'vanilla-unicorn') return 3;
  if (['burger-shot', 'uwu-cafe', 'mechanic-shop'].includes(faction)) return 2;
  return 1;
}

// Map agency names
function mapAgency(affiliation) {
  const aff = (affiliation || '').trim();
  if (!aff || aff === 'Indie') return 'Independent';
  const map = {
    'NIJISANJI': 'NIJISANJI EN',
    'HOLOSTARS': 'HOLOSTARS EN',
    'HOLOLIVE': 'HOLOLIVE EN',
    'VSPO!': 'VSPO!',
    'V&U': 'V&U',
    'V4Mirai': 'V4Mirai',
    'INVICTA': 'INVICTA',
    'First Stage Production': 'First Stage Production',
    'ASTRALINE': 'ASTRALINE',
    'LUMINARA': 'LUMINARA',
    'Neo-Porte': 'Neo-Porte',
    'Aegis-Link': 'Aegis-Link',
    'Requiem': 'Requiem',
    'HEIRS': 'HEIRS',
    'BLUEJUMP': 'BLUEJUMP',
    'ChromaSHIFT': 'ChromaSHIFT',
  };
  return map[aff] || aff;
}

// Track faction members
const factionMembers = {};

const csv = readFileSync(CSV_PATH, 'utf-8');
const players = parseCSV(csv);

let created = 0;
let skipped = 0;
let slugIssues = [];

for (const player of players) {
  const streamer = player['Name']?.trim();
  if (!streamer) continue;

  // Determine slug
  let slug = SLUG_OVERRIDES[streamer] || slugify(streamer);

  // Fallback to twitter handle for non-ASCII names
  if (!slug && player['Twitter Name']) {
    slug = slugifyTwitter(player['Twitter Name']);
  }

  if (!slug) {
    slugIssues.push(streamer);
    continue;
  }

  const rpName = (player['RP Name'] || '').replace(/\n/g, ' ').trim();
  const job = player['Job'] || '';
  const role = player['Role'] || '';
  const lore = (player['Lore'] || '').replace(/\n/g, ' ').trim();
  const affiliation = player['Affliation'] || '';

  // For existing files, use their established faction
  if (EXISTING_FILES[slug]) {
    const existingFaction = EXISTING_FILES[slug];
    if (!factionMembers[existingFaction]) factionMembers[existingFaction] = [];
    factionMembers[existingFaction].push(slug);
    skipped++;
    continue;
  }

  const faction = getFaction(job, role, rpName, lore);
  const status = getStatus(faction);
  const threatLevel = getThreatLevel(role, faction);
  const agency = mapAgency(affiliation);

  // Track faction membership
  if (!factionMembers[faction]) factionMembers[faction] = [];
  factionMembers[faction].push(slug);

  const name = rpName || streamer;
  const frontmatter = [
    '---',
    `name: "${name.replace(/"/g, '\\"')}"`,
    `streamer: "${streamer.replace(/"/g, '\\"')}"`,
    `agency: "${agency}"`,
    `faction: "${faction}"`,
    `status: "${status}"`,
    `threatLevel: ${threatLevel}`,
    `associates: []`,
    '---',
  ].join('\n');

  let body = '';
  if (lore) {
    body = `\n${lore}\n`;
  } else {
    body = `\nA resident of Los Santos.\n`;
  }

  if (job || role) {
    body += `\n## Profile\n`;
    if (job) body += `- **Job:** ${job}\n`;
    if (role) body += `- **Role:** ${role}\n`;
  }

  const content = frontmatter + '\n' + body;
  const filePath = join(CHARS_DIR, `${slug}.md`);
  writeFileSync(filePath, content);
  created++;
}

// Create new faction files
const newFactions = {
  'doj': {
    name: 'Department of Justice',
    color: '#FFD700',
    colorClass: 'doj',
    leader: 'elyzaeve',
    type: 'Judicial',
    body: 'The Department of Justice handles all legal proceedings in Los Santos, including court cases, legal defense, and prosecution.',
  },
  'burger-shot': {
    name: 'Burger Shot',
    color: '#FF8C00',
    colorClass: 'burger-shot',
    leader: 'lucius-merryweather',
    type: 'Food Service',
    body: 'The premier fast food chain of Los Santos. Home of the Bleeder Burger. Run by the Burgerweather family.',
  },
  'uwu-cafe': {
    name: 'uwu Cafe (Cat Cafe)',
    color: '#FFB6C1',
    colorClass: 'uwu-cafe',
    leader: 'shu-yamino',
    type: 'Food Service',
    body: 'A cat-themed cafe in Los Santos serving as a social hub and cover for some questionable activities.',
  },
  'mechanic-shop': {
    name: 'Mechanic Shop',
    color: '#808080',
    colorClass: 'mechanic-shop',
    leader: 'hysteria',
    type: 'Service',
    body: 'The local mechanic shop co-owned by Nissan BeepBeep (Hysteria) and Sherry Shaftswell (Bonnie Barkswell).',
  },
  'criminal': {
    name: 'Criminal Underground',
    color: '#8B0000',
    colorClass: 'criminal',
    leader: 'luca-kaneshiro',
    type: 'Criminal',
    body: 'Various criminals operating in Los Santos. Some are affiliated with gangs, others are independent operators.',
  },
  'civilian': {
    name: 'Civilians',
    color: '#AAAAAA',
    colorClass: 'civilian',
    leader: 'none',
    type: 'Civilian',
    body: 'The everyday citizens of Los Santos. Some are just trying to get by, others are looking for trouble.',
  },
};

for (const [id, faction] of Object.entries(newFactions)) {
  const members = factionMembers[id] || [];
  const filePath = join(FACTIONS_DIR, `${id}.md`);
  const content = [
    '---',
    `name: "${faction.name}"`,
    `color: "${faction.color}"`,
    `colorClass: "${faction.colorClass}"`,
    `leader: "${faction.leader}"`,
    `type: "${faction.type}"`,
    `members: ${JSON.stringify(members)}`,
    '---',
    '',
    faction.body,
    '',
  ].join('\n');
  writeFileSync(filePath, content);
}

// Update existing faction member lists
for (const [factionId, members] of Object.entries(factionMembers)) {
  if (newFactions[factionId]) continue;
  const filePath = join(FACTIONS_DIR, `${factionId}.md`);
  if (!existsSync(filePath)) continue;

  const existing = readFileSync(filePath, 'utf-8');
  const updated = existing.replace(
    /members: \[.*?\]/s,
    `members: ${JSON.stringify([...new Set(members)])}`
  );
  writeFileSync(filePath, updated);
}

console.log(`\nCreated ${created} character files, skipped ${skipped} existing.`);
if (slugIssues.length) {
  console.log(`\nCould not generate slug for: ${slugIssues.join(', ')}`);
}
console.log('\nFaction breakdown:');
for (const [k, v] of Object.entries(factionMembers).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${k} (${v.length}): ${v.join(', ')}`);
}

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── SVG helpers ───────────────────────────────────────────────────────────────

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
function b64(s: string) { return Buffer.from(s).toString('base64') }

function avatarImg(initials: string, bg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="${bg}"/><text x="100" y="118" text-anchor="middle" font-family="Georgia,serif" font-size="68" font-weight="bold" fill="white">${initials}</text></svg>`
  return `data:image/svg+xml;base64,${b64(svg)}`
}

type Dept = 'Studio Art'|'Computer Science'|'Environmental Studies'|'Engineering'|'Theater'|'Film & Media Studies'|'Music'|'Government'|'Biology'

function slideImg(title: string, dept: Dept, gradient: string, author: string): string {
  const cols = (gradient.match(/#[0-9a-fA-F]{6}/g) || ['#1a6b3a','#96fbc4'])
  const c1 = cols[0], c2 = cols[cols.length-1]
  const fs = title.length > 32 ? 40 : title.length > 22 ? 48 : 56

  let accent = ''
  if (dept === 'Studio Art') {
    accent = `<circle cx="980" cy="160" r="200" fill="rgba(255,255,255,0.06)"/>
<circle cx="1100" cy="380" r="130" fill="rgba(255,255,255,0.04)"/>
<circle cx="120" cy="520" r="180" fill="rgba(255,255,255,0.05)"/>
<circle cx="280" cy="260" r="100" fill="rgba(255,255,255,0.07)"/>`
  } else if (dept === 'Computer Science') {
    accent = `<circle cx="750" cy="90" r="5" fill="rgba(255,255,255,0.25)"/>
<circle cx="820" cy="160" r="5" fill="rgba(255,255,255,0.2)"/>
<circle cx="900" cy="90" r="5" fill="rgba(255,255,255,0.25)"/>
<circle cx="970" cy="200" r="5" fill="rgba(255,255,255,0.15)"/>
<circle cx="1050" cy="120" r="5" fill="rgba(255,255,255,0.2)"/>
<circle cx="1100" cy="200" r="5" fill="rgba(255,255,255,0.25)"/>
<circle cx="760" cy="280" r="5" fill="rgba(255,255,255,0.15)"/>
<circle cx="850" cy="320" r="5" fill="rgba(255,255,255,0.2)"/>
<circle cx="950" cy="260" r="5" fill="rgba(255,255,255,0.25)"/>
<line x1="750" y1="90" x2="820" y2="160" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
<line x1="820" y1="160" x2="900" y2="90" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
<line x1="900" y1="90" x2="970" y2="200" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
<line x1="970" y1="200" x2="1050" y2="120" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
<line x1="760" y1="280" x2="850" y2="320" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
<line x1="850" y1="320" x2="950" y2="260" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`
  } else if (dept === 'Environmental Studies' || dept === 'Biology') {
    accent = `<path d="M0,380 C200,300 400,460 600,360 S1000,280 1200,380" stroke="rgba(255,255,255,0.18)" stroke-width="2.5" fill="none"/>
<path d="M0,430 C200,350 400,510 600,410 S1000,330 1200,430" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" fill="none"/>
<path d="M0,480 C200,400 400,560 600,460 S1000,380 1200,480" stroke="rgba(255,255,255,0.06)" stroke-width="1" fill="none"/>
<circle cx="960" cy="220" r="90" fill="rgba(255,255,255,0.05)"/>`
  } else if (dept === 'Engineering') {
    accent = `<rect x="820" y="80" width="280" height="280" fill="none" stroke="rgba(255,255,255,0.13)" stroke-width="1.5" transform="rotate(12,960,220)"/>
<rect x="860" y="120" width="200" height="200" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" transform="rotate(24,960,220)"/>
<line x1="960" y1="80" x2="960" y2="360" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
<line x1="820" y1="220" x2="1100" y2="220" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
<circle cx="960" cy="220" r="32" fill="rgba(255,255,255,0.07)"/>
<circle cx="960" cy="220" r="10" fill="rgba(255,255,255,0.18)"/>`
  } else if (dept === 'Theater' || dept === 'Film & Media Studies') {
    accent = `<polygon points="600,0 80,675 1120,675" fill="rgba(255,255,255,0.04)"/>
<polygon points="600,0 250,675 950,675" fill="rgba(255,255,255,0.03)"/>
<line x1="0" y1="650" x2="1200" y2="650" stroke="rgba(255,255,255,0.18)" stroke-width="3"/>
<rect x="510" y="638" width="180" height="37" fill="rgba(255,255,255,0.1)" rx="4"/>`
  } else if (dept === 'Music') {
    accent = `<line x1="80" y1="310" x2="1120" y2="310" stroke="rgba(255,255,255,0.13)" stroke-width="1.5"/>
<line x1="80" y1="340" x2="1120" y2="340" stroke="rgba(255,255,255,0.13)" stroke-width="1.5"/>
<line x1="80" y1="370" x2="1120" y2="370" stroke="rgba(255,255,255,0.13)" stroke-width="1.5"/>
<line x1="80" y1="400" x2="1120" y2="400" stroke="rgba(255,255,255,0.13)" stroke-width="1.5"/>
<line x1="80" y1="430" x2="1120" y2="430" stroke="rgba(255,255,255,0.13)" stroke-width="1.5"/>
<path d="M200,370 Q400,300 600,360 Q800,420 1000,350" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" fill="none"/>`
  } else {
    accent = `<rect x="750" y="190" width="65" height="270" fill="rgba(255,255,255,0.12)" rx="4"/>
<rect x="835" y="270" width="65" height="190" fill="rgba(255,255,255,0.09)" rx="4"/>
<rect x="920" y="150" width="65" height="310" fill="rgba(255,255,255,0.15)" rx="4"/>
<rect x="1005" y="230" width="65" height="230" fill="rgba(255,255,255,0.1)" rx="4"/>
<rect x="1090" y="310" width="65" height="150" fill="rgba(255,255,255,0.07)" rx="4"/>
<line x1="730" y1="460" x2="1180" y2="460" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>`
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
<stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
</linearGradient></defs>
<rect width="1200" height="675" fill="url(#bg)"/>
${accent}
<line x1="80" y1="510" x2="1120" y2="510" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>
<text x="80" y="250" font-family="Georgia,serif" font-size="${fs}" font-weight="bold" fill="white" opacity="0.96">${esc(title)}</text>
<text x="80" y="${fs + 268}" font-family="Georgia,serif" font-size="22" fill="rgba(255,255,255,0.6)">${esc(dept)}</text>
<text x="80" y="560" font-family="Georgia,serif" font-size="20" fill="rgba(255,255,255,0.55)">${esc(author)} · Dartmouth College</text>
<text x="80" y="635" font-family="Georgia,serif" font-size="15" fill="rgba(255,255,255,0.3)">DiPs — Dartmouth Innovative Projects Studio</text>
</svg>`
  return `data:image/svg+xml;base64,${b64(svg)}`
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Clearing existing data...')
  await prisma.like.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.message.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()

  console.log('Creating users...')
  const users = await Promise.all([
    prisma.user.create({ data: {
      name: 'Elena Vasquez', email: 'evasquez@dartmouth.edu', password: '',
      pronouns: 'she/her', classYear: 2025, major: 'Studio Art',
      bio: 'Digital artist exploring the intersection of code and canvas. My work investigates how algorithms can simulate and subvert natural systems.',
      clubs: JSON.stringify(['Digital Arts Collective', 'Painting & Drawing Club']),
      workExperiences: JSON.stringify([{ title: 'Artist in Residence', org: 'Hood Museum of Art', years: '2023–2024' }]),
      photoUrl: avatarImg('EV', '#134e5e'), isProfileComplete: true,
    }}),
    prisma.user.create({ data: {
      name: 'Marcus Chen', email: 'mchen@dartmouth.edu', password: '',
      pronouns: 'he/him', classYear: 2024, major: 'Computer Science',
      bio: 'Building tools at the intersection of music and machine learning. Interested in generative systems and accessible technology.',
      clubs: JSON.stringify(['DALI Lab', 'Dartmouth Developers']),
      workExperiences: JSON.stringify([{ title: 'SWE Intern', org: 'Spotify', years: 'Summer 2023' }, { title: 'Research Assistant', org: 'Dartmouth CS Dept', years: '2022–2024' }]),
      photoUrl: avatarImg('MC', '#4a0080'), isProfileComplete: true,
    }}),
    prisma.user.create({ data: {
      name: 'Priya Sharma', email: 'psharma@dartmouth.edu', password: '',
      pronouns: 'she/her', classYear: 2026, major: 'Environmental Studies & Data Science',
      bio: 'Using data to tell stories about the natural world. Focused on climate visualization and environmental justice.',
      clubs: JSON.stringify(['Sustainability Coalition', 'Data Science Club', 'Outing Club']),
      workExperiences: JSON.stringify([{ title: 'Research Intern', org: 'NOAA Fisheries', years: 'Summer 2024' }]),
      photoUrl: avatarImg('PS', '#023e8a'), isProfileComplete: true,
    }}),
    prisma.user.create({ data: {
      name: 'James Okafor', email: 'jokafor@dartmouth.edu', password: '',
      pronouns: 'he/him', classYear: 2025, major: 'Engineering Sciences',
      bio: 'Mechatronics and bio-inspired design. Building things that move, sense, and adapt to their environment.',
      clubs: JSON.stringify(['Robotics Club', 'Society of Engineers', 'Design for America']),
      workExperiences: JSON.stringify([{ title: 'Hardware Engineering Intern', org: 'iRobot', years: 'Summer 2023' }]),
      photoUrl: avatarImg('JO', '#b5451b'), isProfileComplete: true,
    }}),
    prisma.user.create({ data: {
      name: 'Sofia Rodriguez', email: 'srodriguez@dartmouth.edu', password: '',
      pronouns: 'she/they', classYear: 2024, major: 'Theater & Film and Media Studies',
      bio: 'Immersive theater and documentary filmmaking. Creating work that collapses the boundary between audience and performance.',
      clubs: JSON.stringify(['Dartmouth Players', 'DOC Films', 'Speaking Truth to Power']),
      workExperiences: JSON.stringify([{ title: 'Assistant Director', org: 'Hopkins Center for the Arts', years: '2023' }]),
      photoUrl: avatarImg('SR', '#780000'), isProfileComplete: true,
    }}),
    prisma.user.create({ data: {
      name: 'Liam Park', email: 'lpark@dartmouth.edu', password: '',
      pronouns: 'he/him', classYear: 2026, major: 'Music & Computer Science',
      bio: 'Composer and programmer working at the edge of human and machine creativity. Everything is a system.',
      clubs: JSON.stringify(['Experimental Music Collective', 'DALI Lab', 'Chamber Music Society']),
      workExperiences: JSON.stringify([{ title: 'Composition Fellow', org: 'Tanglewood Music Center', years: 'Summer 2024' }]),
      photoUrl: avatarImg('LP', '#2b2d42'), isProfileComplete: true,
    }}),
    prisma.user.create({ data: {
      name: 'Aisha Williams', email: 'awilliams@dartmouth.edu', password: '',
      pronouns: 'she/her', classYear: 2025, major: 'Government & Economics',
      bio: 'Policy analyst and data journalist. Making governance legible through visualization.',
      clubs: JSON.stringify(['Political Data Lab', 'The Dartmouth', 'Mock Trial']),
      workExperiences: JSON.stringify([{ title: 'Policy Research Intern', org: 'Brookings Institution', years: 'Summer 2023' }, { title: 'Data Journalist', org: 'The Dartmouth', years: '2022–2025' }]),
      photoUrl: avatarImg('AW', '#6d6875'), isProfileComplete: true,
    }}),
    prisma.user.create({ data: {
      name: 'Noah Thompson', email: 'nthompson@dartmouth.edu', password: '',
      pronouns: 'he/him', classYear: 2027, major: 'Biology',
      bio: 'Marine biologist studying bioluminescence and microbial ecology. Interested in the intersection of science and visual art.',
      clubs: JSON.stringify(['Marine Biology Society', 'Photography Club', 'Science Writers']),
      workExperiences: JSON.stringify([{ title: 'Lab Research Assistant', org: 'Dartmouth Geisel School of Medicine', years: '2024–present' }]),
      photoUrl: avatarImg('NT', '#05668d'), isProfileComplete: true,
    }}),
  ])
  const [elena, marcus, priya, james, sofia, liam, aisha, noah] = users
  console.log(`Created ${users.length} users`)

  const now = Date.now(), day = 86_400_000
  console.log('Creating projects...')

  const projects = await Promise.all([
    // Elena — 3 projects
    prisma.project.create({ data: { title: 'Chromatic Landscapes', description: 'An exploration of color theory through digital landscapes that blend impressionist brushwork with algorithmic generation. Each piece responds to real-time weather data from Hanover, NH — humidity shifts hue, barometric pressure drives saturation, temperature controls value.', tags: JSON.stringify(['art','algorithm','color','digital','generative']), department: 'Studio Art', projectType: 'Solo', year: 2024, gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 50%, #96fbc4 100%)', frameData: JSON.stringify({ x: 120, y: 100, rotation: 2, frameIndex: 12, bobDelay: 0 }), imageUrl: slideImg('Chromatic Landscapes','Studio Art','linear-gradient(135deg, #134e5e 0%, #71b280 50%, #96fbc4 100%)','Elena Vasquez'), authorId: elena.id, createdAt: new Date(now-20*day) }}),
    prisma.project.create({ data: { title: 'Neon Nocturnes', description: 'A series of digital paintings capturing the atmospheric glow of late-night Hanover — neon signs, empty streets, and the particular loneliness of small college town nights. Made over six weeks of midnight walks.', tags: JSON.stringify(['painting','digital','night','urban','atmosphere']), department: 'Studio Art', projectType: 'Solo', year: 2025, gradient: 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', frameData: JSON.stringify({ x: 480, y: 520, rotation: -2, frameIndex: 4, bobDelay: 0.8 }), imageUrl: slideImg('Neon Nocturnes','Studio Art','linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)','Elena Vasquez'), authorId: elena.id, createdAt: new Date(now-8*day) }}),
    prisma.project.create({ data: { title: 'Process / Progress', description: 'Documentation of a year-long creative practice: sketches, failed experiments, breakthroughs, and the messy reality of making art at a research university. An honest portrait of the studio as a space of productive failure.', tags: JSON.stringify(['process','documentation','studio','practice']), department: 'Studio Art', projectType: 'Independent', year: 2024, gradient: 'linear-gradient(135deg, #f8961e 0%, #f9c74f 50%, #fff3b0 100%)', frameData: JSON.stringify({ x: 1400, y: 920, rotation: 3, frameIndex: 7, bobDelay: 2.2 }), imageUrl: slideImg('Process / Progress','Studio Art','linear-gradient(135deg, #f8961e 0%, #f9c74f 50%, #fff3b0 100%)','Elena Vasquez'), authorId: elena.id, createdAt: new Date(now-35*day) }}),
    // Marcus — 2 projects
    prisma.project.create({ data: { title: 'Harmonic', description: 'A web app that generates personalized ambient music using transformer models trained on the listener\'s listening history and real-time biometric data. The system adapts in real time — tempo follows heart rate, harmonic complexity mirrors focus level.', tags: JSON.stringify(['CS','ML','music','app','generative','biometrics']), department: 'Computer Science', projectType: 'Independent', year: 2024, gradient: 'linear-gradient(135deg, #4a0080 0%, #7b2d8b 30%, #c471f5 65%, #fa71cd 100%)', frameData: JSON.stringify({ x: 840, y: 100, rotation: -3, frameIndex: 11, bobDelay: 1.5 }), imageUrl: slideImg('Harmonic','Computer Science','linear-gradient(135deg, #4a0080 0%, #7b2d8b 30%, #c471f5 65%, #fa71cd 100%)','Marcus Chen'), authorId: marcus.id, createdAt: new Date(now-15*day) }}),
    prisma.project.create({ data: { title: 'CampusMap+', description: 'An accessible indoor navigation system for Dartmouth\'s campus, including real-time updates for construction, accessibility closures, and crowding. Built with React Native and a custom pathfinding layer over OpenStreetMap.', tags: JSON.stringify(['CS','accessibility','maps','React','mobile']), department: 'Computer Science', projectType: 'Class Project', classCode: 'ENGS 12', year: 2023, gradient: 'linear-gradient(135deg, #2b2d42 0%, #8d99ae 50%, #edf2f4 100%)', frameData: JSON.stringify({ x: 300, y: 900, rotation: 2, frameIndex: 3, bobDelay: 3.0 }), imageUrl: slideImg('CampusMap+','Computer Science','linear-gradient(135deg, #2b2d42 0%, #8d99ae 50%, #edf2f4 100%)','Marcus Chen'), authorId: marcus.id, createdAt: new Date(now-45*day) }}),
    // Priya — 3 projects
    prisma.project.create({ data: { title: 'River Monitor', description: 'Real-time visualization of Connecticut River watershed health metrics — pH, turbidity, dissolved oxygen, and flow rate — rendered as a living abstract painting that updates every hour from USGS sensor feeds.', tags: JSON.stringify(['environment','data','visualization','React','rivers']), department: 'Environmental Studies', projectType: 'Independent', year: 2024, gradient: 'linear-gradient(135deg, #05668d 0%, #028090 30%, #00b4d8 60%, #83c5be 100%)', frameData: JSON.stringify({ x: 1200, y: 100, rotation: -1, frameIndex: 15, bobDelay: 1.8 }), imageUrl: slideImg('River Monitor','Environmental Studies','linear-gradient(135deg, #05668d 0%, #028090 30%, #00b4d8 60%, #83c5be 100%)','Priya Sharma'), authorId: priya.id, createdAt: new Date(now-12*day) }}),
    prisma.project.create({ data: { title: 'Thirty Years of Fire', description: 'Satellite data analysis of wildfire expansion across the American West from 1990–2023, rendered as an animated time-series map. Data sourced from NASA FIRMS and USFS fire perimeter databases.', tags: JSON.stringify(['climate','data','GIS','visualization','wildfires']), department: 'Environmental Studies', projectType: 'Class Project', classCode: 'ENVS 50', year: 2023, gradient: 'linear-gradient(135deg, #b5451b 0%, #e07b39 40%, #f6d365 100%)', frameData: JSON.stringify({ x: 660, y: 920, rotation: 4, frameIndex: 6, bobDelay: 0.4 }), imageUrl: slideImg('Thirty Years of Fire','Environmental Studies','linear-gradient(135deg, #b5451b 0%, #e07b39 40%, #f6d365 100%)','Priya Sharma'), authorId: priya.id, createdAt: new Date(now-40*day) }}),
    prisma.project.create({ data: { title: 'Carbon Cartography', description: 'Hand-drawn topographic maps overlaid with carbon emissions data — making the invisible geography of climate change tangible and beautiful. Each map pairs a physical landscape with its atmospheric footprint.', tags: JSON.stringify(['art','data','climate','cartography','maps','drawing']), department: 'Environmental Studies', projectType: 'Solo', year: 2025, gradient: 'linear-gradient(135deg, #1a472a 0%, #2d6a4f 40%, #52b788 100%)', frameData: JSON.stringify({ x: 1560, y: 520, rotation: -2, frameIndex: 14, bobDelay: 2.6 }), imageUrl: slideImg('Carbon Cartography','Environmental Studies','linear-gradient(135deg, #1a472a 0%, #2d6a4f 40%, #52b788 100%)','Priya Sharma'), authorId: priya.id, createdAt: new Date(now-5*day) }}),
    // James — 2 projects
    prisma.project.create({ data: { title: 'Sunflower Protocol', description: 'A bio-inspired solar tracking system using swarm robotics to mimic sunflower heliotropism. The hardware prototype doubles as a kinetic sculpture in the engineering quad, achieving 37% efficiency gain over static panels.', tags: JSON.stringify(['engineering','robotics','sustainability','bio-inspired','solar']), department: 'Engineering', projectType: 'Group', year: 2023, gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 50%, #f093fb 100%)', frameData: JSON.stringify({ x: 1560, y: 100, rotation: -1, frameIndex: 17, bobDelay: 3.0 }), imageUrl: slideImg('Sunflower Protocol','Engineering','linear-gradient(135deg, #f6d365 0%, #fda085 50%, #f093fb 100%)','James Okafor'), authorId: james.id, createdAt: new Date(now-50*day) }}),
    prisma.project.create({ data: { title: 'VertiFarm', description: 'A low-cost vertical farming system designed for dorm rooms — modular, self-watering, and IoT-connected. Grows leafy greens under tuned LED spectra, monitored via a React Native app with push alerts for water and nutrient levels.', tags: JSON.stringify(['engineering','sustainability','IoT','hardware','food']), department: 'Engineering', projectType: 'Independent', year: 2024, gradient: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 40%, #95d5b2 100%)', frameData: JSON.stringify({ x: 120, y: 920, rotation: 5, frameIndex: 9, bobDelay: 1.2 }), imageUrl: slideImg('VertiFarm','Engineering','linear-gradient(135deg, #1b4332 0%, #2d6a4f 40%, #95d5b2 100%)','James Okafor'), authorId: james.id, createdAt: new Date(now-18*day) }}),
    // Sofia — 2 projects
    prisma.project.create({ data: { title: 'Memory Palace', description: 'An immersive performance piece where 30 audience members navigate a set constructed from photographs, sounds, and objects gathered from interviews with Dartmouth alumni spanning six decades. No two paths through the space are alike.', tags: JSON.stringify(['theater','immersive','memory','performance','archive']), department: 'Theater', projectType: 'Class Project', classCode: 'THEA 73', year: 2023, gradient: 'linear-gradient(140deg, #6d6875 0%, #b5838d 40%, #e5989b 70%, #ffcdb2 100%)', frameData: JSON.stringify({ x: 1920, y: 100, rotation: 0, frameIndex: 8, bobDelay: 0.6 }), imageUrl: slideImg('Memory Palace','Theater','linear-gradient(140deg, #6d6875 0%, #b5838d 40%, #e5989b 70%, #ffcdb2 100%)','Sofia Rodriguez'), authorId: sofia.id, createdAt: new Date(now-55*day) }}),
    prisma.project.create({ data: { title: 'Hanover Voices', description: 'A documentary portrait of Hanover — its workers, long-term residents, and students — exploring what community means in a town built around an institution. Screened at the Hopkins Center and the New Hampshire Film Festival.', tags: JSON.stringify(['film','documentary','community','ethnography','Hanover']), department: 'Film & Media Studies', projectType: 'Independent', year: 2024, gradient: 'linear-gradient(135deg, #780000 0%, #c1121f 35%, #e09f3e 65%, #fff3b0 100%)', frameData: JSON.stringify({ x: 480, y: 1320, rotation: -3, frameIndex: 16, bobDelay: 2.8 }), imageUrl: slideImg('Hanover Voices','Film & Media Studies','linear-gradient(135deg, #780000 0%, #c1121f 35%, #e09f3e 65%, #fff3b0 100%)','Sofia Rodriguez'), authorId: sofia.id, createdAt: new Date(now-22*day) }}),
    // Liam — 3 projects
    prisma.project.create({ data: { title: 'Generative Soundscapes', description: 'A system that generates ambient soundscapes in real time, responding to weather data, time of day, and campus WiFi density as a proxy for human activity. Installed in Baker Library for one month.', tags: JSON.stringify(['music','CS','generative','ambient','installation']), department: 'Music', projectType: 'Independent', year: 2024, gradient: 'linear-gradient(135deg, #2b2d42 0%, #5c5f7a 50%, #8d99ae 100%)', frameData: JSON.stringify({ x: 840, y: 520, rotation: -4, frameIndex: 2, bobDelay: 1.0 }), imageUrl: slideImg('Generative Soundscapes','Music','linear-gradient(135deg, #2b2d42 0%, #5c5f7a 50%, #8d99ae 100%)','Liam Park'), authorId: liam.id, createdAt: new Date(now-25*day) }}),
    prisma.project.create({ data: { title: 'The Algorithmic Composer', description: 'Training a transformer model on 400 years of Western classical music to generate novel compositions that pass a double-blind listening test for musical coherence and emotional resonance.', tags: JSON.stringify(['CS','ML','music','AI','composition','transformer']), department: 'Computer Science', projectType: 'Independent', year: 2025, gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)', frameData: JSON.stringify({ x: 1200, y: 920, rotation: 2, frameIndex: 13, bobDelay: 3.5 }), imageUrl: slideImg('The Algorithmic Composer','Computer Science','linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)','Liam Park'), authorId: liam.id, createdAt: new Date(now-7*day) }}),
    prisma.project.create({ data: { title: 'Silence // Noise', description: 'A sound installation exploring the phenomenology of acoustic space. Using directional speakers and real-time audio processing, the piece creates shifting zones of silence and noise that visitors move through physically.', tags: JSON.stringify(['music','installation','sound art','philosophy','space']), department: 'Music', projectType: 'Solo', year: 2023, gradient: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #434343 100%)', frameData: JSON.stringify({ x: 1920, y: 920, rotation: -1, frameIndex: 5, bobDelay: 4.0 }), imageUrl: slideImg('Silence // Noise','Music','linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #434343 100%)','Liam Park'), authorId: liam.id, createdAt: new Date(now-60*day) }}),
    // Aisha — 2 projects
    prisma.project.create({ data: { title: 'The Pulse of Democracy', description: 'Interactive visualization of U.S. voter participation data from 1960–2024, filterable by state, demographics, and election type. Designed to make patterns of disenfranchisement and engagement legible at a glance.', tags: JSON.stringify(['politics','data','visualization','democracy','voting','history']), department: 'Government', projectType: 'Independent', year: 2024, gradient: 'linear-gradient(135deg, #1d3557 0%, #457b9d 50%, #a8dadc 100%)', frameData: JSON.stringify({ x: 300, y: 1320, rotation: 3, frameIndex: 18, bobDelay: 1.4 }), imageUrl: slideImg('The Pulse of Democracy','Government','linear-gradient(135deg, #1d3557 0%, #457b9d 50%, #a8dadc 100%)','Aisha Williams'), authorId: aisha.id, createdAt: new Date(now-30*day) }}),
    prisma.project.create({ data: { title: 'Aid Mapping', description: 'Geospatial analysis of foreign aid distribution versus development outcomes across 80 countries from 2000–2022, revealing systematic patterns invisible in standard aggregate reporting.', tags: JSON.stringify(['government','data','GIS','development','policy','economics']), department: 'Government', projectType: 'Class Project', classCode: 'GOV 83', year: 2024, gradient: 'linear-gradient(135deg, #2c003e 0%, #5a189a 50%, #9d4edd 100%)', frameData: JSON.stringify({ x: 1560, y: 1320, rotation: -2, frameIndex: 1, bobDelay: 0.9 }), imageUrl: slideImg('Aid Mapping','Government','linear-gradient(135deg, #2c003e 0%, #5a189a 50%, #9d4edd 100%)','Aisha Williams'), authorId: aisha.id, createdAt: new Date(now-28*day) }}),
    // Noah — 3 projects
    prisma.project.create({ data: { title: 'Bioluminescence Atlas', description: 'A photographic and scientific catalog of bioluminescent organisms found in New England coastal waters, with accompanying research on the molecular mechanisms behind light production and ecological function.', tags: JSON.stringify(['biology','photography','marine','research','bioluminescence','ocean']), department: 'Biology', projectType: 'Independent', year: 2024, gradient: 'linear-gradient(135deg, #03045e 0%, #0077b6 40%, #00b4d8 70%, #90e0ef 100%)', frameData: JSON.stringify({ x: 660, y: 1320, rotation: 1, frameIndex: 10, bobDelay: 2.0 }), imageUrl: slideImg('Bioluminescence Atlas','Biology','linear-gradient(135deg, #03045e 0%, #0077b6 40%, #00b4d8 70%, #90e0ef 100%)','Noah Thompson'), authorId: noah.id, createdAt: new Date(now-14*day) }}),
    prisma.project.create({ data: { title: 'Microbiome Portraits', description: 'Fluorescence microscopy images of gut microbiome samples rendered at print scale — making the invisible ecology within us visible and beautiful. Each print is 40×40 inches, paired with the donor\'s health data.', tags: JSON.stringify(['biology','microscopy','art','science','microbiome']), department: 'Biology', projectType: 'Class Project', classCode: 'BIOL 40', year: 2023, gradient: 'linear-gradient(135deg, #4cc9f0 0%, #7209b7 50%, #f72585 100%)', frameData: JSON.stringify({ x: 1200, y: 1320, rotation: -4, frameIndex: 7, bobDelay: 3.2 }), imageUrl: slideImg('Microbiome Portraits','Biology','linear-gradient(135deg, #4cc9f0 0%, #7209b7 50%, #f72585 100%)','Noah Thompson'), authorId: noah.id, createdAt: new Date(now-48*day) }}),
    prisma.project.create({ data: { title: 'The Coral Chronicles', description: 'Five years of time-lapse photography documenting coral bleaching and recovery in Caribbean reef systems, combined with ocean temperature and acidification data. A collaboration with the Smithsonian Tropical Research Institute.', tags: JSON.stringify(['biology','environment','photography','climate','coral','ocean']), department: 'Biology', projectType: 'Independent', year: 2025, gradient: 'linear-gradient(135deg, #0a9396 0%, #94d2bd 40%, #e9d8a6 70%, #ee9b00 100%)', frameData: JSON.stringify({ x: 1920, y: 1320, rotation: 2, frameIndex: 15, bobDelay: 1.6 }), imageUrl: slideImg('The Coral Chronicles','Biology','linear-gradient(135deg, #0a9396 0%, #94d2bd 40%, #e9d8a6 70%, #ee9b00 100%)','Noah Thompson'), authorId: noah.id, createdAt: new Date(now-3*day) }}),
  ])
  console.log(`Created ${projects.length} projects`)

  // ── Comments ───────────────────────────────────────────────────────────────
  const commentRows = [
    { text: 'The way color shifts with barometric pressure is so poetic — you can feel the weather in every piece.', authorId: marcus.id, projectId: projects[0].id },
    { text: "I've been watching the Hanover feed for weeks. The winter pieces are extraordinary.", authorId: priya.id, projectId: projects[0].id },
    { text: 'Would love to talk about a collaboration — working on something similar with sound data.', authorId: liam.id, projectId: projects[0].id },
    { text: "The Lou's diner piece stopped me cold. That shade of yellow is exactly right.", authorId: sofia.id, projectId: projects[1].id },
    { text: 'These feel like memory, not observation. Incredible work.', authorId: noah.id, projectId: projects[1].id },
    { text: 'I tested this during finals week and it genuinely helped me focus. Please ship it.', authorId: elena.id, projectId: projects[3].id },
    { text: 'What architecture are you using for the real-time adaptation? Would love to read the writeup.', authorId: priya.id, projectId: projects[3].id },
    { text: 'The way it syncs with biometrics is seamless. This is exactly what I needed.', authorId: liam.id, projectId: projects[3].id },
    { text: 'The accessibility features alone make this worth deploying campus-wide. Have you talked to facilities?', authorId: james.id, projectId: projects[4].id },
    { text: 'The turbidity-to-opacity mapping is so intuitive. Is this open source?', authorId: marcus.id, projectId: projects[5].id },
    { text: 'Would be perfect as a lobby installation in the environmental studies building.', authorId: sofia.id, projectId: projects[5].id },
    { text: 'The 2020 fire season frame made my stomach drop. Powerful visualization.', authorId: aisha.id, projectId: projects[6].id },
    { text: '37% efficiency gain is remarkable for an undergrad project. The swarm behavior is so elegant.', authorId: marcus.id, projectId: projects[8].id },
    { text: 'Can I get the firmware? I want to build one for my lab.', authorId: priya.id, projectId: projects[8].id },
    { text: 'I participated in the performance — it was genuinely one of the best things I have experienced here.', authorId: aisha.id, projectId: projects[10].id },
    { text: 'The 1970s dorm room reconstruction was remarkable. How did you source everything?', authorId: noah.id, projectId: projects[10].id },
    { text: 'I worked in Baker during the installation and barely noticed it consciously — which is exactly right.', authorId: elena.id, projectId: projects[12].id },
    { text: 'What sensor feeds are you pulling? I want to do something similar with my river data.', authorId: priya.id, projectId: projects[12].id },
    { text: 'I played the generated pieces for my composition professor without saying anything. He asked who wrote them.', authorId: sofia.id, projectId: projects[13].id },
    { text: 'The Monteverdi-trained outputs are unlike anything I have heard. Would love to collaborate.', authorId: elena.id, projectId: projects[13].id },
    { text: 'This should be in every civics classroom. The 1965 VRA panel is striking.', authorId: marcus.id, projectId: projects[15].id },
    { text: 'Is the dataset publicly available? I have been looking for exactly this format.', authorId: priya.id, projectId: projects[15].id },
    { text: 'The dinoflagellate photographs are extraordinary. What camera system?', authorId: marcus.id, projectId: projects[17].id },
    { text: 'I want to hang the comb jelly print in my room. Are these for sale?', authorId: elena.id, projectId: projects[17].id },
    { text: 'The time compression makes the bleaching events viscerally horrifying in a way charts never do.', authorId: priya.id, projectId: projects[19].id },
    { text: 'How did you get access to the Smithsonian sites? Hoping to do marine fieldwork next summer.', authorId: james.id, projectId: projects[19].id },
  ]
  await prisma.comment.createMany({
    data: commentRows.map((c, i) => ({ ...c, createdAt: new Date(now - (60 - i * 2) * day * 0.3) })),
  })
  console.log(`Created ${commentRows.length} comments`)

  // ── Likes ──────────────────────────────────────────────────────────────────
  const likeMatrix: Array<[string, string[]]> = [
    [projects[0].id,  [marcus.id, priya.id, james.id, sofia.id, liam.id, aisha.id, noah.id]],
    [projects[1].id,  [marcus.id, priya.id, sofia.id, liam.id, aisha.id, noah.id]],
    [projects[2].id,  [marcus.id, sofia.id, liam.id]],
    [projects[3].id,  [elena.id, priya.id, james.id, sofia.id, liam.id, aisha.id, noah.id]],
    [projects[4].id,  [elena.id, priya.id, james.id, aisha.id]],
    [projects[5].id,  [elena.id, marcus.id, james.id, sofia.id, liam.id, aisha.id, noah.id]],
    [projects[6].id,  [elena.id, marcus.id, james.id, aisha.id, noah.id]],
    [projects[7].id,  [elena.id, marcus.id, liam.id, noah.id]],
    [projects[8].id,  [elena.id, marcus.id, priya.id, sofia.id, liam.id, aisha.id, noah.id]],
    [projects[9].id,  [elena.id, priya.id, marcus.id, sofia.id, liam.id]],
    [projects[10].id, [elena.id, marcus.id, priya.id, james.id, liam.id, aisha.id, noah.id]],
    [projects[11].id, [elena.id, marcus.id, james.id, liam.id, noah.id]],
    [projects[12].id, [elena.id, priya.id, james.id, sofia.id, aisha.id, noah.id]],
    [projects[13].id, [elena.id, priya.id, james.id, sofia.id, aisha.id, noah.id]],
    [projects[14].id, [elena.id, priya.id, james.id, sofia.id, aisha.id]],
    [projects[15].id, [elena.id, marcus.id, priya.id, james.id, sofia.id, liam.id, noah.id]],
    [projects[16].id, [elena.id, marcus.id, james.id, liam.id, noah.id]],
    [projects[17].id, [elena.id, marcus.id, priya.id, james.id, sofia.id, liam.id, aisha.id]],
    [projects[18].id, [elena.id, marcus.id, priya.id, sofia.id, aisha.id]],
    [projects[19].id, [elena.id, marcus.id, priya.id, james.id, sofia.id, liam.id, aisha.id]],
  ]
  const likeRows = likeMatrix.flatMap(([projectId, userIds]) =>
    userIds.map(userId => ({ userId, projectId }))
  )
  await prisma.like.createMany({ data: likeRows })
  console.log(`Created ${likeRows.length} likes`)

  console.log('\n✓ Seed complete!')
  console.log(`  ${users.length} users · ${projects.length} projects · ${commentRows.length} comments · ${likeRows.length} likes`)
  console.log('\nSeed user emails (type any into the login form):')
  users.forEach(u => console.log(`  ${u.email}`))
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

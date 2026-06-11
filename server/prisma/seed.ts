import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
function b64(s: string) { return Buffer.from(s).toString('base64') }
function svg2url(s: string) { return `data:image/svg+xml;base64,${b64(s)}` }

function avatarImg(initials: string, bg: string): string {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="${bg}"/><text x="100" y="118" text-anchor="middle" font-family="Georgia,serif" font-size="68" font-weight="bold" fill="white">${initials}</text></svg>`
  return svg2url(s)
}

type Dept = 'Studio Art'|'Computer Science'|'Environmental Studies'|'Engineering'|'Theater'|'Film & Media Studies'|'Music'|'Government'|'Biology'

// Dept accent colors (for details slide strip and abstract slide bg)
const DEPT_COLOR: Record<string, string> = {
  'Studio Art':              '#a0522d',
  'Computer Science':        '#1a237e',
  'Environmental Studies':   '#1b5e20',
  'Engineering':             '#bf360c',
  'Theater':                 '#4a148c',
  'Film & Media Studies':    '#880e4f',
  'Music':                   '#1a237e',
  'Government':              '#0d47a1',
  'Biology':                 '#004d40',
}

// ── Slide generators ──────────────────────────────────────────────────────────
// All 1200×675 (16:9)

// Slide 1: Bold gradient cover — varied composition per dept
function coverSlide(title: string, dept: Dept, gradient: string, author: string): string {
  const cols = (gradient.match(/#[0-9a-fA-F]{6}/g) || ['#1a6b3a', '#96fbc4'])
  const c1 = cols[0], c2 = cols[cols.length - 1]

  // dept-specific graphic element behind/around title
  let graphic = ''
  let titleLayout = ''

  if (dept === 'Studio Art') {
    // Large overlapping paint circles — abstract painterly feel
    graphic = `
      <circle cx="900" cy="100" r="320" fill="rgba(255,255,255,0.06)"/>
      <circle cx="1050" cy="400" r="240" fill="rgba(255,255,255,0.05)"/>
      <circle cx="80"  cy="580" r="200" fill="rgba(255,255,255,0.04)"/>
      <ellipse cx="300" cy="200" rx="180" ry="90" fill="rgba(255,255,255,0.07)" transform="rotate(-20 300 200)"/>
    `
    titleLayout = `
      <text x="80" y="280" font-family="Georgia,serif" font-size="72" font-weight="bold" fill="white" opacity="0.97" letter-spacing="-1">${esc(title)}</text>
      <line x1="80" y1="310" x2="420" y2="310" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
      <text x="80" y="345" font-family="Georgia,serif" font-size="22" fill="rgba(255,255,255,0.7)" font-style="italic">${esc(dept)}</text>
      <text x="80" y="610" font-family="Georgia,serif" font-size="19" fill="rgba(255,255,255,0.5)">${esc(author)} · Dartmouth College</text>
    `
  } else if (dept === 'Computer Science' || dept === 'Music') {
    // Dark terminal / code block style
    graphic = `
      <rect x="640" y="40" width="530" height="595" rx="12" fill="rgba(0,0,0,0.35)"/>
      <circle cx="665" cy="68" r="9" fill="#ff5f57"/>
      <circle cx="690" cy="68" r="9" fill="#ffbd2e"/>
      <circle cx="715" cy="68" r="9" fill="#28ca41"/>
      <line x1="640" y1="88" x2="1170" y2="88" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <text x="660" y="130" font-family="monospace" font-size="13" fill="rgba(255,255,255,0.5)">// ${esc(dept)}</text>
      <text x="660" y="160" font-family="monospace" font-size="13" fill="#7dd3fc">const project = {</text>
      <text x="676" y="188" font-family="monospace" font-size="13" fill="rgba(255,255,255,0.7)">  title: <tspan fill="#86efac">"${esc(title.slice(0,22))}"</tspan>,</text>
      <text x="676" y="216" font-family="monospace" font-size="13" fill="rgba(255,255,255,0.7)">  author: <tspan fill="#86efac">"${esc(author.split(' ')[0])}"</tspan>,</text>
      <text x="676" y="244" font-family="monospace" font-size="13" fill="rgba(255,255,255,0.7)">  year: <tspan fill="#fcd34d">2024</tspan>,</text>
      <text x="660" y="272" font-family="monospace" font-size="13" fill="#7dd3fc">}</text>
    `
    titleLayout = `
      <text x="80" y="260" font-family="Georgia,serif" font-size="68" font-weight="bold" fill="white" opacity="0.97">${esc(title)}</text>
      <text x="80" y="300" font-family="Georgia,serif" font-size="20" fill="rgba(255,255,255,0.6)" font-style="italic">${esc(dept)}</text>
      <text x="80" y="612" font-family="Georgia,serif" font-size="19" fill="rgba(255,255,255,0.5)">${esc(author)} · Dartmouth</text>
    `
  } else if (dept === 'Environmental Studies' || dept === 'Biology') {
    // Organic wave / topographic contours
    graphic = `
      <path d="M0,540 C150,480 300,600 450,520 S750,440 900,500 S1100,460 1200,510" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none"/>
      <path d="M0,560 C150,500 300,620 450,540 S750,460 900,520 S1100,480 1200,530" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" fill="none"/>
      <path d="M0,580 C150,520 300,640 450,560 S750,480 900,540 S1100,500 1200,550" stroke="rgba(255,255,255,0.07)" stroke-width="1" fill="none"/>
      <circle cx="980" cy="180" r="160" fill="rgba(255,255,255,0.05)"/>
      <circle cx="1080" cy="260" r="90" fill="rgba(255,255,255,0.04)"/>
    `
    titleLayout = `
      <text x="80" y="270" font-family="Georgia,serif" font-size="70" font-weight="bold" fill="white" opacity="0.97">${esc(title)}</text>
      <line x1="80" y1="300" x2="500" y2="300" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
      <text x="80" y="336" font-family="Georgia,serif" font-size="22" fill="rgba(255,255,255,0.65)" font-style="italic">${esc(dept)}</text>
      <text x="80" y="612" font-family="Georgia,serif" font-size="19" fill="rgba(255,255,255,0.5)">${esc(author)} · Dartmouth College</text>
    `
  } else if (dept === 'Engineering') {
    // Blueprint grid overlay
    graphic = `
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect x="600" y="0" width="600" height="675" fill="url(#grid)"/>
      <rect x="780" y="120" width="260" height="260" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" transform="rotate(10 910 250)"/>
      <circle cx="910" cy="250" r="80" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
      <circle cx="910" cy="250" r="12" fill="rgba(255,255,255,0.25)"/>
      <line x1="830" y1="250" x2="990" y2="250" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <line x1="910" y1="170" x2="910" y2="330" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    `
    titleLayout = `
      <text x="80" y="270" font-family="Georgia,serif" font-size="66" font-weight="bold" fill="white" opacity="0.97">${esc(title)}</text>
      <text x="80" y="310" font-family="monospace" font-size="13" fill="rgba(255,255,255,0.5)">[ENGR] ${esc(dept).toUpperCase()}</text>
      <text x="80" y="612" font-family="Georgia,serif" font-size="19" fill="rgba(255,255,255,0.5)">${esc(author)} · Dartmouth College</text>
    `
  } else if (dept === 'Theater' || dept === 'Film & Media Studies') {
    // Stage / film aesthetic: spotlight cone + curtain shape
    graphic = `
      <polygon points="600,0 200,675 1000,675" fill="rgba(255,255,255,0.04)"/>
      <line x1="0" y1="648" x2="1200" y2="648" stroke="rgba(255,255,255,0.25)" stroke-width="3"/>
      <rect x="490" y="636" width="220" height="39" fill="rgba(255,255,255,0.12)" rx="4"/>
      <rect x="0" y="0" width="60" height="675" fill="rgba(0,0,0,0.25)"/>
      <rect x="1140" y="0" width="60" height="675" fill="rgba(0,0,0,0.25)"/>
    `
    titleLayout = `
      <text x="600" y="240" text-anchor="middle" font-family="Georgia,serif" font-size="70" font-weight="bold" fill="white" opacity="0.97">${esc(title)}</text>
      <text x="600" y="285" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="rgba(255,255,255,0.6)" font-style="italic">${esc(dept)}</text>
      <text x="600" y="612" text-anchor="middle" font-family="Georgia,serif" font-size="19" fill="rgba(255,255,255,0.5)">${esc(author)} · Dartmouth College</text>
    `
  } else if (dept === 'Government') {
    // Civic / data chart vibe — vertical bars + horizontal rule
    graphic = `
      <rect x="750" y="160" width="55" height="300" fill="rgba(255,255,255,0.12)" rx="3"/>
      <rect x="825" y="240" width="55" height="220" fill="rgba(255,255,255,0.09)" rx="3"/>
      <rect x="900" y="120" width="55" height="340" fill="rgba(255,255,255,0.15)" rx="3"/>
      <rect x="975" y="200" width="55" height="260" fill="rgba(255,255,255,0.1)" rx="3"/>
      <rect x="1050" y="300" width="55" height="160" fill="rgba(255,255,255,0.07)" rx="3"/>
      <line x1="730" y1="460" x2="1130" y2="460" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
    `
    titleLayout = `
      <text x="80" y="270" font-family="Georgia,serif" font-size="66" font-weight="bold" fill="white" opacity="0.97">${esc(title)}</text>
      <line x1="80" y1="298" x2="460" y2="298" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
      <text x="80" y="334" font-family="Georgia,serif" font-size="22" fill="rgba(255,255,255,0.65)">${esc(dept)}</text>
      <text x="80" y="612" font-family="Georgia,serif" font-size="19" fill="rgba(255,255,255,0.5)">${esc(author)} · Dartmouth College</text>
    `
  } else {
    graphic = `<circle cx="960" cy="220" r="180" fill="rgba(255,255,255,0.05)"/>`
    titleLayout = `
      <text x="80" y="270" font-family="Georgia,serif" font-size="68" font-weight="bold" fill="white" opacity="0.97">${esc(title)}</text>
      <text x="80" y="310" font-family="Georgia,serif" font-size="22" fill="rgba(255,255,255,0.6)">${esc(dept)}</text>
      <text x="80" y="612" font-family="Georgia,serif" font-size="19" fill="rgba(255,255,255,0.5)">${esc(author)} · Dartmouth College</text>
    `
  }

  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
<stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
</linearGradient></defs>
<rect width="1200" height="675" fill="url(#bg)"/>
${graphic}
${titleLayout}
<text x="80" y="640" font-family="Georgia,serif" font-size="13" fill="rgba(255,255,255,0.28)">DiPs — Dartmouth Innovative Projects Studio</text>
</svg>`
  return svg2url(s)
}

// Slide 2: Clean white "poster" details panel
function detailsSlide(title: string, dept: Dept, gradient: string, author: string, description: string): string {
  const accentColor = DEPT_COLOR[dept] ?? '#1a6b3a'
  const cols = (gradient.match(/#[0-9a-fA-F]{6}/g) || ['#1a6b3a'])
  const accentBg = cols[0]

  // Truncate description to ~140 chars
  const desc = description.length > 140 ? description.slice(0, 137) + '…' : description

  // Word-wrap description into ~2 lines of ~70 chars each
  const words = desc.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    if ((line + ' ' + w).trim().length > 68) {
      lines.push(line.trim())
      line = w
    } else {
      line = (line + ' ' + w).trim()
    }
  }
  if (line) lines.push(line.trim())
  const descLines = lines.slice(0, 4)

  const lineEls = descLines.map((l, i) =>
    `<text x="100" y="${330 + i * 32}" font-family="Georgia,serif" font-size="18" fill="#444">${esc(l)}</text>`
  ).join('\n')

  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
<rect width="1200" height="675" fill="#fafaf8"/>
<rect x="0" y="0" width="12" height="675" fill="${accentBg}"/>
<rect x="0" y="0" width="1200" height="90" fill="${accentBg}"/>
<text x="100" y="58" font-family="Georgia,serif" font-size="18" font-weight="bold" fill="rgba(255,255,255,0.9)" letter-spacing="2">${esc(dept.toUpperCase())}</text>
<text x="1100" y="58" text-anchor="end" font-family="Georgia,serif" font-size="16" fill="rgba(255,255,255,0.7)">Dartmouth College</text>
<text x="100" y="195" font-family="Georgia,serif" font-size="62" font-weight="bold" fill="#1a1a1a" letter-spacing="-1">${esc(title)}</text>
<line x1="100" y1="225" x2="700" y2="225" stroke="${accentColor}" stroke-width="2.5" opacity="0.4"/>
<text x="100" y="270" font-family="Georgia,serif" font-size="18" fill="${accentColor}" font-style="italic">${esc(author)}</text>
${lineEls}
<line x1="100" y1="590" x2="1100" y2="590" stroke="#ddd" stroke-width="1"/>
<text x="100" y="625" font-family="Georgia,serif" font-size="14" fill="#999">DiPs — Dartmouth Innovative Projects Studio</text>
<text x="1100" y="625" text-anchor="end" font-family="Georgia,serif" font-size="14" fill="#999">2024</text>
</svg>`
  return svg2url(s)
}

// Slide 3: Abstract visual — dept-specific artwork, minimal text
function abstractSlide(title: string, dept: Dept, gradient: string): string {
  const cols = (gradient.match(/#[0-9a-fA-F]{6}/g) || ['#1a1a1a', '#333'])
  const c1 = cols[0], c2 = cols[cols.length - 1]
  const dark = '#0d0d0d'

  let art = ''

  if (dept === 'Studio Art') {
    // Large overlapping translucent paint blobs — abstract expressionist
    art = `
      <defs>
        <radialGradient id="b1" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${c1}" stop-opacity="0.9"/><stop offset="100%" stop-color="${c1}" stop-opacity="0"/></radialGradient>
        <radialGradient id="b2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${c2}" stop-opacity="0.85"/><stop offset="100%" stop-color="${c2}" stop-opacity="0"/></radialGradient>
        <radialGradient id="b3" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="white" stop-opacity="0.5"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient>
      </defs>
      <ellipse cx="380" cy="300" rx="380" ry="280" fill="url(#b1)" transform="rotate(-15 380 300)"/>
      <ellipse cx="820" cy="380" rx="340" ry="260" fill="url(#b2)" transform="rotate(20 820 380)"/>
      <ellipse cx="600" cy="200" rx="260" ry="180" fill="url(#b3)"/>
      <ellipse cx="200" cy="500" rx="200" ry="140" fill="${c2}" opacity="0.3" transform="rotate(30 200 500)"/>
      <ellipse cx="1000" cy="150" rx="180" ry="120" fill="${c1}" opacity="0.4" transform="rotate(-10 1000 150)"/>
    `
  } else if (dept === 'Computer Science') {
    // Network graph nodes and connections
    const nodes = [[200,120],[400,80],[600,200],[800,100],[1000,180],[300,320],[550,380],[750,300],[1050,340],[150,480],[450,520],[700,460],[950,500],[1100,240]]
    const edges = [[0,1],[1,2],[2,3],[3,4],[2,5],[5,6],[6,7],[7,8],[5,9],[6,10],[7,11],[8,12],[4,13]]
    const edgeEls = edges.map(([a,b]) =>
      `<line x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}" stroke="rgba(100,200,255,0.25)" stroke-width="1.5"/>`
    ).join('')
    const nodeEls = nodes.map(([x,y], i) =>
      `<circle cx="${x}" cy="${y}" r="${i % 3 === 0 ? 10 : 6}" fill="${i % 2 === 0 ? c1 : c2}" opacity="0.8"/>`
    ).join('')
    art = `${edgeEls}${nodeEls}`
  } else if (dept === 'Environmental Studies') {
    // Topographic contour map feel
    const contours = [340, 320, 300, 280, 260, 240]
    const offset = [0, 15, 28, 40, 50, 58]
    art = contours.map((y, i) =>
      `<path d="M0,${y} C200,${y - offset[i]} 400,${y + offset[i]} 600,${y - offset[i]/2} S900,${y + offset[i]/3} 1200,${y}" stroke="rgba(255,255,255,${0.08 + i * 0.04})" stroke-width="${1 + i * 0.3}" fill="none"/>`
    ).join('') + `
    <circle cx="600" cy="337" r="18" fill="rgba(255,255,255,0.5)"/>
    <circle cx="600" cy="337" r="8" fill="white"/>`
  } else if (dept === 'Engineering') {
    // Gear / mechanical schematic
    art = `
      <circle cx="500" cy="337" r="180" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
      <circle cx="500" cy="337" r="120" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
      <circle cx="500" cy="337" r="40" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
      <circle cx="800" cy="250" r="110" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
      <circle cx="800" cy="250" r="70" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>
      <circle cx="800" cy="250" r="24" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
      ${Array.from({length:12},(_,i)=>{const a=i*30*Math.PI/180,x=500+165*Math.cos(a),y=337+165*Math.sin(a);return`<rect x="${x-6}" y="${y-12}" width="12" height="24" fill="rgba(255,255,255,0.2)" transform="rotate(${i*30} ${x} ${y})"/>`}).join('')}
      <line x1="100" y1="337" x2="900" y2="337" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      <line x1="500" y1="80" x2="500" y2="594" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    `
  } else if (dept === 'Theater' || dept === 'Film & Media Studies') {
    // Film strip / stage curtain
    const frames = [60,280,500,720,940]
    art = frames.map(x =>
      `<rect x="${x}" y="120" width="180" height="300" rx="4" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
       <rect x="${x+10}" y="130" width="160" height="100" rx="2" fill="rgba(255,255,255,0.04)"/>
       <rect x="${x+10}" y="240" width="160" height="100" rx="2" fill="rgba(255,255,255,0.06)"/>
       <circle cx="${x+30}" cy="108" r="6" fill="rgba(255,255,255,0.3)"/>
       <circle cx="${x+150}" cy="108" r="6" fill="rgba(255,255,255,0.3)"/>
       <circle cx="${x+30}" cy="432" r="6" fill="rgba(255,255,255,0.3)"/>
       <circle cx="${x+150}" cy="432" r="6" fill="rgba(255,255,255,0.3)"/>`
    ).join('')
  } else if (dept === 'Music') {
    // Spectrogram-style frequency bars
    const bars = Array.from({length: 48}, (_, i) => {
      const x = 60 + i * 22
      const h = 40 + Math.abs(Math.sin(i * 0.8) * 240 + Math.sin(i * 1.3) * 100)
      const opacity = 0.4 + Math.abs(Math.sin(i * 0.5)) * 0.5
      return `<rect x="${x}" y="${337 - h/2}" width="14" height="${h}" rx="3" fill="${i % 2 === 0 ? c1 : c2}" opacity="${opacity.toFixed(2)}"/>`
    }).join('')
    art = bars + `
      <line x1="40" y1="337" x2="1160" y2="337" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    `
  } else if (dept === 'Government') {
    // World map silhouette outlines (simplified continents as paths)
    art = `
      <g opacity="0.18" fill="rgba(255,255,255,0.8)">
        <ellipse cx="300" cy="280" rx="160" ry="120" transform="rotate(-10 300 280)"/>
        <ellipse cx="320" cy="420" rx="100" ry="140" transform="rotate(5 320 420)"/>
        <ellipse cx="620" cy="250" rx="200" ry="100" transform="rotate(-5 620 250)"/>
        <ellipse cx="700" cy="380" rx="100" ry="130" transform="rotate(10 700 380)"/>
        <ellipse cx="950" cy="270" rx="140" ry="90"/>
        <ellipse cx="1050" cy="370" rx="90" ry="110" transform="rotate(-15 1050 370)"/>
        <ellipse cx="550" cy="450" rx="120" ry="60" transform="rotate(20 550 450)"/>
      </g>
      ${Array.from({length:8}, (_, i) =>
        `<circle cx="${150 + i*130}" cy="337" r="${3+i%3*2}" fill="rgba(255,255,255,0.35)"/>`
      ).join('')}
    `
  } else {
    // Biology: cellular/microscopy circles
    const cells = [[200,200,80],[450,300,60],[700,180,90],[900,320,70],[550,450,55],[300,480,65],[1050,200,50],[800,500,75],[150,380,45]]
    art = cells.map(([x,y,r]) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
       <circle cx="${x}" cy="${y}" r="${Math.round(r*0.4)}" fill="rgba(255,255,255,0.08)"/>`
    ).join('') + cells.map(([x,y,r], i) =>
      i < cells.length-1 ? `<line x1="${x}" y1="${y}" x2="${cells[i+1][0]}" y2="${cells[i+1][1]}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>` : ''
    ).join('')
  }

  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
<stop offset="0%" stop-color="${dark}"/><stop offset="100%" stop-color="#1a1a1a"/>
</linearGradient></defs>
<rect width="1200" height="675" fill="url(#bg)"/>
${art}
<text x="1140" y="654" text-anchor="end" font-family="Georgia,serif" font-size="14" fill="rgba(255,255,255,0.2)" font-style="italic">${esc(title)}</text>
</svg>`
  return svg2url(s)
}

// Slide 4: Elegant credits / closing card
function creditsSlide(title: string, author: string, dept: Dept, year: number, projectType: string): string {
  const accentColor = DEPT_COLOR[dept] ?? '#1a6b3a'
  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
<rect width="1200" height="675" fill="#0f0f0f"/>
<line x1="0" y1="4" x2="1200" y2="4" stroke="${accentColor}" stroke-width="4"/>
<text x="600" y="200" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="rgba(255,255,255,0.35)" letter-spacing="4">PRESENTED BY</text>
<text x="600" y="280" text-anchor="middle" font-family="Georgia,serif" font-size="58" font-weight="bold" fill="white">${esc(author)}</text>
<line x1="350" y1="310" x2="850" y2="310" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
<text x="600" y="360" text-anchor="middle" font-family="Georgia,serif" font-size="28" fill="rgba(255,255,255,0.6)" font-style="italic">${esc(title)}</text>
<text x="600" y="405" text-anchor="middle" font-family="Georgia,serif" font-size="17" fill="rgba(255,255,255,0.35)">${esc(dept)} · ${projectType} · ${year}</text>
<text x="600" y="520" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="rgba(255,255,255,0.25)">Dartmouth College</text>
<text x="600" y="550" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="rgba(255,255,255,0.18)">DiPs — Dartmouth Innovative Projects Studio</text>
<line x1="0" y1="671" x2="1200" y2="671" stroke="${accentColor}" stroke-width="4"/>
</svg>`
  return svg2url(s)
}

function makeSlides(title: string, dept: Dept, gradient: string, author: string, description: string, year: number, projectType: string): string[] {
  return [
    coverSlide(title, dept, gradient, author),
    detailsSlide(title, dept, gradient, author, description),
    abstractSlide(title, dept, gradient),
    creditsSlide(title, author, dept, year, projectType),
  ]
}

// ── Frame positions — 5-column × 4-row non-overlapping grid ──────────────────
// Canvas: 3300×2300. Columns at x=[50,680,1310,1940,2570]. Rows computed from max heights.
//
// Frame display sizes (w×h) from Frame.tsx FRAME_DATA + FRAME_SCALE:
// 1:348×414  2:380×310  3:342×392  4:300×358  5:320×402
// 6:397×416  7:315×418  8:312×346  9:388×287  10:244×370
// 11:332×395 12:493×374 13:340×346 14:382×300 15:342×270
// 16:374×454 17:517×356 18:428×396
//
// Row 0 (y≈60): items 0-4 → max height=418 → Row1 y=558
// Row 1 (y≈558): items 5-9 → max height=416 → Row2 y=1054
// Row 2 (y≈1054): items 10-14 → max height=454 → Row3 y=1588
// Row 3 (y≈1588): items 15-19 → max height=418 → bottom≈2006

const GRID_POSITIONS = [
  // Row 0
  { x:  50, y:  60, rotation:  2, bobDelay: 0.0 }, // 0
  { x: 680, y:  80, rotation: -1, bobDelay: 1.2 }, // 1
  { x:1310, y:  50, rotation:  3, bobDelay: 2.4 }, // 2
  { x:1940, y:  70, rotation: -2, bobDelay: 0.6 }, // 3
  { x:2570, y:  60, rotation:  1, bobDelay: 3.0 }, // 4
  // Row 1
  { x:  50, y: 570, rotation: -1, bobDelay: 1.8 }, // 5
  { x: 680, y: 558, rotation:  4, bobDelay: 0.4 }, // 6
  { x:1310, y: 580, rotation: -2, bobDelay: 2.6 }, // 7
  { x:1940, y: 560, rotation: -1, bobDelay: 3.5 }, // 8
  { x:2570, y: 570, rotation:  2, bobDelay: 1.2 }, // 9
  // Row 2
  { x:  50, y:1070, rotation:  0, bobDelay: 0.8 }, // 10
  { x: 680, y:1054, rotation: -3, bobDelay: 2.8 }, // 11
  { x:1310, y:1080, rotation:  2, bobDelay: 1.0 }, // 12
  { x:1940, y:1060, rotation: -1, bobDelay: 3.2 }, // 13
  { x:2570, y:1054, rotation:  3, bobDelay: 0.5 }, // 14
  // Row 3
  { x:  50, y:1600, rotation:  1, bobDelay: 1.4 }, // 15
  { x: 680, y:1588, rotation: -2, bobDelay: 0.9 }, // 16
  { x:1310, y:1610, rotation:  4, bobDelay: 2.0 }, // 17
  { x:1940, y:1588, rotation: -1, bobDelay: 3.8 }, // 18
  { x:2570, y:1600, rotation:  2, bobDelay: 1.6 }, // 19
]

const FRAME_INDICES = [12, 4, 7, 11, 3, 15, 6, 14, 17, 9, 8, 16, 2, 13, 5, 18, 1, 10, 7, 15]

function pos(i: number) {
  const p = GRID_POSITIONS[i]
  return JSON.stringify({ x: p.x, y: p.y, rotation: p.rotation, frameIndex: FRAME_INDICES[i], bobDelay: p.bobDelay })
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

  type ProjData = { title: string; description: string; tags: string; department: string; projectType: string; year: number; gradient: string; frameData: string; imageUrl?: string; slides: string; authorId: string; createdAt: Date; classCode?: string }

  function project(i: number, title: string, description: string, tags: string[], dept: Dept, pType: string, year: number, gradient: string, authorId: string, daysAgo: number, classCode?: string): ProjData {
    const slides = makeSlides(title, dept, gradient, authorId === elena.id ? 'Elena Vasquez' : authorId === marcus.id ? 'Marcus Chen' : authorId === priya.id ? 'Priya Sharma' : authorId === james.id ? 'James Okafor' : authorId === sofia.id ? 'Sofia Rodriguez' : authorId === liam.id ? 'Liam Park' : authorId === aisha.id ? 'Aisha Williams' : 'Noah Thompson', description, year, pType)
    return {
      title, description, tags: JSON.stringify(tags), department: dept, projectType: pType, year, gradient,
      frameData: pos(i),
      // No imageUrl — frames show the gradient; slides are for the modal only
      slides: JSON.stringify(slides),
      authorId,
      createdAt: new Date(now - daysAgo * day),
      ...(classCode ? { classCode } : {}),
    }
  }

  const projects = await Promise.all([
    // 0 — Elena: Chromatic Landscapes
    prisma.project.create({ data: project(0, 'Chromatic Landscapes', 'An exploration of color theory through digital landscapes that blend impressionist brushwork with algorithmic generation. Each piece responds to real-time weather data from Hanover, NH — humidity shifts hue, barometric pressure drives saturation, temperature controls value.', ['art','algorithm','color','digital','generative'], 'Studio Art', 'Solo', 2024, 'linear-gradient(135deg, #134e5e 0%, #71b280 50%, #96fbc4 100%)', elena.id, 20) }),
    // 1 — Elena: Neon Nocturnes
    prisma.project.create({ data: project(1, 'Neon Nocturnes', 'A series of digital paintings capturing the atmospheric glow of late-night Hanover — neon signs, empty streets, and the particular loneliness of small college town nights. Made over six weeks of midnight walks.', ['painting','digital','night','urban','atmosphere'], 'Studio Art', 'Solo', 2025, 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', elena.id, 8) }),
    // 2 — Elena: Process / Progress
    prisma.project.create({ data: project(2, 'Process / Progress', 'Documentation of a year-long creative practice: sketches, failed experiments, breakthroughs, and the messy reality of making art at a research university. An honest portrait of the studio as a space of productive failure.', ['process','documentation','studio','practice'], 'Studio Art', 'Independent', 2024, 'linear-gradient(135deg, #f8961e 0%, #f9c74f 50%, #fff3b0 100%)', elena.id, 35) }),
    // 3 — Marcus: Harmonic
    prisma.project.create({ data: project(3, 'Harmonic', 'A web app that generates personalized ambient music using transformer models trained on the listener\'s listening history and real-time biometric data. The system adapts in real time — tempo follows heart rate, harmonic complexity mirrors focus level.', ['CS','ML','music','app','generative','biometrics'], 'Computer Science', 'Independent', 2024, 'linear-gradient(135deg, #4a0080 0%, #7b2d8b 30%, #c471f5 65%, #fa71cd 100%)', marcus.id, 15) }),
    // 4 — Marcus: CampusMap+
    prisma.project.create({ data: project(4, 'CampusMap+', 'An accessible indoor navigation system for Dartmouth\'s campus, including real-time updates for construction, accessibility closures, and crowding. Built with React Native and a custom pathfinding layer over OpenStreetMap.', ['CS','accessibility','maps','React','mobile'], 'Computer Science', 'Class Project', 2023, 'linear-gradient(135deg, #2b2d42 0%, #8d99ae 50%, #edf2f4 100%)', marcus.id, 45, 'ENGS 12') }),
    // 5 — Priya: River Monitor
    prisma.project.create({ data: project(5, 'River Monitor', 'Real-time visualization of Connecticut River watershed health metrics — pH, turbidity, dissolved oxygen, and flow rate — rendered as a living abstract painting that updates every hour from USGS sensor feeds.', ['environment','data','visualization','React','rivers'], 'Environmental Studies', 'Independent', 2024, 'linear-gradient(135deg, #05668d 0%, #028090 30%, #00b4d8 60%, #83c5be 100%)', priya.id, 12) }),
    // 6 — Priya: Thirty Years of Fire
    prisma.project.create({ data: project(6, 'Thirty Years of Fire', 'Satellite data analysis of wildfire expansion across the American West from 1990–2023, rendered as an animated time-series map. Data sourced from NASA FIRMS and USFS fire perimeter databases.', ['climate','data','GIS','visualization','wildfires'], 'Environmental Studies', 'Class Project', 2023, 'linear-gradient(135deg, #b5451b 0%, #e07b39 40%, #f6d365 100%)', priya.id, 40, 'ENVS 50') }),
    // 7 — Priya: Carbon Cartography
    prisma.project.create({ data: project(7, 'Carbon Cartography', 'Hand-drawn topographic maps overlaid with carbon emissions data — making the invisible geography of climate change tangible and beautiful. Each map pairs a physical landscape with its atmospheric footprint.', ['art','data','climate','cartography','maps','drawing'], 'Environmental Studies', 'Solo', 2025, 'linear-gradient(135deg, #1a472a 0%, #2d6a4f 40%, #52b788 100%)', priya.id, 5) }),
    // 8 — James: Sunflower Protocol
    prisma.project.create({ data: project(8, 'Sunflower Protocol', 'A bio-inspired solar tracking system using swarm robotics to mimic sunflower heliotropism. The hardware prototype doubles as a kinetic sculpture in the engineering quad, achieving 37% efficiency gain over static panels.', ['engineering','robotics','sustainability','bio-inspired','solar'], 'Engineering', 'Group', 2023, 'linear-gradient(135deg, #f6d365 0%, #fda085 50%, #f093fb 100%)', james.id, 50) }),
    // 9 — James: VertiFarm
    prisma.project.create({ data: project(9, 'VertiFarm', 'A low-cost vertical farming system designed for dorm rooms — modular, self-watering, and IoT-connected. Grows leafy greens under tuned LED spectra, monitored via a React Native app with push alerts for water and nutrient levels.', ['engineering','sustainability','IoT','hardware','food'], 'Engineering', 'Independent', 2024, 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 40%, #95d5b2 100%)', james.id, 18) }),
    // 10 — Sofia: Memory Palace
    prisma.project.create({ data: project(10, 'Memory Palace', 'An immersive performance piece where 30 audience members navigate a set constructed from photographs, sounds, and objects gathered from interviews with Dartmouth alumni spanning six decades. No two paths through the space are alike.', ['theater','immersive','memory','performance','archive'], 'Theater', 'Class Project', 2023, 'linear-gradient(140deg, #6d6875 0%, #b5838d 40%, #e5989b 70%, #ffcdb2 100%)', sofia.id, 55, 'THEA 73') }),
    // 11 — Sofia: Hanover Voices
    prisma.project.create({ data: project(11, 'Hanover Voices', 'A documentary portrait of Hanover — its workers, long-term residents, and students — exploring what community means in a town built around an institution. Screened at the Hopkins Center and the New Hampshire Film Festival.', ['film','documentary','community','ethnography','Hanover'], 'Film & Media Studies', 'Independent', 2024, 'linear-gradient(135deg, #780000 0%, #c1121f 35%, #e09f3e 65%, #fff3b0 100%)', sofia.id, 22) }),
    // 12 — Liam: Generative Soundscapes
    prisma.project.create({ data: project(12, 'Generative Soundscapes', 'A system that generates ambient soundscapes in real time, responding to weather data, time of day, and campus WiFi density as a proxy for human activity. Installed in Baker Library for one month.', ['music','CS','generative','ambient','installation'], 'Music', 'Independent', 2024, 'linear-gradient(135deg, #2b2d42 0%, #5c5f7a 50%, #8d99ae 100%)', liam.id, 25) }),
    // 13 — Liam: Algorithmic Composer
    prisma.project.create({ data: project(13, 'The Algorithmic Composer', 'Training a transformer model on 400 years of Western classical music to generate novel compositions that pass a double-blind listening test for musical coherence and emotional resonance.', ['CS','ML','music','AI','composition','transformer'], 'Computer Science', 'Independent', 2025, 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)', liam.id, 7) }),
    // 14 — Liam: Silence // Noise
    prisma.project.create({ data: project(14, 'Silence // Noise', 'A sound installation exploring the phenomenology of acoustic space. Using directional speakers and real-time audio processing, the piece creates shifting zones of silence and noise that visitors move through physically.', ['music','installation','sound art','philosophy','space'], 'Music', 'Solo', 2023, 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #434343 100%)', liam.id, 60) }),
    // 15 — Aisha: Pulse of Democracy
    prisma.project.create({ data: project(15, 'The Pulse of Democracy', 'Interactive visualization of U.S. voter participation data from 1960–2024, filterable by state, demographics, and election type. Designed to make patterns of disenfranchisement and engagement legible at a glance.', ['politics','data','visualization','democracy','voting','history'], 'Government', 'Independent', 2024, 'linear-gradient(135deg, #1d3557 0%, #457b9d 50%, #a8dadc 100%)', aisha.id, 30) }),
    // 16 — Aisha: Aid Mapping
    prisma.project.create({ data: project(16, 'Aid Mapping', 'Geospatial analysis of foreign aid distribution versus development outcomes across 80 countries from 2000–2022, revealing systematic patterns invisible in standard aggregate reporting.', ['government','data','GIS','development','policy','economics'], 'Government', 'Class Project', 2024, 'linear-gradient(135deg, #2c003e 0%, #5a189a 50%, #9d4edd 100%)', aisha.id, 28, 'GOV 83') }),
    // 17 — Noah: Bioluminescence Atlas
    prisma.project.create({ data: project(17, 'Bioluminescence Atlas', 'A photographic and scientific catalog of bioluminescent organisms found in New England coastal waters, with accompanying research on the molecular mechanisms behind light production and ecological function.', ['biology','photography','marine','research','bioluminescence','ocean'], 'Biology', 'Independent', 2024, 'linear-gradient(135deg, #03045e 0%, #0077b6 40%, #00b4d8 70%, #90e0ef 100%)', noah.id, 14) }),
    // 18 — Noah: Microbiome Portraits
    prisma.project.create({ data: project(18, 'Microbiome Portraits', 'Fluorescence microscopy images of gut microbiome samples rendered at print scale — making the invisible ecology within us visible and beautiful. Each print is 40×40 inches, paired with the donor\'s health data.', ['biology','microscopy','art','science','microbiome'], 'Biology', 'Class Project', 2023, 'linear-gradient(135deg, #4cc9f0 0%, #7209b7 50%, #f72585 100%)', noah.id, 48, 'BIOL 40') }),
    // 19 — Noah: Coral Chronicles
    prisma.project.create({ data: project(19, 'The Coral Chronicles', 'Five years of time-lapse photography documenting coral bleaching and recovery in Caribbean reef systems, combined with ocean temperature and acidification data. A collaboration with the Smithsonian Tropical Research Institute.', ['biology','environment','photography','climate','coral','ocean'], 'Biology', 'Independent', 2025, 'linear-gradient(135deg, #0a9396 0%, #94d2bd 40%, #e9d8a6 70%, #ee9b00 100%)', noah.id, 3) }),
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
  console.log('\nSeed user emails:')
  users.forEach(u => console.log(`  ${u.email}`))
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

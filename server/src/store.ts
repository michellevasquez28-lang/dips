import { v4 as uuidv4 } from 'uuid'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoredUser {
  id: string; name: string; email: string; password: string
}
export interface StoredProject {
  id: string; title: string; description: string; tags: string
  department: string; projectType: string; year: number
  imageUrl: string | null; pdfUrl: string | null; classCode: string | null
  gradient: string; frameData: string; authorId: string; createdAt: Date
}
export interface StoredComment {
  id: string; text: string; authorId: string; projectId: string; createdAt: Date
}
export interface StoredLike {
  id: string; userId: string; projectId: string
}
export interface StoredMessage {
  id: string; subject: string; body: string; fromId: string; toId: string; createdAt: Date
}

// ─── Seed users ───────────────────────────────────────────────────────────────

const U = (i: number) => `seed-user-${i}`

const SEED_USERS: StoredUser[] = [
  { id: U(0),  name: 'Elena Vasquez',     email: 'evasquez@dartmouth.edu',   password: '' },
  { id: U(1),  name: 'Maya Johnson',      email: 'mjohnson@dartmouth.edu',   password: '' },
  { id: U(2),  name: 'Sam Okonkwo',       email: 'sokonkwo@dartmouth.edu',   password: '' },
  { id: U(3),  name: 'Leo Huang',         email: 'lhuang@dartmouth.edu',     password: '' },
  { id: U(4),  name: 'Nora McCarthy',     email: 'nmccarthy@dartmouth.edu',  password: '' },
  { id: U(5),  name: 'Isabelle Fontaine', email: 'ifontaine@dartmouth.edu',  password: '' },
  { id: U(6),  name: 'Kai Anderson',      email: 'kanderson@dartmouth.edu',  password: '' },
  { id: U(7),  name: 'Vincent Osei',      email: 'vosei@dartmouth.edu',      password: '' },
  { id: U(8),  name: 'Zara Williams',     email: 'zwilliams@dartmouth.edu',  password: '' },
  { id: U(9),  name: 'Chen Wei',          email: 'cwei@dartmouth.edu',       password: '' },
  { id: U(10), name: 'Amara Diop',        email: 'adiop@dartmouth.edu',      password: '' },
  { id: U(11), name: 'Oliver Crane',      email: 'ocrane@dartmouth.edu',     password: '' },
]

// ─── Seed projects ────────────────────────────────────────────────────────────

const P = (i: number) => `seed-proj-${i}`

interface SeedDef {
  title: string; description: string; tags: string; department: string
  projectType: string; year: number; gradient: string; frameData: string
  authorIndex: number
  comments: { text: string; authorIndex: number }[]
  likes: number[]
}

const SEED_DEFS: SeedDef[] = [
  {
    title: 'Chromatic Landscapes',
    description: 'An exploration of color theory through digital landscapes that blend impressionist brushwork with algorithmic generation. Each piece responds to real-time weather data from Hanover, NH.',
    tags: JSON.stringify(['art', 'design', 'algorithm', 'color']),
    department: 'Studio Art', projectType: 'Solo', year: 2024,
    gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 50%, #96fbc4 100%)',
    frameData: JSON.stringify({ x: 80,   y: 80,   rotation: 2,  frameIndex: 12, bobDelay: 0 }),
    authorIndex: 0,
    comments: [
      { text: 'The way color responds to weather data is stunning — really poetic!', authorIndex: 1 },
      { text: 'Love the impressionist influence. How did you map the weather variables to hue?', authorIndex: 3 },
    ],
    likes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  },
  {
    title: 'Portrait Series: Identity',
    description: 'A series of portraits exploring the intersection of cultural heritage and modern identity. Each subject was photographed with heirlooms from their ancestral homeland woven into contemporary clothing.',
    tags: JSON.stringify(['photography', 'identity', 'portrait', 'culture']),
    department: 'Studio Art', projectType: 'Solo', year: 2024,
    gradient: 'linear-gradient(160deg, #780000 0%, #c1121f 35%, #e09f3e 65%, #fff3b0 100%)',
    frameData: JSON.stringify({ x: 80,   y: 580,  rotation: -3, frameIndex: 4,  bobDelay: 0.8 }),
    authorIndex: 1,
    comments: [
      { text: 'Such a powerful concept. The textile contrasts are breathtaking.', authorIndex: 2 },
      { text: 'Would love to collaborate on a follow-up series!', authorIndex: 4 },
      { text: 'Really moved by this. Are these available as prints?', authorIndex: 5 },
    ],
    likes: [0, 2, 3, 5, 6, 7, 8, 9, 10],
  },
  {
    title: 'Coastal Morphology',
    description: 'Satellite imagery analysis of 40 years of New England coastline erosion, visualized as a series of overlapping topographic paintings. Data poetry meets earth science.',
    tags: JSON.stringify(['environment', 'data', 'visualization', 'climate']),
    department: 'Environmental Science', projectType: 'Class Project', year: 2023,
    gradient: 'linear-gradient(150deg, #023e8a 0%, #0077b6 30%, #00b4d8 60%, #90e0ef 100%)',
    frameData: JSON.stringify({ x: 700,  y: 60,   rotation: -2, frameIndex: 7,  bobDelay: 1.5 }),
    authorIndex: 2,
    comments: [
      { text: 'The 40-year composite is haunting. Which datasets did you use?', authorIndex: 0 },
      { text: 'Incredible overlap between science and visual art here.', authorIndex: 6 },
    ],
    likes: [0, 1, 3, 4, 6, 7, 8, 11],
  },
  {
    title: 'Machine Listening',
    description: 'A neural network trained on 10,000 hours of ambient sound generates visual "scores" — synesthetic paintings that render sound as form. Shown as an interactive installation.',
    tags: JSON.stringify(['CS', 'ML', 'music', 'installation', 'AI']),
    department: 'Computer Science', projectType: 'Independent', year: 2024,
    gradient: 'linear-gradient(135deg, #4a0080 0%, #7b2d8b 30%, #c471f5 65%, #fa71cd 100%)',
    frameData: JSON.stringify({ x: 510,  y: 570,  rotation: 4,  frameIndex: 11, bobDelay: 2.1 }),
    authorIndex: 3,
    comments: [
      { text: 'The synesthetic output is genuinely surprising every time!', authorIndex: 7 },
      { text: 'What architecture did you use for the generative model?', authorIndex: 8 },
    ],
    likes: [0, 1, 2, 4, 5, 7, 8, 9, 10, 11],
  },
  {
    title: 'Still Life: Silicon Valley',
    description: 'Oil paintings in the Dutch Golden Age tradition, but depicting circuit boards, USB cables, and cracked phone screens arranged with the same care as 17th-century fruit and flowers.',
    tags: JSON.stringify(['painting', 'oil', 'technology', 'still life']),
    department: 'Studio Art', projectType: 'Solo', year: 2023,
    gradient: 'linear-gradient(130deg, #f8961e 0%, #f9c74f 40%, #90be6d 70%, #43aa8b 100%)',
    frameData: JSON.stringify({ x: 960,  y: 590,  rotation: -2, frameIndex: 9,  bobDelay: 0.4 }),
    authorIndex: 4,
    comments: [
      { text: 'The cracked iPhone as a still life object is genius. So Vanitas.', authorIndex: 9 },
      { text: 'I keep staring at the USB cable painting. The light is unreal.', authorIndex: 0 },
      { text: 'This would look incredible at the Hood Museum.', authorIndex: 6 },
    ],
    likes: [0, 1, 2, 3, 6, 7, 9, 10, 11],
  },
  {
    title: 'The Girl with the Algorithm',
    description: 'A novel-length piece of autofiction about a CS student who builds an AI trained on her own memories. Written in alternating chapters: prose and Python. Shortlisted for the Rolfe Prize.',
    tags: JSON.stringify(['writing', 'AI', 'fiction', 'autofiction', 'CS']),
    department: 'Computer Science', projectType: 'Independent', year: 2024,
    gradient: 'linear-gradient(135deg, #2b2d42 0%, #8d99ae 50%, #edf2f4 100%)',
    frameData: JSON.stringify({ x: 1220, y: 75,   rotation: 3,  frameIndex: 3,  bobDelay: 3.2 }),
    authorIndex: 5,
    comments: [
      { text: 'Read it in one sitting. The Python chapters made me cry.', authorIndex: 1 },
      { text: 'Best piece of speculative fiction from an undergrad in years.', authorIndex: 10 },
    ],
    likes: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11],
  },
  {
    title: 'Sunflower Protocol',
    description: 'Bio-inspired solar tracking system using swarm robotics to mimic sunflower heliotropism. The hardware prototype doubles as a kinetic sculpture in the engineering quad.',
    tags: JSON.stringify(['engineering', 'robotics', 'sustainability', 'bio-inspired']),
    department: 'Engineering', projectType: 'Group', year: 2023,
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 50%, #f093fb 100%)',
    frameData: JSON.stringify({ x: 1700, y: 55,   rotation: -1, frameIndex: 17, bobDelay: 3.0 }),
    authorIndex: 6,
    comments: [
      { text: '37% efficiency gain vs static panels — remarkable for a class project!', authorIndex: 3 },
      { text: 'The swarm behavior is so elegant. Can I get the firmware code?', authorIndex: 4 },
    ],
    likes: [0, 1, 2, 3, 4, 5, 7, 9],
  },
  {
    title: 'Night Sketches',
    description: 'Charcoal and oil studies made exclusively between midnight and 4am for a year. The work traces insomnia, solitude, and the particular quality of artificial light before dawn.',
    tags: JSON.stringify(['charcoal', 'oil', 'expressionism', 'portrait']),
    department: 'Studio Art', projectType: 'Solo', year: 2022,
    gradient: 'linear-gradient(150deg, #1a0050 0%, #3d0066 25%, #8b1a1a 55%, #c0392b 75%, #f39c12 100%)',
    frameData: JSON.stringify({ x: 1480, y: 555,  rotation: 5,  frameIndex: 6,  bobDelay: 2.5 }),
    authorIndex: 7,
    comments: [
      { text: 'The 3am self-portrait series hit me hard. The lighting is extraordinary.', authorIndex: 1 },
    ],
    likes: [0, 1, 2, 3, 5, 6, 9, 10, 11],
  },
  {
    title: 'Watershed',
    description: 'Real-time data visualization of Connecticut River watershed health metrics — pH, turbidity, flow rate — rendered as a living abstract painting that updates every hour.',
    tags: JSON.stringify(['CS', 'data', 'visualization', 'environment', 'React']),
    department: 'Computer Science', projectType: 'Independent', year: 2024,
    gradient: 'linear-gradient(135deg, #05668d 0%, #028090 30%, #00b4d8 60%, #83c5be 100%)',
    frameData: JSON.stringify({ x: 80,   y: 1080, rotation: -5, frameIndex: 15, bobDelay: 1.8 }),
    authorIndex: 8,
    comments: [
      { text: 'The turbidity → opacity mapping is so intuitive. Open source?', authorIndex: 5 },
      { text: 'Would be perfect as a lobby installation at the environmental lab.', authorIndex: 2 },
    ],
    likes: [0, 1, 3, 4, 6, 7, 9, 10, 11],
  },
  {
    title: 'Memory Palace',
    description: 'An immersive performance piece where 30 audience members navigate a set constructed from photographs, sounds, and objects gathered from interviews with Dartmouth alumni spanning 60 years.',
    tags: JSON.stringify(['theater', 'immersive', 'memory', 'performance', 'archive']),
    department: 'Theater', projectType: 'Class Project', year: 2023,
    gradient: 'linear-gradient(140deg, #6d6875 0%, #b5838d 40%, #e5989b 70%, #ffcdb2 100%)',
    frameData: JSON.stringify({ x: 1970, y: 570,  rotation: 0,  frameIndex: 8,  bobDelay: 0.6 }),
    authorIndex: 9,
    comments: [
      { text: 'I participated in the performance and it was unforgettable.', authorIndex: 6 },
      { text: 'The 1970s dorm room reconstruction was incredibly detailed.', authorIndex: 11 },
      { text: 'Brilliant use of found archive materials. How did you obtain them?', authorIndex: 7 },
    ],
    likes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11],
  },
  {
    title: 'Lacuna',
    description: 'Textile works that visualize the gaps in historical records — using negative space and deliberately unfinished weaving to represent stories that were never written down.',
    tags: JSON.stringify(['textile', 'weaving', 'history', 'identity', 'fiber arts']),
    department: 'Studio Art', projectType: 'Solo', year: 2022,
    gradient: 'linear-gradient(130deg, #800020 0%, #a0522d 30%, #cd853f 60%, #f5deb3 100%)',
    frameData: JSON.stringify({ x: 560,  y: 1070, rotation: 3,  frameIndex: 16, bobDelay: 2.8 }),
    authorIndex: 10,
    comments: [
      { text: 'The unfinished edges as intentional statement — so powerful.', authorIndex: 0 },
    ],
    likes: [0, 1, 2, 4, 5, 7, 8, 9],
  },
  {
    title: 'Between Harbors',
    description: 'Watercolor seascapes painted en plein air along the New England coast, each one recording the light conditions at a specific harbor at a specific hour — a year-long log of departure and return.',
    tags: JSON.stringify(['watercolor', 'landscape', 'plein air', 'maritime']),
    department: 'Studio Art', projectType: 'Solo', year: 2024,
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2e86ab 35%, #a4def9 65%, #e8f4f8 100%)',
    frameData: JSON.stringify({ x: 1030, y: 1090, rotation: -3, frameIndex: 14, bobDelay: 1.1 }),
    authorIndex: 11,
    comments: [
      { text: 'The 5am Gloucester painting is my favorite. Just luminous.', authorIndex: 8 },
      { text: 'Are these for sale? The light in the Rockport series is incredible.', authorIndex: 9 },
    ],
    likes: [0, 1, 2, 3, 4, 5, 6, 7, 9, 10],
  },
]

// ─── Build initial collections ────────────────────────────────────────────────

export const users: StoredUser[] = [...SEED_USERS]

export const projects: StoredProject[] = SEED_DEFS.map((def, i) => ({
  id: P(i),
  title: def.title,
  description: def.description,
  tags: def.tags,
  department: def.department,
  projectType: def.projectType,
  year: def.year,
  imageUrl: null,
  pdfUrl: null,
  classCode: null,
  gradient: def.gradient,
  frameData: def.frameData,
  authorId: U(def.authorIndex),
  createdAt: new Date(Date.now() - (12 - i) * 86_400_000),
}))

export const comments: StoredComment[] = SEED_DEFS.flatMap((def, pi) =>
  def.comments.map((c) => ({
    id: uuidv4(),
    text: c.text,
    authorId: U(c.authorIndex),
    projectId: P(pi),
    createdAt: new Date(Date.now() - Math.random() * 30 * 86_400_000),
  }))
)

export const likes: StoredLike[] = SEED_DEFS.flatMap((def, pi) =>
  def.likes.map((ui) => ({ id: uuidv4(), userId: U(ui), projectId: P(pi) }))
)

export const messages: StoredMessage[] = []

// ─── Helper: find user by id or email ────────────────────────────────────────

export function findUserById(id: string): StoredUser | undefined {
  return users.find((u) => u.id === id)
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return users.find((u) => u.email === email)
}

export function createUser(name: string, email: string): StoredUser {
  const user: StoredUser = { id: uuidv4(), name, email, password: '' }
  users.push(user)
  return user
}

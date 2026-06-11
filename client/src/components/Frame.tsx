import React from 'react'
import { Project } from '../types'

// Natural pixel dimensions of each cropped frame PNG + its interior opening bounds
// { w, h, ox, oy, ow, oh } — ox/oy = opening top-left offset, ow/oh = opening size
export const FRAME_DATA: Record<number, { w: number; h: number; ox: number; oy: number; ow: number; oh: number }> = {
  1:  { w:174, h:207, ox:38,  oy:38,  ow:98,  oh:130 },
  2:  { w:190, h:155, ox:39,  oy:38,  ow:110, oh:79  },
  3:  { w:171, h:196, ox:37,  oy:38,  ow:96,  oh:120 },
  4:  { w:150, h:179, ox:36,  oy:32,  ow:78,  oh:114 },
  5:  { w:160, h:201, ox:15,  oy:21,  ow:107, oh:158 },
  6:  { w:209, h:219, ox:46,  oy:46,  ow:117, oh:128 },
  7:  { w:150, h:199, ox:18,  oy:32,  ow:114, oh:139 },
  8:  { w:164, h:182, ox:38,  oy:36,  ow:88,  oh:108 },
  9:  { w:204, h:151, ox:37,  oy:37,  ow:129, oh:76  },
  10: { w:122, h:185, ox:28,  oy:22,  ow:67,  oh:144 },
  11: { w:158, h:188, ox:28,  oy:28,  ow:102, oh:132 },
  12: { w:224, h:170, ox:33,  oy:32,  ow:158, oh:106 },
  13: { w:170, h:173, ox:39,  oy:39,  ow:91,  oh:93  },
  14: { w:191, h:150, ox:43,  oy:39,  ow:105, oh:71  },
  15: { w:180, h:142, ox:32,  oy:33,  ow:116, oh:76  },
  16: { w:178, h:216, ox:41,  oy:39,  ow:95,  oh:137 },
  17: { w:235, h:162, ox:39,  oy:37,  ow:157, oh:87  },
  18: { w:214, h:198, ox:49,  oy:46,  ow:116, oh:111 },
}

// Display scale per frame index — controls how large each frame appears on canvas
export const FRAME_SCALE: Record<number, number> = {
  4: 2.0, 6: 1.9, 7: 2.1, 8: 1.9, 9: 1.9,
  11: 2.1, 12: 2.2, 14: 2.0, 15: 1.9, 16: 2.1, 17: 2.2, 18: 2.0,
}

interface FrameContentProps {
  frameIndex: number
  gradient: string
  imageUrl?: string
  title: string
}

const FrameContent: React.FC<FrameContentProps> = ({ frameIndex, gradient, imageUrl, title }) => {
  const fd = FRAME_DATA[frameIndex]
  if (!fd) return null
  const scale = FRAME_SCALE[frameIndex] ?? 2.0
  const W = Math.round(fd.w * scale)
  const H = Math.round(fd.h * scale)

  const ox = Math.round(fd.ox * scale)
  const oy = Math.round(fd.oy * scale)
  const ow = Math.round(fd.ow * scale)
  const oh = Math.round(fd.oh * scale)

  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      {/* Artwork — positioned and sized to fill exactly the frame opening */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          WebkitMaskImage: `url(/frames/frame-${frameIndex}-mask.png)`,
          maskImage: `url(/frames/frame-${frameIndex}-mask.png)`,
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: ox,
            top: oy,
            width: ow,
            height: oh,
          }}
        >
          {imageUrl ? (
            <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%', background: gradient }} />
          )}
        </div>
      </div>

      {/* Actual frame PNG — gold border with transparent interior */}
      <img
        src={`/frames/frame-${frameIndex}.png`}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </div>
  )
}

interface FrameProps {
  project: Project
  onClick: () => void
  isFiltered: boolean
  isAnyFilterActive: boolean
}

const Frame: React.FC<FrameProps> = ({ project, onClick, isFiltered, isAnyFilterActive }) => {
  const { x, y, rotation, frameIndex, bobDelay } = project.frameData

  const opacity = isAnyFilterActive ? (isFiltered ? 1 : 0.15) : 1
  const glowFilter = isAnyFilterActive && isFiltered
    ? 'drop-shadow(0 0 18px rgba(255,215,0,0.7))'
    : undefined

  return (
    <div
      data-frame="true"
      onClick={onClick}
      role="button"
      aria-label={`Open project: ${project.title} by ${project.author}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="frame-float group"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `rotate(${rotation}deg)`,
        cursor: 'pointer',
        opacity,
        transition: 'opacity 0.4s ease, filter 0.3s ease',
        willChange: 'transform',
        animationDelay: `${bobDelay}s`,
        filter: glowFilter,
      }}
    >
      <div
        className="frame-hover-scale"
        style={{
          transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'inline-block',
        }}
      >
        <FrameContent
          frameIndex={frameIndex}
          gradient={project.gradient}
          imageUrl={project.imageUrl}
          title={project.title}
        />

        {/* Hover label */}
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                     bg-forest text-white text-xs px-3 py-1.5 rounded-full
                     whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100
                     pointer-events-none transition-opacity duration-200"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
        >
          <span className="font-semibold">{project.title}</span>
          <span className="text-white/70 ml-1">— {project.author}</span>
        </div>
      </div>
    </div>
  )
}

export default Frame

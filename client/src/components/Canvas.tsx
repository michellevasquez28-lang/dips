import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import Frame from './Frame'
import { Project } from '../types'
import { useCanvasControls } from '../hooks/useCanvasControls'

interface CanvasProps {
  projects: Project[]
  onFrameClick: (project: Project) => void
  isFiltered: (project: Project) => boolean
  hasActiveFilters: boolean
}

export interface CanvasHandle {
  zoomIn: () => void
  zoomOut: () => void
  resetView: () => void
}

const Canvas = forwardRef<CanvasHandle, CanvasProps>(({
  projects,
  onFrameClick,
  isFiltered,
  hasActiveFilters,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { transform, handleMouseDown, handleMouseMove, handleMouseUp, isDragging, zoomIn, zoomOut, resetView } =
    useCanvasControls(containerRef)

  useImperativeHandle(ref, () => ({ zoomIn, zoomOut, resetView }), [zoomIn, zoomOut, resetView])

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden relative bg-white select-none"
      style={{
        cursor: isDragging.current ? 'grabbing' : 'grab',
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      aria-label="Project gallery canvas — drag to pan, scroll to zoom"
    >
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
          position: 'absolute',
          width: 3300,
          height: 2300,
          willChange: 'transform',
        }}
      >
        {projects.map((project) => (
          <Frame
            key={project.id}
            project={project}
            onClick={() => onFrameClick(project)}
            isFiltered={isFiltered(project)}
            isAnyFilterActive={hasActiveFilters}
          />
        ))}
      </div>
    </div>
  )
})

Canvas.displayName = 'Canvas'
export default Canvas

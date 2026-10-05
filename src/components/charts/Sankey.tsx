import React, { useMemo, useState } from 'react';
import {
  sankey as d3Sankey,
  sankeyLinkHorizontal,
} from 'd3-sankey';

export interface SankeyNodeData {
  id: string;
  name: string;
  color?: string;
}

export interface SankeyLinkData {
  source: string | number;
  target: string | number;
  value: number;
  color?: string;
}

export interface SankeyProps {
  title: string;
  soWhat: string;
  xAxisLabel: string;
  yAxisLabel: string;
  nodes: SankeyNodeData[];
  links: SankeyLinkData[];
  height?: number;
  width?: number;
  className?: string;
  onLinkClick?: (link: SankeyLinkData) => void;
  onNodeClick?: (node: SankeyNodeData) => void;
}

interface CustomNode extends SankeyNodeData {
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  value?: number;
}

interface CustomLink {
  source: CustomNode;
  target: CustomNode;
  value: number;
  width?: number;
  y0?: number;
  y1?: number;
  color?: string;
}

export const Sankey: React.FC<SankeyProps> = ({
  title,
  soWhat,
  xAxisLabel,
  yAxisLabel,
  nodes,
  links,
  height = 340,
  className = '',
  onLinkClick,
  onNodeClick,
}) => {
  const [hoveredLink, setHoveredLink] = useState<{
    link: CustomLink;
    x: number;
    y: number;
  } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{
    node: CustomNode;
    x: number;
    y: number;
  } | null>(null);

  // Fallback palette for segments A-E and generic nodes
  const defaultColors: Record<string, string> = {
    'Segment A': '#0E7C86',
    'Segment B': '#5B6ABF',
    'Segment C': '#E9B44C',
    'Segment D': '#B0603C',
    'Segment E': '#5C7080',
    'A': '#0E7C86',
    'B': '#5B6ABF',
    'C': '#E9B44C',
    'D': '#B0603C',
    'E': '#5C7080',
  };

  const margin = { top: 20, right: 90, bottom: 20, left: 90 };
  const containerWidth = 720; // SVG viewBox coordinate system
  const innerWidth = containerWidth - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const { layoutNodes, layoutLinks } = useMemo(() => {
    if (!nodes.length || !links.length) {
      return { layoutNodes: [], layoutLinks: [] };
    }

    // Map node IDs to indices for d3-sankey
    const nodeMap = new Map<string, number>();
    nodes.forEach((n, idx) => nodeMap.set(n.id, idx));

    const clonedNodes: CustomNode[] = nodes.map((d) => ({
      id: d.id,
      name: d.name,
      color: d.color || defaultColors[d.name] || defaultColors[d.id] || '#0E7C86',
    }));

    const clonedLinks: Array<{ source: number; target: number; value: number; color?: string }> = [];
    for (const l of links) {
      const sourceIdx = typeof l.source === 'string' ? nodeMap.get(l.source) : l.source;
      const targetIdx = typeof l.target === 'string' ? nodeMap.get(l.target) : l.target;

      if (sourceIdx !== undefined && targetIdx !== undefined) {
        clonedLinks.push({
          source: sourceIdx,
          target: targetIdx,
          value: l.value,
          color: l.color,
        });
      }
    }

    try {
      const sankeyGenerator = d3Sankey<any, any>()
        .nodeWidth(16)
        .nodePadding(18)
        .extent([
          [0, 0],
          [innerWidth, innerHeight],
        ]);

      const graph = sankeyGenerator({
        nodes: clonedNodes as any,
        links: clonedLinks as any,
      });

      return {
        layoutNodes: graph.nodes as CustomNode[],
        layoutLinks: graph.links as unknown as CustomLink[],
      };
    } catch (e) {
      console.error('Error generating Sankey layout:', e);
      return { layoutNodes: [], layoutLinks: [] };
    }
  }, [nodes, links, innerWidth, innerHeight]);

  const pathGenerator = sankeyLinkHorizontal<any, any>();

  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-4 flex flex-col shadow-2xs ${className}`}>
      {/* Header */}
      <div className="mb-2">
        <h3 className="text-section-title text-navy-900 leading-snug">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5 font-normal italic">{soWhat}</p>
      </div>

      {/* Axis Information Banner */}
      <div className="flex items-center justify-between text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
        <span>Y: {yAxisLabel}</span>
        <span>Flow: {xAxisLabel}</span>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto" onMouseLeave={() => { setHoveredLink(null); setHoveredNode(null); }}>
        <svg
          viewBox={`0 0 ${containerWidth} ${height}`}
          className="w-full h-auto select-none"
          style={{ minHeight: height }}
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Links */}
            <g className="fill-none">
              {layoutLinks.map((link, idx) => {
                const sourceNode = link.source as CustomNode;
                const targetNode = link.target as CustomNode;
                const d = pathGenerator(link);
                if (!d) return null;

                const linkColor =
                  link.color || sourceNode.color || '#CFE0EA';

                const isHovered = hoveredLink?.link === link;

                return (
                  <path
                    key={`link-${idx}`}
                    d={d}
                    stroke={linkColor}
                    strokeWidth={Math.max(1, link.width || 1)}
                    strokeOpacity={isHovered ? 0.75 : 0.35}
                    className="transition-all duration-150 cursor-pointer hover:stroke-opacity-75"
                    onClick={() => {
                      onLinkClick?.({
                        source: sourceNode.id,
                        target: targetNode.id,
                        value: link.value,
                        color: linkColor,
                      });
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredLink({
                        link,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                      setHoveredNode(null);
                    }}
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g>
              {layoutNodes.map((node, idx) => {
                const x0 = node.x0 || 0;
                const x1 = node.x1 || 0;
                const y0 = node.y0 || 0;
                const y1 = node.y1 || 0;
                const nodeWidth = x1 - x0;
                const nodeHeight = Math.max(y1 - y0, 2);

                const isLeft = x0 < innerWidth / 2;

                return (
                  <g
                    key={`node-${node.id || idx}`}
                    className="cursor-pointer group"
                    onClick={() => onNodeClick?.(node)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredNode({
                        node,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                      setHoveredLink(null);
                    }}
                  >
                    <rect
                      x={x0}
                      y={y0}
                      width={nodeWidth}
                      height={nodeHeight}
                      fill={node.color || '#0E7C86'}
                      rx={2}
                      className="transition-all duration-150 group-hover:brightness-90"
                    />
                    <text
                      x={isLeft ? x0 - 8 : x1 + 8}
                      y={(y0 + y1) / 2}
                      dy="0.35em"
                      textAnchor={isLeft ? 'end' : 'start'}
                      className="text-2xs font-semibold fill-navy-900 group-hover:fill-teal-700 pointer-events-none"
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* Floating Tooltips */}
        {hoveredLink && (
          <div
            className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-navy-900 text-white text-xs rounded-md py-1.5 px-2.5 shadow-lg border border-navy-700 max-w-xs"
            style={{ left: hoveredLink.x, top: hoveredLink.y - 6 }}
          >
            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
              <span>{(hoveredLink.link.source as CustomNode).name}</span>
              <span className="text-slate-400">→</span>
              <span>{(hoveredLink.link.target as CustomNode).name}</span>
            </div>
            <div className="text-teal-300 font-mono mt-0.5 font-bold">
              {hoveredLink.link.value.toLocaleString()} HCPs
            </div>
          </div>
        )}

        {hoveredNode && (
          <div
            className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-navy-900 text-white text-xs rounded-md py-1.5 px-2.5 shadow-lg border border-navy-700 max-w-xs"
            style={{ left: hoveredNode.x, top: hoveredNode.y - 6 }}
          >
            <div className="font-semibold text-slate-100">{hoveredNode.node.name}</div>
            <div className="text-teal-300 font-mono mt-0.5">
              Total Volume: {(hoveredNode.node.value || 0).toLocaleString()} HCPs
            </div>
          </div>
        )}
      </div>

      {/* Axis Footer */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
        <div>
          <span className="font-medium text-slate-600">Volume (Y):</span> {yAxisLabel}
        </div>
        <div>
          <span className="font-medium text-slate-600">Migration Axis (X):</span> {xAxisLabel}
        </div>
      </div>
    </div>
  );
};

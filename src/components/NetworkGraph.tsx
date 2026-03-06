import * as d3 from "d3";
import { useEffect, useRef } from "react";
import type { Character, Faction, Relationship } from "../types";

interface NetworkGraphProps {
  characters: Character[];
  factions: Faction[];
  onOpenCharacter: (id: string) => void;
  relationships: Relationship[];
}

interface NodeDatum extends d3.SimulationNodeDatum {
  color: string;
  faction: string;
  id: string;
  name: string;
  threatLevel: number;
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  label: string;
  type: "ally" | "enemy" | "neutral";
}

function resolveId(n: NodeDatum | string): string {
  return typeof n === "string" ? n : n.id;
}

export default function NetworkGraph({
  characters,
  relationships,
  factions,
  onOpenCharacter,
}: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!(svg && container)) {
      return;
    }

    let initialized = false;
    let simulation: d3.Simulation<NodeDatum, LinkDatum> | null = null;

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width <= 0 || height <= 0) {
        return;
      }

      if (initialized && simulation) {
        d3.select(svg).attr("width", width).attr("height", height);
        simulation.force("center", d3.forceCenter(width / 2, height / 2));
        simulation.alpha(0.3).restart();
        return;
      }
      initialized = true;

      // Read design tokens from CSS
      const styles = getComputedStyle(document.documentElement);
      const tokenAmber =
        styles.getPropertyValue("--color-terminal-amber").trim() || "#ffb000";
      const tokenDanger =
        styles.getPropertyValue("--color-status-danger").trim() || "#ff4444";
      const tokenNeutral =
        styles.getPropertyValue("--color-status-neutral").trim() || "#888888";

      // Build faction color map
      const factionColorMap: Record<string, string> = {};
      factions.forEach((f) => {
        factionColorMap[f.id] = f.color;
        factionColorMap[f.name] = f.color;
      });

      // Build nodes
      const nodes: NodeDatum[] = characters.map((c) => ({
        id: c.id,
        name: c.name,
        faction: c.faction,
        threatLevel: c.threatLevel,
        color: factionColorMap[c.faction] || tokenAmber,
      }));

      const nodeIds = new Set(nodes.map((n) => n.id));

      // Build links from explicit relationships
      const links: LinkDatum[] = relationships
        .filter((r) => nodeIds.has(r.from) && nodeIds.has(r.to))
        .map((r) => ({
          source: r.from,
          target: r.to,
          type: r.type,
          label: r.label,
        }));

      // Auto-generate intra-faction links (skip civilian — too many members)
      const linkSet = new Set(
        links.map((l) => {
          const s = resolveId(l.source as NodeDatum | string);
          const t = resolveId(l.target as NodeDatum | string);
          return s < t ? `${s}|${t}` : `${t}|${s}`;
        })
      );
      factions.forEach((f) => {
        if (f.id === "civilian" || f.members.length === 0) {
          return;
        }
        const members = f.members.filter((m) => nodeIds.has(m));
        for (let i = 0; i < members.length; i++) {
          for (let j = i + 1; j < members.length; j++) {
            const key =
              members[i] < members[j]
                ? `${members[i]}|${members[j]}`
                : `${members[j]}|${members[i]}`;
            if (!linkSet.has(key)) {
              linkSet.add(key);
              links.push({
                source: members[i],
                target: members[j],
                type: "ally",
                label: f.name,
              });
            }
          }
        }
      });

      // Pre-compute adjacency map for O(1) neighbor lookup in mouseover
      const adjacency = new Map<string, Set<string>>();
      nodes.forEach((n) => adjacency.set(n.id, new Set()));
      links.forEach((l) => {
        const s = l.source as string;
        const t = l.target as string;
        adjacency.get(s)?.add(t);
        adjacency.get(t)?.add(s);
      });

      // Clear previous
      d3.select(svg).selectAll("*").remove();

      const svgSel = d3
        .select(svg)
        .attr("width", width)
        .attr("height", height)
        .style("background", "var(--color-terminal-bg, #0a0a0a)");

      // Arrow markers
      svgSel
        .append("defs")
        .selectAll("marker")
        .data(["ally", "enemy", "neutral"])
        .join("marker")
        .attr("id", (d) => `arrow-${d}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", (d) => {
          if (d === "ally") {
            return tokenAmber;
          }
          if (d === "enemy") {
            return tokenDanger;
          }
          return tokenNeutral;
        });

      const g = svgSel.append("g");

      // Zoom
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });
      svgSel.call(zoom);

      // Simulation
      simulation = d3
        .forceSimulation<NodeDatum>(nodes)
        .force(
          "link",
          d3
            .forceLink<NodeDatum, LinkDatum>(links)
            .id((d) => d.id)
            .distance(100)
        )
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(30));

      // Links
      const link = g
        .append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", (d) => {
          if (d.type === "ally") {
            return tokenAmber;
          }
          if (d.type === "enemy") {
            return tokenDanger;
          }
          return tokenNeutral;
        })
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1)
        .attr("marker-end", (d) => `url(#arrow-${d.type})`);

      // Nodes
      const node = g
        .append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", (d) => 4 + d.threatLevel * 1.5)
        .attr("fill", (d) => d.color)
        .attr("stroke", (d) => d.color)
        .attr("stroke-width", 1.5)
        .attr("fill-opacity", 0.3)
        .attr("cursor", "pointer")
        .on("click", (_event, d) => {
          onOpenCharacter(d.id);
        })
        .on("mouseover", (_event, d) => {
          // Highlight connected — O(degree) via adjacency map
          const neighbors = adjacency.get(d.id) ?? new Set<string>();
          const connected = new Set([d.id, ...neighbors]);
          node.attr("opacity", (n) => (connected.has(n.id) ? 1 : 0.15));
          label.attr("opacity", (n) => (connected.has(n.id) ? 1 : 0.1));
          link.attr("stroke-opacity", (l) => {
            const s = resolveId(l.source as NodeDatum | string);
            const t = resolveId(l.target as NodeDatum | string);
            return s === d.id || t === d.id ? 0.8 : 0.05;
          });
        })
        .on("mouseout", () => {
          node.attr("opacity", 1);
          label.attr("opacity", 0.8);
          link.attr("stroke-opacity", 0.4);
        });

      // Drag
      const drag = d3
        .drag<SVGCircleElement, NodeDatum>()
        .on("start", (event, d) => {
          if (!event.active) {
            simulation?.alphaTarget(0.3).restart();
          }
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) {
            simulation?.alphaTarget(0);
          }
          d.fx = null;
          d.fy = null;
        });

      node.call(drag);

      // Labels
      const label = g
        .append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .text((d) => d.name)
        .attr("font-size", "9px")
        .attr("font-family", "monospace")
        .attr("fill", tokenAmber)
        .attr("opacity", 0.8)
        .attr("text-anchor", "middle")
        .attr("dy", (d) => -(8 + d.threatLevel * 1.5))
        .attr("pointer-events", "none");

      // Tick — D3 force simulation guarantees x/y are set after first tick
      simulation.on("tick", () => {
        link
          .attr("x1", (d) => (d.source as NodeDatum).x!)
          .attr("y1", (d) => (d.source as NodeDatum).y!)
          .attr("x2", (d) => (d.target as NodeDatum).x!)
          .attr("y2", (d) => (d.target as NodeDatum).y!);

        node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        label.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
      });
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      simulation?.stop();
    };
  }, [characters, relationships, factions, onOpenCharacter]);

  return (
    <div
      aria-label="Network analysis graph showing character relationships across factions. Click nodes to view dossiers. Scroll to zoom. Drag to reposition."
      className="network-graph-container flex w-full flex-col"
      role="img"
      style={{ height: "500px" }}
    >
      <div className="min-h-0 w-full flex-1" ref={containerRef}>
        <svg aria-hidden="true" className="h-full w-full" ref={svgRef} />
      </div>
      <div className="flex flex-shrink-0 justify-center gap-6 py-2 font-mono text-terminal-amber text-xs">
        <span>
          <span className="text-terminal-amber">---</span> ALLY
        </span>
        <span>
          <span className="text-status-danger">---</span> ENEMY
        </span>
        <span>
          <span className="text-status-neutral">---</span> NEUTRAL
        </span>
        <span className="text-terminal-amber-dim">
          CLICK NODE TO VIEW DOSSIER | SCROLL TO ZOOM | DRAG TO MOVE
        </span>
      </div>
    </div>
  );
}

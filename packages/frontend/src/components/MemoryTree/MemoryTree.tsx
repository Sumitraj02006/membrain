import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { type Memory } from "../../types.js";

interface MemoryTreeProps {
  memories: Memory[];
  onSelectNode: (memory: Memory) => void;
}

export default function MemoryTree({ memories, onSelectNode }: MemoryTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || memories.length === 0) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 600;
    const height = 600;
    const radius = Math.min(width, height) / 2 - 60;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `[-${width / 2}, -${height / 2}, ${width}, ${height}]`)
      .attr("width", "100%")
      .attr("height", "100%")
      .style("font-family", "monospace");

    // Convert flat memories array to D3 hierarchy
    interface TreeNode {
      id?: string;
      name: string;
      isRoot?: boolean;
      tidScore?: number;
      accessCount?: number;
      content?: string;
      lastAccessedAt?: string;
      createdAt?: string;
      children?: TreeNode[];
    }

    const hierarchyData: TreeNode = {
      name: "MemBrain",
      isRoot: true,
      children: memories.map((m) => ({
        id: m.id,
        name: m.content.length > 20 ? m.content.substring(0, 17) + "..." : m.content,
        tidScore: m.tidScore,
        accessCount: m.accessCount,
        content: m.content,
        lastAccessedAt: m.lastAccessedAt,
        createdAt: m.createdAt,
      })),
    };

    const root = d3.hierarchy(hierarchyData);
    
    // Create radial cluster layout
    const cluster = d3.cluster<TreeNode>().size([2 * Math.PI, radius]);
    cluster(root);

    // Draw links
    svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "rgba(99, 102, 241, 0.15)")
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr(
        "d",
        d3
          .linkRadial<any, any>()
          .angle((d) => d.x)
          .radius((d) => d.y) as any
      );

    // Draw nodes group
    const node = svg
      .append("g")
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr(
        "transform",
        (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
      );

    // Color scaler based on TID Score
    const colorScale = d3
      .scaleLinear<string>()
      .domain([0.15, 0.5, 1.0])
      .range(["#f43f5e", "#f59e0b", "#10b981"]); // Rose (decaying), Amber, Emerald (high signal)

    // Node circles
    node
      .append("circle")
      .attr("r", (d) => (d.data.isRoot ? 9 : 6))
      .attr("fill", (d) => {
        if (d.data.isRoot) return "rgb(99, 102, 241)";
        return colorScale(d.data.tidScore || 1.0);
      })
      .attr("stroke", (d) => {
        if (d.data.isRoot) return "rgba(99, 102, 241, 0.3)";
        return d.data.tidScore && d.data.tidScore < 0.15
          ? "rgba(244, 63, 94, 0.6)"
          : "rgba(255, 255, 255, 0.1)";
      })
      .attr("stroke-width", 2)
      .attr("cursor", (d) => (d.data.isRoot ? "default" : "pointer"))
      .style("box-shadow", "0 0 10px rgba(0,0,0,0.5)")
      .on("click", (event, d) => {
        if (d.data.isRoot) return;
        // Convert to Memory type safely
        const mem: Memory = {
          id: d.data.id || "",
          userId: "local",
          content: d.data.content || "",
          embedding: [],
          tidScore: d.data.tidScore || 1.0,
          accessCount: d.data.accessCount || 0,
          lastAccessedAt: d.data.lastAccessedAt || "",
          createdAt: d.data.createdAt || "",
        };
        onSelectNode(mem);
      });

    // Node text labels
    node
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => (d.x < Math.PI === !d.data.isRoot ? 8 : -8))
      .attr("text-anchor", (d) => (d.x < Math.PI === !d.data.isRoot ? "start" : "end"))
      .attr("transform", (d) => (d.x >= Math.PI ? "rotate(180)" : null))
      .text((d) => d.data.name)
      .attr("font-size", (d) => (d.data.isRoot ? "11px" : "9px"))
      .attr("font-weight", (d) => (d.data.isRoot ? "bold" : "normal"))
      .attr("fill", (d) => {
        if (d.data.isRoot) return "#fff";
        return d.data.tidScore && d.data.tidScore < 0.15 ? "#fda4af" : "#cbd5e1";
      })
      .attr("cursor", (d) => (d.data.isRoot ? "default" : "pointer"))
      .on("click", (event, d) => {
        if (d.data.isRoot) return;
        const mem: Memory = {
          id: d.data.id || "",
          userId: "local",
          content: d.data.content || "",
          embedding: [],
          tidScore: d.data.tidScore || 1.0,
          accessCount: d.data.accessCount || 0,
          lastAccessedAt: d.data.lastAccessedAt || "",
          createdAt: d.data.createdAt || "",
        };
        onSelectNode(mem);
      });

  }, [memories]);

  return (
    <div className="w-full h-full flex items-center justify-center p-2 rounded-2xl bg-slate-950/60 border border-slate-900/50 relative">
      <div className="absolute top-4 left-4 flex gap-3 text-[9px] font-mono text-slate-500 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>Decaying (&lt;0.15)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>Warning (&lt;0.40)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Active</span>
        </div>
      </div>
      <svg ref={svgRef} className="max-w-[450px] max-h-[450px] md:max-w-[500px] md:max-h-[500px]" />
    </div>
  );
}

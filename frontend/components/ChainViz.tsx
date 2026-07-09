'use client'

import { useEffect, useCallback, useState } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { getChain } from '@/lib/api'
import type { Block } from '@/lib/types'
import BlockDetail from './BlockDetail'

interface ChainVizProps {
  port: number
}

export default function ChainViz({ port }: ChainVizProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [chain, setChain] = useState<Block[]>([])
  const [chainValid, setChainValid] = useState(true)
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const data = await getChain(port)
      setChain(data.chain)
      setChainValid(data.valid)
      setError(null)

      const newNodes: Node[] = data.chain.map((block, i) => ({
        id: String(block.index),
        position: { x: i * 220, y: 80 },
        data: {
          label: (
            <div className="text-center text-xs" title={block.hash}>
              <div className="font-bold text-sm">
                {block.index === 0 ? 'Genesis' : `#${block.index}`}
              </div>
              <div className="font-mono mt-1" style={{ color: 'var(--ink-secondary)' }}>
                {block.hash.slice(0, 10)}…
              </div>
              <div className="mt-1" style={{ color: 'var(--ink-muted)' }}>
                {block.transactions.length} tx
              </div>
            </div>
          ),
        },
        style: {
          background: block.index === 0
            ? 'rgba(212, 165, 55, 0.12)'
            : data.valid
              ? 'var(--surface)'
              : 'rgba(208, 59, 59, 0.12)',
          border: `2px solid ${block.index === 0 ? 'var(--gold)' : data.valid ? 'var(--primary)' : 'var(--critical)'}`,
          borderRadius: '12px',
          color: 'var(--ink)',
          width: 160,
          cursor: 'pointer',
        },
      }))

      const newEdges: Edge[] = data.chain.slice(1).map((block) => ({
        id: `e${block.index - 1}-${block.index}`,
        source: String(block.index - 1),
        target: String(block.index),
        style: { stroke: data.valid ? 'var(--primary)' : 'var(--critical)' },
        animated: !data.valid,
      }))

      setNodes(newNodes)
      setEdges(newEdges)
    } catch {
      setError(`Nœud ${port} inaccessible`)
    }
  }, [port, setNodes, setEdges])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 2000)
    return () => clearInterval(interval)
  }, [refresh])

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const block = chain.find((b) => b.index === parseInt(node.id))
      if (block) setSelectedBlock(block)
    },
    [chain]
  )

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center text-critical text-sm">
        {error}
      </div>
    )
  }

  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-ink-muted text-xs">{chain.length} bloc{chain.length > 1 ? 's' : ''}</span>
        <span className="text-ink-muted text-xs">·</span>
        <span className="text-ink-muted text-xs">Cliquez sur un bloc pour les détails</span>
      </div>

      <div className="h-64 rounded-lg border border-border" style={{ background: 'var(--surface)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1b2334" gap={16} />
        </ReactFlow>
      </div>

      {selectedBlock && (
        <BlockDetail block={selectedBlock} onClose={() => setSelectedBlock(null)} />
      )}
    </>
  )
}

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
            <div className="text-center text-xs">
              <div className="font-bold text-sm">
                {block.index === 0 ? 'Genesis' : `#${block.index}`}
              </div>
              <div className="font-mono mt-1" style={{ color: '#fca5a5' }}>
                {block.hash.slice(0, 10)}…
              </div>
              <div className="mt-1" style={{ color: '#a8a29e' }}>
                {block.transactions.length} tx
              </div>
            </div>
          ),
        },
        style: {
          background: block.index === 0
            ? '#431407'
            : data.valid
              ? '#1c1007'
              : '#450a0a',
          border: `2px solid ${block.index === 0 ? '#ea580c' : data.valid ? '#f97316' : '#ef4444'}`,
          borderRadius: '12px',
          color: 'white',
          width: 160,
          cursor: 'pointer',
        },
      }))

      const newEdges: Edge[] = data.chain.slice(1).map((block) => ({
        id: `e${block.index - 1}-${block.index}`,
        source: String(block.index - 1),
        target: String(block.index),
        style: { stroke: data.valid ? '#f97316' : '#ef4444' },
        animated: !data.valid,
      }))

      setNodes(newNodes)
      setEdges(newEdges)
    } catch {
      setError(`Node ${port} unreachable`)
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
      <div className="h-64 flex items-center justify-center text-red-400 text-sm">
        {error}
      </div>
    )
  }

  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-gray-500 text-xs">{chain.length} bloc{chain.length > 1 ? 's' : ''}</span>
        <span className="text-gray-700 text-xs">·</span>
        <span className="text-gray-500 text-xs">Cliquez sur un bloc pour les détails</span>
      </div>

      <div className="h-64 rounded-lg border border-gray-700" style={{ background: '#0c0804' }}>
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
        >
          <Background color="#292524" gap={16} />
        </ReactFlow>
      </div>

      {selectedBlock && (
        <BlockDetail block={selectedBlock} onClose={() => setSelectedBlock(null)} />
      )}
    </>
  )
}

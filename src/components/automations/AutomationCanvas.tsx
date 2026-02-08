'use client';

import { useCallback, useMemo } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, Node, Edge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WhatsappAutomation } from '@/actions/automations';

interface AutomationCanvasProps {
    automations: WhatsappAutomation[];
    onEdit: (automation: WhatsappAutomation) => void;
}

export function AutomationCanvas({ automations, onEdit }: AutomationCanvasProps) {
    // Transform automations into nodes and edges
    const { initialNodes, initialEdges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        let yPos = 50;

        automations.forEach((auto, index) => {
            const xBase = 100;
            const y = yPos;

            // Trigger Node
            const triggerId = `trigger-${auto.id}`;
            nodes.push({
                id: triggerId,
                position: { x: xBase, y },
                data: { label: `Gatilho: ${auto.name}` },
                style: { background: '#f0fdf4', border: '1px solid #16a34a', borderRadius: '8px', padding: '10px', width: 180 },
                type: 'input', // React Flow type, not TS type
            });

            // Delay Node (if any or just as a connector)
            const delayId = `delay-${auto.id}`;
            nodes.push({
                id: delayId,
                position: { x: xBase + 250, y },
                data: { label: `Aguardar: ${auto.delay_minutes} min` },
                style: { background: '#fffbeb', border: '1px solid #d97706', borderRadius: '20px', padding: '5px 15px', width: 150 },
            });

            // Action Node
            const actionId = `action-${auto.id}`;
            nodes.push({
                id: actionId,
                position: { x: xBase + 500, y },
                data: {
                    label: (
                        <div onClick={() => onEdit(auto)} className="cursor-pointer">
                            <div className="font-bold mb-1">Enviar WhatsApp</div>
                            <div className="text-xs truncate text-muted-foreground max-w-[140px]">{auto.message_template}</div>
                        </div>
                    )
                },
                style: { background: '#eff6ff', border: '1px solid #2563eb', borderRadius: '8px', padding: '10px', width: 200 },
                type: 'output',
            });

            // Edges
            edges.push({
                id: `e-${triggerId}-${delayId}`,
                source: triggerId,
                target: delayId,
                animated: true,
                style: { stroke: '#94a3b8' },
            });

            edges.push({
                id: `e-${delayId}-${actionId}`,
                source: delayId,
                target: actionId,
                animated: true,
                markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
                style: { stroke: '#94a3b8' },
            });

            yPos += 150; // Spacing for next automation
        });

        return { initialNodes: nodes, initialEdges: edges };
    }, [automations, onEdit]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Keep nodes synced when automations change (simple reset for now)
    // In a real app we might want to preserve positions if user dragged them
    useMemo(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    return (
        <div className="h-[600px] border rounded-lg bg-gray-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}

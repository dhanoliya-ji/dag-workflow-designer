"""Pipeline parsing API.

Receives the nodes and edges of a pipeline built in the frontend and reports
its size along with whether it forms a directed acyclic graph.
"""

from collections import defaultdict, deque
from typing import Any, Dict, List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title='Pipeline API')

# The dev frontend is served from a different origin, so the browser
# preflights the POST below. Any localhost port is allowed so the app works
# whichever port Create React App lands on.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r'https?://(localhost|127\.0\.0\.1)(:\d+)?',
    allow_methods=['*'],
    allow_headers=['*'],
)


class Node(BaseModel):
    id: str
    type: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class Edge(BaseModel):
    id: Optional[str] = None
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class Pipeline(BaseModel):
    nodes: List[Node] = []
    edges: List[Edge] = []


class PipelineStats(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool


def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    """Kahn's algorithm: a graph is acyclic iff a topological sort covers it.

    Edges pointing at unknown nodes are ignored, and a self-loop keeps its
    node's in-degree above zero, so it is correctly reported as a cycle.
    """
    in_degree = {node.id: 0 for node in nodes}
    adjacency = defaultdict(list)

    for edge in edges:
        if edge.source in in_degree and edge.target in in_degree:
            adjacency[edge.source].append(edge.target)
            in_degree[edge.target] += 1

    queue = deque(node_id for node_id, degree in in_degree.items() if degree == 0)
    visited = 0

    while queue:
        node_id = queue.popleft()
        visited += 1
        for neighbour in adjacency[node_id]:
            in_degree[neighbour] -= 1
            if in_degree[neighbour] == 0:
                queue.append(neighbour)

    # Anything left unvisited sits on, or downstream of, a cycle.
    return visited == len(in_degree)


@app.get('/')
def read_root():
    return {'Ping': 'Pong'}


@app.post('/pipelines/parse', response_model=PipelineStats)
def parse_pipeline(pipeline: Pipeline) -> PipelineStats:
    return PipelineStats(
        num_nodes=len(pipeline.nodes),
        num_edges=len(pipeline.edges),
        is_dag=is_dag(pipeline.nodes, pipeline.edges),
    )

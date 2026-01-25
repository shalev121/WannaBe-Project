import faiss
import pickle
import numpy as np
import networkx as nx
from sentence_transformers import SentenceTransformer

# Load Artifacts globally
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
index = faiss.read_index("wannabe_index.bin")
with open("canonical_roles.pkl", "rb") as f:
    # Ensure every role is lowercase for graph matching
    canonical_roles = [r.lower().strip() for r in pickle.load(f)]
with open('wannabe_graph.pkl', 'rb') as f:
    G = pickle.load(f)


def resolve_role_input(input_text, k=3):
    """
    Standardizes input and returns top semantic matches.
    Ensures output matches lowercase graph nodes.
    """
    query = input_text.lower().strip()

    # Exact Match Check (Case-insensitive)
    if query in canonical_roles:
        return [(query, 1.0)]

    # Vector Search
    query_embedding = model.encode([query])
    query_embedding = query_embedding / np.linalg.norm(query_embedding, axis=1, keepdims=True)
    similarities, indices = index.search(query_embedding.astype('float32'), k)

    return [(canonical_roles[idx], float(score)) for score, idx in zip(similarities[0], indices[0])]


def find_wannabe_path(current_role, target_role):
    """
    Computes path with detailed metrics for the frontend.
    """
    # Force lowercase
    u_start = current_role.lower().strip()
    v_end = target_role.lower().strip()

    try:
        path = nx.shortest_path(G, source=u_start, target=v_end, weight='weight')
        # Calculate detailed metrics for the result object
        steps = []
        total_prob = 1.0
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            data = G[u][v]
            total_prob *= data['probability']
            steps.append({
                "from": u,
                "to": v,
                "prob": data['probability'],
                "count": data['count']
            })

        return {
            "success": True,
            "path": path,
            "steps": steps,
            "total_confidence": total_prob
        }

    except (nx.NetworkXNoPath, nx.NodeNotFound):
        return {"success": False, "error": "No realistic path found."}
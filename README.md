# WannaBe  
## Intelligent Career Transition Recommender

WannaBe is an intelligent decision-support system designed to transform noisy, unstructured career histories into actionable, data-driven professional roadmaps.  
By combining semantic role resolution, probabilistic graph modeling, and grounded LLM narration, WannaBe provides users with a clear and statistically validated path from their current role to their ultimate career goal.

---

## Overview

### The Problem

Traditional career platforms focus on job listings or static employment histories. They lack tools for planning multi-step career transitions.  
Users often know their destination role but struggle to identify the intermediate career hops and the specific skills required to reach it.

### The Solution

WannaBe constructs a **Directed Transition Graph** from thousands of historical job transitions.  
It resolves informal job titles into canonical professional roles using high-performance semantic vector search and computes the most efficient transition path between them.

Each transition step is enriched with:
- role-defining skills
- transition probabilities
- strategic explanations grounded in real-world professional data

---

## Intelligent Design and Theoretical Foundation

The system architecture is grounded in four major research pillars that justify its intelligent design.

### 1. Relational Mobility  
**Shalaby et al., 2018**  
Career mobility is modeled as a directed graph of job-to-job transitions. Classical graph algorithms are applied to navigate professional states at scale.

### 2. Skill-Centric Standardization  
**Gugnani et al., 2018**  
Skills, rather than inconsistent job titles, are treated as the fundamental units of career progression.

### 3. Path Planning  
**Ghosh et al., 2020**  
Career progression is framed as an optimization problem, identifying the highest-probability sequence of career milestones.

### 4. Asymmetric Transition Difficulty  
**Dawson et al., 2021**  
Career transitions are asymmetric. Forward and backward moves differ in feasibility and are justified through patterns of skill growth and professional overlap.

---

## System Architecture

### 1. Semantic Role Resolution (Entry Point)

To handle vocabulary mismatch in job titles, WannaBe uses **Sentence-BERT (all-MiniLM-L6-v2)** to encode job roles into 384-dimensional embeddings.

A **FAISS** index enables near-instant mapping of free-text user input to canonical professional roles.

---

### 2. Graph-Based Pathfinding (Core Logic)

Career transitions are represented as edges in a **Directed Graph**, weighted by empirical transition probabilities.

**Cost Function**

Weight = -ln(P) + γ

Where:
- `P` is the transition probability
- `γ` is a regularization hyperparameter

**Optimization Strategy**
- Dijkstra’s algorithm is used to compute optimal paths
- γ = 1.0 was selected to balance realism with path efficiency
- This prevents overly long or statistically weak career paths

---

### 3. Hybrid Strategic Narration (Interpretability Layer)

WannaBe combines deterministic data extraction with LLM-based explanation.

- **Deterministic Skill Extraction**  
  Skills are retrieved from curated CSV datasets

- **Grounded LLM Narration**  
  Gemini 2.5 Flash generates strategic explanations for each transition step, grounded strictly in graph statistics and skill overlap

This hybrid approach ensures transparency, explainability, and narrative clarity.

---

## Repository Structure

### Research and Development

- `Graph_Creation_and_Searching.ipynb`  
  Data cleaning, probability estimation, graph construction, and γ hyperparameter validation

- `Semantic Similarity Search for Professional Roles.ipynb`  
  Sentence-BERT benchmarking, FAISS index construction, and semantic retrieval evaluation

---

### Performance Artifacts

- `wannabe_graph.pkl`  
  Serialized directed transition graph

- `wannabe_index.bin`  
  FAISS index for high-speed role resolution

- `canonical_roles.pkl`  
  Canonical role mapping for index interpretation

---

### Application Implementation

- `app.py`  
  Flask orchestration layer managing:
  - user input
  - semantic resolution
  - graph pathfinding
  - skill extraction
  - LLM narration

- `graph_logic.py`  
  Core algorithmic logic for semantic search and graph traversal

- `static/`  
  Frontend assets and interactive UI logic

- `templates/`  
  Flask HTML templates

---

## Installation and Usage
### Prerequisites

- Python 3.10 or higher  
- Google Gemini API key stored in `.env`

---

### Setup

Clone the repository:

```bash
git clone https://github.com/shalev121/WannaBe-Project.git
cd WannaBe-Project
Install dependencies:

pip install -r requirements.txt
Create a .env file in the project root:

GEMINI_API_KEY=your_api_key_here
Run the application:

python app.py
Access the UI:

http://localhost:5000
Academic Foundation
This project is theoretically supported by the following works:

Shalaby et al. (2018)
Help Me Find a Job: A Graph-based Approach for Job Recommendation at Scale

Gugnani et al. (2018)
Generating Unified Candidate Skill Graph for Career Path Recommendation

Ghosh et al. (2020)
Skill-based Career Path Modeling and Recommendation

Dawson et al. (2021)
Skill-driven Recommendations for Job Transition Pathways

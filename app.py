"""
WANNA-BE: INTELLIGENT CAREER PATHFINDER (BACKEND)
-------------------------------------------------
This script serves as the Flask orchestration layer for the WannaBe application.
It integrates graph theory, semantic vector search, and LLM-grounded narration
to provide data-driven career transition strategies.

Date: January 2026
"""

from flask import Flask, render_template, request, jsonify
from graph_logic import resolve_role_input, find_wannabe_path, canonical_roles
import pandas as pd
import ast
import json
import re
from google import genai
from dotenv import load_dotenv
import os

app = Flask(__name__)

# INITIALIZATION & DATA LOADING
load_dotenv()
key = os.getenv("GEMINI_API_KEY")

if not key:
    print("Error: No API Key found in .env")
else:
    # Initialize Client
    client = genai.Client(api_key=key)


# Load the skills CSV
try:
    skills_df = pd.read_csv('role_skills_list.csv')
    skills_df['role_name'] = skills_df['role_name'].astype(str).str.lower().str.strip()
    print("Skills database loaded successfully.")
except Exception as e:
    print(f"Error loading skills CSV: {e}")


# Load the Skills Resources CSV
try:
    resources_df = pd.read_csv('skills_resources_learn.csv')
    # Clean up column names and strings for easier matching
    resources_df['Skill'] = resources_df['Skill'].astype(str).str.lower().str.strip()
    print("Learning resources database loaded successfully.")
except Exception as e:
    print(f"Error loading resources CSV: {e}")

# CORE INTELLIGENCE API ROUTES
# API ROUTE
@app.post("/api/get-path-details")
def get_path_details():
    """
        PURPOSE: Generates a high-density strategic breakdown for a career path.
        ALGORITHM: Hybrid intelligence approach.
        1. Deterministic Extraction: Fetches skills for the TARGET role of each transition from CSV.
        2. LLM Narration: Grounds Gemini 2.5 Flash in the extracted skills to generate 'Why' rationales.
        3. Resource Enrichment: Maps skills to validated educational resources via resources_df.
    """

    if not client:
        return jsonify({"success": False, "error": "AI client not initialized."})

    data = request.json
    path_roles = data.get("roles", [])

    if not path_roles or len(path_roles) < 2:
        return jsonify({"success": False, "error": "Path too short to analyze."})

    # Construct Transition-Based Skill Mapping
    details_list = []
    for i in range(len(path_roles) - 1):
        from_role = path_roles[i]
        to_role = path_roles[i + 1]

        # Look up skills for the role the user is transitioning TO
        row = skills_df[skills_df['role_name'] == to_role.lower().strip()]
        if not row.empty:
            raw_skills_str = str(row.iloc[0]['top_skills'])
            clean_str = raw_skills_str.strip("[]")
            skills_list = [s.strip() for s in clean_str.split(',')]
            formatted_skills = [{"name": s} for s in skills_list if s]
        else:
            formatted_skills = [{"name": "Industry Standards"}]

        # We store the transition structure directly for the LLM
        details_list.append({
            "from": from_role,
            "to": to_role,
            "skills": formatted_skills
        })

    # Prepare Data for LLM, LLM Strategic Grounding
    target_goal = path_roles[-1]
    current_pos = path_roles[0]

    prompt = f"""
    ### ROLE ###
    You are 'WannaBe AI', an elite Career Strategist and Senior Industry Analyst. You specialize in identifying the "Latent Skills" and "Seniority Bridges" that allow professionals to navigate complex career transitions.

    ### CONTEXT ###
    A user is navigating a career journey from '{current_pos}' to '{target_goal}'.
    Validated Path: {' -> '.join(path_roles)}

    ### TASK ###
    Execute the following instructions with precision, ensuring maximum information density:

    1. **TRANSITION RATIONALE**: For each career step, explain the strategic "bridge" this role provides. Focus on the shift in seniority, responsibility, or domain expertise required to eventually reach the role of '{target_goal}'.

    2. **HIGH-DENSITY SKILL DEFINITION**: Provide exactly ONE comprehensive sentence for every skill.
       - **ANCHOR**: The sentence MUST begin with the skill name (e.g., "SQL is...").
       - **DENSITY**: Avoid generic definitions. Instead, combine the skill's core identity with its primary functional utility (e.g., "[Skill] is [Definition], enabling [Action] through [Mechanism]").

    3. **SKILL CONTEXT**: Explain how that specific skill acts as the "key" to unlocking the responsibilities of the next role in this specific trajectory.

    ### FEW-SHOT EXAMPLE ###
    Input Role: Data Analyst -> Data Engineer
    Skill: Python
    Output:
    {{
      "what": "Python is a high-level, interpreted programming language that serves as the industry standard for data manipulation, allowing for the creation of robust, automated scripts to handle large-scale data processing.",
      "why_skill": "Transitioning from Analyst to Engineer requires moving from static reporting to building live pipelines; Python is the essential tool for scripting those automated ETL workflows."
    }}

    ### DATA TO PROCESS ###
    {details_list}

    ### OUTPUT FORMAT ###
    Return ONLY a valid JSON object. No preamble, no conversational filler.
    {{
      "explanations": [
        {{ 
          "from": "current_role", 
          "to": "next_role", 
          "why_transition": "...",
          "skill_details": [
            {{ 
              "name": "...", 
              "what": "[Skill Name] is...", 
              "why_skill": "..." 
            }}
          ]
        }}
      ]
    }}
    """


    try:
        # CALL GEMINI
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        # Clean response and parse JSON
        json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
        ai_explanations = json.loads(json_match.group()).get("explanations", []) if json_match else []

        # MERGE AI and CSV data
        final_steps = []
        # Loop through every transition object in details_list
        for i in range(len(details_list)):
            ai_step = ai_explanations[i] if i < len(ai_explanations) else {}
            explanation = ai_step.get("why_transition", "Strategic progression step.")
            skill_info = ai_step.get("skill_details", [])

            # --- Skill Resources Logic (No changes needed inside this loop) ---
            for skill in skill_info:
                skill_name_lower = skill.get("name", "").lower().strip()
                res_row = resources_df[resources_df['Skill'] == skill_name_lower]
                if not res_row.empty:
                    raw_resources = str(res_row.iloc[0]['Sources'])
                    skill["resources"] = [r.strip() for r in raw_resources.split(';') if r.strip()]
                else:
                    skill["resources"] = ["General industry documentation", "Foundational online courses"]

            # Use the 'from' and 'to' keys you created in Step 1
            final_steps.append({
                "from": details_list[i]["from"],
                "to": details_list[i]["to"],
                "why": explanation,
                "skills": skill_info
            })

        return jsonify({
            "success": True,
            "steps": final_steps,
            "target_goal": target_goal
        })

    except Exception as e:
        print(f"LLM Error: {e}")
        return jsonify({"success": False, "error": "AI Coach is currently offline."})

# PAGE RENDERING ROUTES
@app.route("/")
def screen1():
    """Main landing page with dynamic role population."""
    return render_template("screen1_input.html", roles=sorted(canonical_roles))

@app.post("/api/search-similar")
def api_search_similar():
    """Executes Semantic Role Resolution using FAISS and Sentence-Transformer."""
    data = request.json
    text = data.get("text")
    if not text:
        return jsonify([])

    # calls specific resolve_role_input function
    matches = resolve_role_input(text, k=3)
    return jsonify(matches)

@app.post("/api/find-path")
def api_find_path():
    """Executes Graph-Based Pathfinding using Dijkstra's Algorithm (-log(P) + gamma)."""
    data = request.json
    result = find_wannabe_path(data.get("currentRole"), data.get("targetRole"))
    return jsonify(result)


@app.get("/path")
def screen2():
    """Roadmap visualization page."""
    return render_template("screen2_path.html")

@app.get("/steps")
def screen3():
    """Strategic deep-dive and skill acquisition page."""
    return render_template("screen3_steps.html")

if __name__ == "__main__":
    # The initialization (loading the graph) happens during startup
    app.run(debug=True)
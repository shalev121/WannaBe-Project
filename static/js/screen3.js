(function () {
  const container = document.getElementById("stepsContainer");
  const result = WB_UI.load("wb_results");

  const format = (s) => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  async function init() {
    if (!result || !result.path) {
      container.innerHTML = "<p class='text-center'>Please calculate a path first.</p>";
      return;
    }

    // Show loading spinner while Gemini generates the strategy
    container.innerHTML = `
      <div class="text-center p-5">
        <div class="spinner-border text-primary mb-3"></div>
        <p class="wb-muted">AI Career Coach is analyzing your roadmap...</p>
      </div>`;

    try {
      // Fetch the combined data (CSV Skills + AI Explanation)
      const response = await fetch("/api/get-path-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: result.path })
      });
      const data = await response.json();

      if (data.success) {
        // 2. Render the steps using the AI-provided descriptions
        renderSteps(data.steps);
      } else {
        container.innerHTML = `<div class='alert alert-warning'>${data.error}</div>`;
      }
    } catch (e) {
      console.error(e);
      container.innerHTML = "<p class='text-danger'>Error loading career insights.</p>";
    }
  }

  function renderSteps(steps) {
    container.innerHTML = "";

    // 'steps' contains the pre-processed transitions from the backend
    steps.forEach((step, i) => {
      const wrapper = document.createElement("div");
      wrapper.className = "wb-step-card mb-4 border rounded-4 overflow-hidden shadow-sm bg-white";

// STEP HEADER
const header = document.createElement("div");
header.className = "p-4 d-flex justify-content-between align-items-center";

// Sets the base color to match the modal paragraph background
header.style.cssText = "cursor: pointer; background-color: #e9ecef; transition: background-color 0.2s ease;";

// Sets the hover state
header.onmouseover = () => header.style.backgroundColor = "#dee2e6";
header.onmouseout = () => header.style.backgroundColor = "#e9ecef";

      header.innerHTML = `
  <div>
     <span class="badge mb-2" style="background-color: rgba(160, 200, 245, 0.36); color: #1a66ff; font-size: 16px;">Transition ${i + 1}</span>
     <div class="fw-bold h5 mb-0">${format(step.from)} → ${format(step.to)}</div>
  </div>
  <div class="toggle-icon fs-4 text-primary">▼</div>
`;

      // STEP BODY
      const body = document.createElement("div");
      body.className = "p-4 border-top";
      body.style.display = i === 0 ? "block" : "none"; // First step starts expanded

      body.innerHTML = `
    <div class="mb-4">
      <div class="fw-bold mb-1">Why this step matters</div>
      <p class="wb-muted mb-0">${step.why}</p>
    </div>
    <div>
      <div class="fw-bold mb-1">Key skills to acquire for ${format(step.to)}</div>
      <div class="d-flex flex-wrap gap-2" id="tags-${i}"></div>
    </div>
  `;

      // Add skills as tags
      const tagsContainer = body.querySelector(`#tags-${i}`);
      step.skills.forEach(skill => {
        const tag = document.createElement("span");
// Find where tags are created and update the classes
tag.className = "wb-tag badge rounded-pill border p-2 px-3 fw-bold"; // Added fw-bold
tag.style.color = "#1b2a41"; // Restores the dark navy color for readability
tag.style.backgroundColor = "#ffffff";
tag.style.cursor = "pointer";
        tag.textContent = skill.name;

        // Pass the skill object and the role to the modal
        tag.onclick = () => openSkillModal(skill, step.to);
        tagsContainer.appendChild(tag);
      });

      // Toggle Logic
      header.onclick = () => {
        const isHidden = body.style.display === "none";
        body.style.display = isHidden ? "block" : "none";
        header.querySelector('.toggle-icon').textContent = isHidden ? "▲" : "▼";
      };

      wrapper.appendChild(header);
      wrapper.appendChild(body);
      container.appendChild(wrapper);
    });
  }

function openSkillModal(skill, role) {
    document.getElementById("skillModalTitle").textContent = format(skill.name);
    document.getElementById("skillWhat").textContent = skill.what || "No definition available.";
    document.getElementById("skillWhy").textContent = skill.why_skill || `Key for transitioning to ${format(role)}.`;

    const ul = document.getElementById("skillResources");
    ul.innerHTML = ""; // Clear existing

    if (skill.resources && skill.resources.length > 0) {
        skill.resources.forEach(resource => {
            const li = document.createElement("li");
            // Classes for a clean, vertical, non-bordered list
li.className = "list-group-item border-0 px-0 d-flex align-items-start bg-transparent py-0";            // Logic to pick the right icon based on the text prefix
            let icon = "bi-link-45deg";
            if (resource.includes("Book:")) icon = "bi-book";
            else if (resource.includes("Course:")) icon = "bi-play-circle";
            else if (resource.includes("Doc:")) icon = "bi-file-earmark-text";
            else if (resource.includes("YouTube:")) icon = "bi-youtube";
            else if (resource.includes("Tool:")) icon = "bi-tools";

            li.innerHTML = `
            <span class="me-2 text-dark">•</span>
            <span style="color: #000000 !important; font-size: 16px;">${resource}</span>
        `;
        ul.appendChild(li);
        });
    } else {
        ul.innerHTML = "<li class='list-group-item border-0 px-0 text-muted'>General documentation and online courses.</li>";
    }

    const modalEl = document.getElementById("skillModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
}

  document.getElementById("editRolesBtn").onclick = () => window.location.href = "/";

  init();
})();
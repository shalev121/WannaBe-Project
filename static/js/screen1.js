/**
 * GLOBAL SCOPE: searchSimilar
 */
window.searchSimilar = async function(type) {
    const inputId = type === 'current' ? 'currentSimInput' : 'targetSimInput';
    const resultsId = type === 'current' ? 'currentSimilarResults' : 'targetSimilarResults';
    const selectId = type === 'current' ? 'currentRoleSelect' : 'targetRoleSelect';

    const text = document.getElementById(inputId).value.trim();
    const resultsArea = document.getElementById(resultsId);
    const dropdown = document.getElementById(selectId);

    if (!text) return;
    resultsArea.innerHTML = "<div class='small text-primary'>Searching database...</div>";

    try {
        const response = await fetch("/api/search-similar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text })
        });

        const matches = await response.json();
        resultsArea.innerHTML = "";

        if (matches.length > 0) {
            if (matches[0][1] >= 0.99) {
                dropdown.value = matches[0][0];
                resultsArea.innerHTML = `<div class='alert alert-info p-2 small'>Exact match: ${matches[0][0]}</div>`;
                return;
            }

            resultsArea.innerHTML = "<p class='small fw-bold mb-2'>Similar jobs found (click to select):</p>";
            matches.forEach((match) => {
                const btn = document.createElement("button");
                btn.className = "btn btn-sm btn-light border w-100 text-start mb-2 d-flex justify-content-between";
btn.innerHTML = `
    <span>${match[0]}</span> 
    <span class='badge' style='background-color: rgba(160, 200, 245, 0.36); color: #1a66ff; font-size: 16px;'>
        ${(match[1] * 100).toFixed(0)}%
    </span>`;                btn.onclick = () => {
                    dropdown.value = match[0];
                    resultsArea.innerHTML = `<div class='alert alert-info py-1 small'>Selected: ${match[0]}</div>`;
                };
                resultsArea.appendChild(btn);
            });
        } else {
            resultsArea.innerHTML = "<div class='text-danger small'>No matches found.</div>";
        }
    } catch (e) {
        console.error("Search Error:", e);
        resultsArea.innerHTML = "<div class='text-danger small'>Connection Error.</div>";
    }
};



/**
 * PRIVATE SCOPE: Find Career Path Logic
 */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
      const currentSelect = document.getElementById("currentRoleSelect");
      const targetSelect = document.getElementById("targetRoleSelect");
      const findBtn = document.getElementById("findPathBtn");
      const errorDiv = document.getElementById("screen1Error");

      if (!findBtn) return;

      findBtn.addEventListener("click", async () => {
        errorDiv.style.display = "none";
        const startNode = currentSelect.value;
        const endNode = targetSelect.value;

        if (!startNode || !endNode) {
          errorDiv.style.display = "block";
          errorDiv.textContent = "Please select or search for both roles.";
          return;
        }

        findBtn.disabled = true;
        findBtn.textContent = "Calculating Path...";

        try {
          const response = await fetch("/api/find-path", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentRole: startNode, targetRole: endNode })
          });

          const result = await response.json();

          if (response.ok && result.success) {
            WB_UI.save("wb_results", result);
            WB_UI.save("wb_input", { currentRole: startNode, targetRole: endNode });
            window.location.href = "/path";
          } else {
            errorDiv.style.display = "block";
            errorDiv.textContent = result.error || "No realistic path found.";
          }
        } catch (e) {
          errorDiv.style.display = "block";
          errorDiv.textContent = "Failed to calculate path. Check server.";
        } finally {
          findBtn.disabled = false;
          findBtn.textContent = "Find Career Path";
        }
      });
  });
})();
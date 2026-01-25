(function () {
    const container = document.getElementById("verticalPathContainer");
    const summaryText = document.getElementById("pathSummaryText");
    const result = WB_UI.load("wb_results");

    if (!result || !result.success) {
        container.innerHTML = "<div class='alert alert-danger'>No path found.</div>";
        return;
    }

    const path = result.path;
    const steps = result.steps; // Contains {prob, count, from, to}

    const format = (s) => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');


    // Calculate the number of transitions (steps between nodes)
    const transitionCount = path.length - 1;

    // Replace overall % with your custom explanation and dynamic transition count
summaryText.innerHTML = `This is the most efficient calculated path, calculated from historical patterns in the JobHop dataset. Your path includes ${transitionCount} transitions,with percentages representing the statistical likelihood of each step based on real-world professional trajectories. Click 'View Detailed Breakdown' for a full strategic analysis.`;
    // 2. Clear container
    container.innerHTML = "";

    // Draw Nodes and Jumping Arrows
    path.forEach((role, index) => {
        // --- DRAW ROLE NODE ---
        const node = document.createElement("div");
        node.className = "wb-node-vertical shadow-sm";
        node.style.borderLeft = index === 0 ? "5px solid #3a86ff" : (index === path.length - 1 ? "5px solid #06d6a0" : "5px solid #ced4da");

        node.innerHTML = `
    <div class="p-4 bg-white rounded-3 border">
        <div class="text-uppercase wb-muted mb-1" style="font-size: 16px !important;">
            ${index === 0 ? "Current Role" : (index === path.length - 1 ? "Target Goal" : "Milestone Step")}
        </div>
        <div class="fw-bold mb-0" style="font-size: 20px !important;">${format(role)}</div>
    </div>
`;
        container.appendChild(node);

        // DRAW JUMPING ARROW WITH PROBABILITY
        if (index < path.length - 1) {
            const stepData = steps[index]; // Get probability for this transition
            const arrowContainer = document.createElement("div");
            arrowContainer.className = "text-center my-2 position-relative";

            arrowContainer.innerHTML = `
    <div class="jump-arrow-line"></div>
    <div class="prob-badge shadow-sm" style="font-size: 16px !important;">
        ${(stepData.prob * 100).toFixed(0)}% Likelihood
    </div>
    <div class="fs-4" style="color:#3a86ff; margin-top: -10px;">↓</div>
`;
            container.appendChild(arrowContainer);
        }
    });

    document.getElementById("explainBtn").addEventListener("click", () => {
        window.location.href = "/steps";
    });
})();
// Initialize popup
document.addEventListener("DOMContentLoaded", () => {
  const endpoint1Input = document.getElementById("endpoint1");
  const endpoint2Input = document.getElementById("endpoint2");
  const tabSelect1 = document.getElementById("tabSelect1");
  const tabSelect2 = document.getElementById("tabSelect2");
  const compareBtn = document.getElementById("compareBtn");
  const response1Div = document.getElementById("response1");
  const response2Div = document.getElementById("response2");
  const errorDiv = document.getElementById("error");

  // Load saved endpoints
  chrome.storage.local.get(["endpoints"], (data) => {
    const endpoints = data.endpoints || [];
    if (endpoints.length > 0) endpoint1Input.value = endpoints[0];
    if (endpoints.length > 1) endpoint2Input.value = endpoints[1];
  });

  // Populate tab dropdowns with matching tabs
  chrome.storage.local.get('domains', (data) => {
    const domains = data.domains || [];
    const hasWildcard = domains.includes('*');

    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const apiTabs = hasWildcard ? tabs : tabs.filter(tab => {
        try {
          const url = new URL(tab.url);
          // Match hostname against regex patterns
          return domains.some(pattern => {
            try {
              const regex = new RegExp(pattern);
              return regex.test(url.hostname);
            } catch (e) {
              console.error(`Invalid regex pattern: ${pattern}`);
              return false;
            }
          });
        } catch (e) {
          return false;
        }
      });

      // Populate dropdowns
      apiTabs.forEach(tab => {
        const option1 = document.createElement('option');
        option1.value = tab.url;
        option1.textContent = `${tab.title} (${tab.url})`;
        tabSelect1.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = tab.url;
        option2.textContent = `${tab.title} (${tab.url})`;
        tabSelect2.appendChild(option2);
      });

      // Log for debugging
      console.log('Selected tabs:', apiTabs);
    });
  });

  // Update input fields when a tab is selected
  tabSelect1.addEventListener('change', () => {
    endpoint1Input.value = tabSelect1.value || '';
  });
  tabSelect2.addEventListener('change', () => {
    endpoint2Input.value = tabSelect2.value || '';
  });

  // Compare button click handler
  compareBtn.addEventListener("click", async () => {
    errorDiv.textContent = "";
    response1Div.innerHTML = "";
    response2Div.innerHTML = "";

    const url1 = endpoint1Input.value.trim();
    const url2 = endpoint2Input.value.trim();

    if (!url1 || !url2) {
      errorDiv.textContent = "Please enter both endpoint URLs.";
      return;
    }

    try {
      const [response1, response2] = await Promise.all([
        fetchResponse(url1),
        fetchResponse(url2)
      ]);

      if (response1.status === "error") throw new Error(`Endpoint 1: ${response1.error}`);
      if (response2.status === "error") throw new Error(`Endpoint 2: ${response2.error}`);

      // Convert responses to strings for diff
      const text1 = formatResponse(response1.data, response1.contentType);
      const text2 = formatResponse(response2.data, response2.contentType);

      // Compute diff using jsdiff
      const diff = Diff.diffJson(
        typeof text1 === "object" ? text1 : JSON.parse(text1),
        typeof text2 === "object" ? text2 : JSON.parse(text2)
      );

      // Display responses with diff highlights
      while (response1Div.firstChild) response1Div.removeChild(response1Div.firstChild);
      while (response2Div.firstChild) response2Div.removeChild(response2Div.firstChild);
      formatDiff(diff, "left").forEach(node => response1Div.appendChild(node));
      formatDiff(diff, "right").forEach(node => response2Div.appendChild(node));

      // Add click-to-copy
      response1Div.addEventListener("click", () => navigator.clipboard.writeText(text1));
      response2Div.addEventListener("click", () => navigator.clipboard.writeText(text2));

      // Save endpoints
      chrome.storage.local.set({ endpoints: [url1, url2] });
    } catch (error) {
      errorDiv.textContent = `Error: ${error.message}`;
    }
  });
});

// Fetch response from background script
function fetchResponse(url) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "fetchResponse", url }, resolve);
  });
}

// Format response (JSON or XML)
function formatResponse(data, contentType) {
  if (contentType.includes("json")) {
    return JSON.stringify(data, null, 2);
  } else if (contentType.includes("xml")) {
    return new XMLSerializer().serializeToString(data);
  }
  return String(data);
}

// Format diff output as DOM nodes
function formatDiff(diff, side) {
  const nodes = [];
  diff.forEach((part) => {
    const color = part.added ? "green" : part.removed ? "red" : "grey";
    if (side === "left" && !part.added || side === "right" && !part.removed) {
      const lines = part.value.split('\n');
      lines.forEach((line, index) => {
        if (line || index === lines.length - 1) { // Skip empty lines except last
          const span = document.createElement('span');
          span.style.backgroundColor = color;
          span.textContent = line;
          nodes.push(span);
          if (index < lines.length - 1) nodes.push(document.createElement('br'));
        }
      });
    }
  });
  return nodes;
}
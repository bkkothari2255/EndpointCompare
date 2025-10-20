// Create context menu for saving API URLs
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-endpoint",
    title: "Save API Endpoint for Comparison",
    contexts: ["link", "selection"]
  });
});

// Store the last clicked URL temporarily
let lastClickedUrl = null;

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-endpoint") {
    const url = info.linkUrl || info.selectionText;
    if (url && isValidUrl(url)) {
      lastClickedUrl = url;
      // Store the endpoint in local storage
      chrome.storage.local.get(["endpoints"], (data) => {
        const endpoints = data.endpoints || [];
        if (!endpoints.includes(url)) {
          endpoints.push(url);
          chrome.storage.local.set({ endpoints }, () => {
            console.log(`Saved endpoint: ${url}`);
          });
        }
      });
    }
  }
});

// Listen for messages from content.js or popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveUrl") {
    lastClickedUrl = message.url;
    chrome.storage.local.get(["endpoints"], (data) => {
      const endpoints = data.endpoints || [];
      if (!endpoints.includes(message.url)) {
        endpoints.push(message.url);
        chrome.storage.local.set({ endpoints }, () => {
          sendResponse({ status: "success" });
        });
      }
    });
    return true; // Keep message channel open for async response
  } else if (message.action === "fetchResponse") {
    fetchEndpoint(message.url, sendResponse);
    return true; // Keep message channel open for async response
  }
});

// Fetch API response
async function fetchEndpoint(url, sendResponse) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json, application/xml" }
    });
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType.includes("json")) {
      data = await response.json();
    } else if (contentType.includes("xml")) {
      const text = await response.text();
      data = new DOMParser().parseFromString(text, "application/xml");
    } else {
      throw new Error("Unsupported response type");
    }
    sendResponse({ status: "success", data, contentType });
  } catch (error) {
    sendResponse({ status: "error", error: error.message });
  }
}

// Basic URL validation
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
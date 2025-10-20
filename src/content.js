// Detect API URLs on right-click
document.addEventListener("contextmenu", (event) => {
  const target = event.target.closest("a");
  let url = null;
  if (target && target.href && target.href.includes("/api/")) {
    url = target.href;
  } else if (window.getSelection().toString()) {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.includes("/api/") && isValidUrl(selectedText)) {
      url = selectedText;
    }
  }
  if (url) {
    chrome.runtime.sendMessage({
      action: "saveUrl",
      url
    });
  }
});

// Basic URL validation
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
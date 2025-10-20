// Load saved domain patterns on page load
chrome.storage.local.get('domains', function(data) {
  document.getElementById('domains').value = (data.domains || []).join('\n');
});

// Save button click handler
document.getElementById('save').addEventListener('click', function() {
  const domainsText = document.getElementById('domains').value;
  const domains = domainsText.split('\n').map(d => d.trim()).filter(d => d);
  
  // Validate regex patterns, allowing '*' as a special case
  const invalidPatterns = domains.filter(pattern => {
    if (pattern === '*') return false; // '*' is valid
    try {
      new RegExp(pattern);
      return false;
    } catch (e) {
      return true;
    }
  });

  if (invalidPatterns.length > 0) {
    const status = document.getElementById('status');
    status.textContent = `Invalid regex patterns: ${invalidPatterns.join(', ')}`;
    status.style.color = 'red';
    setTimeout(() => { status.textContent = ''; status.style.color = ''; }, 3000);
    return;
  }

  chrome.storage.local.set({ domains: domains }, function() {
    const status = document.getElementById('status');
    status.textContent = domains.includes('*') 
      ? 'Patterns saved! "*" will show all tabs.' 
      : 'Regex patterns saved!';
    status.style.color = 'green';
    setTimeout(() => { status.textContent = ''; status.style.color = ''; }, 2000);
  });
});
chrome.action.onClicked.addListener((tab) => {
  const url = tab.url || '';

  if (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('chrome-search://') ||
    url.startsWith('about:') ||
    url === ''
  ) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'log',
      level: 'warn',
      message: '🚫 Voice Assistant cannot run on this page.'
    });
    return;
  }

  chrome.tabs.sendMessage(tab.id, { action: 'show-ui' }, () => {
    if (chrome.runtime.lastError) {
      // chrome.tabs.sendMessage(tab.id, {
      //   action: 'log',
      //   level: 'warn',
      //   message: `[Voice Assistant] No content script detected on this page: ${chrome.runtime.lastError.message}`
      // });
    }
  });
});

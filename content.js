let recognition;
let isListening = false;
let silenceTimeout = null;
let interimTranscript = '';
let finalized = false;

let shadowRoot = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'show-ui') {
    initVoiceUI();
  }

  if (msg.action === 'log') {
    const level = msg.level || 'log';
    if (console[level]) {
      console[level](msg.message);
    } else {
      console.log(msg.message);
    }
  }
});

function initVoiceUI() {
  if (document.getElementById('voice-assistant-container')) return;

  sessionStorage.setItem('voiceAssistantActive', 'true');

  const container = document.createElement('div');
  container.id = 'voice-assistant-container';
  document.body.appendChild(container);

  shadowRoot = container.attachShadow({ mode: 'open' });

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('content.css');
  shadowRoot.appendChild(link);

  const containerInner = document.createElement('div');
  containerInner.className = 'voice-assistant-container';

  const closeBtn = document.createElement('span');
  closeBtn.textContent = '✕';
  closeBtn.title = 'Close';
  closeBtn.className = 'voice-assistant-close';
  closeBtn.onclick = removeVoiceUI;

  const button = document.createElement('button');
  button.id = 'voice-assistant-toggle';
  button.className = 'voice-assistant-button';
  button.textContent = 'Start Listening';

  const transcript = document.createElement('div');
  transcript.id = 'voice-assistant-transcript';
  transcript.className = 'voice-assistant-transcript';
  transcript.textContent = 'Ready when you are.';

  containerInner.appendChild(closeBtn);
  containerInner.appendChild(button);
  containerInner.appendChild(transcript);
  shadowRoot.appendChild(containerInner);

  button.onclick = toggleListening;
}

function toggleListening() {
  if (isListening) {
    stopListening();
  } else {
    startListening();
  }
}

function startListening() {
  if (isListening) return;

  isListening = true;
  finalized = false;
  sessionStorage.setItem('voiceAssistantListening', 'true');
  shadowRoot.getElementById('voice-assistant-toggle').textContent = 'Stop Listening';
  updateTranscriptUI('🎤 Listening…');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    finalized = false;
    console.log('🎤 Listening…');
  };

  recognition.onresult = (event) => {
    if (!isListening || finalized) return;

    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript.trim().toLowerCase();

    interimTranscript = transcript;
    updateTranscriptUI(interimTranscript);

    if (silenceTimeout) clearTimeout(silenceTimeout);

    silenceTimeout = setTimeout(() => {
      if (!isListening || !interimTranscript || finalized) return;

      finalized = true;

      console.log("✅ Finalized due to silence:", interimTranscript);

      processFinalPhrase(interimTranscript);

      interimTranscript = '';
      updateTranscriptUI('🎤 Listening…');

      recognition.stop();
    }, 1500);
  };

  recognition.onerror = (e) => {
    if (e.error === 'aborted') return;
    if (e.error === 'no-speech') {
      console.warn('⚠️ No speech detected, restarting...');
      recognition.stop();
      return;
    }
    if (e.error === 'not-allowed') {
      console.error('🚫 Microphone permission denied.');
      stopListening();
      return;
    }

    console.error('SpeechRecognition error:', e.error);
    stopListening();
  };

  recognition.onend = () => {
    console.log('🎤 Stopped listening.');
    if (isListening) {
      recognition.start();
    } else {
      updateTranscriptUI('Idle…');
    }
  };

  recognition.start();
}

function stopListening() {
  if (!isListening) return;

  isListening = false;
  sessionStorage.removeItem('voiceAssistantListening');
  if (recognition) recognition.stop();
  if (silenceTimeout) clearTimeout(silenceTimeout);
  interimTranscript = '';
  updateTranscriptUI('Idle…');
  const btn = shadowRoot.getElementById('voice-assistant-toggle');
  if (btn) btn.textContent = 'Start Listening';
}

function removeVoiceUI() {
  stopListening();
  sessionStorage.removeItem('voiceAssistantActive');
  const container = document.getElementById('voice-assistant-container');
  if (container) container.remove();
}

function updateTranscriptUI(text) {
  const div = shadowRoot.getElementById('voice-assistant-transcript');
  if (div) div.textContent = text;
}

function processFinalPhrase(phrase) {
  if (!isListening) return;

  interimTranscript = '';

  if (phrase.includes('thank you')) {
    stopListening();
    removeVoiceUI();
    console.log('Session ended by user.');
    return;
  }

  if (phrase.includes('clear')) {
    updateTranscriptUI('🎤 Listening…');
    return;
  }

  handleCommand(phrase);

  updateTranscriptUI('🎤 Listening…');
}

function handleCommand(command) {
  console.log('Processing command:', command);

  const normalize = str => (str || '').trim().toLowerCase().replace(/\s+/g, ' ');

  if (command.match(/(search for|type|in the search box|find)/)) {
    let query = '';

    if (command.includes('search for')) {
      query = command.split('search for')[1]?.trim();
    } else if (command.includes('type')) {
      query = command.split('type')[1]?.trim();
    } else if (command.includes('find')) {
      query = command.split('find')[1]?.trim();
    } else if (command.includes('in the search box')) {
      query = command.split('in the search box')[1]?.trim();
    }

    if (!query) {
      alert(`Could not extract search phrase.`);
      return;
    }

    const searchInput =
      document.querySelector('input[title="Search"]') ||
      document.querySelector('textarea[title="Search"]');

    if (searchInput) {
      searchInput.focus();
      searchInput.value = query;

      const inputEvent = new Event('input', { bubbles: true });
      searchInput.dispatchEvent(inputEvent);

      const keyEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter',
        which: 13,
        keyCode: 13
      });
      searchInput.dispatchEvent(keyEvent);

      const form = searchInput.closest('form');
      if (form) form.submit();

      console.log(`Searched in search box for: ${query}`);
    } else {
      alert(`Could not find a search box with title="Search".`);
    }

    return;
  }

  if (command.includes('go back')) {
    window.history.back();
    console.log(`⬅️ Navigated back`);
    return;
  }

  if (command.includes('close') || command.includes('close modal')) {
    const modalClose = [...document.querySelectorAll('[role="button"]')]
      .find(e => {
        const aria = normalize(e.getAttribute('aria-label'));
        return aria.includes('close');
      });

    if (modalClose) {
      modalClose.click();
      console.log(`✅ Closed modal or element`);
    } else {
      alert(`🚫 Could not find a modal close button.`);
    }
    return;
  }

  if (command.includes('click') || command.includes('go to')) {
    const target = normalize(command.replace(/(click( on)?|go to)/, ''));

    const candidates = [
      ...document.querySelectorAll('a, button, [role="button"]')
    ];

    const el = candidates.find(e => {
      const texts = [
        normalize(e.innerText),
        normalize(e.getAttribute('aria-label')),
        normalize(e.getAttribute('title')),
        ...Array.from(e.querySelectorAll('*')).map(child =>
          normalize(child.textContent))
      ];
      return texts.some(t => t.includes(target));
    });

    if (el) {
      el.click();
      console.log(`✅ Clicked on / navigated to: ${target}`);
      return;
    } else {
      alert(`🚫 Could not find anything to click/go to: "${target}"`);
      return;
    }
  }

  if (command.match(/scroll/) && command.match(/down|bottom|lower|all the way down|to the bottom/)) {
    if (command.includes('all the way') || command.includes('to the bottom')) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      console.log(`Scrolled to the bottom.`);
    } else {
      window.scrollBy({ top: 500, behavior: 'smooth' });
      console.log(`Scrolled down.`);
    }
    return;
  }

  if (command.match(/scroll/) && command.match(/up|top|higher|all the way up|to the top/)) {
    if (command.includes('all the way') || command.includes('to the top')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log(`Scrolled to the top.`);
    } else {
      window.scrollBy({ top: -500, behavior: 'smooth' });
      console.log(`Scrolled up.`);
    }
    return;
  }

  alert(`🚫 Command not recognized: "${command}"`);
}

if (sessionStorage.getItem('voiceAssistantActive') === 'true') {
  initVoiceUI();
  if (sessionStorage.getItem('voiceAssistantListening') === 'true') {
    startListening();
  }
}

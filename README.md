# 🗣️ Chrome Voice Assistant

A minimalist, open-source Chrome Extension that lets you navigate **Google.com** and other websites with your voice.  
Built with the Web Speech API and Manifest V3, it’s designed to be fast, intuitive, and easy to extend.

---

## 🚀 Features
✅ Navigate Google search results hands-free  
✅ Basic commands for scrolling and clicking on most websites  
✅ Minimal UI with a circular microphone button  
✅ Works directly in the browser — no extra software

---

## 📖 How to Install

Until it’s published on the Chrome Web Store, you can load it manually:

1️⃣ Download or clone this repository:
```bash
git clone https://github.com/your-username/chrome-voice-assistant.git
```

2️⃣ Open Chrome, and go to:  
`chrome://extensions/`

3️⃣ Enable **Developer mode** (top right).

4️⃣ Click **Load unpacked**, and select the `chrome-voice-assistant` folder.

5️⃣ Pin the extension to your toolbar (optional).

---

## 🎤 How to Use

- Click the voice assistant icon in your browser toolbar.
- Allow microphone permission if prompted.
- Speak a command — the assistant listens and performs the action.

---

## 🗂️ Supported Commands

### 🧭 On Google (Search-focused)
| Command Example | What it does |
|-----------------|---------------|
| `search for cats` | Types “cats” in the search box and submits |
| `type cars` | Types “cars” in the search box and submits |
| `find dogs` | Same as above |
| `in the search box flowers` | Same as above |

---

### 🌐 Navigation & Actions (All websites)
| Command Example | What it does |
|-----------------|---------------|
| `go back` | Navigates one page back in browser history |
| `close` or `close modal` | Finds and clicks a close button (modal/dialog) |
| `click home` or `go to contact` | Clicks a link, button, or element that matches the word |
| `scroll down` | Scrolls down a bit |
| `scroll to the bottom` or `all the way down` | Scrolls to the bottom of the page |
| `scroll up` | Scrolls up a bit |
| `scroll to the top` or `all the way up` | Scrolls to the top of the page |

---

### 🛑 Session Control
| Command Example | What it does |
|-----------------|---------------|
| `thank you` | Stops listening and closes the UI |
| `clear` | Clears the transcript but keeps listening |

---

## 👥 Contributing
This project is open to contributions!

- Fork this repository
- Create your feature branch (`git checkout -b feature/YourFeature`)
- Commit your changes (`git commit -m 'Add some feature'`)
- Push to the branch (`git push origin feature/YourFeature`)
- Open a Pull Request

---

## 📎 Links
📂 [Download or Clone the Repo](https://github.com/your-username/chrome-voice-assistant)  
🛠️ [Chrome Extensions Guide](https://developer.chrome.com/docs/extensions/)  

When it’s ready to publish, we can also add a **Chrome Web Store link here**.

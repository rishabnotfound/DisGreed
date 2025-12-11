// Simple emoji replacer (no hardcoded emoji list)
const emojiURL = "https://unpkg.com/emoji.json@13.1.0/emoji.json";
let emojiMap = null;

// load shortcode → codepoint mapping once
async function loadEmojiMap() {
  if (emojiMap) return emojiMap;

  const res = await fetch(emojiURL);
  const data = await res.json();

  emojiMap = {};
  for (const e of data) {
    if (!e.short_names) continue;
    for (const s of e.short_names) {
      emojiMap[s] = e.unified.toLowerCase();
    }
  }
  return emojiMap;
}

// main function: replace tokens inside an element
async function replaceEmojis(el) {
  if (!el || !el.innerHTML) return;

  await loadEmojiMap();

  el.innerHTML = el.innerHTML
    // Discord custom emoji: <:name:id> or <a:name:id>
    .replace(/<a?:([a-zA-Z0-9_]+):(\d+)>/g, (m, name, id) => {
      const gif = m.startsWith("<a:");
      const ext = gif ? "gif" : "png";
      return `<img src="https://cdn.discordapp.com/emojis/${id}.${ext}" class="emoji">`;
    })
    // Shortcodes: :sob:
    .replace(/:([a-zA-Z0-9_+\-]+):/g, (m, shortcode) => {
      const cp = emojiMap[shortcode];
      if (!cp) return m;
      return `<img src="https://twemoji.maxcdn.com/v/latest/svg/${cp}.svg" class="emoji">`;
    });
}

// Style
const style = document.createElement("style");
style.innerHTML = `.emoji{width:1em;height:1em;vertical-align:-0.2em;display:inline-block;}`;
document.head.appendChild(style);

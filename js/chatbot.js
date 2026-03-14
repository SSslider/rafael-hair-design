class SalonChatbot {
    constructor() {
        this.kb = {};
        this.isOpen = false;
        this.init();
    }

    async init() {
        // Load Knowledge Base
        try {
            const [profile, services, pricing, faq, contact] = await Promise.all([
                fetch('content/business-profile.he.json').then(r => r.json()).catch(() => ({})),
                fetch('content/services.he.json').then(r => r.json()).catch(() => ({ categories: [] })),
                fetch('content/pricing.he.json').then(r => r.json()).catch(() => ({ items: [] })),
                fetch('content/faq.he.md').then(r => r.text()).catch(() => ""),
                fetch('content/contact.he.json').then(r => r.json()).catch(() => ({}))
            ]);
            this.kb = { profile, services, pricing, faq, contact };
            this.renderUI();
            this.addGreeting();
        } catch (e) {
            console.error('Failed to load KB for chatbot', e);
        }
    }

    renderUI() {
        const chatContainer = document.createElement('div');
        chatContainer.id = 'salon-chatbot';
        chatContainer.innerHTML = `
      <style>
        #salon-chatbot {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 10000;
          font-family: inherit;
          direction: rtl;
        }
        .chat-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: var(--color-primary-dark, #1A1A1A);
          color: white;
          border: none;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s;
        }
        .chat-toggle:hover { transform: scale(1.05); }
        .chat-window {
          display: none;
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 350px;
          height: 500px;
          max-height: 80vh;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          flex-direction: column;
          overflow: hidden;
        }
        .chat-window.open { display: flex; }
        .chat-header {
          background-color: var(--color-accent-gold, #C5A880);
          color: white;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
        }
        .chat-header button { background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem; }
        .chat-messages {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .msg { max-width: 80%; padding: 10px 14px; border-radius: 14px; font-size: 0.95rem; line-height: 1.4; }
        .msg.bot { background-color: var(--color-primary-light, #FAFAF8); align-self: flex-start; border-bottom-right-radius: 4px; border: 1px solid var(--color-border,#EAEAEA); }
        .msg.user { background-color: var(--color-primary-dark, #1A1A1A); color: white; align-self: flex-end; border-bottom-left-radius: 4px; }
        .chat-input {
          display: flex;
          border-top: 1px solid var(--color-border, #EAEAEA);
        }
        .chat-input input {
          flex: 1;
          padding: 15px;
          border: none;
          outline: none;
          font-size: 1rem;
        }
        .chat-input button {
          background: none;
          border: none;
          padding: 0 15px;
          color: var(--color-accent-gold, #C5A880);
          font-weight: 600;
          cursor: pointer;
        }
        .chat-suggestions {
          padding: 10px 15px;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .suggestion-chip {
          background: var(--color-accent-beige, #E6DFD3);
          border: none;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 0.85rem;
          cursor: pointer;
          color: var(--color-primary-dark);
        }
        @media (max-width: 400px) {
          .chat-window { width: calc(100vw - 40px); }
        }
      </style>
      <button class="chat-toggle" aria-label="פתח צ'אט">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </button>
      <div class="chat-window">
        <div class="chat-header">
          <span>רפאל - עוזר וירטואלי</span>
          <button class="close-chat">&times;</button>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-suggestions" id="chat-suggestions"></div>
        <form class="chat-input" id="chat-form">
          <input type="text" placeholder="ספר/י לי במה אפשר לעזור..." required>
          <button type="submit">שלח</button>
        </form>
      </div>
    `;
        document.body.appendChild(chatContainer);

        this.toggleBtn = chatContainer.querySelector('.chat-toggle');
        this.closeBtn = chatContainer.querySelector('.close-chat');
        this.window = chatContainer.querySelector('.chat-window');
        this.msgContainer = chatContainer.querySelector('#chat-messages');
        this.form = chatContainer.querySelector('#chat-form');
        this.input = chatContainer.querySelector('input');
        this.suggestionsContainer = chatContainer.querySelector('#chat-suggestions');

        this.toggleBtn.addEventListener('click', () => this.toggle());
        this.closeBtn.addEventListener('click', () => this.toggle());
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = this.input.value.trim();
            if (text) {
                this.addUserMessage(text);
                this.input.value = '';
                this.handleQuery(text);
            }
        });

        this.setSuggestions(['מה המחירים?', 'שעות פתיחה', 'איך קובעים תור?']);
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.window.classList.toggle('open', this.isOpen);
    }

    addMessage(text, isUser = false) {
        const div = document.createElement('div');
        div.className = `msg ${isUser ? 'user' : 'bot'}`;
        // simple linkify
        const htmlText = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:var(--color-accent-gold);">$1</a>');
        div.innerHTML = htmlText;
        this.msgContainer.appendChild(div);
        this.msgContainer.scrollTop = this.msgContainer.scrollHeight;
    }

    addUserMessage(text) {
        this.addMessage(text, true);
    }

    addGreeting() {
        this.addMessage(`שלום! אני העוזר הוירטואלי של המספרה הבוטיק "${this.kb.profile.brandName || 'רפאל'}". איך אפשר לעזור לך היום?`);
    }

    setSuggestions(list) {
        this.suggestionsContainer.innerHTML = '';
        list.forEach(txt => {
            const b = document.createElement('button');
            b.className = 'suggestion-chip';
            b.textContent = txt;
            b.onclick = () => {
                this.addUserMessage(txt);
                this.handleQuery(txt);
            };
            this.suggestionsContainer.appendChild(b);
        });
    }

    handleQuery(query) {
        this.suggestionsContainer.innerHTML = ''; // basic clear
        query = query.toLowerCase();

        setTimeout(() => {
            if (query.includes('מחיר') || query.includes('כמה עולה') || query.includes('מחירון')) {
                let res = "הנה חלק מההערכות שלנו:\n";
                this.kb.pricing.items.slice(0, 5).forEach(item => {
                    res += `- ${item.service}: ${item.estimatedPrice}<br>`;
                });
                res += "<br>למחירון המלא ולקביעת תור, מומלץ ליצור קשר בוואטסאפ: " + (this.kb.contact.whatsapp || '');
                this.addMessage(res);
                this.setSuggestions(['איך קובעים תור?', 'מה השירותים שלכם?']);
            } else if (query.includes('שעות') || query.includes('פתוח') || query.includes('מתי')) {
                let hrs = this.kb.contact.openingHours;
                let res = `שעות הפעילות שלנו:<br>א'-ה': ${hrs.sunday_thursday}<br>ו': ${hrs.friday}<br>שבת: ${hrs.saturday}`;
                this.addMessage(res);
            } else if (query.includes('תור') || query.includes('קביעת') || query.includes('לקבוע')) {
                this.addMessage(`לקביעת תור, הדרך המהירה ביותר היא דרך הוואטסאפ שלנו: ${this.kb.contact.whatsapp}<br>או בטלפון: ${this.kb.contact.phone}`);
            } else if (query.includes('שירות') || query.includes('מה אתם עושים')) {
                let res = "השירותים העיקריים שלנו כוללים:<br>";
                this.kb.services.categories.forEach(cat => {
                    res += `- <b>${cat.name}</b><br>`;
                });
                res += "לעוד פרטים על שירות ספציפי, אפשר לשאול אותי!";
                this.addMessage(res);
                this.setSuggestions(['החלקות', 'תספורת נשים', 'כלות']);
            } else if (query.includes('החלקה') || query.includes('החלקות')) {
                if (this.kb.faq.includes('החלקה')) {
                    this.addMessage("אנחנו מתמחים בהחלקות איכותיות ובטוחות לפי אישור משרד הבריאות. מומלץ לקבוע פגישת ייעוץ קצרה לאבחון השיער.");
                } else {
                    this.addMessage("ניתן לקבל פרטים נוספים על החלקות בוואטסאפ.");
                }
            } else if (query.includes('כלות') || query.includes('כלה')) {
                this.addMessage("מזל טוב! חבילת כלה כוללת ייעוץ, תסרוקת ניסיון וליווי ביום האירוע. אנו ממליצים לתאם מראש כדי שנוכל לשריין לך את היום הקסום.");
            } else {
                this.addMessage(`על מנת לקבל תשובה מדויקת, אשמח שתצרו איתנו קשר ישירות בוואטסאפ: ${this.kb.contact.whatsapp} או בטלפון: ${this.kb.contact.phone}`);
                this.setSuggestions(['מחירון', 'איך מגיעים?']);
            }
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SalonChatbot();
});

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  AudioLines,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  MapPin,
  Mic,
  Send,
  ShieldCheck,
  Sparkles,
  Waves,
  X,
} from "lucide-react";
import "./AlexaPlusDemo.css";

const DEMO_ISSUES = [
  {
    id: "RN-1042",
    title: "Pothole on Hazratganj main road",
    category: "Roads & infrastructure",
    location: "Hazratganj, Lucknow",
    status: "In progress",
    priority: "High",
    updated: "Updated 2 hours ago",
    summary: "A damaged road surface reported near the crossing. The demo workflow shows it as assigned for inspection.",
  },
  {
    id: "RN-1038",
    title: "Water leaking from a public pipeline",
    category: "Water & sanitation",
    location: "Gomti Nagar, Lucknow",
    status: "Under review",
    priority: "High",
    updated: "Updated yesterday",
    summary: "A possible pipeline leak needs verification by the responsible civic team.",
  },
  {
    id: "RN-1029",
    title: "Overflowing community waste bin",
    category: "Waste management",
    location: "Aliganj, Lucknow",
    status: "Resolved",
    priority: "Medium",
    updated: "Closed 3 days ago",
    summary: "The waste collection issue is marked resolved in this sample record.",
  },
];

const STARTER_PROMPTS = [
  "Show urgent civic issues",
  "What's the status of the pothole?",
  "Summarize the community reports",
  "How can I report a new issue?",
];

const makeMessage = (role, text, issues = []) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  text,
  issues,
});

function answerFor(prompt) {
  const query = prompt.toLowerCase();

  if (/help|what can you do|commands/.test(query)) {
    return {
      text: "I can help you explore civic reports, check a sample issue's status, highlight urgent problems, summarize the demo feed, or guide you through reporting a new issue. Try one of the suggested prompts below.",
    };
  }

  if (/report|submit|new issue|create/.test(query)) {
    return {
      text: "You can report an issue in ResolveNet by adding a clear description, a location, and a photo if available. This Alexa+ style demo does not submit anything to your account or database yet. Open the main ResolveNet app to create a real report.",
    };
  }

  if (/urgent|priority|high priority|critical|important/.test(query)) {
    const urgent = DEMO_ISSUES.filter((issue) => issue.priority === "High" && issue.status !== "Resolved");
    return {
      text: `I found ${urgent.length} high-priority sample reports that are not marked resolved. These are illustrative demo records, not live reports from your area.`,
      issues: urgent,
    };
  }

  if (/summary|summari[sz]e|overview|all reports|community reports/.test(query)) {
    return {
      text: "Here's a quick overview of the sample feed: road infrastructure and water issues need attention, while the waste collection report is marked resolved. In a production version, this summary would be generated from the reports available to your account.",
      issues: DEMO_ISSUES,
    };
  }

  if (/near|around|nearby|location|hazratganj|gomti nagar|aliganj/.test(query)) {
    const matches = DEMO_ISSUES.filter((issue) =>
      [issue.location, issue.title, issue.category].some((value) => value.toLowerCase().includes(query.replace(/.*(?:near|around|nearby|in|at)\s+/, "").trim()))
    );
    return {
      text: "I can show the locations attached to these sample reports. Location matching is limited to the included demo records; this does not use your GPS or fetch live nearby reports.",
      issues: matches.length ? matches : DEMO_ISSUES,
    };
  }

  if (/status|progress|track|pothole|water leak|pipeline|waste bin|rn-\\d+|tell me more|details/.test(query)) {
    let issue = DEMO_ISSUES.find((item) => {
      const words = [item.title, item.id, item.category].join(" ").toLowerCase();
      return words.split(/[^a-z0-9-]+/).some((word) => word.length > 3 && query.includes(word));
    });
    if (!issue && /pothole|road/.test(query)) issue = DEMO_ISSUES[0];
    if (!issue && /water|leak|pipeline/.test(query)) issue = DEMO_ISSUES[1];
    if (!issue && /waste|bin|garbage/.test(query)) issue = DEMO_ISSUES[2];
    return {
      text: issue
        ? `The sample record ${issue.id} is currently marked “${issue.status}.” ${issue.summary}`
        : "I couldn't identify a specific sample report from that request. Try asking about the pothole, water leak, or waste bin.",
      issues: issue ? [issue] : [],
    };
  }

  return {
    text: "I can help with civic issue status, urgent reports, a short feed summary, and reporting guidance. Try “Show urgent civic issues” or “What's the status of the pothole?”",
  };
}

function IssueCard({ issue, onSelect }) {
  const resolved = issue.status === "Resolved";

  return (
    <button className="alexa-issue-card" onClick={() => onSelect(issue)} type="button">
      <span className={`alexa-issue-icon ${resolved ? "is-resolved" : ""}`}>
        {resolved ? <CheckCircle2 size={18} /> : <MapPin size={18} />}
      </span>
      <span className="alexa-issue-copy">
        <span className="alexa-issue-meta">{issue.id} · {issue.category}</span>
        <strong>{issue.title}</strong>
        <span className="alexa-issue-location"><MapPin size={13} /> {issue.location}</span>
        <span className="alexa-issue-bottom">
          <span className={`alexa-status ${resolved ? "resolved" : issue.priority === "High" ? "high" : "review"}`}>
            {issue.status}
          </span>
          <span>{issue.updated}</span>
        </span>
      </span>
      <ChevronRight className="alexa-issue-chevron" size={18} />
    </button>
  );
}

export default function AlexaPlusDemo() {
  const [messages, setMessages] = useState([
    makeMessage(
      "assistant",
      "Hi, I'm the ResolveNet voice assistant demo. Ask me about civic reports, issue status, or urgent community needs. This is a simulated Alexa+ style experience using sample data."
    ),
  ]);
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const [activePrompt, setActivePrompt] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const sendMessage = (text = draft) => {
    const value = text.trim();
    if (!value) return;

    const userMessage = makeMessage("user", value);
    const answer = answerFor(value);
    const assistantMessage = makeMessage("assistant", answer.text, answer.issues || []);
    setMessages((current) => [...current, userMessage, assistantMessage]);
    setDraft("");
    setActivePrompt("");
    setVoiceMessage("");
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceMessage("Voice input isn't supported in this browser. Type a request below instead.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setListening(true);
      setVoiceMessage("Listening… speak your request.");
    };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setDraft(transcript);
      setVoiceMessage(transcript ? "Voice request captured. Review it, then send." : "I couldn't hear that. Please try again.");
      inputRef.current?.focus();
    };
    recognition.onerror = () => {
      setVoiceMessage("Voice input stopped. You can type your request instead.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleIssueSelect = (issue) => {
    sendMessage(`Tell me more about ${issue.id}`);
  };

  const resetChat = () => {
    setMessages([
      makeMessage(
        "assistant",
        "Hi, I'm the ResolveNet voice assistant demo. Ask me about civic reports, issue status, or urgent community needs. This is a simulated Alexa+ style experience using sample data."
      ),
    ]);
    setDraft("");
    setVoiceMessage("");
    setActivePrompt("");
  };

  return (
    <main className="alexa-demo-page">
      <div className="alexa-demo-shell">
        <header className="alexa-demo-topbar">
          <a className="alexa-brand" href="/" aria-label="ResolveNet home">
            <span className="alexa-brand-mark"><Waves size={20} /></span>
            <span>Resolve<span>Net</span></span>
          </a>
          <div className="alexa-topbar-actions">
            <span className="alexa-demo-badge"><span /> Prototype experience</span>
            <button className="alexa-icon-button" type="button" aria-label="How this demo works" onClick={() => setShowHelp((value) => !value)}>
              {showHelp ? <X size={18} /> : <CircleHelp size={18} />}
            </button>
          </div>
        </header>

        {showHelp && (
          <aside className="alexa-help-panel">
            <strong>About this prototype</strong>
            <p>This is a simulated, browser-based conversational experience. It uses local sample records and optional browser speech recognition. It is not connected to an Amazon Alexa+ service, live civic data, or your ResolveNet account.</p>
          </aside>
        )}

        <section className="alexa-demo-grid">
          <div className="alexa-intro-column">
            <div className="alexa-eyebrow"><Sparkles size={15} /> CONVERSATIONAL CIVIC ASSISTANT</div>
            <h1>Make community problem-solving feel <em>natural.</em></h1>
            <p className="alexa-intro-copy">
              Ask in everyday language. Explore sample civic reports, understand their status, and discover what needs attention.
            </p>

            <div className="alexa-assistant-visual" aria-hidden="true">
              <div className="alexa-orbit orbit-one" />
              <div className="alexa-orbit orbit-two" />
              <div className="alexa-orb">
                <AudioLines size={44} strokeWidth={1.4} />
              </div>
              <span className="alexa-floating-chip chip-one"><MapPin size={14} /> Local context</span>
              <span className="alexa-floating-chip chip-two"><ShieldCheck size={14} /> Transparent status</span>
              <span className="alexa-floating-chip chip-three"><Sparkles size={14} /> Simple answers</span>
            </div>

            <div className="alexa-principles">
              <div><span><CheckCircle2 size={16} /></span><p><strong>Plain-language requests</strong><small>Ask the way you naturally speak.</small></p></div>
              <div><span><ShieldCheck size={16} /></span><p><strong>Clear, honest responses</strong><small>Sample data is always identified.</small></p></div>
              <div><span><Clock3 size={16} /></span><p><strong>Faster issue discovery</strong><small>Find status and priorities in fewer steps.</small></p></div>
            </div>
          </div>

          <section className="alexa-chat-panel" aria-label="ResolveNet conversational demo">
            <div className="alexa-chat-header">
              <div className="alexa-chat-avatar"><Bot size={21} /></div>
              <div className="alexa-chat-title">
                <strong>ResolveNet Assistant</strong>
                <span><span className="alexa-online-dot" /> Ready to help · demo mode</span>
              </div>
              <button className="alexa-reset-button" onClick={resetChat} type="button" title="Reset conversation">Reset</button>
            </div>

            <div className="alexa-demo-notice">
              <span><ShieldCheck size={16} /></span>
              <p><strong>Demo mode</strong> — responses use illustrative sample reports, not live civic data.</p>
            </div>

            <div className="alexa-messages" aria-live="polite">
              {messages.map((message) => (
                <div className={`alexa-message-row ${message.role}`} key={message.id}>
                  {message.role === "assistant" && <span className="alexa-message-avatar"><Bot size={16} /></span>}
                  <div className="alexa-message-content">
                    <p className="alexa-message-bubble">{message.text}</p>
                    {message.issues?.length > 0 && (
                      <div className="alexa-issue-list">
                        {message.issues.map((issue) => <IssueCard key={issue.id} issue={issue} onSelect={handleIssueSelect} />)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {messages.length <= 1 && (
              <div className="alexa-prompt-area">
                <span className="alexa-prompt-label">TRY ASKING</span>
                <div className="alexa-prompt-chips">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className={activePrompt === prompt ? "active" : ""}
                      onClick={() => {
                        setActivePrompt(prompt);
                        sendMessage(prompt);
                      }}
                    >
                      {prompt}<ArrowUpRight size={14} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form
              className="alexa-composer"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
            >
              <button
                className={`alexa-mic-button ${listening ? "is-listening" : ""}`}
                type="button"
                onClick={startListening}
                aria-label={listening ? "Stop voice input" : "Start voice input"}
                title={listening ? "Stop listening" : "Use voice input"}
              >
                {listening ? <AudioLines size={19} /> : <Mic size={19} />}
              </button>
              <input
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about a civic issue…"
                aria-label="Ask the ResolveNet assistant"
                maxLength={500}
              />
              <button className="alexa-send-button" type="submit" disabled={!draft.trim()} aria-label="Send message">
                <Send size={17} />
              </button>
            </form>
            {voiceMessage && <p className="alexa-voice-feedback">{voiceMessage}</p>}
            <p className="alexa-chat-footnote">Prototype only · No reports are created or updated here.</p>
          </section>
        </section>

        <footer className="alexa-demo-footer">
          <span>ResolveNet · Civic collaboration, made more accessible</span>
          <a href="/">Back to ResolveNet <ArrowUpRight size={14} /></a>
        </footer>
      </div>
    </main>
  );
}

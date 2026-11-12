/* Project data for the portfolio.
   Edit this file to add, remove or reorder projects — both pages read from it.

   Fields
   id        unique slug (used in the URL hash, e.g. gallery.html#moodscape)
   title     project name
   year      year of the most recent work
   status    "Live" | "In development" | "Research" | "Shipped" | "Archive"
   tags      filter categories: ai, games, web3, trading, research, web
   stack     technologies shown as chips
   summary   one or two sentences for the card
   details   array of paragraphs/bullets for the detail view
   art       generative thumbnail motif (see art.js) — or set `image` instead
   image     optional path to a real screenshot (used for the tile)
   shots     optional [[path, caption], ...] shown in the detail panel
   repo      public repo URL, or null for private work
   live      live demo URL, or null
   featured  true to show on the home page
*/
window.PROJECTS = [
  {
    id: "moodscape",
    title: "Moodscape",
    year: 2026,
    status: "Live",
    tags: ["ai", "web"],
    stack: ["WebGPU", "ONNX", "MediaPipe", "Python", "Android", "JavaScript"],
    summary:
      "A phone app that reads your face and paints a landscape to match, with an image model running entirely on the phone. Its sequel, the Mirror, is a live painting that evolves toward whatever you react to.",
    details: [
      "Front camera to MediaPipe Face Landmarker (52 blendshapes, about 25 fps, on-device) to a mood of joy, surprise, anger, sadness and calm, calibrated to your resting face.",
      "Paints with a one-step SDXS diffusion model on WebGPU. Every prompt is pre-encoded as a CLIP embedding, so no text encoder ships to the phone and moods blend smoothly by adding embeddings.",
      "Learns your taste without retraining: a ridge-regression reward model steers six style directions per mood, and a bandit returns to the layouts you respond to.",
      "The Mirror streams a continuously repainted scene from a laptop GPU. Every few seconds it changes one part of the painting, reads the next second and a half of your face, and keeps the change or undoes it.",
      "It reads expression, an emotion model and your pulse from skin colour (rPPG), scores each against your own normal, and learns per person with Thompson sampling. It recognises each viewer only if they opt in.",
      "Two editions: Bliss keeps what you light up at; Unease keeps whatever makes you squirm while you keep watching. Paintings are combined from a space of about 6.3 quadrillion prompts.",
      "Ships with a one-click Windows setup, an Android app that finds the laptop on Wi-Fi by itself or through a private relay away from home, and 60 fps blended playback.",
    ],
    image: "img/moodscape.webp",
    shots: [
      ["img/moodscape.webp", "Demo mode, cycling through the moods with the live sketch painter"],
      ["img/moodscape-intro.webp", "Moodscape's start screen"],
      ["img/moodscape-mirror.webp", "The Mirror's start screen"],
    ],
    art: "landscape",
    repo: "https://github.com/TheMrRaGe/moodscape",
    live: "https://themrrage.github.io/moodscape/",
    featured: true,
  },
  {
    id: "horror",
    title: "Untitled Psychological Horror",
    year: 2026,
    status: "In development",
    tags: ["games", "ai"],
    stack: ["Unity", "C#", "Blender", "FL Studio", "VR"],
    summary:
      "A roguelite psychological horror game where the house, the dreams and a shape-shifting monster adapt to how afraid you actually are.",
    details: [
      "You inherit your grandparents' old house and live out ~20-minute in-game days of hands-on chores while hauntings and hallucinations escalate.",
      "Night dream sequences are procedural mazes of shifting rooms with lore scattered through them, built on the Moodscape tech, with Left 4 Dead–style chase waves and hiding spots.",
      "The antagonist — \"the Boggart Thing\" — transforms smoothly and organically, even while you watch, drawing its anatomy from common fears.",
      "Planned fear inputs include facial expression, smartwatch heart rate and a VR-playable version.",
    ],
    art: "maze",
    repo: null,
    live: null,
    featured: true,
  },
  {
    id: "flybrain",
    title: "flybrain",
    year: 2026,
    status: "Research",
    tags: ["research", "ai"],
    stack: ["Python", "NumPy", "SciPy", "three.js"],
    summary:
      "A leaky integrate-and-fire simulation of the complete male fruit-fly CNS connectome — 162,517 neurons — wired up to drive a creature.",
    details: [
      "Built from the Janelia FlyEM / Google Research Male CNS Connectome v1.0 (CC-BY 4.0), using published parameters from Shiu et al. 2024.",
      "Wrote a connectome-mirroring step that rebuilds connections seen on only one hemisphere, taking left/right synaptic symmetry from 1.097 to 1.0001.",
      "Event-driven rewrite verified spike-for-spike against the dense path: 4.1× faster overall.",
      "Steering decoded from identified descending neurons with a 30-trial protocol (d′ = 4.21, p = 3e-11). Every claim — and every retraction — is recorded in FINDINGS.md.",
    ],
    image: "img/flybrain-flybench.webp",
    shots: [
      ["img/flybrain-flybench.webp", "Flybench: the whole-brain fly given a body and an environment"],
      ["img/flybrain-flyroom.webp", "Flyroom: walking and flight driven by the connectome's descending neurons"],
    ],
    art: "neurons",
    repo: "https://github.com/TheMrRaGe/flybrain",
    live: null,
    featured: true,
  },
  {
    id: "verge",
    title: "The Verge",
    year: 2026,
    status: "In development",
    tags: ["games", "research"],
    stack: ["Python", "three.js", "Unity"],
    summary:
      "A survival-crafting sandbox where the NPCs are digital flies running the real connectome — a test of how a biological brain prioritises in a world it never evolved for.",
    details: [
      "Python owns the world and the brain in lockstep; three.js replays the recorded trajectories as a spectator view.",
      "Sims-style moods and interests sit on top of the simulated nervous system rather than replacing it.",
      "Doubles as the showcase for the flybrain research.",
    ],
    art: "swarm",
    repo: null,
    live: null,
    featured: false,
  },
  {
    id: "voidreaver",
    title: "Voidreaver",
    year: 2026,
    status: "In development",
    tags: ["trading", "web3"],
    stack: ["TypeScript", "Solana", "Helius", "Jupiter", "RugCheck"],
    summary:
      "A ~2,500-line TypeScript trading bot — originally a Solana token sniper and whale copy-trader — now being rebuilt as a spot trend-follower.",
    details: [
      "Integrates Helius Enhanced Transactions, RugCheck safety gating, Jupiter routing and a bonding-curve liquidity resolver for pre-graduation pump.fun tokens.",
      "Hardened over many debugging passes: real whale tracking replacing a stub, enforced rug/holder filters, ground-truth balance accounting in live mode, and honest liquidity in paper mode.",
      "Next version splits it into six cooperating agents — scanner, rug check, sizer, executor, logger and equity curve — on one shared screen.",
    ],
    art: "chart",
    repo: null,
    live: null,
    featured: true,
  },
  {
    id: "coven",
    title: "Coven & Cauldron",
    year: 2026,
    status: "In development",
    tags: ["games", "web3"],
    stack: ["TypeScript", "Telegram Mini Apps", "Android"],
    summary:
      "An occult-themed mobile idle game with prestige, a tarot system and lunar-phase gating.",
    details: [
      "Full implementation-ready design spec.",
      "Targets both Telegram Mini Apps and Google Play from one codebase, sharing backend modules with The Vault.",
    ],
    art: "moon",
    repo: null,
    live: null,
    featured: true,
  },
  {
    id: "vault",
    title: "The Vault",
    year: 2026,
    status: "In development",
    tags: ["games"],
    stack: ["TypeScript", "Telegram Mini Apps", "Android"],
    summary:
      "A trading-card-collector idle game with a grading minigame and a simulated card market.",
    details: [
      "Pull packs, grade your hits in a skill-based minigame, and trade against a simulated market.",
      "Shares its backend with Coven & Cauldron; targets Telegram Mini Apps and Google Play.",
    ],
    art: "cards",
    repo: null,
    live: null,
    featured: true,
  },
  {
    id: "degen-mode",
    title: "Degen Mode",
    year: 2025,
    status: "Research",
    tags: ["trading", "ai"],
    stack: ["Node.js", "JavaScript"],
    summary:
      "A research trading bot that analyses Bitcoin market conditions and adjusts its own risk parameters from what it learns.",
    details: [
      "Runs historical and technical-indicator analysis without user input, then applies research confidence to position risk.",
      "Logs every trade as training data for later machine-learning passes.",
    ],
    art: "candles",
    repo: "https://github.com/TheMrRaGe/degen-mode-ai-research",
    live: null,
    featured: false,
  },
  {
    id: "trading-expert",
    title: "Trading Expert",
    year: 2025,
    status: "Archive",
    tags: ["trading", "ai", "web"],
    stack: ["Next.js", "Vercel AI SDK", "TypeScript"],
    summary:
      "An AI research and trade-automation platform with a multi-strategy plugin system and chat-driven workflows.",
    details: [
      "Deep market-data research with transparent activity logs, so every automated decision can be traced.",
    ],
    art: "grid",
    repo: null,
    live: null,
    featured: false,
  },
  {
    id: "fiat-to-spl",
    title: "Fiat-to-SPL Onramp",
    year: 2025,
    status: "Archive",
    tags: ["web3", "web"],
    stack: ["Stripe", "Solana", "Raydium", "React"],
    summary:
      "A card-to-Solana-token purchase flow: Stripe payments, Raydium swaps and wallet connect in one checkout.",
    details: ["Includes real-time price feeds and a KYC flow."],
    art: "flow",
    repo: null,
    live: null,
    featured: false,
  },
  {
    id: "omnibot",
    title: "Omnibot",
    year: 2025,
    status: "Archive",
    tags: ["web3", "web"],
    stack: ["Next.js", "Telegram", "X API"],
    summary:
      "DeFi community tooling: real-time analytics, Telegram and X bots, and a Next.js dashboard with a rewards token.",
    details: [],
    art: "orbit",
    repo: null,
    live: null,
    featured: false,
  },
  {
    id: "bpkc",
    title: "Bored Pitty Kennel Club",
    year: 2024,
    status: "Shipped",
    tags: ["web3", "web", "trading"],
    stack: ["React", "Solana", "Netlify"],
    summary:
      "Site for $PITTY, a Solana community token whose utility was trading bots, tools and an NFT collection.",
    details: [
      "React single-page site with animated hero, utility, NFT carousel, team and FAQ sections, deployed on Netlify.",
      "Links out to Dexscreener, Magic Eden and Tensor for the token and the collection.",
    ],
    image: "img/bpkc.webp",
    shots: [
      ["img/bpkc.webp", "The landing page"],
      ["img/bpkc-values.webp", "The collection and the project's values"],
    ],
    art: "dots",
    repo: "https://github.com/TheMrRaGe/BPKC",
    live: null,
    featured: false,
  },
  {
    id: "pd-avatars",
    title: "Project Dudes Avatars",
    year: 2023,
    status: "Archive",
    tags: ["web3"],
    stack: ["Solidity", "Truffle", "The Graph"],
    summary:
      "NFT avatar contracts with a Truffle deployment setup and a subgraph for indexing ownership.",
    details: [],
    art: "dots",
    repo: "https://github.com/TheMrRaGe/PD-Avatars",
    live: null,
    featured: false,
  },
  {
    id: "erc20-reflection",
    title: "Reflection Token",
    year: 2022,
    status: "Archive",
    tags: ["web3"],
    stack: ["Solidity", "EVM"],
    summary:
      "An ERC-20 token contract with holder reflections and automatic liquidity.",
    details: [],
    art: "rings",
    repo: "https://github.com/TheMrRaGe/erc20-reflection-autoliquidity",
    live: null,
    featured: false,
  },
  {
    id: "web3-snakes",
    title: "Web3 Snakes",
    year: 2022,
    status: "Archive",
    tags: ["games", "web3"],
    stack: ["Solidity", "React"],
    summary:
      "A team-built on-chain take on Snake, with smart contracts and a React front end.",
    details: [],
    art: "snake",
    repo: "https://github.com/TheMrRaGe/web3-snakes",
    live: null,
    featured: false,
  },
  {
    id: "unity-pong",
    title: "Unity Pong",
    year: 2022,
    status: "Archive",
    tags: ["games"],
    stack: ["Unity", "C#"],
    summary: "A Pong clone in Unity — the first stop on the way to the horror game.",
    details: [],
    art: "pong",
    repo: "https://github.com/TheMrRaGe/unity-pong",
    live: null,
    featured: false,
  },
];

window.PROFILE = {
  name: "Heath Dale",
  handle: "TheMrRaGe",
  role: "Independent software developer",
  blurb:
    "I build things across AI, games and Web3 — on-device image models, a fruit-fly brain simulation, trading systems and mobile games — and I've taken contract work across a wide range of fields along the way.",
  github: "https://github.com/TheMrRaGe",
  email: "", // add a public contact email here to show a mail button
  skills: [
    ["Languages", "TypeScript · JavaScript · Solidity · Python · C#"],
    ["Front end", "React · Next.js · WebGPU · three.js · PWAs"],
    ["Chains", "Solana · Ethereum · BNB Smart Chain"],
    ["Games", "Unity · Blender · Telegram Mini Apps · Android"],
    ["AI / ML", "ONNX · on-device diffusion · MediaPipe · spiking neural sims"],
  ],
};

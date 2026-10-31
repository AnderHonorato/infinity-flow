export type HeroId = "kael" | "lyra" | "ragnar";
export type Upgrade = "power" | "vitality" | "arcane";
export type GameStatus = "camp" | "fighting" | "resting" | "victory";
export const STAGE_COUNT = 12;
export const MINIBOSS_STAGES = [4, 8];
export interface Game {
  version: 1;
  hero: HeroId;
  started: boolean;
  level: number;
  xp: number;
  gold: number;
  gems: number;
  stage: number;
  cycle: number;
  enemyHp: number;
  hp: number;
  turns: number;
  kills: number;
  upgrades: Record<Upgrade, number>;
  relic: boolean;
  status: GameStatus;
  worldUnlocked: boolean;
  lastSaved: number;
  lastEvent: string;
  skillReadyAt: number;
  auto: boolean;
}
export const HEROES = [
  {
    id: "kael" as const,
    name: "Kael",
    title: "A lâmina do crepúsculo",
    role: "Espadachim",
    element: "Sombra",
    color: "#85c8ac",
    attack: 38,
    health: 520,
    speed: "1,0 s",
    description: "Entre a luz e a escuridão, sua lâmina encontra o caminho.",
    skill: "Corte espectral",
    skillDescription: "Uma lâmina de energia que causa 5× seu dano.",
    trait: "Equilibrado",
    sheet: 0,
  },
  {
    id: "lyra" as const,
    name: "Astra",
    title: "A voz das estrelas",
    role: "Arcanista",
    element: "Arcano",
    color: "#c1a0e4",
    attack: 46,
    health: 380,
    speed: "1,0 s",
    description: "O universo sussurra. Ela transforma o silêncio em poder.",
    skill: "Nova astral",
    skillDescription: "Uma explosão arcana que causa 5× seu dano.",
    trait: "Dano elevado",
    sheet: 1,
  },
  {
    id: "ragnar" as const,
    name: "Nix",
    title: "A fúria da montanha",
    role: "Guardião",
    element: "Fogo",
    color: "#daa16c",
    attack: 32,
    health: 740,
    speed: "1,0 s",
    description: "Forjado nas chamas. Inabalável diante do impossível.",
    skill: "Ruptura ígnea",
    skillDescription: "Um impacto flamejante que causa 5× seu dano.",
    trait: "Alta resistência",
    sheet: 2,
  },
];
export const UPGRADES = {
  power: {
    name: "Força do infinito",
    description: "+18% de dano por melhoria",
    base: 120,
  },
  vitality: {
    name: "Essência vital",
    description: "+25% de vida por melhoria",
    base: 100,
  },
  arcane: {
    name: "Despertar arcano",
    description: "+35% de dano da habilidade",
    base: 160,
  },
};
export function enemyFor(stage: number, cycle: number) {
  const boss = stage === STAGE_COUNT;
  const mini = MINIBOSS_STAGES.includes(stage);
  const names = [
    "Broto corrompido",
    "Sentinela de raízes",
    "Espreitador de musgo",
    "Ancião dos espinhos",
    "Ceifador silvestre",
    "Devorador de seiva",
    "Arauto dos ecos",
    "Guardião das ruínas",
    "Coração retorcido",
    "Arauto umbral",
    "Guardião do limiar",
    "Vor’Kal, Olho do Abismo",
  ];
  return {
    name: names[stage - 1] || names[0],
    race: "Umbral",
    kind: boss ? "boss" : mini ? "mini" : "normal",
    maxHp: Math.round(
      (boss ? 1900 : mini ? 330 + stage * 25 : 110 + stage * 36) *
        (1 + cycle * 0.65),
    ),
    attack: Math.round(
      (boss ? 40 : mini ? 22 : 10 + stage * 2) * (1 + cycle * 0.3),
    ),
  };
}
export function createGame(now = Date.now()): Game {
  return {
    version: 1,
    hero: "kael",
    started: false,
    level: 1,
    xp: 0,
    gold: 1250,
    gems: 150,
    stage: 1,
    cycle: 0,
    enemyHp: enemyFor(1, 0).maxHp,
    hp: 520,
    turns: 0,
    kills: 0,
    upgrades: { power: 0, vitality: 0, arcane: 0 },
    relic: false,
    status: "camp",
    worldUnlocked: false,
    lastSaved: now,
    lastEvent: "",
    skillReadyAt: 0,
    auto: true,
  };
}
export const heroData = (g: Game) => HEROES.find((h) => h.id === g.hero)!;
export const heroDamage = (g: Game) =>
  Math.round(
    heroData(g).attack *
      (1 + (g.level - 1) * 0.15) *
      (1 + g.upgrades.power * 0.18) *
      (g.relic ? 1.2 : 1),
  );
export const maxHealth = (g: Game) =>
  Math.round(
    heroData(g).health *
      (1 + (g.level - 1) * 0.1) *
      (1 + g.upgrades.vitality * 0.25),
  );
export const xpRequired = (level: number) =>
  Math.round(80 * Math.pow(level, 1.3));
export const upgradeCost = (g: Game, id: Upgrade) =>
  Math.round(UPGRADES[id].base * Math.pow(1 + g.upgrades[id], 1.6));
export function startJourney(g: Game, now = Date.now()): Game {
  return {
    ...g,
    started: true,
    status: g.status === "victory" ? "victory" : "fighting",
    hp: maxHealth(g),
    lastSaved: now,
  };
}
function damageEnemy(g: Game, damage: number): Game {
  let next = {
    ...g,
    enemyHp: Math.max(0, g.enemyHp - damage),
    lastEvent: "attack",
  };
  if (next.enemyHp > 0) return next;
  const enemy = enemyFor(g.stage, g.cycle);
  const reward = Math.round(
    (enemy.kind === "boss"
      ? 800
      : enemy.kind === "mini"
        ? 180
        : 45 + g.stage * 9) *
      (1 + g.cycle * 0.5),
  );
  next = {
    ...next,
    gold: g.gold + reward,
    xp: g.xp + (enemy.kind === "boss" ? 180 : 40 + g.stage * 6),
    kills: g.kills + 1,
    lastEvent: "kill",
  };
  while (next.xp >= xpRequired(next.level)) {
    next.xp -= xpRequired(next.level);
    next.level++;
    next.hp = maxHealth(next);
    next.lastEvent = "level";
  }
  if (g.stage === STAGE_COUNT)
    return {
      ...next,
      status: "victory",
      worldUnlocked: true,
      lastEvent: "boss",
      gems: g.gems + 50,
    };
  return {
    ...next,
    stage: g.stage + 1,
    enemyHp: enemyFor(g.stage + 1, g.cycle).maxHp,
  };
}
export function stepCombat(g: Game): Game {
  if (g.status === "resting")
    return { ...g, hp: maxHealth(g), status: "fighting", lastEvent: "revived" };
  if (g.status !== "fighting") return g;
  let next = { ...g, turns: g.turns + 1 };
  if (g.auto) next = damageEnemy(next, heroDamage(g));
  if (next.status === "victory") return next;
  const boss = next.stage === STAGE_COUNT;
  const struck = next.turns % (boss ? 2 : 3) === 0;
  if (struck) {
    const damage = enemyFor(next.stage, next.cycle).attack;
    next = {
      ...next,
      hp: Math.max(0, next.hp - damage),
      lastEvent: boss
        ? next.turns % 4 === 0
          ? "laser"
          : "quake"
        : next.lastEvent,
    };
  }
  if (next.hp === 0)
    next = { ...next, status: "resting", lastEvent: "resting" };
  return next;
}
export function tapAttack(g: Game): Game {
  return g.status === "fighting"
    ? damageEnemy(g, Math.max(4, Math.round(heroDamage(g) * 0.45)))
    : g;
}
export function useSkill(g: Game, now = Date.now()): Game {
  if (g.status !== "fighting" || now < g.skillReadyAt) return g;
  return {
    ...damageEnemy(
      g,
      Math.round(heroDamage(g) * 5 * (1 + g.upgrades.arcane * 0.35)),
    ),
    skillReadyAt: now + 12000,
  };
}
export function buyUpgrade(g: Game, id: Upgrade): Game {
  const cost = upgradeCost(g, id);
  if (g.gold < cost) return g;
  const next = {
    ...g,
    gold: g.gold - cost,
    upgrades: { ...g.upgrades, [id]: g.upgrades[id] + 1 },
  };
  return {
    ...next,
    hp: Math.min(maxHealth(next), next.hp + (maxHealth(next) - maxHealth(g))),
  };
}
export function buyRelic(g: Game): Game {
  return g.relic || g.gems < 100
    ? g
    : { ...g, relic: true, gems: g.gems - 100 };
}
export function continueJourney(g: Game): Game {
  if (g.status !== "victory") return g;
  const cycle = g.cycle + 1;
  return {
    ...g,
    stage: 1,
    cycle,
    enemyHp: enemyFor(1, cycle).maxHp,
    hp: maxHealth(g),
    status: "fighting",
    lastEvent: "",
  };
}
export function offlineProgress(g: Game, now = Date.now()) {
  const seconds = Math.min(
    8 * 3600,
    Math.max(0, Math.floor((now - g.lastSaved) / 1000)),
  );
  let next = { ...g };
  if (g.started && (g.status === "fighting" || g.status === "resting"))
    for (let i = 0; i < seconds; i++) next = stepCombat(next);
  let xp = next.xp - g.xp;
  for (let level = g.level; level < next.level; level++)
    xp += xpRequired(level);
  return {
    game: { ...next, lastSaved: Math.max(now, g.lastSaved) },
    gold: next.gold - g.gold,
    xp,
    seconds,
    kills: next.kills - g.kills,
  };
}
function migrateLegacyGame(legacy: Record<string, unknown>, now: number): Game {
  const count = (value: unknown, fallback = 0) =>
    typeof value === "number" && Number.isFinite(value)
      ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(value)))
      : fallback;
  const values = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const improvements = values(legacy.melhorias),
    skills = values(legacy.poderes);
  const started = legacy.iniciado === true;
  const selected = started ? legacy.heroi : (legacy.escolhido ?? legacy.heroi);
  const hero: HeroId =
    selected === "nix" ? "ragnar" : selected === "kael" ? "kael" : "lyra";
  const wave = Math.max(1, count(legacy.onda, 1));
  const unlocked = legacy.concluido === true || wave > STAGE_COUNT;
  const infiniteWave = wave > STAGE_COUNT ? wave - STAGE_COUNT - 1 : 0;
  let game: Game = {
    ...createGame(now),
    hero,
    started,
    gold: count(legacy.ouro, 15),
    gems: count(legacy.essencia),
    level: Math.max(1, count(legacy.nivel, 1)),
    xp: count(legacy.xp),
    kills: count(legacy.abates),
    stage: unlocked ? (infiniteWave % STAGE_COUNT) + 1 : wave,
    cycle: unlocked ? Math.floor(infiniteWave / STAGE_COUNT) + 1 : 0,
    worldUnlocked: unlocked,
    status: started ? "fighting" : "camp",
    auto: legacy.pausado !== true,
    lastSaved: count(legacy.ultimoRegistro, now),
    upgrades: {
      power: count(count(improvements.arma) + count(improvements.ritmo)),
      vitality: count(improvements.armadura),
      arcane: count(
        count(improvements.magia) +
          count(skills.rajada) +
          count(skills.escudo) +
          count(skills.cometa),
      ),
    },
  };
  while (game.xp >= xpRequired(game.level)) {
    game.xp -= xpRequired(game.level);
    game.level++;
  }
  game = {
    ...game,
    hp: maxHealth(game),
    enemyHp: enemyFor(game.stage, game.cycle).maxHp,
  };
  return game;
}
export function restoreGame(raw: string | null, now = Date.now()): Game {
  try {
    if (!raw) return createGame(now);
    const parsed = JSON.parse(raw);
    const g = (
      parsed?.versao === 1 ? migrateLegacyGame(parsed, now) : parsed
    ) as Game;
    if (
      g.version !== 1 ||
      !HEROES.some((h) => h.id === g.hero) ||
      !["camp", "fighting", "resting", "victory"].includes(g.status) ||
      typeof g.started !== "boolean" ||
      typeof g.auto !== "boolean" ||
      typeof g.worldUnlocked !== "boolean" ||
      typeof g.relic !== "boolean" ||
      typeof g.lastEvent !== "string"
    )
      return createGame(now);
    const ints = [
      g.level,
      g.xp,
      g.gold,
      g.gems,
      g.stage,
      g.cycle,
      g.enemyHp,
      g.hp,
      g.turns,
      g.kills,
      g.lastSaved,
      g.skillReadyAt,
      ...Object.values(g.upgrades || {}),
    ];
    if (
      ints.length !== 15 ||
      ints.some((n) => !Number.isSafeInteger(n) || n < 0) ||
      g.level < 1 ||
      g.stage < 1 ||
      g.stage > STAGE_COUNT ||
      !g.upgrades ||
      !["power", "vitality", "arcane"].every(
        (k) => typeof g.upgrades[k as Upgrade] === "number",
      )
    )
      return createGame(now);
    if (
      g.xp >= xpRequired(g.level) ||
      g.hp > maxHealth(g) ||
      g.enemyHp > enemyFor(g.stage, g.cycle).maxHp ||
      (g.enemyHp === 0 && g.status !== "victory") ||
      (g.status === "victory" &&
        (g.stage !== STAGE_COUNT || g.enemyHp !== 0 || !g.worldUnlocked))
    )
      return createGame(now);
    return g;
  } catch {
    return createGame(now);
  }
}
export function formatNumber(n: number) {
  return new Intl.NumberFormat(
    "pt-BR",
    n > 999999
      ? { notation: "compact", maximumFractionDigits: 1 }
      : { maximumFractionDigits: 0 },
  ).format(n);
}

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  stepCombat,
  enemyFor,
  buyUpgrade,
  restoreGame,
  offlineProgress,
  startJourney,
  continueJourney,
  heroDamage,
  xpRequired,
  maxHealth,
  useSkill,
  tapAttack,
  buyRelic,
  HEROES,
} from "../src/game";

test("combate automático causa dano e derrotar concede experiência e ouro", () => {
  let game = startJourney(createGame(1000), 1000);
  const damage = heroDamage(game);
  assert.equal(stepCombat(game).enemyHp, game.enemyHp - damage);
  game = { ...game, enemyHp: 1 };
  const next = stepCombat(game);
  assert.equal(next.stage, 2);
  assert.ok(next.gold > game.gold);
  assert.ok(next.xp > game.xp || next.level > game.level);
});
test("Capítulo I mantém doze encontros, minichefes4/8 e raça Umbral", () => {
  assert.equal(enemyFor(4, 0).kind, "mini");
  assert.equal(enemyFor(8, 0).kind, "mini");
  assert.equal(enemyFor(12, 0).kind, "boss");
  assert.equal(enemyFor(2, 0).race, "Umbral");
  assert.equal(enemyFor(12, 0).name, "Vor’Kal, Olho do Abismo");
  assert.deepEqual(
    HEROES.map((hero) => hero.name),
    ["Kael", "Astra", "Nix"],
  );
});
test("vencer o colosso libera a próxima região sem pular a animação da vitória", () => {
  const g = { ...startJourney(createGame()), stage: 12, enemyHp: 1 };
  const won = stepCombat(g);
  assert.equal(won.status, "victory");
  assert.equal(won.worldUnlocked, true);
  assert.equal(stepCombat(won).stage, 12);
  assert.equal(continueJourney(won).cycle, 1);
  assert.equal(continueJourney(won).stage, 1);
});
test("compra consome ouro uma vez e saldo insuficiente não compra", () => {
  const g = createGame();
  const upgraded = buyUpgrade(g, "power");
  assert.ok(upgraded.gold < g.gold);
  assert.equal(upgraded.upgrades.power, 1);
  const poor = { ...g, gold: 0 };
  assert.deepEqual(buyUpgrade(poor, "power"), poor);
});
test("offline avança batalha, limita em oito horas e não duplica recompensas", () => {
  const g = startJourney(createGame(1000), 1000);
  const result = offlineProgress(g, 31000);
  assert.ok(result.gold > 0);
  assert.ok(result.game.stage > 1 || result.game.status === "victory");
  assert.equal(offlineProgress(result.game, 31000).gold, 0);
  assert.equal(offlineProgress(g, 1000 + 20 * 3600000).seconds, 8 * 3600);
  assert.equal(offlineProgress(g, 0).seconds, 0);
});
test("dados corrompidos ou adulterados são recuperados de forma segura", () => {
  assert.equal(restoreGame("{broken", 123).level, 1);
  assert.equal(restoreGame('{"version":1,"level":-5}', 123).level, 1);
  const game = buyUpgrade(
    { ...createGame(123), level: 5, gold: 3456 },
    "power",
  );
  assert.deepEqual(restoreGame(JSON.stringify(game), 123), game);
});
test("relatório offline inclui a experiência usada para subir de nível", () => {
  const game = { ...startJourney(createGame(1000), 1000), xp: 70, enemyHp: 1 };
  const result = offlineProgress(game, 2000);
  assert.equal(result.game.level, 2);
  assert.equal(result.xp, 46);
  assert.equal(result.game.xp, 70 + 46 - xpRequired(1));
});
test("restauração rejeita contadores fracionários, números inseguros e eventos inválidos", () => {
  const valid = createGame(123);
  const invalid = [
    { ...valid, cycle: 0.5 },
    { ...valid, gold: Number.MAX_VALUE },
    { ...valid, upgrades: { ...valid.upgrades, power: 0.5 } },
    { ...valid, lastEvent: { text: "invalid" } },
    { ...valid, hp: maxHealth(valid) + 1 },
    { ...valid, xp: xpRequired(valid.level) },
    { ...valid, enemyHp: 0 },
  ];
  for (const game of invalid)
    assert.deepEqual(restoreGame(JSON.stringify(game), 123), valid);
});
test("habilidade respeita recarga e recompensas do chefe não são repetidas", () => {
  const game = {
    ...startJourney(createGame(1000), 1000),
    stage: 12,
    enemyHp: 1,
  };
  const won = useSkill(game, 1000);
  assert.equal(won.status, "victory");
  assert.equal(won.gems, game.gems + 50);
  assert.equal(won.skillReadyAt, 13000);
  assert.deepEqual(useSkill(won, 13000), won);
  assert.deepEqual(tapAttack(won), won);
  const continued = continueJourney(won);
  assert.deepEqual(useSkill(continued, 12999), continued);
  assert.ok(useSkill(continued, 13000).enemyHp < continued.enemyHp);
});
test("morte recupera vida e melhorias e relíquia respeitam o saldo", () => {
  const game = { ...startJourney(createGame()), hp: 1, turns: 2, auto: false };
  const dead = stepCombat(game);
  assert.equal(dead.status, "resting");
  assert.equal(dead.hp, 0);
  assert.equal(stepCombat(dead).hp, maxHealth(game));
  assert.equal(stepCombat(dead).status, "fighting");
  const upgraded = buyUpgrade(game, "vitality");
  assert.equal(upgraded.hp - game.hp, maxHealth(upgraded) - maxHealth(game));
  const relic = buyRelic(game);
  assert.equal(relic.gems, game.gems - 100);
  assert.deepEqual(buyRelic(relic), relic);
  assert.deepEqual(buyRelic({ ...game, gems: 99 }), { ...game, gems: 99 });
});
test("save original em português preserva saldo, herói e evolução", () => {
  const original = {
    versao: 1,
    iniciado: true,
    heroi: "astra",
    escolhido: "nix",
    ouro: 9876,
    essencia: 7,
    nivel: 12,
    xp: 120,
    vida: 200,
    onda: 8,
    melhorias: { arma: 4, ritmo: 2, armadura: 3, magia: 1 },
    poderes: { rajada: 2, escudo: 1, cometa: 0 },
    concluido: false,
    abates: 34,
    ultimoRegistro: 1000,
    pausado: false,
  };
  const game = restoreGame(JSON.stringify(original), 1000);
  assert.equal(game.hero, "lyra");
  assert.equal(game.started, true);
  assert.equal(game.gold, original.ouro);
  assert.equal(game.gems, original.essencia);
  assert.equal(game.level, 12);
  assert.equal(game.xp, original.xp);
  assert.equal(game.kills, 34);
  assert.equal(game.stage, 8);
  assert.deepEqual(game.upgrades, { power: 6, vitality: 3, arcane: 4 });
  assert.deepEqual(restoreGame(JSON.stringify(game), 1000), game);
  const infinite = restoreGame(
    JSON.stringify({ ...original, heroi: "nix", onda: 27, concluido: true }),
    1000,
  );
  assert.equal(infinite.hero, "ragnar");
  assert.equal(infinite.worldUnlocked, true);
  assert.equal(infinite.cycle, 2);
  assert.equal(infinite.stage, 3);
  assert.equal(
    restoreGame(JSON.stringify({ ...original, heroi: "kael" }), 1000).hero,
    "kael",
  );
});
test("migração converte XP excedente e usa escolha antes da jornada", () => {
  const game = restoreGame(
    JSON.stringify({
      versao: 1,
      iniciado: false,
      heroi: "astra",
      escolhido: "nix",
      ouro: 0,
      essencia: 0,
      nivel: 1,
      xp: 100,
      onda: 1,
      ultimoRegistro: 1000,
    }),
    1000,
  );
  assert.equal(game.hero, "ragnar");
  assert.equal(game.started, false);
  assert.equal(game.status, "camp");
  assert.equal(game.gold, 0);
  assert.equal(game.gems, 0);
  assert.equal(game.level, 2);
  assert.equal(game.xp, 20);
  assert.deepEqual(restoreGame(JSON.stringify(game), 1000), game);
});
test("vinte ciclos preservam evolução, recompensa e salvamento válidos", () => {
  let game = startJourney(createGame(1000), 1000);
  let previousGold = game.gold;
  for (let cycle = 0; cycle < 20; cycle++) {
    let ticks = 0;
    while (game.status !== "victory" && ticks++ < 10000)
      game = stepCombat(game);
    assert.equal(game.status, "victory");
    assert.equal(game.cycle, cycle);
    assert.equal(game.kills, (cycle + 1) * 12);
    assert.equal(game.gems, 150 + (cycle + 1) * 50);
    assert.ok(game.gold > previousGold);
    previousGold = game.gold;
    assert.ok(game.xp < xpRequired(game.level));
    assert.deepEqual(restoreGame(JSON.stringify(game), 1000), game);
    const next = continueJourney(game);
    assert.equal(next.cycle, cycle + 1);
    assert.equal(next.stage, 1);
    assert.ok(next.enemyHp > enemyFor(1, cycle).maxHp);
    game = next;
  }
  assert.ok(game.level > 10);
});

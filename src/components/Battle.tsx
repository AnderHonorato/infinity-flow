import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Crown,
  Heart,
  Infinity as InfinityIcon,
  Pause,
  Play,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";
import type { Game } from "../game";
import {
  MINIBOSS_STAGES,
  STAGE_COUNT,
  enemyFor,
  formatNumber,
  heroDamage,
  heroData,
  maxHealth,
  xpRequired,
} from "../game";
import { Coin, Gem, HeroArt } from "./ui";
import "./Battle.css";

type BattleProps = {
  game: Game;
  onTap: () => void;
  onSkill: () => void;
  onToggleAuto: () => void;
  onContinue: () => void;
  onBack: () => void;
};

export function Battle({
  game,
  onTap,
  onSkill,
  onToggleAuto,
  onContinue,
  onBack,
}: BattleProps) {
  const hero = heroData(game);
  const enemy = enemyFor(game.stage, game.cycle);
  const boss = enemy.kind === "boss";
  const health = maxHealth(game);
  const [now, setNow] = useState(Date.now());
  const [victoryVisible, setVictoryVisible] = useState(false);
  const [impact, setImpact] = useState({ id: 0, damage: 0, received: 0 });
  const previous = useRef({
    stage: game.stage,
    hp: game.hp,
    enemyHp: game.enemyHp,
  });
  const cooldown = Math.max(0, Math.ceil((game.skillReadyAt - now) / 1000));
  const fighting = game.status === "fighting";
  const eventKey = `${game.turns}-${game.lastEvent}`;

  useEffect(() => {
    setNow(Date.now());
    if (game.skillReadyAt <= Date.now()) return;
    const timer = window.setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (time >= game.skillReadyAt) window.clearInterval(timer);
    }, 200);
    return () => window.clearInterval(timer);
  }, [game.skillReadyAt]);

  useEffect(() => {
    const old = previous.current;
    const damage =
      old.stage === game.stage ? Math.max(0, old.enemyHp - game.enemyHp) : 0;
    const received = Math.max(0, old.hp - game.hp);
    if (damage || received)
      setImpact((p) => ({ id: p.id + 1, damage, received }));
    previous.current = {
      stage: game.stage,
      hp: game.hp,
      enemyHp: game.enemyHp,
    };
  }, [game.enemyHp, game.hp, game.stage]);

  useEffect(() => {
    setVictoryVisible(false);
    if (game.status !== "victory") return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = window.setTimeout(
      () => setVictoryVisible(true),
      reduced ? 150 : 1950,
    );
    return () => window.clearTimeout(timer);
  }, [game.status]);

  const eventLabel =
    game.status === "resting"
      ? "Recuperando suas forças…"
      : game.status === "victory"
        ? "Vor’Kal se curva diante de você."
        : game.lastEvent === "laser"
          ? "Raio do Abismo! A floresta estremece."
          : game.lastEvent === "quake"
            ? "Ruptura do chão! Mantenha sua posição."
            : game.lastEvent === "level"
              ? "Seu poder despertou. Novo nível alcançado!"
              : boss
                ? "O guardião final despertou."
                : game.auto
                  ? "Seu herói está lutando por você."
                  : "O próximo movimento é seu.";

  return (
    <section
      className="battle"
      aria-label="Combate na Floresta dos Ecos"
      style={{ "--battle-hero-color": hero.color } as CSSProperties}
    >
      <div className="battle-heading">
        <div>
          <div className="eyebrow">
            CAPÍTULO I <ChevronRight size={11} /> MUNDO 01
          </div>
          <h1>
            Floresta dos Ecos<span>Onde as sombras criam raízes.</span>
          </h1>
        </div>
        <button className="secondary-button battle-map-button" onClick={onBack}>
          <ArrowLeft size={15} /> Mapa do mundo
        </button>
      </div>

      <div className="battle-journey">
        <div className="battle-journey-label">
          <span>
            <span className="battle-live-dot" />
            {boss ? "CONFRONTO FINAL" : "EXPLORAÇÃO EM ANDAMENTO"}
          </span>
          <span>
            Etapa <strong>{String(game.stage).padStart(2, "0")}</strong>{" "}
            <span className="battle-dim">/ {STAGE_COUNT}</span>
          </span>
        </div>
        <ol className="battle-stages" aria-label="Progresso da região">
          {Array.from({ length: STAGE_COUNT }, (_, i) => (
            <li
              key={i}
              className={`${i + 1 < game.stage || game.status === "victory" ? "battle-stage-done" : ""} ${i + 1 === game.stage ? "battle-stage-current" : ""}`}
              aria-current={i + 1 === game.stage ? "step" : undefined}
              aria-label={`Etapa ${i + 1}${i + 1 < game.stage ? ", concluída" : ""}`}
            >
              <span>
                {i === STAGE_COUNT - 1 ? (
                  <Skull size={13} />
                ) : i + 1 < game.stage ? (
                  <Check size={11} />
                ) : (
                  <i />
                )}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div
        className={`battle-arena ${boss ? "battle-is-boss" : ""} ${game.status === "victory" ? "battle-victorious" : ""}`}
      >
        <div
          key={game.lastEvent === "quake" ? `ground-${eventKey}` : "ground"}
          className={`battle-scene ${game.lastEvent === "quake" && fighting ? "battle-scene-shake" : ""}`}
          aria-hidden="true"
        />
        <div className="battle-atmosphere" aria-hidden="true" />
        <div className="battle-scene-label">
          <span className="battle-area-icon">✧</span>
          <div>
            Ruínas Esquecidas
            <small>
              FLORESTA DOS ECOS ·{" "}
              {game.cycle > 0
                ? `CICLO ${game.cycle + 1}`
                : "NÍVEL RECOMENDADO 1–10"}
            </small>
          </div>
        </div>
        <div className="battle-enemy-info">
          <div>
            <span
              className={`battle-enemy-type ${boss ? "battle-enemy-type-boss" : ""}`}
            >
              {boss ? (
                <Crown size={12} />
              ) : enemy.kind === "mini" ? (
                <Skull size={12} />
              ) : (
                <Shield size={11} />
              )}
              {boss
                ? "CHEFE DE MUNDO"
                : enemy.kind === "mini"
                  ? "ELITE"
                  : "INIMIGO"}
            </span>
            <span className="battle-enemy-level">
              Nv. {game.stage + game.cycle * STAGE_COUNT}
            </span>
          </div>
          <h2>{enemy.name}</h2>
          <div
            className="battle-hp battle-enemy-hp"
            role="progressbar"
            aria-label={`Vida de ${enemy.name}`}
            aria-valuemin={0}
            aria-valuemax={enemy.maxHp}
            aria-valuenow={game.enemyHp}
          >
            <span
              style={{
                width: `${Math.max(0, (game.enemyHp / enemy.maxHp) * 100)}%`,
              }}
            />
          </div>
          <p>
            {formatNumber(game.enemyHp)}{" "}
            <span>/ {formatNumber(enemy.maxHp)}</span>
          </p>
        </div>

        <div
          className={`battle-hero ${impact.received ? "battle-hero-hit" : ""}`}
        >
          {game.level >= 5 && (
            <div className="battle-aura" aria-hidden="true" />
          )}
          {game.upgrades.vitality > 0 && (
            <div className="battle-vitality-shield" aria-hidden="true" />
          )}
          {game.upgrades.arcane > 0 && (
            <div className="battle-arcane-orbit" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          )}
          {game.level >= 10 && (
            <div
              className="battle-runic-crown"
              aria-label="Evolução: coroa rúnica"
            >
              ᛟ ♛ ᛟ
            </div>
          )}
          <div
            key={`hero-${impact.id}`}
            className={`battle-hero-motion ${impact.damage ? "battle-hero-attacking" : ""} ${impact.received ? "battle-hero-hurt" : ""} ${game.upgrades.power > 0 ? "battle-power-awakened" : ""}`}
          >
            <HeroArt id={game.hero} className="battle-hero-art" />
            {game.upgrades.power > 0 && (
              <span className="battle-power-rune" aria-hidden="true">
                ᚨ
              </span>
            )}
          </div>
          <div className="battle-actor-tag">
            <span>{hero.name}</span>
            <small>NV. {game.level}</small>
          </div>
          {impact.received > 0 && (
            <span
              key={`received-${impact.id}`}
              className="battle-damage battle-damage-received"
            >
              −{impact.received}
            </span>
          )}
        </div>
        <div
          className={`battle-enemy battle-enemy-${enemy.kind} ${game.stage === MINIBOSS_STAGES[1] ? "battle-enemy-crystal" : game.stage === MINIBOSS_STAGES[0] ? "battle-enemy-ancient" : ""}`}
          key={`enemy-${game.stage}`}
          aria-hidden="true"
        >
          <div className="battle-enemy-shadow" />
          {game.stage === MINIBOSS_STAGES[1] && (
            <div className="battle-crystal-spines">
              <i />
              <i />
              <i />
              <i />
            </div>
          )}
          <div
            key={`impact-${impact.id}`}
            className={impact.damage ? "battle-enemy-recoil" : ""}
          >
            <div
              className="battle-enemy-art"
              style={{
                backgroundPosition: `${boss ? 100 : enemy.kind === "mini" ? 50 : 0}% center`,
              }}
            />
          </div>
          {boss && <span className="battle-boss-eye" />}
        </div>
        {impact.damage > 0 && (
          <div
            key={`damage-${impact.id}`}
            className={`battle-damage battle-damage-dealt ${impact.damage >= heroDamage(game) * 3 ? "battle-critical" : ""}`}
            aria-hidden="true"
          >
            {impact.damage >= heroDamage(game) * 3 && <small>CRÍTICO</small>}
            {formatNumber(impact.damage)}
            <Sparkles size={13} />
          </div>
        )}
        {game.lastEvent === "laser" && fighting && (
          <div
            key={`laser-${eventKey}`}
            className="battle-laser"
            aria-hidden="true"
          />
        )}
        {game.lastEvent === "quake" && fighting && (
          <div
            key={`quake-${eventKey}`}
            className="battle-quake"
            aria-hidden="true"
          >
            <i />
            <i />
            <i />
            <i />
          </div>
        )}
        <div className="battle-foreground" aria-hidden="true" />
        <div className="battle-scene-bottom">
          <span className="battle-status">
            <span className={fighting ? "battle-live-dot" : ""} />
            {game.status === "victory"
              ? "REGIÃO CONCLUÍDA"
              : game.status === "resting"
                ? "RECUPERANDO"
                : "EM COMBATE"}
          </span>
          <span className="battle-combat-log" key={eventKey}>
            {eventLabel}
          </span>
          <span className="battle-weather">✦ Névoa ancestral</span>
        </div>

        {game.status === "resting" && (
          <div className="battle-resting" role="status">
            <Heart size={27} />
            <strong>Uma pausa para renascer</strong>
            <span>Sua jornada continua em instantes.</span>
          </div>
        )}
        {victoryVisible && (
          <div
            className="battle-victory"
            role="region"
            aria-label="Vitória sobre Vor’Kal"
          >
            <div className="battle-victory-card">
              <div className="battle-victory-emblem">
                <Trophy size={33} />
              </div>
              <span className="eyebrow">O INFINITO É APENAS O COMEÇO</span>
              <h2>Vor’Kal foi vencido.</h2>
              <p>
                A Floresta dos Ecos respira outra vez.
                <br />
                Um novo mundo espera por você.
              </p>
              <div className="battle-victory-rewards">
                <span>
                  <Coin /> +
                  {formatNumber(Math.round(800 * (1 + game.cycle * 0.5)))}
                </span>
                <span>
                  <Gem /> +50
                </span>
                <span>
                  <Sparkles size={16} /> +180 EXP
                </span>
              </div>
              <button className="primary-button" onClick={onContinue}>
                Continuar a jornada <ArrowRight size={16} />
              </button>
              <button className="battle-victory-map" onClick={onBack}>
                Explorar o mapa do mundo
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="battle-controls">
        <div className="battle-player">
          <HeroArt id={game.hero} className="battle-avatar" />
          <div className="battle-player-info">
            <div>
              <strong>{hero.name}</strong>
              <span>
                Nv. {game.level} {game.level >= 5 && <Sparkles size={11} />}
              </span>
            </div>
            <div
              className="battle-hp battle-player-hp"
              role="progressbar"
              aria-label="Sua vida"
              aria-valuemin={0}
              aria-valuemax={health}
              aria-valuenow={game.hp}
            >
              <span style={{ width: `${(game.hp / health) * 100}%` }} />
            </div>
            <small>
              <Heart size={10} /> {formatNumber(game.hp)} /{" "}
              {formatNumber(health)} <span>PV</span>
            </small>
          </div>
        </div>
        <div className="battle-action-group">
          <button
            className="battle-attack"
            onClick={onTap}
            disabled={!fighting}
          >
            <Swords size={20} />
            <span>
              Atacar<small>TOQUE PARA CAUSAR DANO</small>
            </span>
          </button>
          <button
            className={`battle-skill ${cooldown === 0 ? "battle-skill-ready" : ""}`}
            onClick={onSkill}
            disabled={!fighting || cooldown > 0}
            title={hero.skillDescription}
          >
            <span className="battle-skill-icon">
              <Zap size={23} />
              {cooldown > 0 && <b>{cooldown}s</b>}
            </span>
            <span>
              {hero.skill}
              <small>
                {cooldown > 0
                  ? `RECARREGANDO · ${cooldown}s`
                  : "HABILIDADE PRONTA · 5× DANO"}
              </small>
            </span>
            <span
              className="battle-skill-recharge"
              style={{
                transform: `scaleX(${Math.min(1, Math.max(0, 1 - (game.skillReadyAt - now) / 12000))})`,
              }}
            />
          </button>
        </div>
        <button
          className={`battle-auto ${game.auto ? "battle-auto-on" : ""}`}
          onClick={onToggleAuto}
          aria-pressed={game.auto}
          disabled={game.status === "victory"}
        >
          <span className="battle-auto-icon">
            {game.auto ? <InfinityIcon size={23} /> : <Play size={18} />}
          </span>
          <span>
            Automático<small>{game.auto ? "ATIVADO" : "DESATIVADO"}</small>
          </span>
          <span className="battle-toggle">
            <i />
          </span>
        </button>
      </div>
      <div className="battle-footer">
        <span>
          <Shield size={13} /> {hero.role} <i /> <Swords size={12} />{" "}
          {formatNumber(heroDamage(game))} de dano
        </span>
        <span>
          <Sparkles size={12} /> {formatNumber(game.xp)} /{" "}
          {formatNumber(xpRequired(game.level))} EXP{" "}
          <span className="battle-xp">
            <i
              style={{
                width: `${Math.min(100, (game.xp / xpRequired(game.level)) * 100)}%`,
              }}
            />
          </span>
        </span>
        <span>
          <Pause size={11} /> Progrida mesmo longe
        </span>
      </div>
    </section>
  );
}

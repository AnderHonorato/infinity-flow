import {
  Sword,
  Heart,
  Sparkles,
  ArrowUpRight,
  LockKeyhole,
  Check,
  Gem as GemIcon,
  Shield,
  Zap,
} from "lucide-react";
import {
  HEROES,
  UPGRADES,
  formatNumber,
  heroDamage,
  maxHealth,
  upgradeCost,
  xpRequired,
} from "../game";
import type { Game, Upgrade } from "../game";
import { Coin, Gem, HeroArt } from "./ui";
export function Skills({
  game,
  onBuy,
}: {
  game: Game;
  onBuy: (id: Upgrade) => void;
}) {
  const hero = HEROES.find((h) => h.id === game.hero)!;
  return (
    <section className="skills-page">
      <div className="section-heading">
        <div className="eyebrow">TRANSFORME POTENCIAL EM PODER</div>
        <h2>O despertar do infinito</h2>
        <p>Cada melhoria acompanha seu herói em todas as batalhas.</p>
      </div>
      <div className="power-overview">
        <HeroArt id={game.hero} />
        <div>
          <span className="eyebrow">
            {hero.role} · NÍVEL {game.level}
          </span>
          <h3>{hero.name}</h3>
          <div className="detail-stats">
            <span>
              <Sword size={17} />
              {formatNumber(heroDamage(game))} de dano
            </span>
            <span>
              <Shield size={17} />
              {formatNumber(maxHealth(game))} de vida
            </span>
          </div>
          <div className="xp-track">
            <i
              style={{ width: `${(game.xp / xpRequired(game.level)) * 100}%` }}
            />
          </div>
          <small>
            {game.xp} / {xpRequired(game.level)} EXP para o próximo nível
          </small>
        </div>
      </div>
      <div className="upgrade-grid">
        {(Object.entries(UPGRADES) as [Upgrade, typeof UPGRADES.power][]).map(
          ([id, u]) => {
            const Icon =
              id === "power" ? Sword : id === "vitality" ? Heart : Sparkles;
            const cost = upgradeCost(game, id);
            return (
              <article className={`upgrade-card upgrade-${id}`} key={id}>
                <div className="upgrade-icon">
                  <Icon size={29} />
                </div>
                <span className="level-tag">NÍVEL {game.upgrades[id]}</span>
                <h3>{u.name}</h3>
                <p>{u.description}</p>
                <div className="upgrade-effect">
                  <span>Melhoria atual</span>
                  <b>
                    +
                    {game.upgrades[id] *
                      (id === "power" ? 18 : id === "vitality" ? 25 : 35)}
                    %
                  </b>
                </div>
                <button
                  className="secondary-button"
                  disabled={game.gold < cost}
                  onClick={() => onBuy(id)}
                >
                  Melhorar{" "}
                  <span>
                    <Coin />
                    {formatNumber(cost)}
                  </span>
                </button>
                {game.gold < cost && (
                  <small className="insufficient">
                    Ouro insuficiente · continue batalhando
                  </small>
                )}
              </article>
            );
          },
        )}
      </div>
      <div className="skill-explainer">
        <Zap />
        <div>
          <h3>{hero.skill}</h3>
          <p>
            {hero.skillDescription}{" "}
            {game.upgrades.arcane > 0
              ? `Bônus arcano atual: +${game.upgrades.arcane * 35}%.`
              : ""}{" "}
            Recarrega a cada 12 segundos durante o combate.
          </p>
        </div>
      </div>
      <div className="evolution-panel">
        <div className="eyebrow">EVOLUÇÃO VISÍVEL</div>
        <h3>Seu poder muda. Seu herói também.</h3>
        <div className="evolution-stages">
          {[1, 5, 10].map((lvl, i) => (
            <div
              className={`evo-stage evo-${i} ${game.level >= lvl ? "unlocked" : ""}`}
              key={lvl}
            >
              <div className="evo-art">
                <HeroArt id={game.hero} />
                {game.level < lvl && <LockKeyhole size={20} />}
              </div>
              <span>NÍVEL {lvl}</span>
              <h4>{["Despertar", "Aura desperta", "Ascensão"][i]}</h4>
              <small>
                {
                  [
                    "Seu primeiro passo",
                    "Aura elemental e partículas",
                    "Coroa rúnica e energia elevada",
                  ][i]
                }
              </small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function Inventory({
  game,
  onRelic,
}: {
  game: Game;
  onRelic: () => void;
}) {
  return (
    <section>
      <div className="section-heading">
        <div className="eyebrow">TESOUROS DA SUA JORNADA</div>
        <h2>O que o infinito guarda</h2>
        <p>Relíquias permanentes para ir cada vez mais longe.</p>
      </div>
      <div className="inventory-grid">
        <article className="relic-card">
          <div className="relic-visual">
            <GemIcon size={76} strokeWidth={0.7} />
            <i />
          </div>
          <span className="eyebrow">RELÍQUIA · RARO</span>
          <h3>Fragmento do Infinito</h3>
          <p>
            Um eco do primeiro fluxo. Aumenta permanentemente seu dano em 20%.
          </p>
          <button
            className="primary-button"
            disabled={game.relic || game.gems < 100}
            onClick={onRelic}
          >
            {game.relic ? (
              <>
                <Check size={17} />
                Relíquia equipada
              </>
            ) : (
              <>
                Adquirir relíquia
                <span>
                  <Gem />
                  100
                </span>
              </>
            )}
          </button>
        </article>
        <article
          className={`relic-card boss-relic ${game.worldUnlocked ? "owned" : ""}`}
        >
          <div className="relic-visual">
            <div className="small-eye" />
          </div>
          <span className="eyebrow">TROFÉU · COLOSSAL</span>
          <h3>Olho adormecido</h3>
          <p>
            {game.worldUnlocked
              ? "O colosso caiu. Este troféu registra sua vitória sobre o Vor’Kal."
              : "Um fragmento do colosso da floresta. Conquiste o Vor’Kal para obtê-lo."}
          </p>
          <div className="locked-relic">
            {game.worldUnlocked ? (
              <>
                <Check size={16} /> Conquistado na floresta
              </>
            ) : (
              <>
                <LockKeyhole size={16} /> Derrote o colosso
              </>
            )}
          </div>
        </article>
      </div>
      <div className="inventory-summary">
        <div>
          <Coin size={25} />
          <span>
            Ouro acumulado<b>{formatNumber(game.gold)}</b>
          </span>
        </div>
        <div>
          <Gem size={25} />
          <span>
            Cristais arcanos<b>{formatNumber(game.gems)}</b>
          </span>
        </div>
        <div>
          <ArrowUpRight size={25} />
          <span>
            Inimigos derrotados<b>{formatNumber(game.kills)}</b>
          </span>
        </div>
      </div>
      <p className="selection-note">
        Todos os itens são conquistados jogando. Não há compras com dinheiro
        real.
      </p>
    </section>
  );
}

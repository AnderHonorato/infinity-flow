import { useState } from "react";
import {
  Check,
  Sword,
  Shield,
  Sparkles,
  ArrowUpRight,
  CircleHelp,
} from "lucide-react";
import { HEROES, heroDamage, maxHealth } from "../game";
import type { Game, HeroId } from "../game";
import { HeroArt, Modal } from "./ui";
const filters = ["Todos os heróis", "Espadachim", "Arcanista", "Guardião"];
export function HeroSelection({
  game,
  onSelect,
  full = false,
}: {
  game: Game;
  onSelect: (id: HeroId) => void;
  full?: boolean;
}) {
  const [filter, setFilter] = useState("Todos os heróis");
  const [detail, setDetail] = useState<HeroId | null>(null);
  const selected = HEROES.find((h) => h.id === detail);
  return (
    <section className={`hero-selection ${full ? "full-selection" : ""}`}>
      <div className="section-heading">
        <div>
          <div className="eyebrow">SEU PODER, SUA HISTÓRIA</div>
          <h2>
            Escolha seu herói<span className="count">03</span>
          </h2>
        </div>
        <span className="subtle desktop-label">
          Uma escolha. Infinitas possibilidades.
        </span>
      </div>
      <div className="hero-filters" role="group" aria-label="Filtrar heróis">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? "active" : ""}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="hero-grid">
        {HEROES.filter(
          (h) => filter === "Todos os heróis" || h.role === filter,
        ).map((h) => (
          <article
            className={`hero-card ${game.hero === h.id ? "selected" : ""} hero-${h.id}`}
            key={h.id}
            style={{ "--hero-color": h.color } as React.CSSProperties}
          >
            <button
              className="hero-select"
              onClick={() => onSelect(h.id)}
              aria-label={`Selecionar ${h.name}, ${h.role}`}
              aria-pressed={game.hero === h.id}
            >
              <HeroArt id={h.id} />
              <div className="portrait-shade" />
              <div className="hero-card-top">
                <span className="hero-class">
                  {h.id === "kael" ? (
                    <Sword size={12} />
                  ) : h.id === "lyra" ? (
                    <Sparkles size={12} />
                  ) : (
                    <Shield size={12} />
                  )}{" "}
                  {h.role}
                </span>
                {game.hero === h.id ? (
                  <span className="selected-check">
                    <Check size={13} />
                  </span>
                ) : (
                  <span className="available-dot" />
                )}
              </div>
              <div className="hero-card-info">
                <span className="hero-element">{h.element}</span>
                <h3>{h.name}</h3>
                <p>{h.title}</p>
                <div className="hero-stats">
                  <span>
                    <Sword size={13} />
                    <b>{h.attack}</b> <small>ATQ</small>
                  </span>
                  <span>
                    <Shield size={13} />
                    <b>{h.health}</b> <small>PV</small>
                  </span>
                  <span className="stat-trait">{h.trait}</span>
                </div>
              </div>
            </button>
            <div className="hero-card-footer">
              <span>
                {game.hero === h.id ? (
                  <>
                    <i />
                    Herói selecionado
                  </>
                ) : (
                  <>Disponível para jogar</>
                )}
              </span>
              <button
                onClick={() => setDetail(h.id)}
                aria-label={`Detalhes de ${h.name}`}
              >
                <ArrowUpRight size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="selection-note">
        <CircleHelp size={14} />
        <span>
          Você pode trocar de herói no acampamento a qualquer momento.
        </span>
      </div>
      {selected && (
        <Modal title={selected.name} onClose={() => setDetail(null)}>
          <div className="hero-detail-art">
            <HeroArt id={selected.id} />
            <div>
              <span className="eyebrow">
                {selected.role} · {selected.element}
              </span>
              <h3>{selected.title}</h3>
              <p>{selected.description}</p>
            </div>
          </div>
          <div className="detail-stats">
            <span>
              <Sword size={17} /> {heroDamage({ ...game, hero: selected.id })}{" "}
              de dano
            </span>
            <span>
              <Shield size={17} /> {maxHealth({ ...game, hero: selected.id })}{" "}
              de vida
            </span>
          </div>
          <h4>{selected.skill}</h4>
          <p>{selected.skillDescription}</p>
          <div className="evolution-row">
            <span>
              Nv. 1<br />
              <b>Despertar</b>
            </span>
            <span>
              Nv. 5<br />
              <b>Aura desperta</b>
            </span>
            <span>
              Nv. 10
              <br />
              <b>Ascensão</b>
            </span>
          </div>
          <button
            className="primary-button"
            onClick={() => {
              onSelect(selected.id);
              setDetail(null);
            }}
          >
            Escolher {selected.name}
            <Check size={17} />
          </button>
        </Modal>
      )}
    </section>
  );
}

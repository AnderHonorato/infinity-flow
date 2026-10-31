import {
  Flag,
  LockKeyhole,
  Skull,
  Swords,
  Trees,
  Mountain,
  Flame,
  Snowflake,
  ChevronRight,
  Check,
} from "lucide-react";
import { STAGE_COUNT, MINIBOSS_STAGES } from "../game";
import type { Game } from "../game";
export function WorldMap({
  game,
  onStart,
  onPreview,
}: {
  game: Game;
  onStart: () => void;
  onPreview: (text: string) => void;
}) {
  return (
    <section className="world-map">
      <div className="section-heading">
        <div className="eyebrow">CADA CAMINHO, UMA NOVA HISTÓRIA</div>
        <h2>Além do horizonte</h2>
        <p>Derrote os guardiões. Abra caminhos. Descubra o infinito.</p>
      </div>
      <div className="map-canvas">
        <div className="map-mist" />
        <svg
          className="map-connections"
          viewBox="0 0 900 620"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M130 510 C130 430 240 460 280 370 S400 330 445 240 M445 240 C450 160 600 160 655 95 M445 240 C520 300 660 280 730 350" />
          <path
            className="unlocked-path"
            d="M130 510 C130 430 240 460 280 370"
          />
        </svg>
        <button className="map-node start-node" onClick={onStart}>
          <span className="map-node-icon">
            <Flag />
          </span>
          <strong>Acampamento</strong>
          <small>Onde a lenda começa</small>
        </button>
        <button className="map-node forest-node" onClick={onStart}>
          <span className="node-ring" />
          <span className="map-node-icon">
            <Trees />
          </span>
          <span className="map-node-label">MUNDO 01</span>
          <strong>Floresta dos Ecos</strong>
          <small>
            {game.status === "victory"
              ? "Região conquistada"
              : `${game.started ? game.stage : 0} / ${STAGE_COUNT} encontros`}
          </small>
          <span className="node-action">
            {game.started ? "Continuar" : "Explorar"} <ChevronRight size={12} />
          </span>
        </button>
        <button
          className={`map-node mountain-node ${game.worldUnlocked ? "revealed" : ""}`}
          onClick={() =>
            onPreview(
              game.worldUnlocked
                ? "O caminho para os Picos de Cinza foi revelado! Esta será a próxima região a receber monstros e batalhas próprios. Continue evoluindo na Floresta dos Ecos."
                : "Derrote o Vor’Kal, Olho do Abismo na Floresta dos Ecos para revelar este caminho.",
            )
          }
        >
          <span className="map-node-icon">
            {game.worldUnlocked ? <Mountain /> : <LockKeyhole />}
          </span>
          <span className="map-node-label">MUNDO 02</span>
          <strong>
            {game.worldUnlocked ? "Picos de Cinza" : "Terras desconhecidas"}
          </strong>
          <small>
            {game.worldUnlocked
              ? "Revelado · em desenvolvimento"
              : "Vença o colosso para revelar"}
          </small>
        </button>
        <button
          className="map-node ember-node"
          onClick={() =>
            onPreview(
              "A Caldeira Eterna está planejada para uma próxima atualização. Primeiro, conquiste a Floresta dos Ecos.",
            )
          }
        >
          <span className="map-node-icon">
            <Flame />
          </span>
          <strong>Caldeira Eterna</strong>
          <small>
            <LockKeyhole size={11} /> Região futura
          </small>
        </button>
        <button
          className="map-node ice-node"
          onClick={() =>
            onPreview(
              "O Véu Glacial está planejado para uma próxima atualização. A árvore de caminhos crescerá a cada novo mundo.",
            )
          }
        >
          <span className="map-node-icon">
            <Snowflake />
          </span>
          <strong>Véu Glacial</strong>
          <small>
            <LockKeyhole size={11} /> Região futura
          </small>
        </button>
        <div className="map-legend">
          <span>
            <i className="green" />
            Disponível
          </span>
          <span>
            <i />
            Caminho a revelar
          </span>
        </div>
      </div>
      <div className="stage-road">
        <div className="section-heading">
          <h3>Floresta dos Ecos</h3>
          <span className="subtle">Ciclo {game.cycle + 1} · Raça Umbral</span>
        </div>
        <div className="stage-nodes">
          {Array.from({ length: STAGE_COUNT }, (_, i) => (
            <div
              className={`stage-dot ${i + 1 < game.stage || game.status === "victory" ? "done" : ""} ${i + 1 === game.stage ? "current" : ""}`}
              key={i}
            >
              <span>
                {i + 1 < game.stage || game.status === "victory" ? (
                  <Check size={16} />
                ) : i === STAGE_COUNT - 1 ? (
                  <Skull size={19} />
                ) : MINIBOSS_STAGES.includes(i + 1) ? (
                  <Swords size={17} />
                ) : (
                  i + 1
                )}
              </span>
              <small>
                {i === STAGE_COUNT - 1
                  ? "Colosso"
                  : MINIBOSS_STAGES.includes(i + 1)
                    ? "Minichefe"
                    : `${i + 1}`}
              </small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

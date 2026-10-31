import { useEffect, useRef, useState } from "react";
import {
  TentTree,
  Map,
  UsersRound,
  Sparkles,
  Backpack,
  Settings,
  CircleHelp,
  ChevronRight,
  ArrowRight,
  Swords,
  ShieldCheck,
  Infinity as InfinityIcon,
  Trees,
  Clock3,
  ChevronDown,
  Check,
  Bell,
  Menu,
  X,
  Sword,
  Flag,
  Skull,
  Download,
  Volume2,
  VolumeX,
  Cloud,
  Trophy,
  Leaf,
  Flame,
  Zap,
} from "lucide-react";
import {
  HEROES,
  buyUpgrade,
  buyRelic,
  continueJourney,
  formatNumber,
  maxHealth,
  startJourney,
  tapAttack,
  useSkill,
} from "./game";
import type { HeroId, Upgrade } from "./game";
import { useGame } from "./useGame";
import { HeroArt, Logo, Coin, Gem, Modal } from "./components/ui";
import { HeroSelection } from "./components/HeroSelection";
import { WorldMap } from "./components/WorldMap";
import { Skills, Inventory } from "./components/Progression";
import { Battle } from "./components/Battle";
import "./styles.css";

type Page = "camp" | "map" | "heroes" | "skills" | "inventory" | "battle";
const navigation = [
  { id: "camp", label: "Acampamento", icon: TentTree },
  { id: "map", label: "Mapa do mundo", icon: Map },
  { id: "heroes", label: "Heróis", icon: UsersRound },
  { id: "skills", label: "Habilidades", icon: Sparkles },
  { id: "inventory", label: "Inventário", icon: Backpack },
] as const;
const pageNames: Record<Page, string> = {
  camp: "Acampamento",
  map: "Mapa do mundo",
  heroes: "Seus heróis",
  skills: "Habilidades",
  inventory: "Inventário",
  battle: "Floresta dos Ecos",
};
function readSetting(key: string, fallback: boolean) {
  try {
    return localStorage.getItem(key) === null
      ? fallback
      : localStorage.getItem(key) === "true";
  } catch {
    return fallback;
  }
}
export default function App() {
  const { game, setGame, report, closeReport, saveError } = useGame();
  const [page, setPage] = useState<Page>("camp");
  const [mobileNav, setMobileNav] = useState(false);
  const [modal, setModal] = useState<
    "help" | "settings" | "achievements" | "currency" | null
  >(null);
  const [info, setInfo] = useState("");
  const [toast, setToast] = useState("");
  const [sound, setSound] = useState(() => readSetting("if-sound", false));
  const [motion, setMotion] = useState(() => readSetting("if-motion", true));
  const [online, setOnline] = useState(navigator.onLine);
  const [installEvent, setInstallEvent] = useState<
    (Event & { prompt: () => Promise<void> }) | null
  >(null);
  const audio = useRef<AudioContext | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const hero = HEROES.find((h) => h.id === game.hero)!;
  useEffect(() => {
    try {
      localStorage.setItem("if-sound", String(sound));
      localStorage.setItem("if-motion", String(motion));
    } catch {
      /* Storage unavailable: preferences remain in memory. */
    }
  }, [sound, motion]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    const install = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as Event & { prompt: () => Promise<void> });
    };
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    window.addEventListener("beforeinstallprompt", install);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      window.removeEventListener("beforeinstallprompt", install);
    };
  }, []);
  function tone() {
    if (!sound) return;
    try {
      audio.current ??= new AudioContext();
      const context = audio.current;
      void context.resume();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        880,
        context.currentTime + 0.12,
      );
      gain.gain.setValueAtTime(0.025, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start();
      osc.stop(context.currentTime + 0.2);
    } catch {
      /* Sound is optional. */
    }
  }
  function navigate(p: Page) {
    setPage(p);
    setMobileNav(false);
    tone();
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function selectHero(id: HeroId) {
    setGame((g) => {
      const next = { ...g, hero: id };
      return { ...next, hp: maxHealth(next) };
    });
    tone();
    setToast(
      `${HEROES.find((h) => h.id === id)!.name} está pronto para a jornada.`,
    );
  }
  function begin() {
    if (!game.started) setGame((g) => startJourney(g));
    navigate("battle");
  }
  function upgrade(id: Upgrade) {
    setGame((g) => buyUpgrade(g, id));
    tone();
    setToast("Poder aprimorado. O infinito sente sua força.");
  }
  function exportSave() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(game, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "infinity-flow-progresso.json";
    a.click();
    URL.revokeObjectURL(url);
    setToast("Progresso exportado para seu dispositivo.");
  }
  return (
    <div className={`app-shell ${motion ? "" : "reduce-motion"}`}>
      {mobileNav && (
        <button
          className="nav-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside
        className={`sidebar ${mobileNav ? "is-open" : ""}`}
        aria-label="Navegação principal"
      >
        <button
          className="brand-button"
          onClick={() => navigate("camp")}
          aria-label="Infinity Flow — Acampamento"
        >
          <Logo />
        </button>
        <button
          className="mobile-close icon-button"
          onClick={() => setMobileNav(false)}
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
        <div className="sidebar-divider">
          <span /> <Sparkles size={11} /> <span />
        </div>
        <div className="nav-caption">SUA AVENTURA</div>
        <nav>
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              className={`nav-item ${page === id || (page === "battle" && id === "camp") ? "active" : ""}`}
              key={id}
              onClick={() => navigate(id)}
              aria-current={page === id ? "page" : undefined}
            >
              <Icon size={19} strokeWidth={1.65} />
              <span>{label}</span>
              {id === "heroes" ? (
                <small>3</small>
              ) : id === "inventory" && game.worldUnlocked ? (
                <i className="nav-indicator" />
              ) : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-world">
          <div className="world-lines" />
          <span className="eyebrow">O INFINITO TE CHAMA</span>
          <InfinityIcon size={30} strokeWidth={1} />
          <p>
            Sua lenda ainda
            <br />
            está sendo escrita.
          </p>
          <div className="mini-stars">
            ✧ <span>✦</span> ✧
          </div>
        </div>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => setModal("help")}>
            <CircleHelp size={18} />
            <span>Como jogar</span>
            <ArrowRight size={13} />
          </button>
          <button className="nav-item" onClick={() => setModal("settings")}>
            <Settings size={18} />
            <span>Configurações</span>
          </button>
          <div className="profile">
            <div className="profile-avatar">
              <HeroArt id={game.hero} />
            </div>
            <div>
              <strong>Viajante</strong>
              <small>
                {game.started
                  ? `${hero.name} · Nível ${game.level}`
                  : "Uma lenda em formação"}
              </small>
            </div>
            <button
              className="icon-button"
              aria-label="Abrir configurações do viajante"
              onClick={() => setModal("settings")}
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMobileNav(true)}
              aria-label="Abrir menu"
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb-game">Infinity Flow</span>
            <ChevronRight size={12} />
            <span>{pageNames[page]}</span>
          </div>
          <div className="topbar-right">
            <div className="currency gold-currency">
              <Coin />
              <strong>{formatNumber(game.gold)}</strong>
              <button
                aria-label="Como ganhar ouro"
                onClick={() => {
                  setInfo(
                    "Derrote criaturas e minichefes para conquistar ouro. Use-o em Habilidades para melhorar dano, vida e poder arcano. Seu herói também conquista ouro enquanto você está fora.",
                  );
                  tone();
                }}
              >
                +
              </button>
            </div>
            <div className="currency">
              <Gem />
              <strong>{formatNumber(game.gems)}</strong>
              <button
                aria-label="Como ganhar cristais"
                onClick={() => {
                  setInfo(
                    "Você começa com 150 cristais. Cada vitória contra o Vor’Kal, Olho do Abismo concede mais 50. Adquira o Fragmento do Infinito no Inventário por 100 cristais para receber +20% de dano permanente.",
                  );
                  tone();
                }}
              >
                +
              </button>
            </div>
            <div className="header-divider" />
            <button
              className="notification-button icon-button"
              aria-label="Conquistas da jornada"
              onClick={() => setModal("achievements")}
            >
              <Bell size={18} />
              {game.kills === 0 && <i />}
            </button>
            <button
              className="level-profile"
              onClick={() => navigate("heroes")}
              aria-label={`Heróis, nível ${game.level}`}
            >
              <div className="level-avatar">
                <HeroArt id={game.hero} />
              </div>
              <span>NV. {game.level}</span>
            </button>
          </div>
        </header>
        <main ref={mainRef} className="main-content" id="conteudo">
          {page !== "battle" && (
            <div className="page-heading">
              <div>
                <div className="eyebrow">
                  {page === "camp"
                    ? "SEU REFÚGIO ENTRE BATALHAS"
                    : "A JORNADA CONTINUA"}
                </div>
                <h1>{pageNames[page]}</h1>
              </div>
              <div className="world-chip">
                <i />
                <span>Mundo 01</span>
                <span className="world-chip-divider" />
                <Leaf size={13} />
                <span>Alvorecer</span>
              </div>
            </div>
          )}
          {page === "camp" && (
            <>
              <section className="welcome-banner">
                <div className="welcome-art" />
                <div className="welcome-vignette" />
                <div className="banner-particles" aria-hidden="true">
                  {Array.from({ length: 12 }, (_, i) => (
                    <i key={i} style={{ "--i": i } as React.CSSProperties} />
                  ))}
                </div>
                <div className="welcome-copy">
                  <div className="banner-overline">
                    <span />
                    UM NOVO DESTINO AGUARDA
                  </div>
                  <h2>
                    Toda lenda tem
                    <br />
                    um <em>começo.</em>
                  </h2>
                  <p>
                    Escolha seu herói. Desperte seu poder.
                    <br />
                    Deixe sua marca no infinito.
                  </p>
                  <button
                    className="banner-link"
                    onClick={() => navigate("map")}
                  >
                    Explore o mundo
                    <ArrowUpRightIcon />
                  </button>
                </div>
                <div className="banner-coordinate">
                  <span className="live-dot" /> FLORESTA DOS ECOS <span>·</span>{" "}
                  MUNDO 01
                </div>
                <div className="banner-corner corner-top" />
                <div className="banner-corner corner-bottom" />
              </section>
              <div className="camp-grid">
                <div className="camp-left">
                  <HeroSelection game={game} onSelect={selectHero} />
                  <div className="feature-strip">
                    <div>
                      <Swords />
                      <span>
                        <b>Combate automático</b>
                        <small>Seu herói luta por você.</small>
                      </span>
                    </div>
                    <div>
                      <Trees />
                      <span>
                        <b>Um mundo de caminhos</b>
                        <small>Explore. Conquiste. Avance.</small>
                      </span>
                    </div>
                    <div>
                      <InfinityIcon />
                      <span>
                        <b>Evolução sem limites</b>
                        <small>Sempre um novo patamar.</small>
                      </span>
                    </div>
                  </div>
                </div>
                <aside className="journey-column">
                  <section className="journey-card">
                    <div className="journey-heading">
                      <span>Sua jornada</span>
                      <Flag size={15} />
                    </div>
                    <div className="region-preview">
                      <div className="region-art" />
                      <div className="region-gradient" />
                      <span className="region-label">MUNDO 01</span>
                      <div>
                        <Trees size={20} />
                        <h3>Floresta dos Ecos</h3>
                        <span>Onde o fluxo desperta</span>
                      </div>
                    </div>
                    <div className="journey-details">
                      <div className="region-meta">
                        <span>
                          <Swords size={13} />
                          12 encontros
                        </span>
                        <i />
                        <span>
                          <Skull size={13} />1 colosso
                        </span>
                      </div>
                      <p>
                        Algo antigo despertou entre as raízes.
                        <br />A floresta espera pelo seu primeiro passo.
                      </p>
                      <div className="chosen-hero">
                        <div className="chosen-avatar">
                          <HeroArt id={game.hero} />
                        </div>
                        <div>
                          <small>SEU HERÓI</small>
                          <strong>
                            {hero.name}
                            <span>· {hero.role}</span>
                          </strong>
                        </div>
                        <Check size={15} />
                      </div>
                      <button
                        className="primary-button start-button"
                        onClick={begin}
                      >
                        <Swords size={17} />
                        {game.started ? "Continuar jornada" : "Iniciar jornada"}
                        <ArrowRight size={17} />
                      </button>
                      <div className="journey-save">
                        <ShieldCheck size={12} />
                        Seu progresso é salvo automaticamente
                      </div>
                    </div>
                  </section>
                  <button
                    className="offline-card"
                    onClick={() =>
                      setInfo(
                        "Seu herói continua batalhando enquanto você está fora. Ao retornar, calculamos até 8 horas de combate e entregamos o ouro e a experiência conquistados. Uma vitória contra o colosso aguarda sua confirmação antes de iniciar o próximo ciclo. Depois de abrir o jogo uma vez, você também pode jogá-lo sem internet.",
                      )
                    }
                  >
                    <div className="offline-icon">
                      <Clock3 size={20} />
                      <span />
                    </div>
                    <div>
                      <span className="eyebrow">ATÉ QUANDO VOCÊ NÃO ESTÁ</span>
                      <h3>A aventura continua.</h3>
                      <p>Volte para colher suas conquistas.</p>
                      <span className="offline-status">
                        <i />
                        Progresso offline ativo
                        <ChevronRight size={12} />
                      </span>
                    </div>
                  </button>
                </aside>
              </div>
            </>
          )}
          {page === "heroes" && (
            <>
              <HeroSelection full game={game} onSelect={selectHero} />
              <div className="collection-footer">
                <Sparkles size={24} />
                <div>
                  <h3>O herói é seu. O destino também.</h3>
                  <p>
                    Todos os três heróis estão disponíveis desde o começo.
                    Experimente cada estilo.
                  </p>
                </div>
                <button className="secondary-button" onClick={begin}>
                  Ir para a aventura
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
          {page === "map" && (
            <WorldMap game={game} onStart={begin} onPreview={setInfo} />
          )}
          {page === "skills" && <Skills game={game} onBuy={upgrade} />}
          {page === "inventory" && (
            <Inventory
              game={game}
              onRelic={() => {
                setGame((g) => buyRelic(g));
                tone();
                setToast(
                  "Fragmento do Infinito equipado. Dano aumentado em 20%.",
                );
              }}
            />
          )}
          {page === "battle" && (
            <Battle
              game={game}
              onTap={() => {
                setGame(tapAttack);
                tone();
              }}
              onSkill={() => {
                setGame((g) => useSkill(g));
                tone();
              }}
              onToggleAuto={() => setGame((g) => ({ ...g, auto: !g.auto }))}
              onContinue={() => setGame(continueJourney)}
              onBack={() => navigate("map")}
            />
          )}
          <footer className="main-footer">
            <span>
              <Cloud size={13} />
              {saveError
                ? "Armazenamento indisponível · exporte seu progresso"
                : online
                  ? "Progresso salvo neste dispositivo"
                  : "Sem conexão · sua aventura continua"}
            </span>
            <span>
              INFINITY FLOW <i /> A JORNADA NÃO TEM FIM
            </span>
            <span className="version">
              PRIMEIRO DESPERTAR <b>v0.1</b>
            </span>
          </footer>
        </main>
      </div>
      {(page === "camp" || page === "heroes") && (
        <div className="mobile-journey-bar">
          <div className="chosen-avatar">
            <HeroArt id={game.hero} />
          </div>
          <div>
            <small>SEU HERÓI</small>
            <strong>{hero.name}</strong>
          </div>
          <button className="primary-button" onClick={begin}>
            {game.started ? "Continuar" : "Iniciar jornada"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      {info && (
        <Modal title="Ecos do infinito" onClose={() => setInfo("")}>
          <div className="info-symbol">
            <Sparkles size={28} />
          </div>
          <p className="info-text">{info}</p>
          <button className="primary-button" onClick={() => setInfo("")}>
            Entendi
            <Check size={16} />
          </button>
        </Modal>
      )}
      {modal === "help" && (
        <Modal
          title="Sua lenda começa aqui"
          onClose={() => setModal(null)}
          wide
        >
          <div className="help-intro">
            <InfinityIcon size={37} strokeWidth={1} />
            <p>
              Um passo de cada vez.
              <br />
              <strong>Um poder que nunca para de crescer.</strong>
            </p>
          </div>
          <div className="help-steps">
            {[
              {
                icon: UsersRound,
                title: "Escolha seu herói",
                text: "Kael equilibra ataque e vida. Astra causa mais dano. Nix resiste por mais tempo. Todos compartilham seu nível e suas melhorias.",
              },
              {
                icon: Swords,
                title: "Deixe o fluxo lutar",
                text: "O combate é automático. Toque para atacar mais rápido e use sua habilidade especial a cada 12 segundos. Ao ficar sem vida, seu herói se recupera e volta à batalha.",
              },
              {
                icon: Sparkles,
                title: "Evolua sem parar",
                text: "Ganhe ouro e experiência. Compre melhorias em Habilidades e uma relíquia no Inventário. Nos níveis 5 e 10, seu herói ganha novos efeitos visuais.",
              },
              {
                icon: Skull,
                title: "Enfrente o impossível",
                text: "Há minichefes nos encontros 4 e 8. No décimo segundo, enfrente o Vor’Kal, Olho do Abismo. Vença, revele um novo caminho e continue em ciclos cada vez mais desafiadores.",
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <div key={title}>
                <span className="help-step-icon">
                  <Icon size={20} />
                  <small>{i + 1}</small>
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="help-offline">
            <Clock3 size={19} />
            <p>
              Ficou fora? Até 8 horas de recompensas são calculadas ao voltar. O
              progresso fica salvo neste dispositivo.
            </p>
          </div>
          <button className="primary-button" onClick={() => setModal(null)}>
            Estou pronto
            <ArrowRight size={17} />
          </button>
        </Modal>
      )}
      {modal === "settings" && (
        <Modal title="Do seu jeito" onClose={() => setModal(null)}>
          <p className="modal-description">
            Um pouco de calma entre as batalhas.
          </p>
          <div className="setting-row">
            <div>
              {sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
              <span>
                <b>Efeitos sonoros</b>
                <small>Sons leves nas ações e ataques</small>
              </span>
            </div>
            <button
              role="switch"
              aria-checked={sound}
              aria-label="Efeitos sonoros"
              className={`toggle ${sound ? "on" : ""}`}
              onClick={() => setSound(!sound)}
            >
              <i />
            </button>
          </div>
          <div className="setting-row">
            <div>
              <Zap size={20} />
              <span>
                <b>Animações e partículas</b>
                <small>Respeita também as opções do sistema</small>
              </span>
            </div>
            <button
              role="switch"
              aria-checked={motion}
              aria-label="Animações e partículas"
              className={`toggle ${motion ? "on" : ""}`}
              onClick={() => setMotion(!motion)}
            >
              <i />
            </button>
          </div>
          <div className="settings-save">
            <ShieldCheck size={19} />
            <div>
              <b>Sua aventura está neste dispositivo</b>
              <p>Exporte uma cópia para guardar seu progresso.</p>
            </div>
          </div>
          <button className="secondary-button" onClick={exportSave}>
            <Download size={17} />
            Exportar progresso
          </button>
          <button
            className="secondary-button install-button"
            onClick={async () => {
              if (installEvent) {
                await installEvent.prompt();
                setInstallEvent(null);
              } else
                setInfo(
                  "No Android, abra o menu do navegador e escolha “Adicionar à tela inicial” ou “Instalar aplicativo”. No iPhone, toque em Compartilhar e depois em “Adicionar à Tela de Início”. A versão APK também funciona sem navegador.",
                );
            }}
          >
            <Download size={17} />
            Instalar no dispositivo
          </button>
          <p className="settings-version">
            Infinity Flow · Primeiro Despertar · v0.1.0
          </p>
        </Modal>
      )}
      {modal === "achievements" && (
        <Modal
          title="Pequenas vitórias. Grandes lendas."
          onClose={() => setModal(null)}
        >
          <p className="modal-description">
            Cada conquista conta um pedaço da sua história.
          </p>
          <div className="achievement-list">
            {[
              {
                name: "O primeiro passo",
                text: "Comece sua jornada.",
                unlocked: game.started,
                icon: Flag,
              },
              {
                name: "Entre raízes e sombras",
                text: "Derrote 5 criaturas da floresta.",
                unlocked: game.kills >= 5,
                icon: Trees,
              },
              {
                name: "O poder desperta",
                text: "Alcance o nível 5.",
                unlocked: game.level >= 5,
                icon: Flame,
              },
              {
                name: "Até os gigantes caem",
                text: "Derrote o Vor’Kal, Olho do Abismo.",
                unlocked: game.worldUnlocked,
                icon: Trophy,
              },
            ].map(({ name, text, unlocked, icon: Icon }) => (
              <div
                className={unlocked ? "achievement unlocked" : "achievement"}
                key={name}
              >
                <span>
                  <Icon size={22} />
                </span>
                <div>
                  <b>{name}</b>
                  <small>{text}</small>
                </div>
                {unlocked ? (
                  <Check size={17} />
                ) : (
                  <span className="achievement-pending">Pendente</span>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
      {report && (
        <Modal title="Enquanto você esteve fora…" onClose={closeReport}>
          <div className="offline-welcome">
            <Clock3 size={44} strokeWidth={1} />
            <h3>Seu herói manteve o fluxo.</h3>
            <p>
              {report.seconds >= 3600
                ? `${Math.floor(report.seconds / 3600)}h ${Math.floor((report.seconds % 3600) / 60)}min`
                : `${Math.floor(report.seconds / 60)}min`}{" "}
              de aventura calculada · até 8h por retorno
            </p>
          </div>
          <div className="offline-rewards">
            <span>
              <Coin size={25} />
              <b>+{formatNumber(report.gold)}</b>
              <small>Ouro</small>
            </span>
            <span>
              <Sword size={25} />
              <b>{report.kills}</b>
              <small>Inimigos</small>
            </span>
            <span>
              <Sparkles size={25} />
              <b>Nv. {game.level}</b>
              <small>Nível atual</small>
            </span>
          </div>
          {game.status === "victory" && (
            <p className="offline-victory">
              Até os gigantes caem. Seu herói venceu o colosso!
            </p>
          )}
          <button
            className="primary-button"
            onClick={() => {
              closeReport();
              navigate("battle");
            }}
          >
            Continuar a aventura
            <ArrowRight size={17} />
          </button>
        </Modal>
      )}
    </div>
  );
}
function ArrowUpRightIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M6 18 18 6M6 6h12v12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

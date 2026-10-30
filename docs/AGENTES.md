# Equipe de especialidades — Infinity Flow

Estratégia para o desenvolvimento incremental. Estas são responsabilidades de produção e revisão; a existência deste documento não representa execução autônoma de agentes externos.

## 1. Direção de arte e animação 2D
Responsável por silhuetas exclusivas da raça Umbral, legibilidade da câmera, partículas, texturas vetoriais, iluminação e adaptação para celular. Proibidos personagens copiados do site de referência.

## 2. Engenharia de combate e balanceamento
Responsável pelos intervalos de dano automático, recargas de habilidades, saúde de herói, dano do titã, recompensas, escalonamento e ciclo de morte/ressurgimento.

## 3. Progressão e persistência
Responsável pela evolução dos heróis, aparência por patamar, ouro, experiência, árvore do mapa, salvamento local, migração de versões e compensação offline com relógio real. Testar relógios inválidos e limites de renda.

## 4. UX/UI e acessibilidade
Responsável por interface em português, hierarquia do progresso, controles por toque, contraste, respeito a movimento reduzido e mensagens curtas sem repetição.

## 5. Android e web / QA
Responsável por PWA, APK, build reproduzível, desempenho em Galaxy A35 e navegadores, teste offline e verificação de acessibilidade.

### Critérios de aceite da primeira fase
- Selecionar um entre três heróis e iniciar;
- O personagem atacar e matar sem toques;
- Os dois minibosses serem perceptivelmente diferentes;
- O titã ocupar a borda da cena e usar ataque ocular e de terreno;
- Após derrota o titã cair com animação, liberar próximo ramo e salvar a conquista;
- Compras de upgrades alterarem os atributos e aparências;
- Fechar e reabrir conferir recompensa offline;
- Tela se adaptar a aparelho móvel sem dependência de rede durante as batalhas;
- APK ser compilável via GitHub Actions.

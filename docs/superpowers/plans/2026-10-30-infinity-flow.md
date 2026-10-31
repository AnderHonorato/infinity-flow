# Infinity Flow Implementation Plan

**Goal:** entregar interface inicial polida e primeira região jogável em português.
**Architecture:** React para interface, motor puro de jogo testável, persistência local, SVG/CSS para combate, PWA e Capacitor para Android.
**Tech Stack:** TypeScript, React, Vite, lucide-react, Capacitor.
**Spec:** docs/superpowers/specs/2026-10-30-infinity-flow-design.md

## Restrições
- Toda a interface em português, adaptação desktop e celular.
- Três heróis selecionáveis, habilidades e melhorias funcionais.
- Apenas primeira região implementada; mundos futuros claramente indicados.
- Progresso offline calculado ao retorno, até oito horas.

## Verificação
- Evitar gasto com saldo insuficiente; testar compra e progressão.
- Impedir progresso offline com horário negativo ou recompensa duplicada.
- Validar salvamento inválido sem quebrar a interface.
- Testar vitória do chefe e liberação do mapa.
- Inspecionar desktop, móvel, teclado e operação sem rede.

## Tarefas
- [x] Criar motor em src/game.ts com testes de combate, chefes, progresso e offline.
- [x] Criar seleção de heróis e identidade visual com arte original.
- [x] Criar combate, mapa, melhorias, inventário e configurações.
- [x] Adicionar cache offline, integração Android e instruções.
- [x] Rodar testes, build e verificação visual com Playwright.

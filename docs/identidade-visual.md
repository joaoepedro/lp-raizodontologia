# Identidade visual — Raiz Odontologia

Direção escolhida: **verde-azulado (petróleo) com latão**, tipografia **Newsreader Light + Manrope**, hero **V2 (foto circular com anel dourado)**.
Canvas de referência: artefato "Raiz Odontologia — direções visuais" (telas V2 celular e computador).

## Conceito

"Um sorriso saudável começa pela raiz." A marca fala de cuidado desde a base: calma, clareza e saúde. O petróleo junta o azul (confiança, clínica) e o verde (saúde, natureza) num tom só, sem o conflito entre azul e verde. O latão é um dourado envelhecido, não amarelo, usado só em detalhes, para dar acolhimento sem soar luxuoso.

## Paleta

| Nome | Hex | Função | Contraste |
|---|---|---|---|
| Petróleo profundo | `#12343A` | Texto principal, faixa de aviso, rodapé | 12,19:1 sobre Névoa · 13,31:1 sobre branco |
| **Petróleo** | `#1D5F66` | **Reservada ao botão principal** (agendar) | Texto branco: 7,29:1 · botão sobre Névoa: 6,68:1 |
| Musgo | `#48605F` | Texto secundário | 6,18:1 sobre Névoa · 6,74:1 sobre branco |
| Névoa | `#F1F6F5` | Fundo da página | — |
| Água | `#E3EFEE` | Superfícies suaves, ícones em círculo | Petróleo profundo: 11,31:1 |
| Latão | `#876838` | Destaques em texto ("raiz", rótulos, ícones) | 4,73:1 sobre Névoa · 5,16:1 sobre branco |
| Latão claro | `#C9B48A` | Decorativo: anel da foto | Não leva texto |
| Latão traço | `#DCCFB3` | Decorativo: traço do dente no fundo | Não leva texto |
| Latão logo | `#A8864E` | Contorno do dente no logo | Elemento gráfico ao lado do nome |
| Branco | `#FFFFFF` | Cartões, texto do botão | — |
| Linha | `#CFE0DE` | Divisórias e bordas | — |
| Névoa escura | `#B8CBC9` | Texto secundário sobre fundo escuro (diferenciais, rodapé) | 7,87:1 sobre Petróleo profundo |
| Borda de campo | `#7A918F` | Borda dos campos de formulário | 3,35:1 sobre branco (mínimo 3:1 para componentes) |
| Erro | `#A3352B` | Mensagens de erro dos formulários | 6,77:1 sobre branco · 6,2:1 sobre Névoa |

Regras:
- O Petróleo `#1D5F66` só aparece nos botões de agendar (topo, hero e CTAs). Links comuns usam Petróleo profundo sublinhado; botões escuros secundários passam para Petróleo noite `#0B2529` ao passar o mouse.
- O Latão (4,73:1) passa no contraste AA em qualquer tamanho, mas fica reservado a rótulos, ícones e destaques curtos; nunca em parágrafos.
- Não há "verde de sucesso" nem "vermelho de erro" soltos: erros de formulário usam o token `--cor-erro` (`#A3352B`), definido no `variables.css`.

## Tipografia

| Uso | Fonte | Peso | Tamanho (celular → computador) |
|---|---|---|---|
| H1 | Newsreader | 300 (Light), itálico na palavra "raiz" em Latão | 44px → 80px |
| H2 | Newsreader | 300 | 32px → 52px |
| H1 no computador (≥1024px) | Newsreader | 300 | 56px → 80px (80px em 1440px), sempre em até 3 linhas |
| Destaques em serifa (frase de abertura, rodapé de Tratamentos) | Newsreader | 300 | 20px → 26px |
| Títulos de cards, etapas e equipe | Manrope | 700 | 17–18px |
| Texto de apoio (lead) | Manrope | 400 | 16px → 20px |
| Texto | Manrope | 400 | 16px |
| Rótulos (caixa alta) | Manrope | 700, espaçamento 0,12em | 13px |
| Logo "Raiz" | Newsreader | 500 | 25px → 30px |

Fontes servidas pelo próprio site em `.woff2` (`assets/fonts/`), com `font-display: swap` e `preload` da Newsreader 300.

## Logo

Contorno do dente (traço 1,4, sem preenchimento e sem fundo) em Latão logo + "Raiz" em Newsreader 500 + "ODONTOLOGIA" em Manrope 600, caixa alta, espaçamento 0,12em, cor Musgo.

## Elemento memorável

1. **Traço contínuo do dente** (`assets/img/linha-dente.svg`): uma onda atravessa a tela e forma um dente com as raízes. Fica no fundo do hero, atrás do texto e da foto, em Latão traço.
   - Computador (referência 1440px): topo a 370px, largura 1630px (113% da tela), alinhado à esquerda.
   - Celular (referência 375px): largura de ≈203% da tela, com o dente centralizado na tela, logo abaixo do título.
   - No código: SVG **embutido no HTML** (não é arquivo à parte, para não ser o "maior elemento" que atrasa o carregamento no celular), cor `currentColor` = Latão traço, largura em % da tela. Decorativo (`aria-hidden`).
   - Menu completo a partir de 1200px; abaixo disso, botão de menu.
2. **Foto circular com anel em Latão claro** deslocado para baixo e para a direita.
3. **Cartão da responsável técnica** sobre a foto: ícone do dente em círculo Água + nome + "Responsável técnica · CRO".

## Formas e espaçamento

- Botões em pílula (`999px`); alvo de toque mínimo de 44px (botão principal com 56px no celular).
- Cartões com raio de 16px e sombra suave `0 12px 32px rgb(18 52 58 / .14)`.
- Blocos e fotos retangulares com raio de 28px.
- Grade de 8px; margem lateral de 20px (celular) a 80px (computador); conteúdo até 1280px.

## Movimento

- **Ao rolar:** cada bloco sobe 32px e aparece em 1 s, com curva que desacelera no fim (`--curva-suave`). Itens de uma mesma lista entram em cascata, 120 ms um após o outro (até 4). A primeira dobra nunca é animada.
- **Dúvidas:** a resposta desliza para baixo em 480 ms (altura + transparência); só uma aberta por vez; o "+" gira e vira "×".
- **Janelas** (aviso do WhatsApp, cookies): surgem no centro da tela com leve subida em 320 ms.
- **Lista "Como podemos ajudar?":** aberta com o mesmo visual dos campos (Chrome/Edge 135+; nos outros navegadores, a lista do sistema).
- **Movimento reduzido** (configuração do sistema): sem deslocamentos; só esmaecer rápido, e as dúvidas abrem na hora.

## Imagens

- Hero: foto da dentista atendendo, recorte circular (`object-position: 52% 40%`).
- Licença das fotos confirmada pelo autor do projeto (bancos de imagens licenciados).
- Seção "A clínica": foto vertical da profissional de jaleco branco (`clinica-consultorio-*.webp`).
- Estilo para as demais fotos: luz natural, fundo claro, pessoas reais em atendimento, sem "antes e depois", sem close de boca aberta como destaque.

## Clichês evitados

Sem fundo escuro com neon, sem gradiente roxo, sem grade de 3 cards iguais, sem dente sorridente de desenho animado.

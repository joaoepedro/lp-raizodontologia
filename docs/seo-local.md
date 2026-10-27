# SEO — Raiz Odontologia

Atualizado em 27/10/2026. A página está **indexável** (sem `noindex`).

## Estratégia

Clínica de bairro: **SEO básico como base + SEO local como foco**.
A persona busca "dentista Água Verde" ou "dentista perto de mim" no celular. Nessas buscas o Google mostra primeiro o mapa com 3 clínicas (o "pacote local") e só depois os sites. O pacote local depende de três coisas: **relevância** (o negócio corresponde à busca), **distância** (perto de quem busca) e **destaque** (avaliações, menções e o próprio site).

## O que está no código

### SEO básico (técnico e on-page)

| Item | Onde |
|---|---|
| `<title>` com serviço + bairro + cidade (51 caracteres) | `index.html` |
| Meta description começando por "Dentista no Água Verde, Curitiba" (150 caracteres) | `index.html` |
| `robots` = `index, follow, max-image-preview:large` | `index.html` |
| `canonical` com o endereço final | `index.html` |
| Um único `<h1>`, hierarquia H2 → H3 → H4 | `index.html` |
| `alt` descritivo em todas as imagens de conteúdo | `index.html` |
| Open Graph completo (imagem 1200×630, tipo, dimensões e texto alternativo) | `index.html` |
| `robots.txt` liberando tudo e apontando o sitemap | `robots.txt` |
| `sitemap.xml` com a página inicial | `sitemap.xml` |
| `noindex` só no obrigado e na política | `obrigado.html`, `politica-de-privacidade.html` |
| Velocidade (Lighthouse 99/100), celular primeiro, HTTPS | todo o projeto |

O `robots.txt` deixou de bloquear o `obrigado.html`: com o bloqueio, o Google não conseguia ler o `noindex` daquela página.

### SEO local (no site)

| Item | Onde |
|---|---|
| Bairro e cidade no título, na descrição, no rótulo do hero e num H2 ("Uma clínica no Água Verde…") | `index.html` |
| Linha de bairros atendidos (Água Verde, Batel, Rebouças, Portão, Vila Izabel, Bigorrilho, Centro) | seção Contato |
| Mapa do bairro (carregado sob clique) | rodapé |
| Nome, telefone e horários iguais em todo o site | `config.js` + HTML |
| Dados estruturados `Dentist` (veja abaixo) | `<script type="application/ld+json">` no `<head>` |

**Dados estruturados (JSON-LD)**: `WebSite` + `Dentist` com nome, descrição, URL, logo, imagem, telefone, e-mail, endereço (cidade, estado, país), coordenadas do bairro, link do mapa, bairros atendidos, horários, especialidade, `isAcceptingNewPatients`, os 8 tratamentos (`MedicalProcedure`) e a equipe (`Person`).

Sem `priceRange` de propósito: o CFO proíbe anunciar preço.

Validar sempre que mudar: [Teste de pesquisa aprimorada](https://search.google.com/test/rich-results) e [Validador do Schema.org](https://validator.schema.org).

## O que um cliente real faria fora do site

Num projeto real, estas etapas pesam mais que o próprio site para aparecer no mapa:

1. **Perfil da Empresa no Google** (antigo Google Meu Negócio)
   - Categoria principal "Dentista"; secundárias como "Clínica odontológica", "Ortodontista", "Odontopediatra".
   - Endereço verificado, horários (incluindo feriados), telefone, link do site com UTM (`?utm_source=google&utm_medium=organico&utm_campaign=perfil-empresa`), link de agendamento apontando para `#agendar`.
   - Fotos reais da fachada, recepção, consultórios e equipe; atualizar com frequência.
   - Serviços cadastrados com os mesmos nomes da página.
2. **Avaliações**
   - Pedir avaliação depois da consulta (link direto do Perfil enviado pelo WhatsApp).
   - Responder todas, inclusive as negativas, sem expor dados de saúde do paciente.
   - Na página: bloco "Avaliações no Google" com avaliações verdadeiras (nunca inventadas).
3. **Consistência de nome, endereço e telefone** em todos os lugares: site, Perfil da Empresa, Instagram, Facebook, Doctoralia, Apple Maps, Bing Places.
4. **Dados estruturados com o endereço completo** (rua, número, CEP) e as coordenadas exatas da clínica, iguais às do Perfil.
5. **Search Console**
   - Adicionar a propriedade, enviar o `sitemap.xml` e acompanhar as buscas que trazem visitas.
   - Em domínio próprio (ex.: `raizodontologia.com.br`), trocar `canonical`, `og:url`, `og:image`, os endereços dos dados estruturados, `robots.txt` e `sitemap.xml`.
6. **Conteúdo**: se a clínica quiser ir além, páginas por tratamento (ex.: "Implante dentário no Água Verde") sempre com uma ação única de agendar.
7. **Regras do CFO** valem também no Perfil e nas respostas às avaliações: sem preço, sem promoção, sem "antes e depois" sem autorização, CRO visível.

## Projeto conceitual: cuidados com a indexação

- A faixa de "projeto conceitual" no topo da página e a descrição nos dados estruturados avisam que a clínica é fictícia.
- Nomes, números de CRO e e-mails foram conferidos em 27/10/2026 para não coincidir com pessoas ou registros reais:
  - equipe: Dra. Clara Wolanski, Dr. Caetano Vilhena, Dra. Lívia Sakamori;
  - CROs numa faixa bem alta (97.000–98.999), escolhida para ficar longe da numeração em uso no CRO-PR (não há consulta pública automática para confirmar número a número);
  - e-mails no domínio `.example`, reservado internacionalmente para exemplos e que nunca pode ser registrado.
- Os telefones continuam fictícios e os botões nunca discam (modo demonstração). Não existe faixa oficial de números "de mentira" no Brasil; a busca não encontrou uso público dos números escolhidos.
- O Perfil da Empresa no Google **não deve** ser criado para uma clínica fictícia (as regras do Google proíbem).

# SingularII — observatório digital de divulgação científica

Frontend completo (React + TypeScript + Vite + Tailwind v4) de uma plataforma de divulgação científica sobre física, astrofísica e cosmologia, com área pública e painel administrativo. Todos os dados são mockados e persistidos no `localStorage`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Contas de demonstração (login simulado)

Senha de todas: `cosmos123`

| E-mail | Papel |
|---|---|
| admin@singularii.ciencia | Superadministrador |
| administrador@singularii.ciencia | Administrador |
| editora@singularii.ciencia | Editor |
| colaborador@singularii.ciencia | Colaborador |
| leitor@singularii.ciencia | Leitor |

No painel, o seletor **Simular papel** mostra a interface com as permissões de outro papel.
Em **Configurações → Restaurar dados originais** o estado de demonstração é reiniciado.

## Downloads e apoiadores

- **Downloads** (`/downloads`, antes Multimídia) reúne automaticamente toda imagem, vídeo e arquivo publicado em artigos, notícias e eventos, junto com a biblioteca do painel. Cada item mostra onde apareceu, e a busca aceita o nome do arquivo ou o título do artigo/evento.
- Eventos, artigos e notícias têm uma seção **Downloads (anexos)** no painel. Arquivos de até 2 MB ficam salvos com o conteúdo; maiores devem ser adicionados por link.
- **Painel → Apoiadores** cadastra instituições (nome, descrição, logo e link). No formulário do evento elas são escolhidas em **Realização** e **Apoio**, e aparecem na página do evento com a logo levando ao link. As logos de exemplo são provisórias: envie as oficiais pelo painel.

## Estrutura

```
src/
  animations/   stellarRenderer.ts (canvas do ciclo estelar), stellarStages.ts, variants.ts
  components/   ui/ layout/ cosmic/ content/ home/ admin/ loaders/
  contexts/     Theme, Auth (papéis simulados), Toast, Confirm
  data/         dados mockados (artigos, notícias, eventos, mídia, usuários, taxonomia)
  hooks/        useQuery (com invalidação por coleção), utilitários de DOM
  layouts/      PublicLayout, AdminLayout
  pages/        páginas públicas e admin/
  services/     camada de dados — trocar store.ts/index.ts por chamadas HTTP (ver http.ts)
  types/        contratos de domínio
  utils/        formatação, permissões, sanitização, CSV/ICS
```

## Integração com backend

A UI depende apenas das funções em `src/services/index.ts` (`articlesService`, `eventsService`, …), que hoje resolvem contra `createCollection` (localStorage com latência simulada). Para integrar uma API, reimplemente essas funções com `request()` de `src/services/http.ts` mantendo as assinaturas. As permissões em `src/utils/permissions.ts` (`ROLE_PERMISSIONS`) espelham o que o backend deve validar.

## Imagens

Fotografias e vídeos da NASA Image and Video Library (images.nasa.gov), de domínio público, com créditos exibidos em cada item.

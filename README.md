# Republik

Front-end interativo para hackathon, inspirado nas telas do pen.dev. React 19, TypeScript, Vite e Lucide, com layout responsivo e conteúdo em português.

## Rodar

```sh
npm install
npm run dev
```

Acesse **http://localhost:5173**. As imagens e fontes estão incluídas no projeto; depois da instalação, a apresentação não depende de APIs externas.

```sh
npm run build    # Validação TypeScript e build em dist/
npm run preview  # Prévia da versão compilada
npm run test:e2e # Testes de fluxo no Chrome instalado
```

Para publicar o conteúdo de `dist/` em uma hospedagem estática, configure o fallback de todas as rotas para `index.html` (SPA).

## O que funciona

- **Moradia:** busca por texto, universidade, orçamento, características e tipo; ordenação e carregamento de mais anúncios.
- **Desapego:** compra e aluguel de itens, categorias, busca e filtros por finalidade e período de cobrança.
- **Detalhes:** galeria, favoritos, compartilhamento por link, custos, propostas, visitas e solicitações de aluguel com retirada, devolução e total estimado.
- **Verificação simulada:** e-mail institucional e código **123456**, com retorno para a ação que iniciou o fluxo.
- **Chat:** mensagens persistidas e respostas automáticas simuladas; propostas e visitas aparecem na conversa.
- **Anunciar:** escolha entre moradia, venda ou aluguel de item; aluguel por diária, semana (7 dias) ou mês (30 dias); quatro etapas, upload de até quatro fotos (redimensionadas no navegador), fotos de demonstração, rascunhos, revisão e publicação no feed.
- **Meu Espaço:** anúncios próprios, favoritos, edição e status Disponível / Reservado / Concluído. Anúncios indisponíveis saem dos feeds.
- **Persistência:** dados e rascunhos no `localStorage`, separados por navegador. O botão **Reiniciar demo** no rodapé restaura os dados iniciais.

## Roteiro de apresentação

1. Na Home, filtre a universidade **USP** e o orçamento **R$ 800**.
2. Abra uma vaga e salve nos favoritos; confira em **Meu Espaço → Salvos**.
3. Clique em **Agendar uma visita**; confirme o e-mail demonstrativo `marina.silva@usp.br` com **123456**.
4. Escolha uma data futura e envie a solicitação. Acompanhe a resposta no chat e envie outra mensagem.
5. Entre em **Desapego** e escolha **Para alugar**. Abra a bicicleta, escolha retirada e devolução e veja o total estimado. Envie a solicitação para o chat. Para itens de venda, use **Para comprar** e envie uma proposta.
6. Clique em **Anunciar** e escolha **Quero alugar um item**. Defina o valor e o período de cobrança, escolha uma foto demonstrativa e publique. O anúncio aparece no filtro **Para alugar**.
7. Em **Meu Espaço**, edite o anúncio ou marque como **Reservado**. Ele sai do feed, mas continua acessível no painel.
8. Recarregue a página para mostrar que as alterações foram preservadas.

## Estrutura

```text
src/
  App.tsx                # Layout, navegação e rotas
  components.tsx         # Cartões, modal, favoritos, avatares
  data.ts                # Dados iniciais e helpers
  store.tsx              # Estado persistido, migração e respostas de chat
  RentalRequest.tsx      # Datas, estimativa e solicitação de aluguel
  types.ts               # Contratos de dados
  styles.css             # Tokens visuais e estilos responsivos
  pages/
    Explore.tsx          # Moradia e Desapego
    Details.tsx          # Detalhes, galeria, proposta e visita
    Dashboard.tsx        # Meu Espaço
    CreateListing.tsx    # Criação e edição em quatro etapas
    Messages.tsx         # Conversas simuladas
    Verification.tsx     # Verificação demonstrativa
public/
  images/                # Fotografias ilustrativas, Unsplash
  fonts/                 # Inter e Rosario, Google Fonts
tests/flows.spec.ts       # Testes ponta a ponta
```

O documento de referência tinha arquivos de logotipo sem imagem disponível. A implementação usa uma assinatura tipográfica provisória, preservando o nome e o coral da marca. As fotos são ilustrativas.

Este projeto é uma demonstração de front-end: não há autenticação real, envio de e-mails, mensagens externas, pagamentos nem validação acadêmica real. Anúncios novos e links para eles são específicos deste navegador; não há sincronização entre dispositivos. Para integração futura, as operações estão concentradas em `src/store.tsx`.

No aluguel de itens, o total usa a diferença entre retirada e devolução. Uma diária equivale a um dia; semanas e meses são blocos de 7 e 30 dias, arredondados para cima. A estimativa não confirma disponibilidade nem cria cobrança. Ao atualizar de uma versão anterior, os exemplos de aluguel são adicionados uma única vez, preservando seus anúncios, favoritos e conversas.

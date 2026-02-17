

# Plano: Responsividade 100% Mobile em Todas as Paginas

## Problemas Identificados

Apos analise de cada pagina, os principais problemas de responsividade sao:

1. **Ordens de Servico** - Tabela HTML pura sem versao mobile (colunas cortadas)
2. **Relatorios** - Tabela de despesas sem versao mobile; botoes do header apertados
3. **Pendencias** - Cards com muitos elementos na mesma linha, ficam espremidos
4. **Financeiro** - Cards de OS com icone + info + valores + botoes em uma so linha
5. **Agendamentos** - Seletor de dias da semana com botoes muito pequenos no celular
6. **Dashboard** - Algumas listas com elementos apertados em tela pequena
7. **Clientes** - Formulario com grids de 3 colunas que ficam apertados; botoes de acao espremidos
8. **Modal Nova OS** - Tabs com 4 colunas ficam ilegíveis no celular

## Mudancas por Pagina

### 1. ServiceOrders.tsx
- Substituir tabela por cards empilhados no mobile (`hidden md:block` para tabela, `md:hidden` para cards)
- Cada card mostra: ID da OS, cliente, status, financeiro e total em layout vertical
- Header com titulo e botao empilhados em telas pequenas

### 2. Reports.tsx
- Tabela de despesas: adicionar versao mobile com cards
- Header: empilhar titulo, seletor de mes e botao PDF verticalmente no mobile
- Cards de resumo: `grid-cols-2` no mobile em vez de `grid-cols-4`

### 3. Pendencies.tsx
- Cards de pendencia: empilhar conteudo verticalmente no mobile (icone + info em cima, data + botoes embaixo)
- Stats cards: `grid-cols-2` no mobile em vez de `grid-cols-4`
- Header: empilhar titulo e botoes

### 4. Financial.tsx
- Cards de contas: empilhar info e botoes verticalmente no mobile
- Separar valores e botoes em linhas distintas no celular

### 5. Schedule.tsx
- Seletor de dias: mostrar apenas 3 dias por vez no mobile ou scroll horizontal
- Cards de agendamento: layout vertical no mobile

### 6. Dashboard.tsx
- Listas de OS e devedores: ajustar para nao cortar texto
- Melhorar spacing em telas pequenas

### 7. Clients.tsx
- Formulario de endereco: `grid-cols-1` no mobile em vez de `grid-cols-3`
- Lista de clientes: empilhar botoes de acao embaixo no mobile

### 8. NovaOSModal.tsx
- TabsList: `grid-cols-2` no mobile com 2 linhas em vez de 4 colunas
- Grids internos: `grid-cols-1` no mobile

---

## Detalhes Tecnicos

### Padrao utilizado
- Classes Tailwind responsivas: `sm:`, `md:`, `lg:`
- Padrao `hidden md:block` / `md:hidden` para alternar entre tabela e cards
- `flex-col` no mobile, `flex-row` no desktop
- Grids adaptativos: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

### Arquivos editados
- `src/pages/ServiceOrders.tsx`
- `src/pages/Reports.tsx`
- `src/pages/Pendencies.tsx`
- `src/pages/Financial.tsx`
- `src/pages/Schedule.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Clients.tsx`
- `src/components/NovaOSModal.tsx`

### Nenhuma mudanca no banco de dados necessaria


# ChamaAi - Chamados de TI

Crie um novo sistema web de gerenciamento de chamados de TI, inspirado conceitualmente em sistemas como GLPI, porém com interface própria, simples, rápida e moderna baseada em Material Design 3.

O sistema será utilizado internamente por uma equipe pequena de TI.

IMPORTANTE:

- Não criar um portal de autoatendimento para funcionários.

- Os solicitantes NÃO terão contas, login ou senha.

- Somente duas pessoas terão acesso autenticado ao sistema: o administrador/técnico e a estagiária de TI.

- O sistema deve diferenciar claramente USUÁRIO AUTENTICADO de SOLICITANTE.

- Priorizar funcionalidade, organização, rastreabilidade e rapidez.

- Não implementar CMDB, inventário completo de ativos, contratos, licenciamento ou outros módulos complexos de ITSM neste primeiro momento.

- A arquitetura deve permitir expansão futura.

- Utilizar Material Design 3 como referência visual.

- Interface profissional, limpa, responsiva e intuitiva.

- Tema claro como padrão, com suporte preparado para tema escuro.

════════════════════════════════════

1. AUTENTICAÇÃO E USUÁRIOS

════════════════════════════════════

O sistema terá somente duas contas autenticadas:

1. Administrador/Técnico

2. Estagiária de TI

Não criar contas para os funcionários que solicitam suporte.

Os funcionários serão cadastrados apenas como SOLICITANTES.

SOLICITANTE NÃO É USUÁRIO DO SISTEMA.

O solicitante:

- não possui login

- não possui senha

- não acessa o sistema

- não possui permissões

- serve apenas para identificar quem solicitou o atendimento

Criar um cadastro separado de solicitantes contendo:

- nome

- setor

- telefone/ramal opcional

- status ativo/inativo

Ao abrir um chamado, selecionar o solicitante através de pesquisa/autocomplete.

Não permitir que o cadastro de solicitante seja utilizado para autenticação.

════════════════════════════════════

2. PERMISSÕES

════════════════════════════════════

Administrador/Técnico:

- acesso completo

- criar chamados

- editar chamados

- atribuir técnico

- alterar status

- adicionar comentários

- registrar solução

- visualizar histórico

- visualizar relatórios

- gerenciar categorias

- gerenciar setores

- gerenciar técnicos

- gerenciar solicitantes

- gerenciar configurações

Estagiária:

- criar chamados

- visualizar chamados

- editar chamados

- adicionar comentários

- alterar status

- registrar atendimento

- visualizar histórico

- visualizar relatórios

A estrutura deve permitir futuramente criar outros níveis de permissão, mas não criar uma hierarquia complexa agora.

════════════════════════════════════

3. DASHBOARD

════════════════════════════════════

Criar um dashboard inicial com visão geral dos chamados.

Exibir:

- Chamados abertos

- Chamados em triagem

- Chamados em atendimento

- Chamados aguardando

- Chamados resolvidos

- Chamados encerrados

- Chamados críticos

- Chamados abertos hoje

Adicionar métricas e gráficos:

- Chamados por setor

- Chamados por categoria

- Chamados por nível de urgência

- Chamados por técnico

- Evolução dos chamados ao longo do tempo

════════════════════════════════════

4. CHAMADOS

════════════════════════════════════

Criar um módulo completo de chamados.

Cada chamado deve possuir:

- número automático

- data e hora de abertura

- solicitante

- setor

- categoria

- urgência

- título

- descrição

- técnico responsável

- status

- data/hora de resolução

- data/hora de encerramento

- comentários

- solução aplicada

- histórico

- anexos

O número do chamado deve ser único.

Exemplo:

#2026-0042

Registrar também qual usuário autenticado criou o chamado.

Exemplo:

"14:20 — Chamado aberto por Hoffman em nome de Maria Silva."

════════════════════════════════════

5. ABERTURA DE CHAMADO

════════════════════════════════════

Ao criar um chamado, permitir informar:

- solicitante

- setor

- categoria

- urgência

- título

- descrição

- técnico responsável, opcional

- anexos

O solicitante deve ser selecionado a partir do cadastro existente.

Não exigir que o solicitante possua conta.

O fluxo de abertura deve ser rápido e exigir poucos cliques.

════════════════════════════════════

6. SETORES

════════════════════════════════════

Criar inicialmente:

- Financeiro

- Comercial

- Pedagógico

- TI

- Administrativo

Permitir adicionar, editar e desativar setores posteriormente.

════════════════════════════════════

7. CATEGORIAS

════════════════════════════════════

Criar categorias iniciais:

HARDWARE

- Computador

- Notebook

- Monitor

- Impressora

- Periféricos

SOFTWARE

- Windows

- Microsoft Office

- Sistema interno

- Aplicativo

- Instalação/configuração

REDE

- Internet

- Wi-Fi

- Cabeamento

- Acesso à rede

- Impressora de rede

CONTAS E ACESSOS

- Senha

- E-mail

- Sistema

- Permissões

- Criação de usuário

MANUTENÇÃO

- Preventiva

- Corretiva

Permitir posteriormente criar, editar, desativar e organizar categorias.

════════════════════════════════════

8. URGÊNCIA

════════════════════════════════════

Criar quatro níveis:

BAIXA

Pode aguardar sem impacto significativo.

NORMAL

Atendimento comum.

ALTA

Impacta o trabalho do setor.

CRÍTICA

Paralisa uma atividade, equipamento ou sistema essencial.

Utilizar indicadores visuais discretos para diferenciar os níveis.

Permitir filtrar por urgência.

════════════════════════════════════

9. STATUS

════════════════════════════════════

Utilizar os seguintes status:

- Aberto

- Em triagem

- Em atendimento

- Aguardando solicitante

- Aguardando terceiro

- Resolvido

- Encerrado

- Cancelado

Não utilizar somente um status genérico "Pendente".

"Aguardando solicitante" e "Aguardando terceiro" devem ser estados distintos.

════════════════════════════════════

10. RESOLUÇÃO E ENCERRAMENTO

════════════════════════════════════

Diferenciar RESOLVIDO de ENCERRADO.

RESOLVIDO:

O técnico informa que o problema foi solucionado.

Ao marcar como Resolvido, permitir registrar:

- solução aplicada

- observação final

Registrar automaticamente a data e hora da resolução.

ENCERRADO:

O atendimento foi definitivamente finalizado.

Registrar automaticamente a data e hora do encerramento.

Não apagar o histórico ao encerrar o chamado.

════════════════════════════════════

11. CHAMADOS NÃO RESOLVIDOS

════════════════════════════════════

Quando um chamado não puder ser resolvido, permitir informar o motivo.

Motivos iniciais:

- Sem solução no momento

- Problema persiste

- Necessita equipamento

- Necessita fornecedor

- Necessita acesso

- Necessita intervenção externa

- Problema não reproduzido

- Solicitante desistiu

- Outro

Permitir adicionar novos motivos posteriormente.

════════════════════════════════════

12. TÉCNICOS

════════════════════════════════════

Criar cadastro de técnicos.

Cada técnico deve possuir:

- nome

- status ativo/inativo

Inicialmente haverá apenas o administrador/técnico e a estagiária.

Ao criar ou editar um chamado, permitir selecionar o técnico responsável.

Permitir alterar o responsável posteriormente.

Importante:

A pessoa que criou o chamado e o técnico responsável pelo chamado são informações diferentes e devem ser armazenadas separadamente.

════════════════════════════════════

13. HISTÓRICO DO CHAMADO

════════════════════════════════════

Cada chamado deve possuir histórico cronológico.

Registrar automaticamente alterações importantes.

Exemplo:

14:20 — Chamado aberto por Hoffman

14:35 — Técnico atribuído: Estagiária

14:50 — Status alterado para Em atendimento

15:10 — Comentário adicionado

16:02 — Status alterado para Resolvido

Registrar:

- criação

- alteração de status

- alteração de técnico

- comentários

- solução

- alterações relevantes

O histórico não deve ser apagado.

════════════════════════════════════

14. COMENTÁRIOS

════════════════════════════════════

Permitir adicionar comentários dentro do chamado.

Cada comentário deve possuir:

- autor

- data/hora

- conteúdo

Separar claramente:

DESCRIÇÃO:

Problema informado originalmente.

COMENTÁRIOS:

Atualizações durante o atendimento.

SOLUÇÃO:

Conclusão técnica do atendimento.

Exemplo de comentário:

"Foi identificado que o cabo de rede estava danificado. Realizada substituição."

════════════════════════════════════

15. ANEXOS

════════════════════════════════════

Permitir anexar arquivos aos chamados.

Exemplos:

- imagens

- screenshots

- PDFs

- documentos

- evidências do problema

Os anexos devem permanecer vinculados ao chamado.

════════════════════════════════════

16. PESQUISA GLOBAL

════════════════════════════════════

Criar pesquisa global de chamados.

Permitir pesquisar por:

- número do chamado

- nome do solicitante

- título

- descrição

- técnico

- categoria

Exemplo:

Pesquisar:

#2026-0042

deve abrir diretamente o chamado correspondente.

════════════════════════════════════

17. FILTROS

════════════════════════════════════

Permitir filtrar chamados por:

- status

- urgência

- setor

- categoria

- técnico

- período

- solicitante

Permitir ordenar por:

- mais recentes

- mais antigos

- maior urgência

- maior tempo em aberto

════════════════════════════════════

18. RELATÓRIOS E MÉTRICAS

════════════════════════════════════

Preparar o sistema para calcular:

- tempo médio até atendimento

- tempo médio até resolução

- tempo médio até encerramento

- quantidade de chamados por setor

- quantidade por categoria

- quantidade por urgência

- quantidade por técnico

- taxa de resolução

Permitir consultar esses dados em períodos diferentes.

Exemplos:

- hoje

- últimos 7 dias

- este mês

- mês anterior

- período personalizado

Preparar a arquitetura para implementação futura de SLA.

Não implementar regras complexas de SLA neste momento.

════════════════════════════════════

19. NAVEGAÇÃO

════════════════════════════════════

Criar a seguinte estrutura:

Dashboard

Chamados

- Todos

- Abertos

- Em atendimento

- Aguardando

- Resolvidos

- Encerrados

Novo chamado

Relatórios

Configurações

- Técnicos

- Solicitantes

- Setores

- Categorias

- Prioridades

- Motivos de não resolução

════════════════════════════════════

20. INTERFACE — MATERIAL DESIGN 3

════════════════════════════════════

════════════════════════════════════

20. INTERFACE — MATERIAL DESIGN 3

════════════════════════════════════

A interface DEVE utilizar Material Design 3 como base de design.

IMPORTANTE:

Não substituir Material Design por um estilo genérico de dashboard SaaS.

O resultado deve claramente remeter ao Material Design 3, utilizando seus princípios de:

- componentes Material

- cards

- chips

- badges

- dialogs

- menus

- campos de formulário

- botões

- navegação lateral

- tabelas

- snackbar/toasts

- estados de hover, foco e interação

- elevação e superfícies

- espaçamento consistente

- hierarquia visual

──────────────────────────────

TEMA

──────────────────────────────

O modo PRIMÁRIO do sistema deve ser:

DARK MODE

Não utilizar o tema claro como padrão.

Ao entrar no sistema, a interface deve iniciar automaticamente no tema escuro.

Preparar suporte para tema claro futuramente, mas o modo escuro deve ser a experiência principal.

O dark mode deve utilizar superfícies e elevação seguindo os princípios do Material Design 3, evitando simplesmente aplicar fundo preto em todos os elementos.

Utilizar diferentes níveis de superfície para diferenciar:

- fundo principal

- sidebar

- cards

- dialogs

- campos

- menus

- áreas de conteúdo

Manter bom contraste e legibilidade.

──────────────────────────────

TIPOGRAFIA

──────────────────────────────

Adicionar uma tipografia com aparência de máquina de escrever/monoespaçada como parte da identidade visual.

Utilizar fonte monoespaçada de maneira estratégica, principalmente em:

- número dos chamados

- identificadores

- códigos

- informações técnicas

- endereços IP

- nomes de arquivos

- logs

- horários

- timestamps

- elementos relacionados ao histórico técnico

- pequenos títulos ou destaques quando fizer sentido

Exemplo:

#2026-0042

14:32:18

192.168.1.100

STATUS: RESOLVIDO

Para textos longos, descrições, menus e conteúdo convencional, utilizar uma fonte sans-serif legível.

Não utilizar a fonte monoespaçada em absolutamente todos os textos da interface.

A combinação deve transmitir uma estética de:

- tecnologia

- infraestrutura

- suporte técnico

- terminal

- sistemas de TI

sem prejudicar a usabilidade.

──────────────────────────────

ESTÉTICA

──────────────────────────────

O visual deve transmitir:

- tecnologia

- TI

- infraestrutura

- confiabilidade

- organização

- precisão

Evitar aparência excessivamente corporativa ou genérica.

Utilizar os componentes Material Design 3 com uma identidade visual própria voltada para TI.

Criar hierarquia visual clara entre:

- status

- urgência

- número do chamado

- solicitante

- técnico

- descrição

- histórico

- solução

Criar um botão de ação destacado:

"+ Novo chamado"

O fluxo de abertura de chamado deve exigir poucos passos.

A interface deve ser totalmente responsiva, mas priorizar a experiência em desktop, considerando que o sistema será utilizado principalmente para atendimento interno de TI.

════════════════════════════════════

21. PRINCÍPIOS IMPORTANTES DE MODELAGEM

════════════════════════════════════

Diferenciar obrigatoriamente:

USUÁRIO AUTENTICADO

Pessoa que possui acesso ao sistema.

SOLICITANTE

Pessoa que possui um problema e está sendo atendida, mas não possui acesso ao sistema.

TÉCNICO RESPONSÁVEL

Usuário/técnico responsável pela resolução do chamado.

CRIADOR DO CHAMADO

Usuário autenticado que registrou o chamado no sistema.

Esses papéis não devem ser tratados como a mesma entidade.

Exemplo:

Solicitante:

Maria Silva — Financeiro

Chamado criado por:

Hoffman

Técnico responsável:

Estagiária

Isso deve ser corretamente refletido no banco de dados e no histórico.

════════════════════════════════════

22. PRINCÍPIOS GERAIS

════════════════════════════════════

O sistema deve priorizar:

- rapidez

- simplicidade

- rastreabilidade

- organização

- facilidade de uso

- histórico confiável

- boa experiência em desktop

- responsividade

Evitar:

- excesso de telas

- burocracia

- campos desnecessários

- funcionalidades corporativas não solicitadas

- criação de contas para solicitantes

- portal de autoatendimento

- complexidade desnecessária

O objetivo é criar um Help Desk de TI profissional e funcional, inspirado no conceito do GLPI, mas mais simples e direto para o uso diário.

Antes de implementar, preservar a separação correta entre autenticação, solicitantes, chamados, técnicos, categorias, status e histórico para evitar problemas de modelagem futuramente.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9c453d8c-4b1a-4e1c-a8c9-158e86ac399a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

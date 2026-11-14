# Escopo do Recomeço

Fonte principal: [Especificação do aplicativo pessoal](https://chatgpt.com/share/6af3aedd-1b7c-83e9-a366-e8d4c8ad51c1).

## Acompanhamento pessoal

- Web responsivo e instalável. Interface Glassy com verde, creme, lilás e ícones das referências visuais do próprio Recomeço.
- Login individual. Diário e histórico privados. Login e sincronização dependem do banco de dados da próxima etapa.
- Busca de substâncias por categoria, nome e sinônimos. Catálogo brasileiro abrangente e cadastro de itens pessoais. Esta entrega começa com um catálogo inicial e cadastro personalizado.
- Registro diário de uso por substância, contadores independentes, histórico mensal, marcos de 7, 30 e 90 dias e economia estimada. Um registro de uso reinicia somente o contador da substância selecionada.
- Mensagens no início e biblioteca de reflexões para usuários e familiares. Apoio com contatos oficiais, psicólogos e grupos de WhatsApp e Facebook gerenciados pelo administrador.

## Módulos seguintes

- Autenticação, banco de dados, regras de acesso por função e registro de acessos. A especificação sugeriu Supabase para autenticação, Postgres e armazenamento. A primeira entrega usa React, TypeScript e Vite para compilar a mesma PWA para as duas hospedagens.
- Diretório de clínicas com busca por cidade, região, estado e tipo, endereço, contato, horários e fotos. Cadastro da instituição com aprovação administrativa, avaliação por quem já passou pelo atendimento e estatísticas agregadas.
- Portal da clínica para pacientes vinculados e contatos familiares. Portal da família com acesso autorizado às informações de evolução. As informações pessoais de consumo e do diário seguem privadas por padrão.
- Reels, Stories e perfis com contagem agregada de visitas, além de painel de administração e moderação.
- Assinaturas para pessoas e clínicas. Decisão do projeto: teste gratuito de 7 dias no Plus e de 30 dias para clínicas. Valores propostos por mês: Livre, R$ 0; Plus, R$ 12,90; Família, R$ 19,90; Clínica Essencial, R$ 149,90; Clínica Profissional, R$ 299,90; Clínica Premium, R$ 599,90. Cobrança recorrente depende de autorização, e recursos essenciais de recuperação integram o plano gratuito.

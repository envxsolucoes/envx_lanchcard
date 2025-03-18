# LancheCard - Sistema de Lanchonetes Universitárias (PWA)

Sistema completo para gerenciamento de lanchonetes universitárias adaptado para Progressive Web App (PWA), permitindo compatibilidade com Windows Server 2019 e implantação em nuvem.

## Características Principais

- **PWA Completo**: Funciona em qualquer dispositivo com navegador moderno
- **Design Responsivo**: Interface adaptada para desktop, tablet e mobile
- **Experiência Offline**: Funciona mesmo sem conexão contínua com internet
- **Instalável**: Pode ser adicionado à tela inicial como um aplicativo nativo
- **Backend Robusto**: API RESTful com Node.js e Express
- **Banco de Dados**: PostgreSQL para armazenamento de dados

## Paleta de Cores (Azul Degradê)

- **Cores Principais**:
  - Primary Dark: #0D47A1
  - Primary Medium-Dark: #1565C0
  - Primary Medium: #1976D2 (cor principal)
  - Primary Medium-Light: #1E88E5
  - Primary Light: #2196F3
  - Primary Lightest: #42A5F5

- **Cores de Apoio e Alertas**:
  - Background Light: #E3F2FD
  - Secondary: #039BE5
  - Alerta: #FF5252
  - Warning: #FFA726
  - Success: #66BB6A
  - Info/Insight: #5E35B1

## Requisitos de Sistema

- Node.js 16+
- PostgreSQL 12+
- Windows Server 2019 (ambiente de produção)
- Navegadores modernos para utilização do PWA

## Estrutura do Projeto

```
lanchecard/
├── app/
│   ├── frontend/         # Frontend PWA com Next.js
│   └── backend/          # Backend API com Express
└── package.json          # Scripts para gerenciar o projeto
```

## Instalação e Configuração

### Requisitos Prévios

- Node.js (v16+)
- PostgreSQL (v12+)

### Passos para Instalação

1. Clone o repositório
   ```
   git clone https://github.com/envxsolucoes/envx_lanchcard.git
   cd envx_lanchcard
   ```

2. Instale as dependências
   ```
   npm run install:all
   ```

3. Configure as variáveis de ambiente
   - Copie o arquivo `.env.example` para `.env` no diretório `/app/backend`
   - Edite as configurações conforme seu ambiente

4. Configure o banco de dados PostgreSQL
   - Crie um banco de dados chamado `lanchecard`
   - Execute os scripts de migração (se disponíveis)

5. Inicie o aplicativo em modo de desenvolvimento
   ```
   npm run dev
   ```

## Scripts Disponíveis

- `npm run dev` - Inicia frontend e backend em modo de desenvolvimento
- `npm run frontend` - Inicia apenas o frontend em modo de desenvolvimento
- `npm run backend` - Inicia apenas o backend em modo de desenvolvimento
- `npm run build` - Compila o frontend para produção
- `npm run install:all` - Instala dependências de todo o projeto

## Funcionalidades

- Autenticação de usuários (clientes, funcionários, administradores)
- Catálogo de produtos com categorias
- Carrinho de compras
- Processamento de pedidos
- Pagamentos via PIX (integração com OpenPIX)
- Análise nutricional dos alimentos
- Dashboard administrativo
- Relatórios e estatísticas

## Integrações

- **OpenPIX**: Processamento de pagamentos via PIX
- **LLM**: Análise nutricional dos produtos

## Configuração para Produção

Para implantar em produção no Windows Server 2019:

1. Configure o IIS como proxy reverso para os serviços Node.js
2. Utilize o PM2 para gerenciamento de processos Node.js
3. Configure o PostgreSQL para acesso seguro
4. Implemente HTTPS com certificados válidos

## Configuração em Nuvem

O projeto está preparado para implantação em ambientes de nuvem:

1. Banco de dados:
   - Pode ser migrado para serviços gerenciados como Azure SQL, Amazon RDS ou Google Cloud SQL
   - Configure as variáveis de ambiente apropriadas para conexão remota

2. Hospedagem:
   - Deploy do backend em serviços como Azure App Service, AWS Elastic Beanstalk ou similares
   - Frontend pode ser hospedado em serviços de CDN/hospedagem estática

## Licença

Este projeto está licenciado sob os termos da licença ISC.

# Desafio Front-End — Cadastro de Fornecedores e Produtos

Este projeto foi desenvolvido como parte do desafio proposto para avaliação de conhecimentos técnicos em HTML, CSS, JavaScript (ES6), Bootstrap e jQuery.  
O objetivo é criar um formulário funcional para **cadastro de fornecedores e produtos**, seguindo fielmente o layout fornecido no PDF e as regras especificadas no enunciado.

---

## 📋 Funcionalidades Implementadas

- Formulário de **Cadastro de Fornecedor** com validação de campos obrigatórios.
- Preenchimento automático do endereço via **API ViaCEP** ao informar o CEP.
- Tabela de **Produtos**:
  - Inclusão e remoção de itens.
  - Cálculo automático do **Valor Total** (Quantidade × Valor Unitário).
  - Validação para exigir pelo menos 1 produto.
- Tabela de **Anexos**:
  - Inclusão de arquivos (pdf, jpg, png) com limite de **5 MB** por arquivo.
  - Armazenamento em **sessionStorage** no formato Base64 (simulação de upload em memória).
  - Botão **Visualizar** para download do arquivo.
  - Botão **Excluir** que remove o anexo da memória.
  - Validação para exigir pelo menos 1 anexo.
- Botão **Salvar Fornecedor**:
  - Exibe modal de "Enviando..." (loading).
  - Gera um JSON no formato especificado no enunciado.
  - JSON exibido no console do navegador e disponível para download.
- Layout responsivo com Bootstrap e paleta de cores adaptada ao layout do PDF.

---

 🖼 Layout

O layout do formulário foi desenvolvido com base no modelo PDF fornecido, adaptando para uso com Bootstrap 4.5 e CSS customizado para manter fidelidade visual.

---

 🛠 Tecnologias Utilizadas

- HTML5
- CSS3 (com Bootstrap 4.5 e customização própria)
- JavaScript (ECMAScript 6)
- jQuery 3.5.1
- Bootstrap 4.5
- API ViaCEP (consulta de endereço por CEP)

---
 📂 Estrutura de Pastas
pw_arthurmonteiro/
│
├── index.html
├── css/
│ └── style.css
├── js/
│ └── app.js
└── README.md

---

Como Executar o Projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/Arthur-Monteir0/Desafio-front-end.git
   Abra o arquivo index.html no navegador.

Recomenda-se usar o Live Server (VS Code) para evitar bloqueios de API.

Preencha o formulário, adicione pelo menos 1 produto e 1 anexo.

Clique em Salvar Fornecedor para gerar o JSON (veja no console ou baixe pelo botão).
Observações Importantes
Campos obrigatórios: Razão Social, Nome Fantasia, CNPJ, CEP, Endereço, Nome do Contato, Telefone, E-mail.

Pelo menos 1 produto e 1 anexo são necessários para salvar.



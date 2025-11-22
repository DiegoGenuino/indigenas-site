# Ecos Ancestrais - Site Indígena com Three.js e GSAP

Este projeto é uma experiência web imersiva sobre a história e origem dos povos indígenas, utilizando tecnologias web modernas para criar uma narrativa visual interativa.

## Tecnologias Utilizadas

*   **HTML5 / CSS3 / JavaScript (ES6+)**
*   **Three.js:** Para renderização 3D e sistema de partículas.
*   **GSAP (GreenSock Animation Platform):** Para animações de rolagem (ScrollTrigger) e transições suaves.

## Como Rodar o Projeto

Como o projeto utiliza **ES Modules** (importação de módulos JavaScript), ele precisa ser executado através de um servidor local para evitar erros de política de segurança do navegador (CORS).

### Opção 1: Extensão "Live Server" do VS Code (Recomendado)
1.  Abra este projeto no VS Code.
2.  Instale a extensão **Live Server**.
3.  Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"**.

### Opção 2: Python (via terminal)
Se você tem Python instalado, pode rodar um servidor simples:

```bash
# Python 3
python -m http.server 8000
```

Depois acesse `http://localhost:8000` no seu navegador.

### Opção 3: Node.js (http-server)
```bash
npx http-server .
```

## Estrutura do Projeto

*   `index.html`: Estrutura principal e importação das bibliotecas via CDN.
*   `css/style.css`: Estilos visuais e layout.
*   `js/main.js`: Lógica 3D (Three.js), Shaders e Animações (GSAP).

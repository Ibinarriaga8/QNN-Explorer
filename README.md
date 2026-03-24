# Quantum Neural Networks Explorer

An interactive educational website about Quantum Machine Learning inspired by the paper:

**Classification with Quantum Neural Networks on Near Term Processors**  
Edward Farhi and Hartmut Neven

## What This Project Is

This project is a student-friendly React website that explains:

- basic quantum computing ideas
- how quantum circuits can behave like neural networks
- how classification works with a readout qubit
- why some tasks are easier to train than others
- the key takeaways and limitations of the Farhi-Neven paper

The app is organized as a multi-page lesson with interactive sections for:

- quantum basics
- circuit visualizations
- a simplified QNN lab
- training intuition
- parity vs majority examples
- final insights

## Tech Stack

- React
- Vite
- React Router
- Custom CSS
- SVG-based circuit visuals

## Project Structure

```text
public/
  assets/
    circuits/
src/
  components/
  data/
  pages/
  App.jsx
  main.jsx
index.html
package.json
vite.config.js
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Notes

- The app uses `HashRouter`, which makes it easier to host on GitHub Pages.
- The original paper PDF is included in `public/1802.06002v2.pdf`.

## Author

Final project for Quantum / Quantum Machine Learning coursework.

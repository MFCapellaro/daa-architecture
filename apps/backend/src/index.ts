import express from 'express';
import cors from 'cors';
import { directoryRouter } from './routes/directory.js';

const app = express();

app.use(cors());
app.use(express.json());

// Montaje de las rutas del directorio y mapa
app.use(directoryRouter);

// Compatibilidad con rutas anteriores si aplica
app.use('/api/operators', directoryRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});
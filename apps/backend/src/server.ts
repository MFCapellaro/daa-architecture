import express from 'express';
import cors from 'cors';
import { directoryRouter } from './routes/directory.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(directoryRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});

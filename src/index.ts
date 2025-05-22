import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import autoRoutes from "./routes/auto.routes";
import passwordRoutes from "./routes/password.routes";
import registroHostRoutes from "./routes/registroHost.routes";
import authRoutes from "./routes/auth.routes";

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', autoRoutes);
app.use('/api', passwordRoutes);
app.use('/api', registroHostRoutes);
app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.send('Bienvenido al back de REDIBO');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
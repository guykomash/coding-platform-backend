import 'dotenv/config';
import express from 'express';
const app = express();

import cors from 'cors';
import logger from './middleware/logger';
import { corsOptions } from './config/corsOptions';
import codeBlockRouter from './routes/codeblockRoute';
import { connectDB } from './config/dbConnection';

connectDB();

app.use(logger);
app.use(cors(corsOptions));

// Routes

app.use('/codeblock', codeBlockRouter);

export default app;

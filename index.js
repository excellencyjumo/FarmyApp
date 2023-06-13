// import path from 'path';
import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config({path: './config.env'});
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';
import routes from './src/routes/index.js';

const port = process.env.PORT || 5000;

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {
  serverSelectionTimeoutMS: 5000
}).catch(err => console.log(err.reason));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());


app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));

routes(app)
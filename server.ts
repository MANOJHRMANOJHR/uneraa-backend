import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import authRouter from './src/routes/auth.routes';
import { globalErrorHandler } from './src/middleware/globalError';
import bodyParser from 'body-parser';
import passport from 'passport';
import postRouter from './src/routes/post.routes';
import { RegisterRoutes } from './build/routes';
import swaggerDocument from './src/docs/swagger.json';

import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(passport.initialize());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve Swagger API documentation
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ✅ TSOA-generated routes
RegisterRoutes(app); 
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/post', postRouter);
app.get('/', (req, res) => {
  res.send('Hello UNERRA!');
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    globalErrorHandler(err, req, res, next);
  }
);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('swagger docs available at http://localhost:8080/api/v1/docs');
});

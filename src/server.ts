import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import session from "express-session";


import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { userRouter } from "@/api/user/userRouter";
import freeAgentRouter from "@/api/freeagent/freeAgentRouter";
import steamRouter  from "@/api/steam/steamRouter";



import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import connectDB from "@/common/utils/db"


const logger = pino({ name: "server start" });
const app: Express = express();
connectDB();
// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

app.use(
   session({
    secret: 'heheh',
    resave: false,
    saveUninitialized: false, 
    cookie: {
      secure: true, 
      httpOnly: true,
      sameSite: 'lax', 
    },
  })
);
// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/users", userRouter);
app.use("/free-agents", freeAgentRouter);
app.use("/steam", steamRouter); 


// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };

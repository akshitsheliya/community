import express from 'express';
import { getAppVersion } from '../controllers/appVersionController';
import { verifyToken } from '../middleware/authMiddleware';

const Router = express.Router();

// Protected route (authentication and community access required)
Router.get('/version', verifyToken, getAppVersion as express.RequestHandler);
export default Router;
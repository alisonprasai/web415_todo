import express from "express";
import signup from "../controllers/auth/signup";
import login from "../controllers/auth/login";
import logout from "../controllers/auth/logout";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
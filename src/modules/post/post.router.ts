import express, { Router } from "express";
import { postController } from "./post.controller";
import isAuthUserPayload, { UserRole } from "../../middleware/auth.middleware";

const router = express.Router();

router.get("/", postController.getAllPosts);
router.get("/me", isAuthUserPayload(UserRole.USER, UserRole.ADMIN), postController.getMyPosts);

router.get("/:id", postController.getPostById);

router.post("/", isAuthUserPayload(UserRole.USER), postController.createPost);

export const postRouter: Router = router;

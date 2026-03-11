import express, {Router} from 'express';
import isAuthUserPayload, { UserRole } from '../../middleware/auth.middleware';
import { commentController } from './comment.controller';

const router = express.Router();

router.post("/", isAuthUserPayload(UserRole.USER, UserRole.ADMIN), commentController.createComment);
router.get("/author/:authorId", commentController.getCommentByAuthorId);
router.patch("/:id/moderate", isAuthUserPayload(UserRole.ADMIN), commentController.moderateComment);
router.get("/:id", commentController.getCommentById);
router.patch("/:id", isAuthUserPayload(UserRole.USER, UserRole.ADMIN), commentController.updateCommentById);
router.delete("/:id", isAuthUserPayload(UserRole.USER, UserRole.ADMIN), commentController.deleteComment);

export const commentRouter: Router = router;

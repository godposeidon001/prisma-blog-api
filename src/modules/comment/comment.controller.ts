import { Request, Response } from "express";
import { commentService } from "./comment.service";

const VALID_COMMENT_STATUSES = ["APPROVED", "REJECTED"] as const;
type CommentStatusValue = (typeof VALID_COMMENT_STATUSES)[number];

const createComment = async (req: Request, res: Response) => {
  try {
    const result = await commentService.createComment(req.body, req.user);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (error.message === "Post not found") {
        return res.status(404).json({ error: "Post not found" });
      }

      if (error.message === "Parent comment not found") {
        return res.status(404).json({ error: "Parent comment not found" });
      }

      if (error.message === "Parent comment does not belong to this post") {
        return res
          .status(400)
          .json({ error: "Parent comment does not belong to this post" });
      }
    }

    res.status(500).json({ error: "Failed to create comment" });
  }
};

const getCommentById = async (req: Request, res: Response) => {
  try {
    const idValue = req.params.id;
    const id = Array.isArray(idValue) ? idValue[0] : idValue;

    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return res.status(400).json({ error: "Invalid comment id" });
    }

    const result = await commentService.getCommentById(id);

    if (!result) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comment" });
  }
};

const getCommentByAuthorId = async (req: Request, res: Response) => {
  try {
    const authorIdValue = req.params.authorId;
    const authorId = Array.isArray(authorIdValue) ? authorIdValue[0] : authorIdValue;

    if (!authorId || typeof authorId !== "string" || authorId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid author id" });
    }

    const result = await commentService.getCommentByAuthorId(authorId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments by author" });
  }
};

const deleteComment = async (req: Request, res: Response) => {
  try {
    const idValue = req.params.id;
    const id = Array.isArray(idValue) ? idValue[0] : idValue;

    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return res.status(400).json({ error: "Invalid comment id" });
    }

    const result = await commentService.deleteComment(id, req.user);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (error.message === "Comment not found") {
        return res.status(404).json({ error: "Comment not found" });
      }

      if (error.message === "Forbidden") {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    res.status(500).json({ error: "Failed to delete comment" });
  }
};

const updateCommentById = async (req: Request, res: Response) => {
  try {
    const idValue = req.params.id;
    const id = Array.isArray(idValue) ? idValue[0] : idValue;

    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return res.status(400).json({ error: "Invalid comment id" });
    }

    const result = await commentService.updateCommentById(id, req.body, req.user);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (error.message === "Comment not found") {
        return res.status(404).json({ error: "Comment not found" });
      }

      if (error.message === "Forbidden") {
        return res.status(403).json({ error: "Forbidden" });
      }

      if (error.message === "Content is required") {
        return res.status(400).json({ error: "Content is required" });
      }
    }

    res.status(500).json({ error: "Failed to update comment" });
  }
};

const moderateComment = async (req: Request, res: Response) => {
  try {
    const idValue = req.params.id;
    const id = Array.isArray(idValue) ? idValue[0] : idValue;

    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return res.status(400).json({ error: "Invalid comment id" });
    }

    const rawStatus = req.body?.status;
    const normalizedStatus = String(rawStatus).toUpperCase() as CommentStatusValue;

    if (!VALID_COMMENT_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        error: "Invalid status value. Use status=APPROVED or status=REJECTED",
      });
    }

    const result = await commentService.moderateComment(
      id,
      { status: normalizedStatus },
      req.user,
    );
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (error.message === "Forbidden") {
        return res.status(403).json({ error: "Forbidden" });
      }

      if (error.message === "Comment not found") {
        return res.status(404).json({ error: "Comment not found" });
      }

      if (error.message === "Comment already has this status") {
        return res.status(400).json({ error: "Comment already has this status" });
      }
    }

    res.status(500).json({ error: "Failed to moderate comment" });
  }
};

export const commentController = {
  createComment,
  getCommentById,
  getCommentByAuthorId,
  deleteComment,
  updateCommentById,
  moderateComment,
};

import { prisma } from "../../lib/prisma";

type AuthUser = {
  id: string;
  role?: "user" | "admin";
};

type CreateCommentPayload = {
  content: string;
  postId: string;
  parentId?: string;
};

type UpdateCommentPayload = {
  content: string;
};

type ModerateCommentPayload = {
  status: "APPROVED" | "REJECTED";
};

const createComment = async (data: CreateCommentPayload, user?: AuthUser) => {
  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const postExists = await prisma.post.findUnique({
    where: {
      id: data.postId,
    },
  });

  if (!postExists) {
    throw new Error("Post not found");
  }

  if (data.parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: {
        id: data.parentId,
      },
      select: {
        id: true,
        postId: true,
      },
    });

    if (!parentComment) {
      throw new Error("Parent comment not found");
    }

    if (parentComment.postId !== data.postId) {
      throw new Error("Parent comment does not belong to this post");
    }
  }

  const result = await prisma.comment.create({
    data: {
      ...data,
      authorId: user.id,
    },
  });

  return result;
};

const getCommentById = async (id: string) => {
  const result = await prisma.comment.findUnique({
    where: { id },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          views: true,
        },
      },
      replies: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return result;
};

const getCommentByAuthorId = async (authorId: string) => {
  const result = await prisma.comment.findMany({
    where: { authorId },
    include: {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const deleteComment = async (id: string, user?: AuthUser) => {
  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const existingComment = await prisma.comment.findUnique({
    where: { id },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!existingComment) {
    throw new Error("Comment not found");
  }

  if (existingComment.authorId !== user.id) {
    throw new Error("Forbidden");
  }

  const result = await prisma.comment.delete({
    where: { id },
  });

  return result;
};

const updateCommentById = async (
  id: string,
  data: UpdateCommentPayload,
  user?: AuthUser,
) => {
  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  if (typeof data.content !== "string" || data.content.trim().length === 0) {
    throw new Error("Content is required");
  }

  const existingComment = await prisma.comment.findUnique({
    where: { id },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!existingComment) {
    throw new Error("Comment not found");
  }

  if (existingComment.authorId !== user.id) {
    throw new Error("Forbidden");
  }

  const result = await prisma.comment.update({
    where: { id },
    data: {
      content: data.content.trim(),
    },
  });

  return result;
};

const moderateComment = async (
  id: string,
  data: ModerateCommentPayload,
  user?: AuthUser,
) => {
  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }

  const existingComment = await prisma.comment.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existingComment) {
    throw new Error("Comment not found");
  }

  if (existingComment.status === data.status) {
    throw new Error("Comment already has this status");
  }

  const result = await prisma.comment.update({
    where: { id },
    data: {
      status: data.status,
    },
  });

  return result;
};

export const commentService = {
  createComment,
  getCommentById,
  getCommentByAuthorId,
  deleteComment,
  updateCommentById,
  moderateComment,
};

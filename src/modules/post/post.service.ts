import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

type CreatePostPayload = Omit<
  Prisma.PostUncheckedCreateInput,
  "id" | "createdAt" | "updatedAt" | "authorId"
>;

type AuthUser = {
  id: string;
};

type PostFilters = {
  search?: string;
  tags?: string[];
  featured?: boolean;
  authorId?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

const createPost = async (data: CreatePostPayload, user?: AuthUser) => {
  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: user.id,
    },
  });

  return result;
};

const getAllPosts = async (filters: PostFilters = {}) => {
  const { search, tags = [], featured, authorId, status } = filters;
  const andFilters: Prisma.PostWhereInput[] = [];

  if (search) {
    andFilters.push({
      OR: [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (tags.length > 0) {
    andFilters.push({
      tags: {
        hasSome: tags,
      },
    });
  }

  if (featured !== undefined) {
    andFilters.push({
      isFeatured: featured,
    });
  }

  if (authorId) {
    andFilters.push({
      authorId,
    });
  }

  if (status) {
    andFilters.push({
      status,
    });
  }

  const result = await prisma.post.findMany({
    where: andFilters.length > 0 ? { AND: andFilters } : {},
  });
  return result;
};

export const postService = {
  createPost,
  getAllPosts,
};

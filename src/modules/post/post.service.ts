import { Prisma } from "../../../generated/prisma/client";
import type { SortByField, SortOrderValue } from "../../helpers/PaginationSorting";
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
  limit?: number;
  skip?: number;
  page?: number;
  sortBy?: SortByField;
  sortOrder?: SortOrderValue;
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
  const { search, tags = [], featured, authorId, status, limit, skip, page, sortBy, sortOrder } = filters;
  const andFilters: Prisma.PostWhereInput[] = [];
  const currentPage = page ?? 1;
  const currentLimit = limit ?? 10;

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

  const orderBy: Prisma.PostOrderByWithRelationInput = sortBy
    ? ({
        [sortBy]: sortOrder ?? "desc",
      } as Prisma.PostOrderByWithRelationInput)
    : { createdAt: "desc" };

  const result = await prisma.post.findMany({
    where: andFilters.length > 0 ? { AND: andFilters } : {},
    orderBy,
    ...(limit !== undefined ? { take: limit } : {}),
    ...(skip !== undefined ? { skip } : {}),
  });
  //return result;

  const count = await prisma.post.count({
    where: andFilters.length > 0 ? { AND: andFilters } : {},
  });
  
  return {
    posts: result,
    pagination:{
      total: count,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(count / currentLimit),
    }
  };
};

const getPostById = async (id: string) => {
  const existingPost = await prisma.post.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingPost) {
    return null;
  }

  const result = await prisma.post.update({
    where: { id },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  return result;
};

export const postService = {
  createPost,
  getAllPosts,
  getPostById,
};

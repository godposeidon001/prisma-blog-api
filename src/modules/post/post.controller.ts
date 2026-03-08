import { Request, Response } from "express";
import { parsePaginationSorting } from "../../helpers/PaginationSorting";
import { postService } from "./post.service";

const VALID_POST_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
type PostStatusValue = (typeof VALID_POST_STATUSES)[number];

const getAllPosts = async (req: Request, res: Response) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;

    const tags =
      typeof req.query.tags === "string"
        ? req.query.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : Array.isArray(req.query.tags)
          ? req.query.tags
              .map((tag) => String(tag).trim())
              .filter(Boolean)
          : [];

    let featured: boolean | undefined;
    const hasIsFeatured = Object.prototype.hasOwnProperty.call(
      req.query,
      "isFeatured",
    );

    if (hasIsFeatured) {
      const isFeaturedValue = Array.isArray(req.query.isFeatured)
        ? req.query.isFeatured[0]
        : req.query.isFeatured;

      if (isFeaturedValue === "true") {
        featured = true;
      } else if (isFeaturedValue === "false") {
        featured = false;
      } else {
        return res.status(400).json({
          error: "Invalid isFeatured value. Use isFeatured=true or isFeatured=false",
        });
      }
    }

    const authorId =
      typeof req.query.authorId === "string" ? req.query.authorId.trim() : undefined;

    let status: PostStatusValue | undefined;
    const hasStatus = Object.prototype.hasOwnProperty.call(req.query, "status");
    if (hasStatus) {
      const statusValue = Array.isArray(req.query.status)
        ? req.query.status[0]
        : req.query.status;

      const normalizedStatus = String(statusValue).toUpperCase() as PostStatusValue;
      if (!VALID_POST_STATUSES.includes(normalizedStatus)) {
        return res.status(400).json({
          error:
            "Invalid status value. Use status=DRAFT, status=PUBLISHED, or status=ARCHIVED",
        });
      }
      status = normalizedStatus;
    }

    const filters: {
      tags: string[];
      search?: string;
      featured?: boolean;
      authorId?: string;
      status?: PostStatusValue;
      limit: number;
      skip: number;
      sortBy: "createdAt" | "updatedAt" | "title" | "views";
      sortOrder: "asc" | "desc";
    } = { tags, limit: 10, skip: 0, sortBy: "createdAt", sortOrder: "desc" };

    if (search !== undefined) {
      filters.search = search;
    }
    if (featured !== undefined) {
      filters.featured = featured;
    }
    if (authorId) {
      filters.authorId = authorId;
    }
    if (status !== undefined) {
      filters.status = status;
    }

    const paginationSortingResult = parsePaginationSorting(req.query);
    if (!paginationSortingResult.ok) {
      return res.status(400).json({
        error: paginationSortingResult.error,
      });
    }

    filters.limit = paginationSortingResult.data.limit;
    filters.skip = paginationSortingResult.data.skip;
    filters.sortBy = paginationSortingResult.data.sortBy;
    filters.sortOrder = paginationSortingResult.data.sortOrder;

    const result = await postService.getAllPosts(filters);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

const createPost = async (req: Request, res: Response) => {
  try {
    const result = await postService.createPost(req.body, req.user);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.status(500).json({ error: "Failed to create post" });
  }
};

export const postController = {
  createPost,
  getAllPosts,
};

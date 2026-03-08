import { Request } from "express";

export const VALID_SORT_FIELDS = ["createdAt", "updatedAt", "title", "views"] as const;
export type SortByField = (typeof VALID_SORT_FIELDS)[number];

export const VALID_SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrderValue = (typeof VALID_SORT_ORDERS)[number];

export type PaginationSortingData = {
  page: number;
  limit: number;
  skip: number;
  sortBy: SortByField;
  sortOrder: SortOrderValue;
};

type PaginationSortingResult =
  | {
      ok: true;
      data: PaginationSortingData;
    }
  | {
      ok: false;
      error: string;
    };

const getSingleQueryValue = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : undefined;
  }

  return typeof value === "string" ? value : undefined;
};

export const parsePaginationSorting = (
  query: Request["query"],
): PaginationSortingResult => {
  const rawPage = getSingleQueryValue(query.page);
  const rawLimit = getSingleQueryValue(query.limit);

  const page = rawPage === undefined ? 1 : Number(rawPage);
  const limit = rawLimit === undefined ? 10 : Number(rawLimit);

  if (!Number.isInteger(page) || page < 1) {
    return {
      ok: false,
      error: "Invalid page value. Use a positive integer (page >= 1).",
    };
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return {
      ok: false,
      error: "Invalid limit value. Use an integer between 1 and 100.",
    };
  }

  const sortByValue = getSingleQueryValue(query.sortBy);
  if (
    sortByValue !== undefined &&
    !VALID_SORT_FIELDS.includes(sortByValue as SortByField)
  ) {
    return {
      ok: false,
      error:
        "Invalid sortBy value. Use sortBy=createdAt, sortBy=updatedAt, sortBy=title, or sortBy=views",
    };
  }

  const sortOrderValue = getSingleQueryValue(query.sortOrder);
  if (
    sortOrderValue !== undefined &&
    !VALID_SORT_ORDERS.includes(sortOrderValue as SortOrderValue)
  ) {
    return {
      ok: false,
      error: "Invalid sortOrder value. Use sortOrder=asc or sortOrder=desc",
    };
  }

  const sortBy = (sortByValue as SortByField | undefined) ?? "createdAt";
  const sortOrder = (sortOrderValue as SortOrderValue | undefined) ?? "desc";
  const skip = (page - 1) * limit;

  return {
    ok: true,
    data: {
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    },
  };
};

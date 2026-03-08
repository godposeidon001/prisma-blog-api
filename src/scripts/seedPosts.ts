import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";

const TOTAL_POSTS = 30;

const titlePrefixes = [
  "Getting Started with",
  "Advanced Guide to",
  "Common Mistakes in",
  "Practical Patterns for",
  "Best Practices for",
] as const;

const topics = [
  "TypeScript",
  "Node.js",
  "Express",
  "Prisma ORM",
  "PostgreSQL",
  "REST API Design",
  "Authentication",
  "System Design",
  "Testing",
  "Performance Optimization",
] as const;

const tagPool = [
  "typescript",
  "node",
  "express",
  "prisma",
  "postgres",
  "api",
  "auth",
  "testing",
  "backend",
  "web",
] as const;

const statuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
type PostStatusValue = (typeof statuses)[number];

const pickOne = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)] as T;

const pickTags = (): string[] => {
  const count = 2 + Math.floor(Math.random() * 3); // 2-4 tags
  const selected = new Set<string>();

  while (selected.size < count) {
    selected.add(pickOne(tagPool));
  }

  return [...selected];
};

const pickStatus = (): PostStatusValue => {
  const roll = Math.random();
  if (roll < 0.7) return "PUBLISHED";
  if (roll < 0.9) return "DRAFT";
  return "ARCHIVED";
};

async function seedPosts() {
  try {
    const existingUsers = await prisma.user.findMany({
      select: { id: true },
    });

    const authorIds =
      existingUsers.length > 0
        ? existingUsers.map((user) => user.id)
        : ["seed-author-1", "seed-author-2", "seed-author-3"];

    const data: Prisma.PostCreateManyInput[] = Array.from(
      { length: TOTAL_POSTS },
      (_, index) => {
        const topic = pickOne(topics);
        const title = `${pickOne(titlePrefixes)} ${topic} (${index + 1})`;
        const status = pickStatus();

        return {
          title,
          content: `This post covers practical ideas about ${topic}. It includes core concepts, implementation notes, and production tips for real projects.`,
          thumbnail: `https://picsum.photos/seed/post-${index + 1}/800/450`,
          isFeatured: Math.random() < 0.25,
          status,
          tags: pickTags(),
          views: Math.floor(Math.random() * 5000),
          authorId: pickOne(authorIds),
        };
      },
    );

    const result = await prisma.post.createMany({ data });
    console.log(`Seeded ${result.count} posts successfully.`);
  } catch (error) {
    console.error("Error seeding posts:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void seedPosts();

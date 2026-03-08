import { prisma } from "../lib/prisma";
import { UserRole } from "../middleware/auth.middleware";

async function seedAdmin() {
  try {
    const requiredEnv = [
      "ADMIN_NAME",
      "ADMIN_EMAIL",
      "ADMIN_PASSWORD",
    ] as const;

    for (const key of requiredEnv) {
      if (!process.env[key]) {
        throw new Error(`Missing environment variable: ${key}`);
      }
    }

    const adminData = {
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: UserRole.ADMIN,
    };

    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminData.email!,
      },
    });

    if (existingUser) {
      throw new Error("Admin user already exists");
    }

    const signUpAdmin = await fetch(
      "http://localhost:3000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": process.env.APP_URL || "http://localhost:4000",
        },
        body: JSON.stringify(adminData),
      },
    );

    if (!signUpAdmin.ok) {
      const errorData = await signUpAdmin.json();
      throw new Error(`Failed to create admin user: ${errorData.message}`);
    }

    if(signUpAdmin.ok) {
      await prisma.user.update({
        where: {
          email: adminData.email!,
        },
        data: {
          emailVerified: true,
        },
      });
      console.log("Admin user created successfully");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}

seedAdmin();

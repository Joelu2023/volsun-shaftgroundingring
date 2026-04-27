import { randomBytes, scryptSync } from "node:crypto";

type ResourceAdminRoleCode = "admin" | "editor";

type RcRoleRecord = {
  id: string;
  code: ResourceAdminRoleCode;
};

type RcUserRecord = {
  id: string;
  username: string;
};

type RcUserRoleRecord = {
  userId: string;
  roleId: string;
};

type RcRoleDelegate = {
  findUnique(args: { where: { code: ResourceAdminRoleCode } }): Promise<RcRoleRecord | null>;
  create(args: {
    data: {
      code: ResourceAdminRoleCode;
      name: string;
      description?: string;
    };
  }): Promise<RcRoleRecord>;
};

type RcUserDelegate = {
  findUnique(args: { where: { username: string } }): Promise<RcUserRecord | null>;
  create(args: {
    data: {
      username: string;
      displayName: string;
      passwordHash: string;
      status: "active";
    };
  }): Promise<RcUserRecord>;
  update(args: {
    where: { id: string };
    data: {
      displayName?: string;
      passwordHash?: string;
      status?: "active";
    };
  }): Promise<RcUserRecord>;
};

type RcUserRoleDelegate = {
  findUnique(args: {
    where: { userId_roleId: { userId: string; roleId: string } };
  }): Promise<RcUserRoleRecord | null>;
  create(args: {
    data: {
      userId: string;
      roleId: string;
    };
  }): Promise<RcUserRoleRecord>;
};

type PrismaClientLike = {
  $disconnect(): Promise<void>;
  rcRole: RcRoleDelegate;
  rcUser: RcUserDelegate;
  rcUserRole: RcUserRoleDelegate;
};

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_DISPLAY_NAME = "Resource Center Admin";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function createPrismaClient(): PrismaClientLike {
  const databaseUrl = requireEnv("DATABASE_URL");

  try {
    const runtimeRequire = eval("require") as <T>(id: string) => T;
    const { PrismaClient } = runtimeRequire<{
      PrismaClient: new (options: { accelerateUrl: string } | { adapter: unknown }) => PrismaClientLike;
    }>("@prisma/client");

    if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
      const { Pool } = runtimeRequire<{ Pool: new (options: { connectionString: string }) => unknown }>("pg");
      const { PrismaPg } = runtimeRequire<{
        PrismaPg: new (pool: unknown) => unknown;
      }>("@prisma/adapter-pg");
      const pool = new Pool({ connectionString: databaseUrl });
      const adapter = new PrismaPg(pool);
      return new PrismaClient({ adapter });
    }

    return new PrismaClient({ accelerateUrl: databaseUrl });
  } catch (error) {
    throw new Error(
      "Prisma client is not available. Run `npx prisma generate` after dependencies are installed.",
      { cause: error },
    );
  }
}

async function ensureRole(
  prisma: PrismaClientLike,
  code: ResourceAdminRoleCode,
  name: string,
  description: string,
): Promise<RcRoleRecord> {
  const existing = await prisma.rcRole.findUnique({ where: { code } });
  if (existing) {
    return existing;
  }

  return prisma.rcRole.create({
    data: {
      code,
      name,
      description,
    },
  });
}

async function ensureAdminUser(
  prisma: PrismaClientLike,
  passwordHash: string,
): Promise<RcUserRecord> {
  const existing = await prisma.rcUser.findUnique({
    where: { username: DEFAULT_ADMIN_USERNAME },
  });

  if (existing) {
    return prisma.rcUser.update({
      where: { id: existing.id },
      data: {
        displayName: DEFAULT_ADMIN_DISPLAY_NAME,
        passwordHash,
        status: "active",
      },
    });
  }

  return prisma.rcUser.create({
    data: {
      username: DEFAULT_ADMIN_USERNAME,
      displayName: DEFAULT_ADMIN_DISPLAY_NAME,
      passwordHash,
      status: "active",
    },
  });
}

async function ensureUserRole(
  prisma: PrismaClientLike,
  userId: string,
  roleId: string,
): Promise<void> {
  const existing = await prisma.rcUserRole.findUnique({
    where: { userId_roleId: { userId, roleId } },
  });

  if (existing) {
    return;
  }

  await prisma.rcUserRole.create({
    data: {
      userId,
      roleId,
    },
  });
}

async function main() {
  const bootstrapPassword = requireEnv("RC_BOOTSTRAP_ADMIN_PASSWORD");
  const prisma = createPrismaClient();

  try {
    const adminRole = await ensureRole(
      prisma,
      "admin",
      "Administrator",
      "Full access to Resource Center administration.",
    );
    await ensureRole(
      prisma,
      "editor",
      "Editor",
      "Can create and edit Resource Center content without publish privileges.",
    );

    const adminUser = await ensureAdminUser(prisma, hashPassword(bootstrapPassword));
    await ensureUserRole(prisma, adminUser.id, adminRole.id);

    console.info("Resource Center Phase 1 seed completed.");
    console.info(`Admin username: ${DEFAULT_ADMIN_USERNAME}`);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error("Resource Center Phase 1 seed failed.");
  console.error(error);
  process.exit(1);
});

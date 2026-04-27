declare global {
  var __resourceCenterDbClient__: ResourceCenterDbClient | undefined;
  var __resourceCenterDbUrl__: string | undefined;
}

export type ResourceCenterDbClient = {
  readonly provider: "prisma";
  $connect?: () => Promise<void>;
  $disconnect?: () => Promise<void>;
} & Record<string, unknown>;

function createResourceCenterDbClient(): ResourceCenterDbClient {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error(
      "Resource Center Prisma client cannot start because DATABASE_URL is not configured.",
    );
  }

  try {
    const runtimeRequire = eval("require") as <T>(id: string) => T;
    const { PrismaClient } = runtimeRequire<{
      PrismaClient: new (options: { accelerateUrl: string } | { adapter: unknown }) => ResourceCenterDbClient;
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
      "Resource Center Prisma client is not available yet. Install and generate Prisma client before enabling DB access.",
      { cause: error },
    );
  }
}

export function getResourceCenterDbClient(): ResourceCenterDbClient {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error(
      "Resource Center Prisma client cannot start because DATABASE_URL is not configured.",
    );
  }

  if (!globalThis.__resourceCenterDbClient__) {
    globalThis.__resourceCenterDbClient__ = createResourceCenterDbClient();
    globalThis.__resourceCenterDbUrl__ = databaseUrl;
    return globalThis.__resourceCenterDbClient__;
  }

  if (globalThis.__resourceCenterDbUrl__ !== databaseUrl) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL changed in production, aborting to prevent inconsistent connections");
    }

    console.warn("Prisma client reinitialized due to DATABASE_URL change");
    globalThis.__resourceCenterDbClient__ = createResourceCenterDbClient();
    globalThis.__resourceCenterDbUrl__ = databaseUrl;
  }

  return globalThis.__resourceCenterDbClient__;
}

export const resourceCenterDbClient = new Proxy({} as ResourceCenterDbClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getResourceCenterDbClient(), prop, receiver);
  },
});

import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
					id: text("id").primaryKey(),
					name: text("name").notNull(),
					email: text("email").notNull().unique(),
					emailVerified: boolean("emailVerified").notNull(),
					image: text("image"),
					createdAt: timestamp("createdAt").notNull(),
					updatedAt: timestamp("updatedAt").notNull(),
					role: text("role").notNull().default('tutor'), // 'tutor' | 'walker' | 'admin'
});

export const session = pgTable("session", {
					id: text("id").primaryKey(),
					expiresAt: timestamp("expiresAt").notNull(),
					token: text("token").notNull().unique(),
					createdAt: timestamp("createdAt").notNull(),
					updatedAt: timestamp("updatedAt").notNull(),
					ipAddress: text("ipAddress"),
					userAgent: text("userAgent"),
					userId: text("userId").notNull().references(()=> user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
					id: text("id").primaryKey(),
					accountId: text("accountId").notNull(),
					providerId: text("providerId").notNull(),
					userId: text("userId").notNull().references(()=> user.id, { onDelete: 'cascade' }),
					accessToken: text("accessToken"),
					refreshToken: text("refreshToken"),
					idToken: text("idToken"),
					accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
					refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
					scope: text("scope"),
					password: text("password"),
					createdAt: timestamp("createdAt").notNull(),
					updatedAt: timestamp("updatedAt").notNull()
});

export const verification = pgTable("verification", {
					id: text("id").primaryKey(),
					identifier: text("identifier").notNull(),
					value: text("value").notNull(),
					expiresAt: timestamp("expiresAt").notNull(),
					createdAt: timestamp("createdAt"),
					updatedAt: timestamp("updatedAt")
});

export const pets = pgTable("pets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ownerId: text("ownerId").notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  breed: text("breed"),
  age: integer("age"),
  weight: integer("weight"), // em kg
  photoUrl: text("photoUrl"), // base64 mock
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const walkers = pgTable("walkers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  bio: text("bio"),
  pricePerWalk: integer("pricePerWalk").notNull().default(0), // em centavos
  rating: integer("rating").default(0), // vezes 10, ex: 45 = 4.5
  experienceYears: integer("experienceYears").default(0),
  available: boolean("available").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const walks = pgTable("walks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  petId: text("petId").notNull().references(() => pets.id),
  ownerId: text("ownerId").notNull().references(() => user.id),
  walkerId: text("walkerId").notNull().references(() => walkers.id),
  scheduledDate: timestamp("scheduledDate").notNull(),
  durationMinutes: integer("durationMinutes").notNull().default(30),
  status: text("status").notNull().default('pending'), // pending, accepted, rejected, completed, cancelled
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  walkId: text("walkId").notNull().references(() => walks.id),
  ownerId: text("ownerId").notNull().references(() => user.id),
  walkerId: text("walkerId").notNull().references(() => walkers.id),
  rating: integer("rating").notNull(), // 1 a 5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

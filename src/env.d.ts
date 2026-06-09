// Type declarations for environment variables

declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI: string;
    NEXTAUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    NODE_ENV: "development" | "production" | "test";
  }
}

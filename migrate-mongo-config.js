import dotenv from "dotenv";
dotenv.config();

const config = {
  mongodb: {
    url: process.env.MONGODB_URI,
    databaseName: "CraveNow",
    options: {
      // options if needed
    },
  },
  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  moduleSystem: "esm",
  useFileHash: false,
};

export default config;

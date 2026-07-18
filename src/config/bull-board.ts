import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { Queue } from "bullmq";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

export const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

async function discoverQueues(): Promise<Queue[]> {
  const queues: Queue[] = [];
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const srcRoot = path.resolve(__dirname, "..");

  const scanDirectory = async (dir: string) => {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== "node_modules" && entry.name !== ".git") {
            await scanDirectory(fullPath);
          }
        } else if (
          (entry.name.endsWith(".queue.js") ||
            entry.name.endsWith(".queue.ts")) &&
          !fullPath.includes("node_modules")
        ) {
          try {
            const fileUrl = pathToFileURL(fullPath).href;
            const module = await import(fileUrl);
            for (const key of Object.keys(module)) {
              const exported = module[key];

              if (
                exported &&
                (exported instanceof Queue ||
                  (typeof exported === "object" &&
                    exported.constructor &&
                    exported.constructor.name === "Queue" &&
                    typeof exported.add === "function"))
              ) {
                if (!queues.some((q) => q.name === exported.name)) {
                  queues.push(exported);
                }
              }
            }
          } catch (err) {
            console.error(`Failed to import queue file at ${fullPath}:`, err);
          }
        }
      }
    } catch (err) {
      console.error(`Failed to read directory ${dir}:`, err);
    }
  };

  await scanDirectory(srcRoot);
  return queues;
}

export async function initBullBoard(): Promise<void> {
  try {
    const queues = await discoverQueues();
    const adapters = queues.map((queue) => new BullMQAdapter(queue));

    createBullBoard({
      queues: adapters,
      serverAdapter,
    });

    console.log(
      `[Bull Board] Successfully initialized with ${queues.length} queues: ${queues.map((q) => q.name).join(", ")}`,
    );
  } catch (err) {
    console.error("[Bull Board] Failed to initialize Bull Board:", err);
  }
}

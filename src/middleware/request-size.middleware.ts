import express from "express";

export const jsonSizeLimit = express.json({ limit: "10kb" });

export const urlEncodedSizeLimit = express.urlencoded({
  extended: true,
  limit: "10kb",
});

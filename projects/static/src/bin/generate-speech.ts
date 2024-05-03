import { createHash } from "crypto";
import { spawnSync } from "node:child_process";
import { createReadStream } from "node:fs";
import { glob, mkdir, rename, rm } from "node:fs/promises";
import { dirname } from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { phrases, voices } from "../speechData";

yargs(hideBin(process.argv))
  .usage(
    "$0",
    "generate audio files for each phrase and voice",
    (y) => y,
    async (argv) => {
      for (const voice of voices) {
        for (const phrase of phrases) {
          const tempPath = "speech.aac";
          spawnSync("say", ["-v", voice.name, "-o", tempPath, phrase.text]);
          const md5Hash = await createMD5(tempPath);
          const destPathPrefix = `public/speech/${phrase.id}/${voice.id}-`;
          const destPath = `${destPathPrefix}${md5Hash}.aac`;
          await mkdir(dirname(destPath), { recursive: true });

          // Delete all existing files for the given phase and voice.
          for await (const path of glob(`${destPathPrefix}*`)) {
            const isStale = path !== destPath;
            if (isStale) {
              console.log(`Deleting stale file: ${path}`);
            }
            await rm(path);
          }
          await rename(tempPath, destPath);
        }
      }
    },
  )
  .parse();

function createMD5(filePath: string): Promise<string> {
  return new Promise((res, rej) => {
    const hash = createHash("md5");

    const rStream = createReadStream(filePath);
    rStream.on("data", (data) => {
      hash.update(data);
    });
    rStream.on("end", () => {
      res(hash.digest("hex"));
    });
    rStream.on("error", (err) => rej(err));
  });
}

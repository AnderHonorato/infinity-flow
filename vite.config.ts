import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";
function offlinePlugin() {
  let output = "dist";
  return {
    name: "infinity-flow-offline",
    configResolved(config: { build: { outDir: string } }) {
      output = config.build.outDir;
    },
    closeBundle() {
      const files: string[] = [];
      function walk(dir: string) {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const path = join(dir, entry.name);
          if (entry.isDirectory()) walk(path);
          else if (
            !entry.name.endsWith(".map") &&
            !["sw.js", "servico-worker.js"].includes(entry.name)
          )
            files.push(relative(output, path).replaceAll("\\", "/"));
        }
      }
      walk(output);
      const hash = createHash("sha256");
      for (const file of files) hash.update(readFileSync(join(output, file)));
      const source = `const CACHE='infinity-flow-${hash.digest("hex").slice(0, 12)}';\nconst FILES=${JSON.stringify(files)};\nconst base=new URL('./',self.location.href);\nself.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(file=>new URL(file,base).href))).then(()=>self.skipWaiting()));});\nself.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('infinity-flow-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});\nself.addEventListener('fetch',event=>{const request=event.request;const url=new URL(request.url);if(request.method!=='GET'||url.origin!==base.origin||!url.pathname.startsWith(base.pathname))return;if(request.mode==='navigate'){event.respondWith(fetch(request).catch(()=>caches.match(new URL('index.html',base).href)));return;}event.respondWith(caches.open(CACHE).then(cache=>cache.match(request,{ignoreVary:true})).then(cached=>cached||fetch(request)));});\n`;
      writeFileSync(join(output, "sw.js"), source);
      writeFileSync(join(output, "servico-worker.js"), source);
    },
  };
}
export default defineConfig({
  plugins: [react(), offlinePlugin()],
  server: { host: "0.0.0.0", port: 5173 },
});

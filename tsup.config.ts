import { defineConfig, Options } from "tsup";

export function createTsupConfig({
    entry = ["src/index.ts"],
    platform = 'node',
    format = ['esm', 'cjs'],
    target =  "esnext",
    sourcemap = true,
    dts = true,
    outDir = "dist",
    skipNodeModulesBundle = true,
}: Options) {
    return defineConfig({
        entry,
        platform,
        format,
        target,
        sourcemap,
        dts,
        outDir,
        skipNodeModulesBundle,
    })
}

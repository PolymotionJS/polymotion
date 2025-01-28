<script lang="ts">
	import { emit, currentFrame, on } from "$lib/index.js"
	import { onMount, tick, type Snippet } from "svelte";

    let {
        width,
        height,
        fps,
        durationInFrames,
        children
    }: {
        width: number;
        height: number;
        fps: number;
        durationInFrames: number;
        children: Snippet;
    } = $props();

    onMount(() => {
        emit("ready", {
            width,
            height,
            fps,
            durationInFrames
        });

        on("next-frame", async () => {
            currentFrame.set($currentFrame + 1);
            await tick();
            emit("screenshot");
        });
    });
</script>

{@render children()}
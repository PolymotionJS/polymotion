<script lang="ts">
	import { emit, frame, on } from "$lib/index.js"
	import { onMount, tick, type Snippet } from "svelte";

    let {
        id,
        width,
        height,
        fps,
        durationInFrames,
        children
    }: {
        id: string;
        width: number;
        height: number;
        fps: number;
        durationInFrames: number;
        children: Snippet;
    } = $props();

    onMount(() => {
        emit("ready", {
            id,
            width,
            height,
            fps,
            durationInFrames
        });

        on("next-frame", async () => {
            frame.set($frame + 1);
            await tick();
            emit("screenshot");
        });
    });
</script>

<div class="composition">
    {@render children()}
</div>
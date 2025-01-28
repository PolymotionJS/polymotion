import { PolymotionPlugin } from "./plugin";
import puppeteer from "puppeteer";
import { EventEmitter } from "events";
import { spawn } from "child_process";

export type RenderOptions = {
    plugin: PolymotionPlugin;
}

export async function render(options: RenderOptions) {
    const server = await options.plugin.launchServer();
    const browser = await puppeteer.launch({
        // TODO: remove
        headless: false
    });
    
    const page = await browser.newPage();
    await page.goto(server.url);

    // comms between the page and the plugin
    const clientEmitter = new EventEmitter();
    const serverEmitter = {
        emit: (event: string, message?: object) => {
            page.evaluate((event, message) => {
                // TODO: remove any
                const listeners = (window as any).__polymotion_listeners.get(event)
                if (listeners) 
                    for (const listener of listeners) listener(message);
            }, event, message);
        }
    }

    // Expose listen function to the page
    page.evaluate(() => {
        // TODO: remove any
        (window as any).__polymotion_listeners = new Map<string, ((data: any) => void)[]>();
        (window as any).__polymotion_listen = (event: string, listener: (data: any) => void) => {
            // Initialize the array if it doesn't exist
            if (!(window as any).__polymotion_listeners.has(event))
                (window as any).__polymotion_listeners.set(event, []);
            // Add callback to the array
            (window as any).__polymotion_listeners.get(event)?.push(listener);
        }
    })

    // Expose emit function to the page
    page.exposeFunction("__polymotion_emit", (event: string, data: any) => {
        clientEmitter.emit(event, data);
    });

    let compositionOptions: {
        fps: number;
        width: number;
        height: number;
        durationInFrames: number;
    } | undefined;

    clientEmitter.once("ready", async (data: {
        fps: number;
        width: number;
        height: number;
        durationInFrames: number;
    }) => {
        await page.setViewport({ width: data.width, height: data.height });
        compositionOptions = data;
    });

    await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
            if (compositionOptions) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });

    if (!compositionOptions) {
        // Should never happen
        throw new Error("Composition options not found");
    }

    const frameStream = spawn("ffmpeg", [
            "-y",                          // overwrite output file if it exists
            "-f", "image2pipe",            // input format: pipe of images
            "-r", compositionOptions.fps.toString(), // frame rate: 60 fps
            "-i", "-",                     // input from stdin
            "-vcodec", "libx264",          // output codec: h.264
            "-pix_fmt", "yuv420p",         // pixel format: ensures compatibility
            "-preset", "veryslow",         // slow preset for better compression
            "-crf", "1",                  // constant rate factor (18 = visually lossless)
            "output.mp4",                  // output file name
    ])
    
    for (let i = 0; i < compositionOptions.durationInFrames; i++) {
        serverEmitter.emit("next-frame");

        await new Promise<void>((resolve) => {
            clientEmitter.once("screenshot", () => {
                resolve();
            });
        });

        frameStream.stdin.write(await page.screenshot({
            type: "png",
            optimizeForSpeed: true,
        }));
    }

    frameStream.stdin.end();
    await server.close();
    await browser.close();

    // Wait for the ffmpeg process to finish
    await new Promise<void>((resolve) => {
        if (frameStream.killed)
            resolve();
        else
            frameStream.on("close", resolve);
    });

    return;
}


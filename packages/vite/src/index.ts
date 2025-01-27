import { PolymotionPlugin } from "polymotion";
import { createServer, InlineConfig as ViteConfig } from "vite";


/**
 * Creates a Polymotion plugin for Vite
 * @param {ViteConfig} [viteConfig={}] - Vite configuration
 * @param {Object} [viteConfig.server] - Server configuration
 * @param {string} [viteConfig.server.host=localhost] - Server host
 * @param {number} [viteConfig.server.port=3000] - Server port
 * @param {boolean} [viteConfig.server.hmr=false] - Hot Module Replacement flag
 * @returns {PolymotionPlugin} Polymotion plugin instance
 */
export default function (viteConfig: ViteConfig = {}): PolymotionPlugin {
    const defaultConfig = {
        server: {
            host: "localhost",
            port: 3000,
            hmr: true
        }
    };

    // Merge the default config with the provided config
    const mergedConfig = {
        ...defaultConfig,
        ...viteConfig,
        server: {
            ...defaultConfig.server,
            ...(viteConfig.server || {})
        }
    };

    return {
        launchServer: async () => {
            const server = await createServer(mergedConfig);
            await server.listen();
            return {
                url: `http://${mergedConfig.server.host}:${mergedConfig.server.port}`,
                close: () => {
                    server.close();
                    return Promise.resolve();
                }
            }
        }
    }
}
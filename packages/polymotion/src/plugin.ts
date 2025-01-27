export interface PolymotionPlugin {
    /**
     * Launch the server.
     * @returns The URL of the server.
     */
    launchServer: () => Promise<{
        url: string;
        close: () => Promise<void>;
    }>;
}
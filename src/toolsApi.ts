import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

type Result<T> = T | Error;

let _clientPromise: Promise<Result<ToolsClient>> | null = null;

/**
 * Public interface to a singleton `ToolsClient` interface.
 *
 * TODO: do we want to pull credentials from .env?
 */
export async function getToolsClient(): Promise<Result<ToolsClient>> {
    if (_clientPromise) return _clientPromise;

    _clientPromise = (async (): Promise<Result<ToolsClient>> => {
        const { IGEM_TOOLS_USERNAME: username, IGEM_TOOLS_PASSWORD: password } =
            process.env;

        if (!username || !password) {
            return Error("Missing IGEM_TOOLS_ environment variables.");
        }

        return await ToolsClient.withAuthentication({
            username,
            password,
        });
    })();

    return _clientPromise;
}

class ToolsClient {
    private client: AxiosInstance;

    private constructor() {
        // Internally holds a cookie store so we don't need to constantly re-authenticate our session
        const jar = new CookieJar();
        this.client = wrapper(
            axios.create({
                jar,
                withCredentials: true,
                baseURL: "https://api.igem.org/v1",
            }),
        );
    }

    public static async withAuthentication({
        username,
        password,
    }: {
        username: string;
        password: string;
    }): Promise<Result<ToolsClient>> {
        const instance = new ToolsClient();

        const params = new URLSearchParams({
            identifier: username,
            password,
        });

        try {
            await instance.client.post("/auth/sign-in", params);
            return instance;
        } catch (e) {
            return e instanceof Error ? e : Error("Authentication failed");
        }
    }

    public async upload({
        folderName,
        fileName,
        url,
    }: {
        folderName: string;
        fileName: string;
        url: string;
    }): Promise<Result<null>> {
        // TODO
        // This will probably act like `fileSystem.ts/download`, but instead of downloading locally
        // it will stream data from `url` to the Tools API. You may wish to modularize the current
        // `fileSystem.ts/download` implementation
        return null;
    }

    public async alreadyUploaded({
        folderName,
        fileName,
    }: {
        folderName: string;
        fileName: string;
    }): Promise<Result<boolean>> {
        // TODO
        // Has it been already uploaded?
        return false;
    }
}

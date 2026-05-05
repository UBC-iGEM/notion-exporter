import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

type Result<T> = T | Error;

let _clientPromise: Promise<Result<ToolsClient>> | null = null;

export async function getToolsClient(): Promise<Result<ToolsClient>> {
    if (_clientPromise) return _clientPromise;

    _clientPromise = (async (): Promise<Result<ToolsClient>> => {
        const { IGEM_TOOLS_USERNAME: user, IGEM_TOOLS_PASSWORD: pass } =
            process.env;

        if (!user || !pass) {
            return Error("Missing IGEM_TOOLS_ environment variables.");
        }

        return await ToolsClient.withAuthentication(user, pass);
    })();

    return _clientPromise;
}

class ToolsClient {
    private client: AxiosInstance;

    private constructor() {
        const jar = new CookieJar();
        this.client = wrapper(
            axios.create({
                jar,
                withCredentials: true,
                baseURL: "https://api.igem.org/v1",
            }),
        );
    }

    public static async withAuthentication(
        username: string,
        password: string,
    ): Promise<Result<ToolsClient>> {
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

    public async upload() {
        // TODO
    }
}

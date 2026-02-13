import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000" // Point to your Express server
})

export const { signIn, signUp, useSession } = authClient;

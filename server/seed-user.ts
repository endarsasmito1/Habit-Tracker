
import { auth } from "./src/auth";

async function seedUser() {
    console.log("Creating user...");
    try {
        const user = await auth.api.signUpEmail({
            body: {
                email: "endarsasmito1@gmail.com",
                password: "749283886",
                name: "Endar Sasmito",
            }
        });
        console.log("✅ User created successfully:", user);
    } catch (error) {
        console.error("❌ Failed to create user:", error);
    }
    process.exit(0);
}

seedUser();

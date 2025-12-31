/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Server } from "http";
import app from "./app";
import { envVars } from "./config/envVariable.config";
import mongoose from "mongoose";

let server: Server;

// Bootstrap function to initialize the server
const bootstrap = async () => {
    try {
        // Database config 
        await mongoose.connect(envVars.DB_URL)
            .then(() => {
                console.log("Database is connected.")
            })
            .catch((error) => {
                console.log(`Database error is : ${error.message}`);
            });
        server = app.listen(envVars.PORT, () => {
            console.log(`Server running on port http://localhost:${envVars.PORT}`)
        })
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error during server bootstrap:", error.message);
        }
    }
};

// Start the bootstrap process
(async () => {
    await bootstrap();
})();

const serverShutdown = async (message: string, err?: any) => {
    console.log(`Message: ${message}. Server is closing.`, err || "")
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    };
    process.exit(1);
};

//when server cloud platform stopped
process.on("SIGTERM", () => {
    serverShutdown("SIGTERM received");
});

//when server manually stopped
process.on("SIGINT", () => {
    serverShutdown("SIGINT received");
});

//when synchronous error occurs
process.on("uncaughtException", (error) => {
    serverShutdown("Uncaught Exception occurred", error);
});

//when promise rejection occurs
process.on("unhandledRejection", (error) => {
    serverShutdown("Unhandled Rejection occurred", error);
});
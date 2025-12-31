import { Router } from "express";
import { AuthRouter } from "../modules/auth/auth.route";

interface IRoute {
    path: string;
    route: Router;
}

const router = Router();

const allRoutes: IRoute[] = [
    {
        path: "/auth",
        route: AuthRouter,
    },
];

allRoutes.forEach(({ path, route }) => {
    router.use(path, route);
});
export default router;
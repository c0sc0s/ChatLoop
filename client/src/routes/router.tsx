import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/Auth/login";
import RegisterPage from "../pages/Auth/register";
import Layout from "./layout";
import Home from "@/pages/Home";
import Friends from "@/pages/Friends";
import Setting from "@/pages/Setting";
import RequireAuth from "./auth";
import EmptyChatHint from "@/pages/ChatList/EmptyChat";
import ChatLayout from "@/pages/ChatList/ChatLayout";
import ChatPanel from "@/pages/ChatList/ChatPanel";
import QuickStartVedio from "@/pages/QuickStartVedio/QuickStartVedio";

const router = createBrowserRouter([

    {
        path: "/",
        element: <RequireAuth><Layout /></RequireAuth>,
        children: [
            { path: "home", element: <Home /> },
            {
                path: "/chatlist",
                element: <ChatLayout />, // 左侧列表+右侧内容
                children: [
                    { index: true, element: <EmptyChatHint /> }, // 没选中会话
                    { path: ":id", element: <ChatPanel /> },     // 选中会话
                ]
            },
            { path: "friends", element: <Friends /> },
            { path: "setting", element: <Setting /> },
            { path: "quick-start-vedio", element: <QuickStartVedio /> },
            { index: true, element: <Navigate to="/home" replace /> }, // 这里重定向
        ],

    },
    {
        path: "/auth",
        children: [
            {
                path: "login",
                element: <LoginPage />,
            },
            {
                path: "register",
                element: <RegisterPage />,
            }
        ]
    }

]);

export default router;

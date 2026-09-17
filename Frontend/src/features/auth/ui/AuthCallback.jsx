import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { toast } from "react-toastify";

const AuthCallback = () => {

    const navigate = useNavigate();

    useEffect(() => {

        const finishLogin = async () => {

            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();

            if (error || !session) {
                console.error("Login failed");
                navigate("/login");
                return;
            }

             const token = session.access_token;

            try {
                const response = await fetch(
                    "http://localhost:8000/api/auth/me/",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Django authentication failed");
                }
                const user = await response.json();
                toast.success("User LoggedIn successfully")
                navigate("/main");

            } catch (error) {
                console.error(error);

                navigate("/login");
            }


        };

        

        finishLogin();

    }, [navigate]);

    return <p>Signing in...</p>;
};

export default AuthCallback;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

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

            navigate("/main");
        };

        finishLogin();

    }, [navigate]);

    return <p>Signing in...</p>;
};

export default AuthCallback;

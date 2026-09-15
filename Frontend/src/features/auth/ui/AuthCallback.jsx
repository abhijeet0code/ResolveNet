import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
<<<<<<< HEAD
=======
import { toast } from "react-toastify";
>>>>>>> 1c25876f34c419c95d1485c3e49b00dc2ee2238f

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
<<<<<<< HEAD
=======
                toast.success("User LoggedIn successfully")
>>>>>>> 1c25876f34c419c95d1485c3e49b00dc2ee2238f
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

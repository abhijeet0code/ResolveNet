export function getAuthHeaders() {
    const authType = localStorage.getItem("auth_type");
    if (authType === "supabase") {
        const token =
            localStorage.getItem("supabase_token");

        if (!token) {
            console.error(
                "Supabase token not found"
            );

            return {};
        }

        return {
            Authorization: `Bearer ${token}`,
        };
    }
    const token =
        localStorage.getItem("token");

    if (!token) {
        console.error(
            "Django authentication token not found"
        );

        return {};
    }

    return {
        Authorization: `Token ${token}`,
    };
}
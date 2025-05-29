import { useSession } from "next-auth/react";
import SignUp from "./sign_in_sign_out/sign_up";
import DashboardPage from "./dashboard/dashboard_page";

export default function Home() {
  const { data: sessionData, status } = useSession();

  if (status === "loading") {
    return <p className="mt-10 text-center text-white">Loading session...</p>;
  }

  if (!sessionData) {
    return (
      <div>
        <SignUp />
      </div>
    );
  }

  return (
    <>
      <DashboardPage />
    </>
  );
}

import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const createUser = api.user.createUser.useMutation({
    onSuccess: async () => {
      await signIn("credentials", {
        email: email,
        password: password,
        callbackUrl: "/dashboard/dashboard_page",
      });
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createUser.mutate({ name, email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign Up</h1>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Sign Up
        </button>
        <div className="mt-4 text-center text-sm text-gray-600">
          <Link href="/sign_in_sign_out/sign_in">
            {" "}
            Already have an account?
          </Link>
        </div>
      </div>
    </div>
  );
}

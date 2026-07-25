import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
} from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // TEMPORARY USERS - Will be replaced with API calls
  const users = [
    {
      phone: "9999999999",
      password: "admin123",
      role: "admin",
      name: "Admin",
    },
    {
      phone: "8888888888",
      password: "retailer123",
      role: "retailer",
      name: "Retailer",
    },
    {
      phone: "7777777777",
      password: "driver123",
      role: "driver",
      name: "Driver",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!phone || !password) {
      setError("Please enter your phone number and password.");
      return;
    }

    const user = users.find(
      (user) => user.phone === phone && user.password === password
    );

    if (!user) {
      setError("Invalid phone number or password.");
      return;
    }

    // Use AuthContext login
    login({
      phone: user.phone,
      role: user.role,
      name: user.name,
    });

    // Navigate based on role
    if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else if (user.role === "retailer") {
      navigate("/retailer/dashboard");
    } else if (user.role === "driver") {
      navigate("/driver/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* LEFT SIDE */}
      <section className="relative hidden min-h-screen overflow-hidden bg-[#111714] p-12 text-white lg:flex lg:flex-col xl:p-16">
        <div className="absolute -bottom-52 -right-52 h-[500px] w-[500px] rounded-full border border-white/5" />
        <div className="absolute -bottom-32 -right-32 h-[350px] w-[350px] rounded-full border border-white/5" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-bold text-[#111714]">B</div>
          <div>
            <h2 className="text-[15px] font-bold tracking-[0.2em]">BISMILLAH</h2>
            <p className="mt-1 text-[8px] tracking-[0.35em] text-white/40">CHICKEN CENTER</p>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-xl">
          <p className="mb-6 text-[10px] font-medium tracking-[0.3em] text-white/40">
            WHOLESALE POULTRY MANAGEMENT
          </p>
          <h1 className="text-6xl font-medium leading-[0.95] tracking-[-0.05em] xl:text-7xl">
            Business made
            <br />
            <span className="text-white/35">simple.</span>
          </h1>
          <p className="mt-8 max-w-md text-sm leading-7 text-white/45">
            Manage retailers, orders, deliveries, payments and your daily
            poultry operations from one simple platform.
          </p>
        </div>

        <div className="relative z-10 text-[8px] tracking-[0.3em] text-white/25">
          BISMILLAH CHICKEN CENTER
        </div>
      </section>

      {/* RIGHT SIDE - Login Form */}
      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
        <div className="w-full max-w-[420px]">
          <div className="mb-16 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#111714] text-lg font-bold text-white">B</div>
            <div>
              <h2 className="text-sm font-bold tracking-[0.2em] text-[#111714]">BISMILLAH</h2>
              <p className="mt-1 text-[8px] tracking-[0.3em] text-gray-400">CHICKEN CENTER</p>
            </div>
          </div>

          <div className="mb-10">
            <p className="text-[10px] font-semibold tracking-[0.25em] text-gray-400">WELCOME BACK</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#151a17]">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-400">Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">Phone Number</label>
              <div className="flex h-14 items-center rounded-lg border border-gray-200 bg-white px-4 transition focus-within:border-[#111714] focus-within:ring-4 focus-within:ring-black/5">
                <FiPhone className="mr-3 text-lg text-gray-400" />
                <span className="mr-3 border-r border-gray-200 pr-3 text-sm text-gray-600">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter phone number"
                  className="h-full w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">Password</label>
              <div className="flex h-14 items-center rounded-lg border border-gray-200 bg-white px-4 transition focus-within:border-[#111714] focus-within:ring-4 focus-within:ring-black/5">
                <FiLock className="mr-3 text-lg text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-full w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-3 cursor-pointer text-lg text-gray-400 transition hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="group flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-[#111714] text-[11px] font-semibold tracking-[0.2em] text-white transition hover:bg-[#29312d]"
            >
              SIGN IN
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[11px] leading-5 text-gray-400">
              Having trouble signing in?
              <br />
              Contact your administrator.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
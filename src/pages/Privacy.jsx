import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function Privacy() {
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    if (path === "/privacy") {
      document.title = "Privacy Policy - SoundScapes";
    }
  }, [path]);

  return (
    <div>
      <article className="space-y-6 w-full max-w-2xl">
        <h1 className="text-2xl  text-center font-bold">Privacy</h1>

        <p>
          We care about your privacy. We don't require you to create an account
          to use Noisefill and we don't use any third-party cookies. Many
          privacy regulations require us to stuff a lot inside our privacy
          policy, so if you don't need to read the full version, here's a quick
          rundown:
          <ul className="list-disc pl-6">
            <li>
              Our website may collect usage data to improve performance and
              security, which is handled by our privacy-friendly service
              providers
            </li>
            <li>
              Your browser will connect to our storage bucket to play
              soundscapes, which may include usage data for performance and
              security reasons
            </li>
          </ul>
        </p>
        <br />
        <p className="text-base font-semibold">Last updated</p>
        <p className="text-base">April 14, 2025</p>
      </article>
    </div>
  );
}

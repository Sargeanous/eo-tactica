import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="text-5xl font-semibold text-brand-700">404</div>
      <p className="text-muted-foreground">Page not found</p>
      <Button asChild>
        <Link to="/">Back to Command Center</Link>
      </Button>
    </div>
  );
}

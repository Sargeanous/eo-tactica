import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ServerError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="text-5xl font-semibold text-status-danger">500</div>
      <p className="text-muted-foreground">
        Something went wrong on our side.
      </p>
      <Button asChild variant="outline">
        <Link to="/">Back to Command Center</Link>
      </Button>
    </div>
  );
}

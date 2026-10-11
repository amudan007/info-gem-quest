import { createFileRoute } from "@tanstack/react-router";
import { OverviewPage, pageHead } from '@/components/insightflow';
export const Route = createFileRoute("/")({
  head:()=>pageHead('Feedback overview','Customer feedback analytics, sentiment distribution, and evidence-backed priorities.'),
  component: OverviewPage,
});

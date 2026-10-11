import { createFileRoute } from '@tanstack/react-router';
import { InsightsPage,pageHead } from '@/components/insightflow';
export const Route=createFileRoute('/insights')({head:()=>pageHead('AI insights','Generate evidence-backed customer feedback summaries and recommendations.'),component:InsightsPage});
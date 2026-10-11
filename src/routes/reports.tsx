import { createFileRoute } from '@tanstack/react-router';
import { ReportsPage,pageHead } from '@/components/insightflow';
export const Route=createFileRoute('/reports')({head:()=>pageHead('Insight reports','Export business-friendly customer feedback reports and recommended actions.'),component:ReportsPage});
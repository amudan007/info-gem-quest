import { createFileRoute } from '@tanstack/react-router';
import { FeedbackPage,pageHead } from '@/components/insightflow';
export const Route=createFileRoute('/feedback')({head:()=>pageHead('Feedback explorer','Search, filter, import, and inspect customer reviews in InsightFlow.'),component:FeedbackPage});
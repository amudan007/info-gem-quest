import { createFileRoute } from '@tanstack/react-router';
import { IssuesPage,pageHead } from '@/components/insightflow';
export const Route=createFileRoute('/issues')({head:()=>pageHead('Issue tracker','Track and resolve high-priority customer concerns with supporting evidence.'),component:IssuesPage});
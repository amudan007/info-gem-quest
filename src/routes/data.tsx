import { createFileRoute } from '@tanstack/react-router';
import { DataPage,pageHead } from '@/components/insightflow';
export const Route=createFileRoute('/data')({head:()=>pageHead('Data and Adaption','Inspect dataset quality, prepare Adaption input, and compare adapted sentiment labels.'),component:DataPage});
import Papa from 'papaparse';
import sample from '@/data/feedback.json';

export const categories = ['Customer Service', 'Fraud and Scam', 'Operational Issues', 'Product Feedback'] as const;
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type Feedback = { id: string; review: string; category: string; count: number; sentiment: Sentiment; date: string | null; method: 'baseline' | 'adaption' };
export type Issue = { key: string; title: string; category: string; action: string; evidence: Feedback[]; count: number; share: number };
export type Workspace = { feedback: Feedback[]; statuses: Record<string, string>; summary: string; dataset: string };

export function classify(review: string): Sentiment {
  const text = review.toLowerCase();
  const clean = text.replace(/not (?:a )?victim of fraud|not scammed|no (?:fraud|issues|problems|defects)|not fraudulent|not counterfeit/g, 'safe').replace(/unresponsive/g,'unavailable').replace(/not helpful|not responsive|not satisfied|not meet|didn't meet|did not meet/g,'disappointed');
  const negative = /scam|fraud|counterfeit|unavailable|disappoint|delay|defect|damaged|broken|poor|terrible|never (?:sent|received)|additional payment|low-quality|unsatisf|unhelpful|rude|misleading|difficult|failed|failure|late|not provide|not delivered/.test(clean);
  const positive = /helpful|responsive|excellent|great|improv|exceeded|perfect|innovative|satisfied|user-friendly|easy to|prompt|resolved|transparent|informed|safe|high-quality|reliable|smooth|knowledgeable|outstanding/.test(clean);
  return negative && positive ? 'neutral' : negative ? 'negative' : positive ? 'positive' : 'neutral';
}

export const initialFeedback: Feedback[] = sample.map((row, i) => ({ ...row, id: `BB-${String(i+1).padStart(4,'0')}`, sentiment: classify(row.review), date: null, method: 'baseline' }));
export const initialWorkspace: Workspace = { feedback: initialFeedback, statuses: {}, summary: '', dataset: 'Build Battle 2026' };
export function weight(row: Feedback, unique: boolean) { return unique ? 1 : row.count; }
export function stats(rows: Feedback[], unique = false) {
  const total = rows.reduce((n,r) => n+weight(r,unique),0);
  const sentiments = { positive: 0, neutral: 0, negative: 0 };
  rows.forEach(r => sentiments[r.sentiment] += weight(r,unique));
  return { total, sentiments, unique: rows.length, duplicates: rows.reduce((n,r) => n+r.count-1,0), positivePercent: total ? Math.round(sentiments.positive/total*100) : 0 };
}

export function makeIssues(rows: Feedback[], unique = false): Issue[] {
  const definitions = [
    { key:'fraud', title:'Seller fraud & counterfeit products', category:'Fraud and Scam', action:'Introduce seller verification, flag suspicious payment requests, and add a clear buyer-protection escalation path.' },
    { key:'support', title:'Unresponsive customer support', category:'Customer Service', action:'Review unanswered requests, set a first-response target, and route unresolved conversations to a dedicated escalation queue.' },
    { key:'operations', title:'Delivery & ordering friction', category:'Operational Issues', action:'Audit delayed orders and checkout failures; provide proactive delivery updates and a clear recovery path.' },
    { key:'quality', title:'Product quality concerns', category:'Product Feedback', action:'Review defect patterns, strengthen quality checks, and make replacement requests easier for affected customers.' },
  ];
  const total = stats(rows,unique).total;
  return definitions.map(d => {
    const evidence=rows.filter(r=>r.category===d.category && r.sentiment==='negative');
    const count=evidence.reduce((n,r)=>n+weight(r,unique),0);
    return {...d,evidence,count,share:total?Math.round(count/total*100):0};
  }).filter(d=>d.count>0).sort((a,b)=>b.count-a.count);
}

export function parseFeedbackCSV(text: string, adapted = false): Feedback[] {
  const parsed=Papa.parse<Record<string,string>>(text,{header:true,skipEmptyLines:'greedy',transformHeader:h=>h.trim().replace(/^\uFEFF/,'').toLowerCase()});
  if(parsed.errors.length) throw new Error(`CSV could not be read: ${parsed.errors[0]?.message}`);
  if(!parsed.meta.fields?.includes('review') || !parsed.meta.fields.includes('category')) throw new Error('Your CSV needs review and category columns.');
  if(adapted && !parsed.meta.fields.includes('sentiment')) throw new Error('The adapted CSV needs review, category, and sentiment columns.');
  const groups = new Map<string,Feedback>();
  parsed.data.forEach((r,i)=> {
    if(!r.review?.trim() || !r.category?.trim()) throw new Error(`Row ${i+2} has an empty review or category.`);
    const category=r.category.trim();
    if(!categories.includes(category as typeof categories[number])) throw new Error(`Row ${i+2} has an unrecognized category: ${category}.`);
    const label=r.sentiment?.trim().toLowerCase();
    if(adapted && !['positive','negative','neutral'].includes(label)) throw new Error(`Row ${i+2} needs a positive, neutral, or negative sentiment.`);
    const count=r.count ? Number(r.count) : 1;
    if(!Number.isSafeInteger(count)||count<1) throw new Error(`Row ${i+2} has an invalid count.`);
    const key=JSON.stringify([r.review.trim(),category,label]);
    const existing=groups.get(key);
    if(existing) existing.count+=count;
    else groups.set(key,{id:`IMP-${i+1}`,review:r.review.trim(),category,count,sentiment:adapted?label as Sentiment:classify(r.review),date:null,method:adapted?'adaption':'baseline'});
  });
  if(!groups.size) throw new Error('The CSV contains no feedback.');
  return [...groups.values()];
}

export function download(name: string, content: string, type='text/plain') {
  const url=URL.createObjectURL(new Blob([content],{type}));
  const a=document.createElement('a'); a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);
}
export function feedbackCSV(rows:Feedback[], adapted=false) {
  return Papa.unparse(rows.map(r=>({review:r.review,category:r.category,count:r.count,...(adapted?{sentiment:r.sentiment}:{})})));
}

export function reportText(workspace:Workspace,unique:boolean) {
  const s=stats(workspace.feedback,unique);
  return `# InsightFlow — Customer feedback report\n\nDataset: ${workspace.dataset}\nCounting mode: ${unique?'Unique reviews':'All source records'}\nTotal: ${s.total}\nPositive: ${s.sentiments.positive}\nNeutral / mixed: ${s.sentiments.neutral}\nNegative: ${s.sentiments.negative}\nDistinct reviews: ${s.unique}\nRepeated rows: ${s.duplicates}\n\n## Methodology\n${workspace.feedback.some(r=>r.method==='adaption')?'Labels imported from an Adaption result supplied by the user.':'Sentiment uses a transparent keyword baseline, not a model prediction.'}\nSource rows have no dates; historical trends are unavailable. Priorities rank negative feedback volume, not verified financial impact.\n\n## Priorities\n${makeIssues(workspace.feedback,unique).map((i,n)=>`${n+1}. ${i.title} — ${i.count} negative records (${i.share}% of selected feedback)\nAction: ${i.action}\nEvidence: "${i.evidence[0]?.review ?? ''}"\nStatus: ${workspace.statuses[i.key] ?? 'Open'}\n`).join('\n')}\n## AI executive summary\n${workspace.summary || 'Not generated.'}`;
}
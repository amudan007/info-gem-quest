import { describe,it,expect } from 'vitest';
import { classify,initialFeedback,stats,parseFeedbackCSV,makeIssues } from '@/lib/feedback';
describe('supplied dataset and evidence rules',()=>{
  it('preserves all 7000 records and 320 distinct pairs',()=>{expect(stats(initialFeedback)).toMatchObject({total:7000,unique:320,duplicates:6680});});
  it('counts duplicate rows only once in unique mode',()=>{expect(stats(initialFeedback,true).total).toBe(320);});
  it('does not create source dates',()=>{expect(initialFeedback.every(r=>r.date===null)).toBe(true);});
  it('handles negative negation without reversing positive service',()=>{expect(classify('Customer service was not helpful.')).toBe('negative');expect(classify('I was not a victim of fraud.')).toBe('positive');expect(classify('Customer service was unresponsive.')).toBe('negative');});
  it('parses quoted multiline review and counts repeats',()=>{const rows=parseFeedbackCSV('review,category\n"Great product, excellent quality",Product Feedback\n"Great product, excellent quality",Product Feedback');expect(rows).toHaveLength(1);expect(rows[0]?.count).toBe(2);});
  it('rejects adapted CSV without sentiment',()=>{expect(()=>parseFeedbackCSV('review,category\nGreat,Product Feedback',true)).toThrow('sentiment');});
  it('ranks only negative evidence with concrete volumes',()=>{const issues=makeIssues([{id:'1',review:'scammed',category:'Fraud and Scam',sentiment:'negative',count:5,date:null,method:'baseline'},{id:'2',review:'excellent',category:'Product Feedback',sentiment:'positive',count:10,date:null,method:'baseline'}]);expect(issues).toHaveLength(1);expect(issues[0]).toMatchObject({count:5,share:33});});
});
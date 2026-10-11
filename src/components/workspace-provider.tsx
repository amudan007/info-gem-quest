import { createContext, useContext, useState, type ReactNode } from 'react';
import { initialWorkspace, type Workspace } from '@/lib/feedback';
type WorkspaceContextValue={workspace:Workspace;setWorkspace:(value:Workspace|((value:Workspace)=>Workspace))=>void;unique:boolean;setUnique:(value:boolean)=>void};
const WorkspaceContext=createContext<WorkspaceContextValue|null>(null);
export function WorkspaceProvider({children}:{children:ReactNode}) {
  const [workspace,setWorkspace]=useState<Workspace>(initialWorkspace);
  const [unique,setUnique]=useState(false);
  return <WorkspaceContext.Provider value={{workspace,setWorkspace,unique,setUnique}}>{children}</WorkspaceContext.Provider>;
}
export function useWorkspace(){const context=useContext(WorkspaceContext);if(!context)throw new Error('Workspace is unavailable');return context;}
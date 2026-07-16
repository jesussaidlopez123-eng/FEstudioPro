import { FichaTecnica, SalesOrder, ProductionTask, FinancialTransaction, SystemAlert, OKR, AppUser } from './types';

export const initialUsers: AppUser[] = [
  { id: 'usr-1', username: 'admin', role: 'Admin', passwordHash: 'admin123' },
  { id: 'usr-2', username: 'Jorge Salmero', role: 'Operador', passwordHash: '1234' }
];

export const initialFichasTecnicas: FichaTecnica[] = [];
export const initialSalesOrders: SalesOrder[] = [];
export const initialProductionTasks: ProductionTask[] = [];
export const initialFinancialTransactions: FinancialTransaction[] = [];
export const initialSystemAlerts: SystemAlert[] = [];
export const initialOKRs: OKR[] = [];

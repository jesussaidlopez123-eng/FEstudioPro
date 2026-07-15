/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin' | 'Operador';

export interface User {
  username: string;
  role: UserRole;
  avatar: string;
}

export type AlertType = 'urgent' | 'info' | 'success';

export interface SystemAlert {
  id: string;
  type: AlertType;
  title: string;
  desc: string;
  sender: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface AppUser {
  id: string;
  username: string;
  role: UserRole;
  passwordHash: string; // Store plain password just for the scope of this UI demo
}

export interface FichaTecnica {
  id: string;
  name: string;
  code: string;
  description: string;
  dimensions: string;
  estimatedHours: number;
  difficulty: 'Baja' | 'Media' | 'Alta';
  materials: {
    material: string;
    quantity: string;
  }[];
  pdfName?: string;
  pdfSize?: string;
  uploadedAt?: string;
  instruccionesTrabajo?: string[]; // List of work instructions
  referenceImages?: string[]; // References images for manual uploading
  referenceImageNames?: string[]; // Names/Labels for reference images
}

export type ProductionStatus = 'Pendiente' | 'Corte' | 'Soldadura' | 'Pintura' | 'Calidad' | 'Terminado';

export interface TaskInstructionStep {
  id: string;
  instruction: string;
  status: 'Pendiente' | 'En Proceso' | 'Completado';
  timeSpentMinutes: number; // For registering times as requested
  startedAt?: string;
  completedAt?: string;
  observations?: string;
}

export interface ProductionTask {
  id: string;
  orderId: string;
  productName: string;
  clientName: string;
  status: ProductionStatus;
  assignedTo: string;
  notes: string;
  updatedAt: string;
  progress: number; // 0 to 100
  dimensions?: string;
  pdfName?: string;
  instruccionesTrabajo?: TaskInstructionStep[]; // Split instructions for tracking times in workshop
  referenceImages?: string[]; // Reference images copied from the spec sheet for the operators
  referenceImageNames?: string[]; // Reference image names
}

export type TransactionType = 'income' | 'expense';

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  concept: string;
  date: string;
  category: string; // e.g., 'Venta', 'Materia Prima', 'Nómina', 'Herramientas', 'Servicios'
}

export interface SalesOrder {
  id: string;
  clientName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
  deliveryDate: string;
  status: 'Pendiente' | 'En Producción' | 'Completado' | 'Entregado';
}

export interface OKR {
  id: string;
  objective: string;
  keyResult: string;
  target: number;
  current: number;
  unit: string;
}

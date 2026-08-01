export type ReportStatus = 'Pending' | 'In Progress' | 'Resolved';

export type Department =
  | 'Electricity'
  | 'Potholes & Roads'
  | 'Municipality & Waste'
  | 'Water Supply';

export interface Report {
  id: string;
  citizen_id: string;
  photo_url: string;
  latitude: number;
  longitude: number;
  address: string;
  department: Department;
  status: ReportStatus;
  created_at: string;
}

export type ReportInsert = Omit<Report, 'id' | 'created_at' | 'status'> & {
  status?: ReportStatus;
};

export type UserRole = 'citizen' | 'officer';

export interface AuthState {
  role: UserRole | null;
  citizenId: string | null;
  citizenLabel: string | null;
  officerId: string | null;
  isGuest: boolean;
}

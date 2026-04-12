import type { User } from '@/services/api/users/types';
import type { Format } from '@/services/api/formats/types';

export type MapSubmissionStatus = 'pending' | 'accepted' | 'rejected';

export interface MapSubmission {
  id: number;
  code: string;
  submitter_id: string;
  subm_notes: string | null;
  format_id: number;
  proposed: number;
  rejected_by: string | null;
  created_on: string;
  completion_proof: string;
  status: MapSubmissionStatus;
  submitter: User;
  rejecter: User | null;
  format: Format;
}

export interface GetMapSubmissionsParams {
  page?: number;
  per_page?: number;
  format_ids?: number[];
  submitter_id?: string;
  status?: MapSubmissionStatus;
  include?: string;
}

export interface GetMapSubmissionParams {
  include?: string;
}

export interface CreateMapSubmissionRequest {
  code: string;
  format_id: number;
  proposed: number;
  completion_proof: File;
  subm_notes?: string;
}

export interface CreateMapSubmissionResponse {
  id: number;
}

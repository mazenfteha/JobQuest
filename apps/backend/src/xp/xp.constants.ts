import { ActivityType, ApplicationStatus } from '@prisma/client';

export const XP_FOR_STATUS: Record<ApplicationStatus, number> = {
  SAVED: 10,
  APPLIED: 50,
  INTERVIEW: 100,
  OFFER: 500,
  REJECTED: 10,
};

export const STATUS_TO_ACTIVITY_TYPE: Record<ApplicationStatus, ActivityType> =
  {
    SAVED: ActivityType.JOB_SAVED,
    APPLIED: ActivityType.JOB_APPLIED,
    INTERVIEW: ActivityType.INTERVIEW,
    OFFER: ActivityType.OFFER,
    REJECTED: ActivityType.REJECTED,
  };

export const MANUAL_LOG_TYPES: ActivityType[] = [
  ActivityType.NETWORKING,
  ActivityType.CV_TAILORED,
  ActivityType.COVER_LETTER,
];

export const MANUAL_LOG_XP = 10;

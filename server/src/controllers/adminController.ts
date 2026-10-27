import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/errors.js';
import {
  getAdminOverviewStats,
  listAdminListings,
  moderateListing,
  listAdminReports,
  updateAdminReport,
  listAdminUsers,
  updateAdminUserStatus,
} from '../services/adminService.js';

export const getAdminStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getAdminOverviewStats();
  res.status(200).json(stats);
});

export const listAdminListingsHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await listAdminListings(req.query as Record<string, unknown>);
  res.status(200).json(result);
});

export const moderateListingHandler = asyncHandler(async (req: Request, res: Response) => {
  const listing = await moderateListing(
    req.user!._id.toString(),
    String(req.params.id),
    req.body
  );
  res.status(200).json({ listing });
});

export const listAdminReportsHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await listAdminReports(req.query as Record<string, unknown>);
  res.status(200).json(result);
});

export const updateAdminReportHandler = asyncHandler(async (req: Request, res: Response) => {
  const report = await updateAdminReport(
    req.user!._id.toString(),
    String(req.params.id),
    req.body
  );
  res.status(200).json({ report });
});

export const listAdminUsersHandler = asyncHandler(async (_req: Request, res: Response) => {
  const users = await listAdminUsers();
  res.status(200).json({ users });
});

export const updateAdminUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await updateAdminUserStatus(String(req.params.id), req.body);
  res.status(200).json({ user });
});

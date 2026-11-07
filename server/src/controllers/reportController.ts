import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GroupService } from '../services/groups/GroupService';
import { ReportService } from '../services/reports/ReportService';

const reportService = new ReportService();
const groupService = new GroupService();

export const monthlyReport = async (request: Request, response: Response) => {
  const groups = await groupService.listGroups(request.auth!.userId);
  const report = await reportService.monthly(
    request.auth!.userId,
    groups.map((group) => group._id.toString()),
  );
  response.status(StatusCodes.OK).json({ success: true, message: 'Monthly report fetched', data: report });
};

export const groupReport = async (request: Request, response: Response) => {
  const report = await reportService.group(request.params.groupId);
  response.status(StatusCodes.OK).json({ success: true, message: 'Group report fetched', data: report });
};

export const exportCsv = async (request: Request, response: Response) => {
  const groupId = typeof request.query.groupId === 'string' ? request.query.groupId : '';
  const csv = await reportService.exportCsv(groupId);
  response.status(StatusCodes.OK).setHeader('Content-Type', 'text/csv').send(csv);
};

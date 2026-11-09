import { documentService } from '../documents/documentService';

export const dashboardService = {
  async getOverview() {
    const documents = await documentService.list();
    const count = (status) => documents.filter((d) => d.status === status).length;
    return {
      documents,
      stats: {
        total: documents.length,
        ready: count('ready'),
        processing: count('processing') + count('uploaded'),
        failed: count('failed'),
      },
    };
  },
};

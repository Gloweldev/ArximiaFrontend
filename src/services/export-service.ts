import api from './api';

export interface ExportConfig {
  reportType: string;
  format: 'excel' | 'pdf';
  period: string;
  dateRange?: {
    start: string;
    end: string;
  };
  clubs: string[];
  includeCharts: boolean;
  includeDetails: boolean;
  customNotes?: string;
}

export const exportReport = async (config: ExportConfig) => {
  const response = await api.post('/reports/export', config, {
    responseType: 'blob'
  });
  
  // Crear nombre del archivo
  const date = new Date().toISOString().split('T')[0];
  const fileName = `reporte_${config.reportType}_${date}.${config.format}`;
  
  // Crear blob y descargar
  const blob = new Blob([response.data], {
    type: config.format === 'excel' 
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf'
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

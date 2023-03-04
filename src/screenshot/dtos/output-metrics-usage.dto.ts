export class OutputMetricsUsageDto {
  date: Date;
  total: number;

  constructor(date: Date, total: number) {
    this.date = date;
    this.total = total;
  }
}

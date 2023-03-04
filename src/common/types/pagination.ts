export class Pagination {
  private page: number;
  private itemsPerPage: number;

  constructor(page = 1, itemsPerPage = 10) {
    this.page = page;
    this.itemsPerPage = itemsPerPage;
  }

  getPageOriginal(): number {
    return this.page;
  }

  getPage(): number {
    return (this.page - 1) * this.itemsPerPage;
  }

  getItemsPerPage(): number {
    return this.itemsPerPage;
  }
}

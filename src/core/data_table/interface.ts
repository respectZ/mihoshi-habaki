export interface IDataTable<T extends object> {
  Type: string;
  Name: string;
  Class: string;
  Properties?: unknown;
  Rows: Record<string, T>;
}

type Int2 = number;
type Int8 = number;

interface TransactionRecord {
  transaction_id: Int8;
  date: string;
  staff: string;
  quantity: Int8;
  item: string;
  price: Int8;
}

interface Item {
  id: string;
  title: string;
  price: Int2;
  keywords: string;
}

interface TransactionItem {
  id: number;
  item: Item;
  quantity: Int2;
  price: Int8
}
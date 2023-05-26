import {
  GridColDef,
  GridRowSelectionModel,
  GridCallbackDetails,
  DataGrid,
} from "@mui/x-data-grid";
import DatagridFooter from "./base/DatagridFooter";
import { useState } from "react";

let getItemName = (id: string) => "Loading";

const columns: GridColDef[] = [
  // { field: "id", }
  {
    field: "date",
    headerName: "Date",
    width: 120,
    sortComparator: (a, b) => {
      if (a.split("/").length < 2 || b.split("/").length < 2) return 1;
      let [da, ma, ya] = a.split("/");
      let [db, mb, yb] = b.split("/");
      if (!ya) ya = new Date().getFullYear();
      if (!yb) yb = new Date().getFullYear();
      if (ya !== yb) return ya > yb ? 1 : -1;
      if (ma !== mb) return ma > mb ? 1 : -1;
      return da > db ? 1 : -1;
    },
  },
  { field: "staff", headerName: "Staff", width: 130 },
  {
    field: "item",
    headerName: "Item",
    width: 350,
    valueGetter: ({ row }) => getItemName(row.item),
  },
  {
    field: "quantity",
    headerName: "Qty.",
    type: "number",
    width: 90,
  },
  { field: "price", headerName: "Price", type: "number", width: 90 },
];

interface ITransactionHistoryProps {
  records: TransactionRecord[];
  itemNameGetter: (id: string) => string;
}

export default function TransactionHistory({
  records,
  itemNameGetter,
}: ITransactionHistoryProps) {
  getItemName = itemNameGetter;

  const [selectionCount, setSelectionCount] = useState(0);
  const [selectionItemsSum, setSelectionItemsSum] = useState(0);
  const [selectionPriceSum, setSelectionPriceSum] = useState(0);

  const onRowSelectionModelChange = (
    rowSelection: GridRowSelectionModel,
    details: GridCallbackDetails
  ) => {
    setSelectionCount(rowSelection.length);
    setSelectionItemsSum(
      rowSelection
        .map((id) => {
          const record = records.find((record) => record.transaction_id === id);
          return record ? record.quantity ?? 0 : 0;
        })
        .reduce((sum, qty) => sum + qty, 0)
    );
    setSelectionPriceSum(
      rowSelection
        .map((id) => {
          const record = records.find((record) => record.transaction_id === id);
          return record ? record.price ?? 0 : 0;
        })
        .reduce((sum, price) => sum + price, 0)
    );
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={records}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
          sorting: {
            sortModel: [
              {
                field: "date",
                sort: "desc",
              },
            ],
          },
        }}
        pageSizeOptions={[10, 15, 25, 50, 100]}
        checkboxSelection
        getRowId={(record) => record.transaction_id}
        onRowSelectionModelChange={onRowSelectionModelChange}
        slots={{
          footer: DatagridFooter,
        }}
        slotProps={{
          footer: {
            selectionCount: selectionCount,
            selectionItemsSum: selectionItemsSum,
            selectionPriceSum: selectionPriceSum,
          },
        }}
      />
    </div>
  );
}

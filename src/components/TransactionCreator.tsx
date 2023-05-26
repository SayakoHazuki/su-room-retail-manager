import * as React from "react";
import "./STransactionCreator.css";
import { Button, TextField } from "@mui/material";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  DataGrid,
  GridCallbackDetails,
  GridColDef,
  GridRowSelectionModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import DatagridFooter from "./base/DatagridFooter";

import { ChangeEvent, FormEvent, useRef, useState, MouseEvent } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

function saveInput(records: TransactionItem[]) {
  // localStorage.setItem("records", JSON.stringify(records));
  // localStorage.setItem("items", JSON.stringify(items));
  localStorage.setItem("records", JSON.stringify(records));
}

export interface ITransactionCreatorProps {}

export default function TransactionCreator({
  itemsDict,
  supabaseClient,
}: {
  itemsDict: Item[];
  supabaseClient: SupabaseClient;
}) {
  const [items, setItems] = useState<TransactionItem[]>([]);

  let loaded_items: TransactionItem[] = [];
  try {
    loaded_items = JSON.parse(localStorage.getItem("items") ?? "[]");
  } catch {}

  if (loaded_items.length && items.length === 0) {
    const records = JSON.parse(localStorage.getItem("records") ?? "");
    setItems(records);
  }

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
          const record = items.find((item: TransactionItem) => item.id === id);
          return record ? record.quantity ?? 0 : 0;
        })
        .reduce((sum, qty) => sum + qty, 0)
    );
    setSelectionPriceSum(
      rowSelection
        .map((id) => {
          const record = items.find((item: TransactionItem) => item.id === id);
          return record ? record.price ?? 0 : 0;
        })
        .reduce((sum, price) => sum + price, 0)
    );
  };

  const productIdInputRef = useRef<HTMLInputElement>();
  const [productIdInput, setProductIdInput] = useState<string>("");

  const dataGridRef = useGridApiRef();

  const [quantity, setQuantity] = useState<number>();

  const [username, setUsername] = useState<string>("");
  const [passcode, setPasscode] = useState<string>("");

  function addItem(productId: string, quantity: number) {
    console.log("iDict", itemsDict);
    let item = itemsDict.find((item) => item.id === productId) ?? {
      id: productId,
      title: `Unknown product <${productId}>`,
      price: 0,
      keywords: ""
    };
    console.log("item", item); 
    const nextId = items.length + 1;
    const transItem = {
      id: nextId,
      item,
      quantity,
      price: item.price * quantity,
    };
    setItems([...items, transItem]);
    console.log(items);
    dataGridRef.current.updateRows([transItem]);
    saveInput([...items, transItem]);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!productIdInputRef.current) return;

    addItem(productIdInput, quantity ?? 1);
    productIdInputRef.current.value = "";
    setProductIdInput("");
  }

  function shortcutSubmit(e: MouseEvent<HTMLButtonElement>, id: string) {
    e.preventDefault();

    if (productIdInputRef.current) {
      productIdInputRef.current.focus();
      productIdInputRef.current.value = id;
    }

    addItem(id, quantity ?? 1);
    setTimeout(() => {
      if (productIdInputRef.current) {
        productIdInputRef.current.value = "";
      }
    }, 100);
    setProductIdInput("");
  }

  async function submitRecord(e: MouseEvent<HTMLButtonElement>) {
    if (items.length === 0) return;

    const records = items.map((item) => {
      return {
        date: new Date()
          .toLocaleDateString()
          .split("/")
          .map((s) => s.padStart(2, "0"))
          .join("/"),
        staff: username,
        item: item.item.id,
        quantity: item.quantity,
        price: item.price,
      };
    });

    let { data, error } = await supabaseClient.rpc("insert_records", {
      pw: passcode,
      records,
      staff: username,
    });

    if (error) console.error(error);
    else console.log(data);
  }

  function onQuantityChange(e: ChangeEvent<HTMLInputElement>) {
    setQuantity(Number(e.target.value));
  }

  const shortcutItems = [
    { title: "暖包$3", id: "HWM3" },
    { title: "暖包$5", id: "HWM5" },
    { title: "間尺$5", id: "PRLR" },
    { title: "File $2", id: "SFF4" },
    { title: "單行$3", id: "SUFS" },
  ];

  const deleteSelected = () => {
    console.log("datagridref", dataGridRef.current);
    console.log("GridRowId", dataGridRef.current.getSelectedRows());
    console.log("items", items);
    const newItems = items.filter(
      (item: TransactionItem) =>
        !Array.from(dataGridRef.current.getSelectedRows().keys())?.includes(
          item.id
        )
    );
    console.log("newItems", newItems);
    saveInput(newItems);
    // reload
    document.location.reload();
  };

  const clearAll = () => {
    localStorage.removeItem("records");
    document.location.reload();
  };

  return (
    <div>
      <Stack direction="column" spacing={2}>
        <form className="transaction-input-form" onSubmit={handleSubmit}>
          <Stack direction="row" spacing={2}>
            <TextField
              inputRef={productIdInputRef}
              id="outlined-basic"
              label="Scan Product ID"
              variant="outlined"
              onInput={(e: ChangeEvent<HTMLInputElement>) =>
                setProductIdInput(e.target.value)
              }
            />
            {shortcutItems.map((item) => (
              <Button
                key={item.id}
                variant="contained"
                value={item.id}
                onClick={(e: MouseEvent<HTMLButtonElement>) =>
                  shortcutSubmit(e, item.id)
                }
              >
                {item.title}
              </Button>
            ))}
            <FormControl>
              <RadioGroup
                row
                name="position"
                defaultValue="1"
                onChange={onQuantityChange}
              >
                <FormControlLabel
                  value="1"
                  control={<Radio />}
                  label="x1"
                  labelPlacement="top"
                />
                <FormControlLabel
                  value="2"
                  control={<Radio />}
                  label="x2"
                  labelPlacement="top"
                />
                <FormControlLabel
                  value="3"
                  control={<Radio />}
                  label="x3"
                  labelPlacement="top"
                />
                <FormControlLabel
                  value="4"
                  control={<Radio />}
                  label="x4"
                  labelPlacement="top"
                />
                <FormControlLabel
                  value="5"
                  control={<Radio />}
                  label="x5"
                  labelPlacement="top"
                />
              </RadioGroup>
            </FormControl>
          </Stack>
        </form>
        <div style={{ height: "80%", width: "100%" }}>
          <DataGrid
            apiRef={dataGridRef}
            rows={items}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
              columns: {
                columnVisibilityModel: {
                  id: false,
                },
              },
            }}
            pageSizeOptions={[5, 8, 10, 15, 20]}
            checkboxSelection
            onRowSelectionModelChange={onRowSelectionModelChange}
            slots={{
              footer: DatagridFooter,
            }}
            slotProps={{
              footer: {
                selectionCount: selectionCount,
                selectionItemsSum: selectionItemsSum,
                selectionPriceSum: selectionPriceSum,
                optionsShown: true,
                buttonCallbacks: {
                  deleteSelected,
                  clearAll,
                },
              },
            }}
          />
        </div>
        <Stack direction="row" spacing={2}>
          <Typography variant="h4" sx={{ flex: 1 }}>
            Total: $
            {items.length > 0
              ? items.map((i) => i.price).reduce((a, b) => a + b)
              : 0}
          </Typography>
          <TextField
            id="outlined-basic"
            label="Staff"
            variant="outlined"
            autoComplete="username"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setUsername(e.target.value)
            }
          />
          <TextField
            id="outlined-basic"
            label="Passcode"
            variant="outlined"
            type="password"
            autoComplete="current-password"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPasscode(e.target.value)
            }
          />
          <Button onClick={submitRecord} variant="contained">
            Submit record
          </Button>
        </Stack>
      </Stack>
    </div>
  );
}

const columns: GridColDef[] = [
  // { field: "id", }
  {
    field: "id",
  },
  {
    field: "item",
    headerName: "Item",
    width: 350,
    valueGetter: ({ row }) => row.item.title,
  },
  {
    field: "quantity",
    headerName: "Qty.",
    type: "number",
    width: 90,
  },
  { field: "price", headerName: "Price", type: "number", width: 90 },
];
